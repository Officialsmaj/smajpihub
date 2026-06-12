import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";

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
});

const validProduct = (product: ReturnType<typeof productFields>) =>
  product.title && product.image && product.description && product.category && product.location && product.sellerContact
  && Number.isFinite(product.pricePi) && product.pricePi > 0;

export default function mountMarketplaceEndpoints(router: Router) {
  router.get("/products", async (req, res) => {
    if (!requireUser(req, res)) return;
    const products = await req.app.locals.productCollection.find({ active: true, hidden: { $ne: true }, approved: { $ne: false } }).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ products: products.map(serialize) });
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
    return res.status(200).json({ product: serialize(product) });
  });

  router.post("/products", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const fields = productFields(req.body);

    if (!validProduct(fields)) {
      return res.status(400).json({ error: "bad_request", message: "Complete all required product fields" });
    }

    const product = {
      sellerId: user.uid,
      sellerName: user.displayName || user.piUsername || user.username,
      piUsername: user.piUsername || user.username,
      ...fields,
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
      pricePi: product.pricePi,
      status: "pending",
      paymentStatus: "pending",
      paymentId: null,
      paymentTxid: null,
      paidAt: null,
      createdAt: new Date(),
    };
    const result = await req.app.locals.marketplaceOrderCollection.insertOne(order);
    return res.status(201).json({ order: serialize({ ...order, _id: result.insertedId }) });
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
    if (["paid", "cancelled"].includes(status) && order.buyerId !== user.uid) {
      return res.status(403).json({ error: "forbidden", message: "Only the buyer can update this order" });
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
    await req.app.locals.marketplaceOrderCollection.updateOne({ _id: order._id }, { $set: { status } });
    return res.status(200).json({ message: `Order marked ${status}` });
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
    return res.status(200).json({ product: serialize(product) });
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
