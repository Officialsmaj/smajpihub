import { Router } from "express";
import { ObjectId } from "mongodb";
import { createNotification } from "../services/notifications";

const serialize = (item: Record<string, any>) => ({ ...item, _id: item._id.toString() });

export default function mountMessageEndpoints(router: Router) {
  router.use((req, res, next) => {
    if (!req.session.currentUser) return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    next();
  });

  router.get("/", async (req, res) => {
    const uid = req.session.currentUser!.uid;
    const conversations = await req.app.locals.conversationCollection.find({ participants: uid }).sort({ updatedAt: -1 }).toArray();
    return res.status(200).json({ conversations: conversations.map(serialize) });
  });

  router.post("/start", async (req, res) => {
    const user = req.session.currentUser!;
    const productId = String(req.body?.productId || "");
    if (!ObjectId.isValid(productId)) return res.status(400).json({ error: "bad_request", message: "Invalid product id" });
    const product = await req.app.locals.productCollection.findOne({ _id: new ObjectId(productId) });
    if (!product || product.sellerId === user.uid) return res.status(400).json({ error: "bad_request", message: "Conversation cannot be created" });
    let conversation = await req.app.locals.conversationCollection.findOne({ buyerId: user.uid, sellerId: product.sellerId, productId });
    if (!conversation) {
      const document = {
        buyerId: user.uid,
        buyerName: user.displayName || user.username,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        productId,
        productTitle: product.title,
        productImage: product.image,
        participants: [user.uid, product.sellerId],
        lastMessage: "",
        unreadBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await req.app.locals.conversationCollection.insertOne(document);
      conversation = { ...document, _id: result.insertedId };
    }
    return res.status(200).json({ conversation: serialize(conversation) });
  });

  router.get("/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid conversation id" });
    const uid = req.session.currentUser!.uid;
    const conversation = await req.app.locals.conversationCollection.findOne({ _id: new ObjectId(req.params.id), participants: uid });
    if (!conversation) return res.status(404).json({ error: "not_found", message: "Conversation not found" });
    const messages = await req.app.locals.messageCollection.find({ conversationId: req.params.id }).sort({ createdAt: 1 }).toArray();
    await req.app.locals.conversationCollection.updateOne({ _id: conversation._id }, { $pull: { unreadBy: uid } });
    return res.status(200).json({ conversation: serialize(conversation), messages: messages.map(serialize) });
  });

  router.post("/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid conversation id" });
    const user = req.session.currentUser!;
    const conversation = await req.app.locals.conversationCollection.findOne({ _id: new ObjectId(req.params.id), participants: user.uid });
    if (!conversation) return res.status(404).json({ error: "not_found", message: "Conversation not found" });
    const message = String(req.body?.message || "").trim();
    if (!message || message.length > 1000) return res.status(400).json({ error: "bad_request", message: "Message must be 1-1000 characters" });
    const receiverId = conversation.buyerId === user.uid ? conversation.sellerId : conversation.buyerId;
    const document = { conversationId: req.params.id, senderId: user.uid, senderName: user.displayName || user.username, message, createdAt: new Date() };
    const result = await req.app.locals.messageCollection.insertOne(document);
    await req.app.locals.conversationCollection.updateOne({ _id: conversation._id }, { $set: { lastMessage: message, updatedAt: new Date() }, $addToSet: { unreadBy: receiverId } });
    await createNotification(req.app, { userId: receiverId, type: "new_message", title: "New message", message: `${document.senderName}: ${message.slice(0, 100)}`, relatedId: req.params.id });
    return res.status(201).json({ message: serialize({ ...document, _id: result.insertedId }) });
  });
}
