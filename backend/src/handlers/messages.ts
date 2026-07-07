import { Router } from "express";
import { ObjectId } from "mongodb";
import { createNotification } from "../services/notifications";
import { resolveCurrentUser } from "../services/auth";

const serialize = (item: Record<string, any>) => ({ ...item, _id: item._id.toString() });
const ONLINE_WINDOW_MS = 2 * 60 * 1000;
const TYPING_WINDOW_MS = 5 * 1000;
const verificationStatus = (user: any) => ["none", "pending", "approved", "rejected"].includes(user?.verificationStatus) ? user.verificationStatus : user?.verificationRequested ? "pending" : "none";
const publicVerificationLevel = (user: any) => verificationStatus(user) === "approved" && ["verified", "trusted_seller"].includes(user?.verificationLevel) ? user.verificationLevel : "basic";

const enrichConversations = async (req: any, currentUser: Record<string, any>, conversations: Array<Record<string, any>>) => {
  const otherUserIds = conversations
    .map((conversation) => conversation.buyerId === currentUser.uid ? conversation.sellerId : conversation.buyerId)
    .filter(Boolean);
  const users: Array<Record<string, any>> = otherUserIds.length && req.app.locals.userCollection
    ? await req.app.locals.userCollection.find({ uid: { $in: otherUserIds } }).toArray()
    : [];
  const usersById = new Map(users.map((user: Record<string, any>) => [user.uid, user]));

  return conversations.map((conversation) => {
    const otherUserId = conversation.buyerId === currentUser.uid ? conversation.sellerId : conversation.buyerId;
    const otherUser = usersById.get(otherUserId);
    const lastSeenAt = otherUser?.lastSeenAt || otherUser?.updatedAt || conversation.updatedAt;
    const lastSeenMs = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
    const online = Boolean(otherUser?.online) || (lastSeenMs > 0 && Date.now() - lastSeenMs < ONLINE_WINDOW_MS);
    const typingAt = conversation.typingBy?.[otherUserId];
    const typingMs = typingAt ? new Date(typingAt).getTime() : 0;
    return {
      ...serialize(conversation),
      participantId: otherUserId,
      participantName: otherUser?.displayName || otherUser?.username || (conversation.buyerId === currentUser.uid ? conversation.sellerName : conversation.buyerName),
      profileImage: otherUser?.avatar || (conversation.buyerId === currentUser.uid ? conversation.sellerAvatar : conversation.buyerAvatar) || "",
      verificationLevel: publicVerificationLevel(otherUser),
      verificationStatus: verificationStatus(otherUser),
      online,
      lastSeenAt,
      typing: typingMs > 0 && Date.now() - typingMs < TYPING_WINDOW_MS,
    };
  });
};

export default function mountMessageEndpoints(router: Router) {
  router.get("/", async (req, res) => {
    const currentUser = await resolveCurrentUser(req);
    if (!currentUser) return res.status(200).json({ conversations: [] });
    const uid = currentUser.uid;
    const conversations = await req.app.locals.conversationCollection.find({ participants: uid }).sort({ updatedAt: -1 }).toArray();
    return res.status(200).json({ conversations: await enrichConversations(req, currentUser, conversations) });
  });

  router.post("/start", async (req, res) => {
    const user = await resolveCurrentUser(req);
    if (!user) return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
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
    const currentUser = await resolveCurrentUser(req);
    if (!currentUser) return res.status(200).json({ conversation: null, messages: [] });
    const uid = currentUser.uid;
    const conversation = await req.app.locals.conversationCollection.findOne({ _id: new ObjectId(req.params.id), participants: uid });
    if (!conversation) return res.status(404).json({ error: "not_found", message: "Conversation not found" });
    await req.app.locals.messageCollection.updateMany({ conversationId: req.params.id, senderId: { $ne: uid }, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
    const messages = await req.app.locals.messageCollection.find({ conversationId: req.params.id }).sort({ createdAt: 1 }).toArray();
    await req.app.locals.conversationCollection.updateOne({ _id: conversation._id }, { $pull: { unreadBy: uid } });
    const [enrichedConversation] = await enrichConversations(req, currentUser, [conversation]);
    return res.status(200).json({ conversation: enrichedConversation, messages: messages.map(serialize) });
  });

  router.post("/:id/typing", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid conversation id" });
    const user = await resolveCurrentUser(req);
    if (!user) return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    const conversation = await req.app.locals.conversationCollection.findOne({ _id: new ObjectId(req.params.id), participants: user.uid });
    if (!conversation) return res.status(404).json({ error: "not_found", message: "Conversation not found" });
    const typingBy = { ...(conversation.typingBy || {}) };
    if (req.body?.typing) typingBy[user.uid] = new Date();
    else delete typingBy[user.uid];
    await req.app.locals.conversationCollection.updateOne({ _id: conversation._id }, { $set: { typingBy } });
    return res.status(200).json({ ok: true });
  });

  router.post("/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "bad_request", message: "Invalid conversation id" });
    const user = await resolveCurrentUser(req);
    if (!user) return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    const conversation = await req.app.locals.conversationCollection.findOne({ _id: new ObjectId(req.params.id), participants: user.uid });
    if (!conversation) return res.status(404).json({ error: "not_found", message: "Conversation not found" });
    const message = String(req.body?.message || "").trim();
    if (!message || message.length > 1000) return res.status(400).json({ error: "bad_request", message: "Message must be 1-1000 characters" });
    const receiverId = conversation.buyerId === user.uid ? conversation.sellerId : conversation.buyerId;
    const document = { conversationId: req.params.id, senderId: user.uid, senderName: user.displayName || user.username, message, createdAt: new Date() };
    const result = await req.app.locals.messageCollection.insertOne(document);
    await req.app.locals.conversationCollection.updateOne({ _id: conversation._id }, { $set: { lastMessage: message, updatedAt: new Date() }, $addToSet: { unreadBy: receiverId } });
    await createNotification(req.app, { userId: receiverId, type: "new_message", title: "New message", message: `${document.senderName}: ${message.slice(0, 100)}`, relatedId: req.params.id, image: user.avatar || "" });
    return res.status(201).json({ message: serialize({ ...document, _id: result.insertedId }) });
  });
}
