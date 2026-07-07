import { Router } from "express";

import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { resolveCurrentUser } from "../services/auth";

const timelineEntry = (status: string, label: string, note?: string) => ({
  status,
  label,
  note,
  at: new Date().toISOString(),
});

const requireUser = async (req: Request, res: Response) => {
  const currentUser = await resolveCurrentUser(req);
  if (!currentUser) {
    res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    return null;
  }
  return currentUser;
};

const findBuyerOrder = async (req: Request, res: Response, orderId: string) => {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (!ObjectId.isValid(orderId)) {
    res.status(400).json({ error: "bad_request", message: "Invalid order id" });
    return null;
  }
  const order = await req.app.locals.marketplaceOrderCollection.findOne({ _id: new ObjectId(orderId), buyerId: user.uid });
  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return null;
  }
  return order;
};

export default function mountPaymentsEndpoints(router: Router) {
  router.post("/incomplete", async (_req, res) => {
    return res.status(200).json({ message: "Pi payments are temporarily disabled. No payment was processed." });
  });

  router.post("/approve", async (req, res) => {
    const { paymentId, orderId } = req.body || {};
    if (!paymentId || !orderId) {
      return res.status(400).json({ error: "bad_request", message: "Missing paymentId or orderId." });
    }

    const order = await findBuyerOrder(req, res, String(orderId));
    if (!order) return;
    if (order.status !== "pending") {
      return res.status(400).json({ error: "bad_request", message: "Only pending orders can be approved for payment." });
    }

    await req.app.locals.marketplaceOrderCollection.updateOne(
      { _id: order._id },
      {
        $set: {
          paymentId,
          paymentStatus: "processing",
          updatedAt: new Date(),
          timeline: [
            ...(Array.isArray(order.timeline) ? order.timeline : []),
            timelineEntry("payment_processing", "Payment Processing", "Pi payment was approved and is waiting for confirmation."),
          ],
        },
      }
    );

    return res.status(200).json({ message: "Payment approved.", paymentId });
  });

  router.post("/complete", async (req, res) => {
    const { paymentId, orderId, txid } = req.body || {};
    if (!paymentId || !orderId || !txid) {
      return res.status(400).json({ error: "bad_request", message: "Missing paymentId, orderId, or txid." });
    }

    const order = await findBuyerOrder(req, res, String(orderId));
    if (!order) return;
    if (order.status !== "pending") {
      return res.status(400).json({ error: "bad_request", message: "Only pending orders can be completed with payment." });
    }

    await req.app.locals.marketplaceOrderCollection.updateOne(
      { _id: order._id },
      {
        $set: {
          status: "paid",
          paymentStatus: "paid",
          paymentId,
          paymentTxid: txid,
          paidAt: new Date(),
          updatedAt: new Date(),
          timeline: [
            ...(Array.isArray(order.timeline) ? order.timeline : []),
            timelineEntry("paid", "Paid", "Pi payment confirmed."),
          ],
        },
      }
    );

    return res.status(200).json({ message: "Payment completed.", paymentId, txid });
  });

  router.post("/cancelled_payment", async (req, res) => {
    const { paymentId, orderId } = req.body || {};
    if (!paymentId || !orderId) {
      return res.status(400).json({ error: "bad_request", message: "Missing paymentId or orderId." });
    }

    const order = await findBuyerOrder(req, res, String(orderId));
    if (!order) return;

    await req.app.locals.marketplaceOrderCollection.updateOne(
      { _id: order._id },
      {
        $set: {
          paymentId,
          paymentStatus: "cancelled",
          updatedAt: new Date(),
          timeline: [
            ...(Array.isArray(order.timeline) ? order.timeline : []),
            timelineEntry("cancelled", "Payment Cancelled", "Pi payment was cancelled."),
          ],
        },
      }
    );

    return res.status(200).json({ message: "Payment cancelled." });
  });

  router.post("/failed", async (req, res) => {
    const { paymentId, orderId } = req.body || {};
    if (!paymentId || !orderId) {
      return res.status(400).json({ error: "bad_request", message: "Missing paymentId or orderId." });
    }

    const order = await findBuyerOrder(req, res, String(orderId));
    if (!order) return;

    await req.app.locals.marketplaceOrderCollection.updateOne(
      { _id: order._id },
      {
        $set: {
          paymentId,
          paymentStatus: "failed",
          updatedAt: new Date(),
          timeline: [
            ...(Array.isArray(order.timeline) ? order.timeline : []),
            timelineEntry("failed", "Payment Failed", "Pi payment failed. Please try again."),
          ],
        },
      }
    );

    return res.status(200).json({ message: "Payment failed. Order remains pending." });
  });
}
