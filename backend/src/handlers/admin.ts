import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";

const serialize = (document: Record<string, any>) => ({ ...document, _id: document._id.toString(), accessToken: undefined });

const requireAdmin = (req: Request, res: Response) => {
  if (!req.session.currentUser) {
    res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    return null;
  }
  if (req.session.currentUser.role !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Admin access required" });
    return null;
  }
  return req.session.currentUser;
};

export default function mountAdminEndpoints(router: Router) {
  router.use((req, res, next) => { if (requireAdmin(req, res)) next(); });

  router.get("/stats", async (req, res) => {
    const [totalUsers, totalProducts, totalOrders, pendingOrders, paidOrders, reportedProducts] = await Promise.all([
      req.app.locals.userCollection.countDocuments(),
      req.app.locals.productCollection.countDocuments(),
      req.app.locals.marketplaceOrderCollection.countDocuments(),
      req.app.locals.marketplaceOrderCollection.countDocuments({ status: "pending" }),
      req.app.locals.marketplaceOrderCollection.countDocuments({ status: { $in: ["paid", "completed"] } }),
      req.app.locals.reportCollection.countDocuments({ resolved: { $ne: true }, targetType: "product" }),
    ]);
    return res.status(200).json({ stats: { totalUsers, totalProducts, totalOrders, pendingOrders, paidOrders, reportedProducts } });
  });

  router.get("/users", async (req, res) => {
    const users = await req.app.locals.userCollection.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ users: users.map(serialize) });
  });

  router.patch("/users/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid user id" });
    const updates: Record<string, unknown> = {};
    if (typeof req.body?.blocked === "boolean") updates.blocked = req.body.blocked;
    if (["buyer", "seller", "admin"].includes(req.body?.role)) {
      updates.role = req.body.role;
      updates.roles = [req.body.role];
    }
    if (!Object.keys(updates).length) return res.status(400).json({ error: "bad_request", message: "No valid user update supplied" });
    await req.app.locals.userCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    return res.status(200).json({ message: "User updated" });
  });

  router.get("/products", async (req, res) => {
    const products = await req.app.locals.productCollection.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ products: products.map(serialize) });
  });

  router.patch("/products/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    const updates: Record<string, unknown> = {};
    if (typeof req.body?.approved === "boolean") updates.approved = req.body.approved;
    if (typeof req.body?.hidden === "boolean") updates.hidden = req.body.hidden;
    if (!Object.keys(updates).length) return res.status(400).json({ error: "bad_request", message: "No valid product update supplied" });
    await req.app.locals.productCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    return res.status(200).json({ message: "Product updated" });
  });

  router.delete("/products/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    await req.app.locals.productCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    return res.status(200).json({ message: "Product deleted" });
  });

  router.get("/orders", async (req, res) => {
    const orders = await req.app.locals.marketplaceOrderCollection.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ orders: orders.map(serialize) });
  });

  router.patch("/orders/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id) || !["pending", "paid", "completed", "cancelled"].includes(req.body?.status)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid order update" });
    }
    await req.app.locals.marketplaceOrderCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: req.body.status, updatedAt: new Date() } },
    );
    return res.status(200).json({ message: "Order updated" });
  });

  router.get("/reports", async (req, res) => {
    const reports = await req.app.locals.reportCollection.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ reports: reports.map(serialize) });
  });

  router.patch("/reports/:id/resolve", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid report id" });
    await req.app.locals.reportCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { resolved: true, resolvedAt: new Date(), resolvedBy: req.session.currentUser?.uid } },
    );
    return res.status(200).json({ message: "Report resolved" });
  });
}
