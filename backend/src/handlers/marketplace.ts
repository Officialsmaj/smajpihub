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

export default function mountMarketplaceEndpoints(router: Router) {
  router.get("/products", async (req, res) => {
    if (!requireUser(req, res)) return;
    const products = await req.app.locals.productCollection.find({ active: true }).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ products: products.map(serialize) });
  });

  router.get("/products/:id", async (req, res) => {
    if (!requireUser(req, res)) return;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    }
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(req.params.id), active: true });
    if (!product) {
      return res.status(404).json({ error: "not_found", message: "Product not found" });
    }
    return res.status(200).json({ product: serialize(product) });
  });

  router.post("/products", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    if (user.role !== "seller") {
      return res.status(403).json({ error: "forbidden", message: "Switch your profile role to seller first" });
    }

    const title = String(req.body?.title || "").trim();
    const image = String(req.body?.image || "").trim();
    const description = String(req.body?.description || "").trim();
    const category = String(req.body?.category || "").trim();
    const location = String(req.body?.location || "").trim();
    const sellerContact = String(req.body?.sellerContact || "").trim();
    const pricePi = Number(req.body?.pricePi);

    if (!title || !description || !category || !location || !sellerContact || !Number.isFinite(pricePi) || pricePi <= 0) {
      return res.status(400).json({ error: "bad_request", message: "Complete all required product fields" });
    }

    const product = {
      sellerId: user.uid,
      sellerName: user.displayName || user.piUsername,
      title,
      image,
      pricePi,
      description,
      category,
      location,
      sellerContact,
      active: true,
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

    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(productId), active: true });
    if (!product) {
      return res.status(404).json({ error: "not_found", message: "Product not found" });
    }
    if (product.sellerId === user.uid) {
      return res.status(400).json({ error: "bad_request", message: "You cannot order your own product" });
    }

    const order = {
      buyerId: user.uid,
      sellerId: product.sellerId,
      productId,
      productTitle: product.title,
      productImage: product.image,
      pricePi: product.pricePi,
      status: "pending",
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
    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid order status" });
    }
    const order = await req.app.locals.marketplaceOrderCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!order || (order.buyerId !== user.uid && order.sellerId !== user.uid)) {
      return res.status(404).json({ error: "not_found", message: "Order not found" });
    }
    if (status === "completed" && order.sellerId !== user.uid) {
      return res.status(403).json({ error: "forbidden", message: "Only the seller can complete an order" });
    }
    await req.app.locals.marketplaceOrderCollection.updateOne({ _id: order._id }, { $set: { status } });
    return res.status(200).json({ message: `Order marked ${status}` });
  });
}
