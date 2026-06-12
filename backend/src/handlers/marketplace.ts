import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { createNotification } from "../services/notifications";

const STORE_CATEGORIES = ["Electronics", "Fashion", "Vehicles", "Property", "Food", "Services", "Others"];

const serialize = (document: Record<string, any> | null) =>
  document ? { ...document, _id: document._id.toString() } : null;

const requireUser = (req: Request, res: Response) => {
  if (!req.session.currentUser) {
    res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    return null;
  }
  return req.session.currentUser;
};

const productFields = (body: any) => ({
  title: String(body?.title || "").trim(),
  image: String(body?.image || "").trim(),
  description: String(body?.description || "").trim(),
  category: String(body?.category || "").trim(),
  location: String(body?.location || "").trim(),
  sellerContact: String(body?.sellerContact || "").trim(),
  pricePi: Number(body?.pricePi),
  images: Array.isArray(body?.images) ? body.images.map((item: unknown) => String(item)).filter(Boolean).slice(0, 5) : [],
});

const validProduct = (product: ReturnType<typeof productFields>) =>
  product.title && product.image && product.description && product.category && product.location && product.sellerContact
  && Number.isFinite(product.pricePi) && product.pricePi > 0;

export default function mountMarketplaceEndpoints(router: Router) {
  router.get("/products", async (req, res) => {
    if (!requireUser(req, res)) return;
    const query: Record<string, any> = { active: true, hidden: { $ne: true }, approved: { $ne: false } };
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const location = String(req.query.location || "").trim();
    if (search) query.title = { $regex: search, $options: "i" };
    if (category && category !== "All") query.category = category;
    if (location) query.location = { $regex: location, $options: "i" };
    const sort: Record<string, 1 | -1> = req.query.sort === "price-low" ? { pricePi: 1 } : req.query.sort === "price-high" ? { pricePi: -1 } : { createdAt: -1 };
    const products = await req.app.locals.productCollection.find(query).sort(sort).toArray();
    return res.status(200).json({ products: products.map(serialize) });
  });

  router.get("/feed", async (req, res) => {
    const user = requireUser(req, res); if (!user) return;
    const visible = { active: true, hidden: { $ne: true }, approved: { $ne: false } };
    const [latest, favorites, orders] = await Promise.all([
      req.app.locals.productCollection.find(visible).sort({ createdAt: -1 }).limit(8).toArray(),
      req.app.locals.favoriteCollection.find({ userId: user.uid }).limit(20).toArray(),
      req.app.locals.marketplaceOrderCollection.find({ buyerId: user.uid }).sort({ createdAt: -1 }).limit(20).toArray(),
    ]);
    const preferredCategories = [...new Set(orders.map((item: any) => item.productCategory).filter(Boolean))];
    const recommended = await req.app.locals.productCollection.find(preferredCategories.length ? { ...visible, category: { $in: preferredCategories } } : visible).sort({ createdAt: -1 }).limit(8).toArray();
    const counts = await req.app.locals.productCollection.aggregate([{ $match: visible }, { $group: { _id: "$category", count: { $sum: 1 } } }]).toArray();
    return res.status(200).json({ latest: latest.map(serialize), recommended: (recommended.length ? recommended : latest).map(serialize), categories: STORE_CATEGORIES.map((name) => ({ name, count: counts.find((item: any) => item._id === name)?.count || 0 })), savedIds: favorites.map((item: any) => item.productId) });
  });

  router.get("/products/:id", async (req, res) => {
    if (!requireUser(req, res)) return;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    }
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(req.params.id), active: true, hidden: { $ne: true }, approved: { $ne: false } });
    if (!product) {
      return res.status(404).json({ error: "not_found", message: "Product not found" });
    }
    const [seller, related, favorite] = await Promise.all([
      req.app.locals.userCollection.findOne({ uid: product.sellerId }),
      req.app.locals.productCollection.find({ category: product.category, _id: { $ne: product._id }, active: true, hidden: { $ne: true }, approved: { $ne: false } }).sort({ createdAt: -1 }).limit(4).toArray(),
      req.app.locals.favoriteCollection.findOne({ userId: req.session.currentUser!.uid, productId: req.params.id }),
    ]);
    return res.status(200).json({ product: serialize(product), seller: seller ? { uid: seller.uid, displayName: seller.displayName, piUsername: seller.piUsername, verificationLevel: seller.verificationLevel || "basic", createdAt: seller.createdAt } : null, related: related.map(serialize), saved: Boolean(favorite) });
  });

  router.post("/products", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const fields = productFields(req.body);

    if (!validProduct(fields)) {
      return res.status(400).json({ error: "bad_request", message: "Complete all required product fields" });
    }

    const images = fields.images.length ? fields.images : [fields.image];
    const product = {
      sellerId: user.uid,
      sellerName: user.displayName || user.piUsername || user.username,
      piUsername: user.piUsername || user.username,
      ...fields,
      image: images[0],
      images,
      active: true,
      approved: true,
      hidden: false,
      createdAt: new Date(),
    };
    const result = await req.app.locals.productCollection.insertOne(product);
    return res.status(201).json({ product: serialize({ ...product, _id: result.insertedId }) });
  });

  router.get("/orders", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const orders = await req.app.locals.marketplaceOrderCollection
      .find({ $or: [{ buyerId: user.uid }, { sellerId: user.uid }] })
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json({ orders: orders.map(serialize) });
  });

  router.post("/orders", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const productId = String(req.body?.productId || "");
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    }

    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(productId), active: true, hidden: { $ne: true }, approved: { $ne: false } });
    if (!product) {
      return res.status(404).json({ error: "not_found", message: "Product not found" });
    }
    if (product.sellerId === user.uid) {
      return res.status(400).json({ error: "bad_request", message: "You cannot order your own product" });
    }

    const order = {
      buyerId: user.uid,
      buyerName: user.displayName || user.piUsername || user.username,
      sellerId: product.sellerId,
      sellerName: product.sellerName || product.piUsername || "Pi seller",
      productId,
      productTitle: product.title,
      productImage: product.image,
      productCategory: product.category,
      pricePi: product.pricePi,
      status: "pending",
      paymentStatus: "pending",
      paymentId: null,
      paymentTxid: null,
      paidAt: null,
      createdAt: new Date(),
    };
    const result = await req.app.locals.marketplaceOrderCollection.insertOne(order);
    await createNotification(req.app, { userId: product.sellerId, type: "new_order", title: "New order", message: `${order.buyerName} ordered ${product.title}`, relatedId: result.insertedId.toString() });
    return res.status(201).json({ order: serialize({ ...order, _id: result.insertedId }) });
  });

  router.post("/products/:id/report", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    }
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ error: "not_found", message: "Product not found" });
    if (product.sellerId === user.uid) return res.status(400).json({ error: "bad_request", message: "You cannot report your own product" });
    const reason = String(req.body?.reason || "").trim();
    if (!reason || reason.length > 300) return res.status(400).json({ error: "bad_request", message: "Provide a report reason" });
    await req.app.locals.reportCollection.insertOne({
      targetType: "product",
      targetId: req.params.id,
      targetName: product.title,
      reason,
      reportedBy: user.uid,
      reporterName: user.displayName || user.username,
      resolved: false,
      createdAt: new Date(),
    });
    return res.status(201).json({ message: "Product report submitted" });
  });

  router.patch("/orders/:id/status", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid order id" });
    }
    const status = req.body?.status;
    if (!["paid", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid order status" });
    }
    const order = await req.app.locals.marketplaceOrderCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!order || (order.buyerId !== user.uid && order.sellerId !== user.uid)) {
      return res.status(404).json({ error: "not_found", message: "Order not found" });
    }
    if (status === "completed" && order.sellerId !== user.uid) {
      return res.status(403).json({ error: "forbidden", message: "Only the seller can complete an order" });
    }
    if (status === "paid" && order.buyerId !== user.uid) {
      return res.status(403).json({ error: "forbidden", message: "Only the buyer can test-pay this order" });
    }
    if (status === "cancelled" && order.buyerId !== user.uid && order.sellerId !== user.uid) {
      return res.status(403).json({ error: "forbidden", message: "Only the buyer or seller can cancel this order" });
    }
    if (status === "paid" && order.status !== "pending") {
      return res.status(400).json({ error: "bad_request", message: "Only pending orders can be marked paid" });
    }
    if (status === "cancelled" && order.status !== "pending") {
      return res.status(400).json({ error: "bad_request", message: "Only pending orders can be cancelled" });
    }
    if (status === "completed" && order.status !== "paid") {
      return res.status(400).json({ error: "bad_request", message: "Only paid orders can be completed" });
    }
    const updates: Record<string, unknown> = { status, updatedAt: new Date() };
    if (status === "paid") {
      updates.paymentStatus = "paid";
      updates.paymentId = `test_${order._id.toString()}_${Date.now()}`;
      updates.paidAt = new Date();
    }
    await req.app.locals.marketplaceOrderCollection.updateOne({ _id: order._id }, { $set: updates });
    const receiverId = order.buyerId === user.uid ? order.sellerId : order.buyerId;
    await createNotification(req.app, { userId: receiverId, type: status === "completed" ? "order_completed" : status === "paid" ? "order_paid" : "order_update", title: `Order ${status}`, message: `${order.productTitle} was marked ${status}`, relatedId: order._id.toString() });
    return res.status(200).json({ message: `Order marked ${status}` });
  });

  router.get("/saved", async (req, res) => {
    const user = requireUser(req, res); if (!user) return;
    const favorites = await req.app.locals.favoriteCollection.find({ userId: user.uid }).sort({ createdAt: -1 }).toArray();
    const ids = favorites.map((item: any) => item.productId).filter(ObjectId.isValid).map((id: string) => new ObjectId(id));
    const products = ids.length ? await req.app.locals.productCollection.find({ _id: { $in: ids }, hidden: { $ne: true } }).toArray() : [];
    return res.status(200).json({ products: products.map(serialize) });
  });

  router.post("/products/:id/favorite", async (req, res) => {
    const user = requireUser(req, res); if (!user) return;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    const existing = await req.app.locals.favoriteCollection.findOne({ userId: user.uid, productId: req.params.id });
    if (existing) {
      await req.app.locals.favoriteCollection.deleteOne({ _id: existing._id });
      return res.status(200).json({ saved: false });
    }
    await req.app.locals.favoriteCollection.insertOne({ userId: user.uid, productId: req.params.id, createdAt: new Date() });
    return res.status(201).json({ saved: true });
  });

  router.get("/sellers/:id", async (req, res) => {
    const user = requireUser(req, res); if (!user) return;
    const seller = await req.app.locals.userCollection.findOne({ uid: req.params.id });
    if (!seller) return res.status(404).json({ error: "not_found", message: "Seller not found" });
    const [products, reviews, completedOrders] = await Promise.all([
      req.app.locals.productCollection.find({ sellerId: seller.uid, hidden: { $ne: true } }).sort({ createdAt: -1 }).toArray(),
      req.app.locals.reviewCollection.find({ sellerId: seller.uid }).sort({ createdAt: -1 }).toArray(),
      req.app.locals.marketplaceOrderCollection.countDocuments({ sellerId: seller.uid, status: "completed" }),
    ]);
    const averageRating = reviews.length ? reviews.reduce((sum: number, review: any) => sum + Number(review.rating), 0) / reviews.length : 0;
    return res.status(200).json({ seller: { uid: seller.uid, displayName: seller.displayName, piUsername: seller.piUsername, country: seller.country, verificationLevel: seller.verificationLevel || "basic", createdAt: seller.createdAt, totalProducts: products.length, successfulOrders: completedOrders, averageRating, reviewCount: reviews.length }, products: products.map(serialize), reviews: reviews.map(serialize) });
  });

  router.post("/orders/:id/review", async (req, res) => {
    const user = requireUser(req, res); if (!user) return;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid order id" });
    const order = await req.app.locals.marketplaceOrderCollection.findOne({ _id: new ObjectId(req.params.id), buyerId: user.uid, status: "completed" });
    if (!order) return res.status(404).json({ error: "not_found", message: "Completed order not found" });
    const rating = Number(req.body?.rating); const review = String(req.body?.message || req.body?.review || "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || review.length > 300) return res.status(400).json({ error: "bad_request", message: "Rating must be 1-5 stars" });
    await req.app.locals.reviewCollection.updateOne({ orderId: req.params.id }, { $setOnInsert: { orderId: req.params.id, sellerId: order.sellerId, buyerId: user.uid, buyerName: user.displayName || user.username, rating, message: review, createdAt: new Date() } }, { upsert: true });
    return res.status(201).json({ message: "Seller review saved" });
  });

  router.get("/seller", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const products = await req.app.locals.productCollection.find({ sellerId: user.uid }).sort({ createdAt: -1 }).toArray();
    const orders = await req.app.locals.marketplaceOrderCollection.find({ sellerId: user.uid }).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({
      products: products.map(serialize),
      orders: orders.map(serialize),
      stats: {
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((order: any) => order.status === "pending").length,
        paidOrders: orders.filter((order: any) => ["paid", "completed"].includes(order.status)).length,
      },
    });
  });

  router.get("/seller/products/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(req.params.id), sellerId: user.uid });
    if (!product) return res.status(404).json({ error: "not_found", message: "Product not found" });
    const [seller, related, favorite] = await Promise.all([
      req.app.locals.userCollection.findOne({ uid: product.sellerId }),
      req.app.locals.productCollection.find({ category: product.category, _id: { $ne: product._id }, active: true, hidden: { $ne: true }, approved: { $ne: false } }).sort({ createdAt: -1 }).limit(4).toArray(),
      req.app.locals.favoriteCollection.findOne({ userId: req.session.currentUser!.uid, productId: req.params.id }),
    ]);
    return res.status(200).json({ product: serialize(product), seller: seller ? { uid: seller.uid, displayName: seller.displayName, piUsername: seller.piUsername, verificationLevel: seller.verificationLevel || "basic", createdAt: seller.createdAt } : null, related: related.map(serialize), saved: Boolean(favorite) });
  });

  router.put("/seller/products/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    const fields = productFields(req.body);
    if (!validProduct(fields)) return res.status(400).json({ error: "bad_request", message: "Complete all required product fields" });
    const result = await req.app.locals.productCollection.updateOne(
      { _id: new ObjectId(req.params.id), sellerId: user.uid },
      { $set: { ...fields, updatedAt: new Date() } },
    );
    if (!result.matchedCount) return res.status(404).json({ error: "not_found", message: "Product not found" });
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(req.params.id) });
    return res.status(200).json({ product: serialize(product) });
  });

  router.patch("/seller/products/:id/availability", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id) || typeof req.body?.active !== "boolean") {
      return res.status(400).json({ error: "bad_request", message: "Invalid availability update" });
    }
    const result = await req.app.locals.productCollection.updateOne(
      { _id: new ObjectId(req.params.id), sellerId: user.uid },
      { $set: { active: req.body.active, updatedAt: new Date() } },
    );
    if (!result.matchedCount) return res.status(404).json({ error: "not_found", message: "Product not found" });
    return res.status(200).json({ message: req.body.active ? "Product is available" : "Product is sold out" });
  });

  router.delete("/seller/products/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    const result = await req.app.locals.productCollection.deleteOne({ _id: new ObjectId(req.params.id), sellerId: user.uid });
    if (!result.deletedCount) return res.status(404).json({ error: "not_found", message: "Product not found" });
    return res.status(200).json({ message: "Product deleted" });
  });
}
