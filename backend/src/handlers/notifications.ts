import { Router } from "express";
import { ObjectId } from "mongodb";
import { resolveCurrentUser } from "../services/auth";

const serialize = (item: Record<string, any>) => ({ ...item, _id: item._id.toString() });

export default function mountNotificationEndpoints(router: Router) {
  router.get("/", async (req, res) => {
    const currentUser = await resolveCurrentUser(req);
    if (!currentUser) {
      return res.status(200).json({ notifications: [], unreadCount: 0 });
    }
    const userId = currentUser.uid;
    const notifications = await req.app.locals.notificationCollection.find({ userId }).sort({ createdAt: -1 }).limit(100).toArray();
    const unreadCount = await req.app.locals.notificationCollection.countDocuments({ userId, read: false });
    return res.status(200).json({ notifications: notifications.map(serialize), unreadCount });
  });

  router.patch("/read-all", async (req, res) => {
    const currentUser = await resolveCurrentUser(req);
    if (!currentUser) {
      return res.status(200).json({ message: "Notifications marked as read" });
    }
    await req.app.locals.notificationCollection.updateMany({ userId: currentUser.uid, read: false }, { $set: { read: true } });
    return res.status(200).json({ message: "Notifications marked as read" });
  });

  router.patch("/:id/read", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid notification id" });
    const currentUser = await resolveCurrentUser(req);
    if (!currentUser) {
      return res.status(200).json({ message: "Notification marked as read" });
    }
    await req.app.locals.notificationCollection.updateOne({ _id: new ObjectId(req.params.id), userId: currentUser.uid }, { $set: { read: true } });
    return res.status(200).json({ message: "Notification marked as read" });
  });

  router.delete("/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid notification id" });
    const currentUser = await resolveCurrentUser(req);
    if (!currentUser) {
      return res.status(200).json({ message: "Notification deleted" });
    }
    await req.app.locals.notificationCollection.deleteOne({ _id: new ObjectId(req.params.id), userId: currentUser.uid });
    return res.status(200).json({ message: "Notification deleted" });
  });
}
