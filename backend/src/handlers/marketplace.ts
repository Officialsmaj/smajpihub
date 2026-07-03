import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { createNotification } from "../services/notifications";
import env from "../environments";
import { resolveCurrentUser } from "../services/auth";

const STORE_CATEGORIES = ["Deals", "Grocery", "Electronics", "Mobiles", "Laptops", "Fashion", "Beauty", "Home", "Vehicles", "Accessories"];

const timelineEntry = (status: string, label: string, note?: string) => ({
  status,
  label,
  note,
  at: new Date().toISOString(),
});

const serialize = (document: Record<string, any> | null) =>
  document ? { ...document, _id: document._id.toString() } : null;

const requireUser = async (req: Request, res: Response) => {
  const currentUser = await resolveCurrentUser(req);
  if (!currentUser) {
    res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    return null;
  }
  return currentUser;
};

const productFields = (body: any) => ({
  title: String(body?.title || "").trim(),
  image: String(body?.image || "").trim(),
  description: String(body?.description || "").trim(),
  category: String(body?.category || "").trim(),
  location: String(body?.location || "").trim(),
  sellerContact: String(body?.sellerContact || "").trim(),
  pricePi: Number(body?.pricePi),
  priceUsdt: Number(body?.priceUsdt),
  condition: String(body?.condition || "").trim(),
  quantity: Number(body?.quantity || 1),
  deliveryOption: String(body?.deliveryOption || "").trim(),
  country: String(body?.country || "").trim(),
  stateRegion: String(body?.stateRegion || "").trim(),
  city: String(body?.city || "").trim(),
  areaAddress: String(body?.areaAddress || "").trim(),
  sellerAgreementAccepted: Boolean(body?.sellerAgreementAccepted),
  images: Array.isArray(body?.images) ? body.images.map((item: unknown) => String(item)).filter(Boolean).slice(0, 5) : [],
});

const productValidationMessage = (product: ReturnType<typeof productFields>) => {
  if (!product.title) return "Product title is required.";
  if (product.title.length < 3) return "Product title must be at least 3 characters.";
  if (!product.image && !product.images.length) return "At least one product image is required.";
  if (!product.description || product.description.length < 20) return "Product description must be at least 20 characters.";
  if (!product.category) return "Product category is required.";
  if (!product.condition) return "Product condition is required.";
  if (!Number.isFinite(product.quantity) || product.quantity < 1) return "Product quantity must be at least 1.";
  if (!Number.isFinite(product.pricePi) || product.pricePi <= 0) return "Pi price must be greater than zero.";
  if (!Number.isFinite(product.priceUsdt) || product.priceUsdt <= 0) return "USDT price must be greater than zero.";
  if (!product.country) return "Country is required.";
  if (!product.stateRegion) return "State or region is required.";
  if (!product.city) return "City is required.";
  if (!product.areaAddress) return "Area or address summary is required.";
  if (!product.location) return "Product location is required.";
  if (!product.deliveryOption) return "Delivery option is required.";
  if (!product.sellerContact) return "Seller contact is required.";
  if (!product.sellerAgreementAccepted) return "Seller agreement must be accepted before listing.";
  return "";
};

const validProduct = (product: ReturnType<typeof productFields>) =>
  product.title && product.image && product.description && product.category && product.location && product.sellerContact
  && Number.isFinite(product.pricePi) && product.pricePi > 0
  && Number.isFinite(product.priceUsdt) && product.priceUsdt > 0
  && product.condition && product.deliveryOption && product.country && product.stateRegion && product.city && product.areaAddress
  && Number.isFinite(product.quantity) && product.quantity > 0 && product.sellerAgreementAccepted;

export default function mountMarketplaceEndpoints(router: Router) {
  router.get("/products", async (req, res) => {
    const query: Record<string, any> = { active: true, hidden: { $ne: true }, approved: true, reviewStatus: "approved" };
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
    const user = await resolveCurrentUser(req);
    const visible = { active: true, hidden: { $ne: true }, approved: true, reviewStatus: "approved" };
    const latest = await req.app.locals.productCollection.find(visible).sort({ createdAt: -1 }).limit(8).toArray();
    const counts = await req.app.locals.productCollection.aggregate([{ $match: visible }, { $group: { _id: "$category", count: { $sum: 1 } } }]).toArray();

    if (!user) {
      return res.status(200).json({ latest: latest.map(serialize), recommended: latest.map(serialize), categories: STORE_CATEGORIES.map((name) => ({ name, count: counts.find((item: any) => item._id === name)?.count || 0 })), savedIds: [] });
    }

    const [favorites, orders] = await Promise.all([
      req.app.locals.favoriteCollection.find({ userId: user.uid }).limit(20).toArray(),
      req.app.locals.marketplaceOrderCollection.find({ buyerId: user.uid }).sort({ createdAt: -1 }).limit(20).toArray(),
    ]);
    const preferredCategories = [...new Set(orders.map((item: any) => item.productCategory).filter(Boolean))];
    const recommended = await req.app.locals.productCollection.find(preferredCategories.length ? { ...visible, category: { $in: preferredCategories } } : visible).sort({ createdAt: -1 }).limit(8).toArray();
    return res.status(200).json({ latest: latest.map(serialize), recommended: (recommended.length ? recommended : latest).map(serialize), categories: STORE_CATEGORIES.map((name) => ({ name, count: counts.find((item: any) => item._id === name)?.count || 0 })), savedIds: favorites.map((item: any) => item.productId) });
  });

  router.get("/products/:id", async (req, res) => {
    const user = await resolveCurrentUser(req);
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    }
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(req.params.id), active: true, hidden: { $ne: true }, approved: true, reviewStatus: "approved" });
    if (!product) {
      return res.status(404).json({ error: "not_found", message: "Product not found" });
    }
    const [seller, related, favorite] = await Promise.all([
      req.app.locals.userCollection.findOne({ uid: product.sellerId }),
      req.app.locals.productCollection.find({ category: product.category, _id: { $ne: product._id }, active: true, hidden: { $ne: true }, approved: { $ne: false } }).sort({ createdAt: -1 }).limit(4).toArray(),
      user ? req.app.locals.favoriteCollection.findOne({ userId: user.uid, productId: req.params.id }) : null,
    ]);
    return res.status(200).json({ product: serialize(product), seller: seller ? { uid: seller.uid, displayName: seller.displayName, piUsername: seller.piUsername, verificationLevel: seller.verificationLevel || "basic", createdAt: seller.createdAt } : null, related: related.map(serialize), saved: Boolean(favorite) });
  });

  router.post("/products", async (req, res) => {
    const sessionUser = await requireUser(req, res);
    if (!sessionUser) return;
    const freshUser = await req.app.locals.userCollection.findOne({ uid: sessionUser.uid });
    const user = freshUser || sessionUser;
    if (freshUser) req.session.currentUser = freshUser;
    if (user.role !== "seller" && !user.sellerActive) {
      return res.status(403).json({ error: "seller_required", message: "Activate seller tools before listing products." });
    }

    const fields = productFields(req.body);
    const validationMessage = productValidationMessage(fields);

    if (validationMessage || !validProduct(fields)) {
      return res.status(400).json({ error: "bad_request", message: validationMessage || "Complete all required product fields" });
    }

    const images = fields.images.length ? fields.images : [fields.image];
    const autoApprove = env.marketplace_auto_approve_products;
    const product = {
      sellerId: user.uid,
      sellerName: user.displayName || user.piUsername || user.username,
      piUsername: user.piUsername || user.username,
      verificationLevel: user.verificationLevel || "basic",
      ...fields,
      image: images[0],
      images,
      active: true,
      approved: autoApprove,
      reviewStatus: autoApprove ? "approved" : "pending",
      rejectionReason: "",
      hidden: false,
      createdAt: new Date(),
    };
    const result = await req.app.locals.productCollection.insertOne(product);
    return res.status(201).json({ product: serialize({ ...product, _id: result.insertedId }) });
  });

  router.get("/orders", async (req, res) => {
    const user = await resolveCurrentUser(req);
    if (!user) return res.status(200).json({ orders: [] });
    const orders = await req.app.locals.marketplaceOrderCollection
      .find({ $or: [{ buyerId: user.uid }, { sellerId: user.uid }] })
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json({ orders: orders.map(serialize) });
  });

  router.get("/orders/:id", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid order id" });
    }
    const order = await req.app.locals.marketplaceOrderCollection.findOne({
      _id: new ObjectId(req.params.id),
      $or: [{ buyerId: user.uid }, { sellerId: user.uid }],
    });
    if (!order) {
      return res.status(404).json({ error: "not_found", message: "Order not found" });
    }
    return res.status(200).json({ order: serialize(order) });
  });

  router.post("/orders", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const productId = String(req.body?.productId || "");
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    }

    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(productId), active: true, hidden: { $ne: true }, approved: true, reviewStatus: "approved" });
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
      updatedAt: new Date(),
      timeline: [
        timelineEntry("pending", "Order Created", "Your SMAJ Store order was created successfully."),
        timelineEntry("payment_pending", "Payment Pending", "Open Pi Browser to complete payment."),
      ],
    };
    const result = await req.app.locals.marketplaceOrderCollection.insertOne(order);
    await createNotification(req.app, { userId: product.sellerId, type: "new_order", title: "New order", message: `${order.buyerName} ordered ${product.title}`, relatedId: result.insertedId.toString() });
    return res.status(201).json({ order: serialize({ ...order, _id: result.insertedId }) });
  });

  router.post("/products/:id/report", async (req, res) => {
    const user = await requireUser(req, res);
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
    const user = await requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid order id" });
    }
    const status = req.body?.status;
    if (!["processing", "shipped", "delivered", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid order status" });
    }
    const order = await req.app.locals.marketplaceOrderCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!order || (order.buyerId !== user.uid && order.sellerId !== user.uid)) {
      return res.status(404).json({ error: "not_found", message: "Order not found" });
    }
    if (status === "cancelled" && order.buyerId !== user.uid && order.sellerId !== user.uid) {
      return res.status(403).json({ error: "forbidden", message: "Only the buyer or seller can cancel this order" });
    }
    if (["processing", "shipped", "delivered"].includes(status) && order.sellerId !== user.uid) {
      return res.status(403).json({ error: "forbidden", message: "Only the seller can update fulfillment status" });
    }
    if (status === "completed" && order.buyerId !== user.uid) {
      return res.status(403).json({ error: "forbidden", message: "Only the buyer can complete this order" });
    }
    if (status === "cancelled" && order.status !== "pending") {
      return res.status(400).json({ error: "bad_request", message: "Only pending orders can be cancelled" });
    }
    if (status === "processing" && order.status !== "paid") {
      return res.status(400).json({ error: "bad_request", message: "Only paid orders can move to processing" });
    }
    if (status === "shipped" && order.status !== "processing") {
      return res.status(400).json({ error: "bad_request", message: "Only processing orders can be marked shipped" });
    }
    if (status === "delivered" && order.status !== "shipped") {
      return res.status(400).json({ error: "bad_request", message: "Only shipped orders can be marked delivered" });
    }
    if (status === "completed" && order.status !== "delivered") {
      return res.status(400).json({ error: "bad_request", message: "Only delivered orders can be completed" });
    }
    const labels: Record<string, string> = {
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    const noteMap: Record<string, string> = {
      processing: "Seller started preparing your order.",
      shipped: "Your SMAJ Store order is on the way.",
      delivered: "Seller marked the order as delivered.",
      completed: "Order journey is complete.",
      cancelled: "The order was cancelled before fulfillment.",
    };
    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
      timeline: [...(Array.isArray(order.timeline) ? order.timeline : []), timelineEntry(status, labels[status], noteMap[status])],
    };
    await req.app.locals.marketplaceOrderCollection.updateOne({ _id: order._id }, { $set: updates });
    const receiverId = order.buyerId === user.uid ? order.sellerId : order.buyerId;
    await createNotification(req.app, { userId: receiverId, type: status === "completed" ? "order_completed" : "order_update", title: `Order ${status}`, message: `${order.productTitle} was marked ${status}`, relatedId: order._id.toString() });
    return res.status(200).json({ message: `Order marked ${status}` });
  });

  router.get("/saved", async (req, res) => {
    const user = await resolveCurrentUser(req); if (!user) return res.status(200).json({ products: [] });
    const favorites = await req.app.locals.favoriteCollection.find({ userId: user.uid }).sort({ createdAt: -1 }).toArray();
    const ids = favorites.map((item: any) => item.productId).filter(ObjectId.isValid).map((id: string) => new ObjectId(id));
    const products = ids.length ? await req.app.locals.productCollection.find({ _id: { $in: ids }, hidden: { $ne: true } }).toArray() : [];
    return res.status(200).json({ products: products.map(serialize) });
  });

  router.post("/products/:id/favorite", async (req, res) => {
    const user = await requireUser(req, res); if (!user) return;
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
    const seller = await req.app.locals.userCollection.findOne({ uid: req.params.id });
    if (!seller) return res.status(404).json({ error: "not_found", message: "Seller not found" });
    const [products, reviews, completedOrders] = await Promise.all([
      req.app.locals.productCollection.find({ sellerId: seller.uid, hidden: { $ne: true }, active: true, approved: true, reviewStatus: "approved" }).sort({ createdAt: -1 }).toArray(),
      req.app.locals.reviewCollection.find({ sellerId: seller.uid }).sort({ createdAt: -1 }).toArray(),
      req.app.locals.marketplaceOrderCollection.countDocuments({ sellerId: seller.uid, status: "completed" }),
    ]);
    const averageRating = reviews.length ? reviews.reduce((sum: number, review: any) => sum + Number(review.rating), 0) / reviews.length : 0;
    return res.status(200).json({ seller: { uid: seller.uid, displayName: seller.displayName, piUsername: seller.piUsername, country: seller.country, verificationLevel: seller.verificationLevel || "basic", createdAt: seller.createdAt, totalProducts: products.length, successfulOrders: completedOrders, averageRating, reviewCount: reviews.length }, products: products.map(serialize), reviews: reviews.map(serialize) });
  });

  router.post("/orders/:id/review", async (req, res) => {
    const user = await requireUser(req, res); if (!user) return;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid order id" });
    const order = await req.app.locals.marketplaceOrderCollection.findOne({ _id: new ObjectId(req.params.id), buyerId: user.uid, status: "completed" });
    if (!order) return res.status(404).json({ error: "not_found", message: "Completed order not found" });
    const rating = Number(req.body?.rating); const review = String(req.body?.message || req.body?.review || "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || review.length > 300) return res.status(400).json({ error: "bad_request", message: "Rating must be 1-5 stars" });
    await req.app.locals.reviewCollection.updateOne({ orderId: req.params.id }, { $setOnInsert: { orderId: req.params.id, sellerId: order.sellerId, buyerId: user.uid, buyerName: user.displayName || user.username, rating, message: review, createdAt: new Date() } }, { upsert: true });
    return res.status(201).json({ message: "Seller review saved" });
  });

  router.get("/seller", async (req, res) => {
    const user = await resolveCurrentUser(req);
    if (!user) return res.status(200).json({ products: [], orders: [], stats: { totalProducts: 0, totalOrders: 0, pendingOrders: 0, paidOrders: 0 } });
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
    const user = await requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(req.params.id), sellerId: user.uid });
    if (!product) return res.status(404).json({ error: "not_found", message: "Product not found" });
    const [seller, related, favorite] = await Promise.all([
      req.app.locals.userCollection.findOne({ uid: product.sellerId }),
      req.app.locals.productCollection.find({ category: product.category, _id: { $ne: product._id }, active: true, hidden: { $ne: true }, approved: true, reviewStatus: "approved" }).sort({ createdAt: -1 }).limit(4).toArray(),
      req.app.locals.favoriteCollection.findOne({ userId: req.session.currentUser!.uid, productId: req.params.id }),
    ]);
    return res.status(200).json({ product: serialize(product), seller: seller ? { uid: seller.uid, displayName: seller.displayName, piUsername: seller.piUsername, verificationLevel: seller.verificationLevel || "basic", createdAt: seller.createdAt } : null, related: related.map(serialize), saved: Boolean(favorite) });
  });

  router.put("/seller/products/:id", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    const fields = productFields(req.body);
    const validationMessage = productValidationMessage(fields);
    if (validationMessage || !validProduct(fields)) return res.status(400).json({ error: "bad_request", message: validationMessage || "Complete all required product fields" });
    const autoApprove = env.marketplace_auto_approve_products;
    const result = await req.app.locals.productCollection.updateOne(
      { _id: new ObjectId(req.params.id), sellerId: user.uid },
      { $set: { ...fields, approved: autoApprove, reviewStatus: autoApprove ? "approved" : "pending", rejectionReason: "", hidden: false, updatedAt: new Date() } },
    );
    if (!result.matchedCount) return res.status(404).json({ error: "not_found", message: "Product not found" });
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(req.params.id) });
    return res.status(200).json({ product: serialize(product) });
  });

  router.patch("/seller/products/:id/availability", async (req, res) => {
    const user = await requireUser(req, res);
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
    const user = await requireUser(req, res);
    if (!user) return;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    const result = await req.app.locals.productCollection.deleteOne({ _id: new ObjectId(req.params.id), sellerId: user.uid });
    if (!result.deletedCount) return res.status(404).json({ error: "not_found", message: "Product not found" });
    return res.status(200).json({ message: "Product deleted" });
  });
}
