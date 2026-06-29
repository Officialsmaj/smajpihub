import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { createNotification } from "../services/notifications";

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
    const [totalUsers, totalProducts, totalOrders, pendingOrders, paidOrders, reportedProducts, pendingOnboarding, pendingProducts] = await Promise.all([
      req.app.locals.userCollection.countDocuments(),
      req.app.locals.productCollection.countDocuments(),
      req.app.locals.marketplaceOrderCollection.countDocuments(),
      req.app.locals.marketplaceOrderCollection.countDocuments({ status: "pending" }),
      req.app.locals.marketplaceOrderCollection.countDocuments({ status: { $in: ["paid", "completed"] } }),
      req.app.locals.reportCollection.countDocuments({ resolved: { $ne: true }, targetType: "product" }),
      req.app.locals.onboardingCollection.countDocuments({ status: "pending" }),
      req.app.locals.productCollection.countDocuments({ approved: false, hidden: { $ne: true } }),
    ]);
    return res.status(200).json({ stats: { totalUsers, totalProducts, totalOrders, pendingOrders, paidOrders, reportedProducts, pendingOnboarding, pendingProducts } });
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
    if (["basic", "verified", "trusted_seller"].includes(req.body?.verificationLevel)) {
      updates.verificationLevel = req.body.verificationLevel;
      updates.verificationRequested = false;
    }
    if (!Object.keys(updates).length) return res.status(400).json({ error: "bad_request", message: "No valid user update supplied" });
    await req.app.locals.userCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    return res.status(200).json({ message: "User updated" });
  });

  router.get("/verification-requests", async (req, res) => {
    const users = await req.app.locals.userCollection.find({ verificationRequested: true }).sort({ verificationRequestedAt: -1 }).toArray();
    return res.status(200).json({ users: users.map(serialize) });
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
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(req.params.id) });
    await req.app.locals.productCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    if (product && typeof req.body?.approved === "boolean") await createNotification(req.app, { userId: product.sellerId, type: "product_approved", title: "Product approved", message: `${product.title} is approved for the Store`, relatedId: req.params.id });
    if (product && typeof req.body?.hidden === "boolean") await createNotification(req.app, { userId: product.sellerId, type: "product_hidden", title: req.body.hidden ? "Product hidden" : "Product visible", message: `${product.title} visibility was updated`, relatedId: req.params.id });
    return res.status(200).json({ message: "Product updated" });
  });

  router.get("/onboarding", async (req, res) => {
    const applications = await req.app.locals.onboardingCollection.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ applications: applications.map(serialize) });
  });

  router.patch("/onboarding/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid application id" });
    const status = req.body?.status;
    if (!["pending", "approved", "rejected", "contacted"].includes(status)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid application status" });
    }
    await req.app.locals.onboardingCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, reviewedAt: new Date(), reviewedBy: req.session.currentUser?.uid, updatedAt: new Date() } },
    );
    return res.status(200).json({ message: "Application updated" });
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
    const report = await req.app.locals.reportCollection.findOne({ _id: new ObjectId(req.params.id) });
    await req.app.locals.reportCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { resolved: true, resolvedAt: new Date(), resolvedBy: req.session.currentUser?.uid } },
    );
    if (report?.reportedBy) await createNotification(req.app, { userId: report.reportedBy, type: "report_update", title: "Report resolved", message: `Your report about ${report.targetName || report.targetType} was reviewed`, relatedId: req.params.id });
    return res.status(200).json({ message: "Report resolved" });
  });
}
