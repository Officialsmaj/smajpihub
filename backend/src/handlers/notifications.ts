import { Router } from "express";
import { ObjectId } from "mongodb";

const serialize = (item: Record<string, any>) => ({ ...item, _id: item._id.toString() });

export default function mountNotificationEndpoints(router: Router) {
  router.use((req, res, next) => {
    if (!req.session.currentUser) return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    next();
  });

  router.get("/", async (req, res) => {
    const userId = req.session.currentUser!.uid;
    const notifications = await req.app.locals.notificationCollection.find({ userId }).sort({ createdAt: -1 }).limit(100).toArray();
    const unreadCount = await req.app.locals.notificationCollection.countDocuments({ userId, read: false });
    return res.status(200).json({ notifications: notifications.map(serialize), unreadCount });
  });

  router.patch("/read-all", async (req, res) => {
    await req.app.locals.notificationCollection.updateMany({ userId: req.session.currentUser!.uid, read: false }, { $set: { read: true } });
    return res.status(200).json({ message: "Notifications marked as read" });
  });

  router.patch("/:id/read", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid notification id" });
    await req.app.locals.notificationCollection.updateOne({ _id: new ObjectId(req.params.id), userId: req.session.currentUser!.uid }, { $set: { read: true } });
    return res.status(200).json({ message: "Notification marked as read" });
  });
}
