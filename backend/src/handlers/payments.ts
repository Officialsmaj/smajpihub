import axios from "axios";
import { Router } from "express";
import { getAppPlatformAPIClient } from "../services/platformAPIClient";
import "../types/session";
import { ObjectId } from "mongodb";
import { createNotification } from "../services/notifications";
import { resolveCurrentUser } from "../services/auth";

export default function mountPaymentsEndpoints(router: Router) {
  // handle the incomplete payment
  router.post("/incomplete", async (req, res) => {
    try {
      const payment = req.body.payment;
      const piAPI = getAppPlatformAPIClient();
      const paymentId = payment.identifier;
      const txid = payment.transaction && payment.transaction.txid;
      const txURL = payment.transaction && payment.transaction._link;

      /* 
        Implement your logic here
        e.g. verifying the payment, delivering the item to the user, etc...
      */

      const app = req.app;
      const paymentCollection = app.locals.paymentCollection;
      const order = await paymentCollection.findOne({ pi_payment_id: paymentId });

      if (!order) {
        return res.status(400).json({ error: "not_found", message: "Order not found" });
      }

      const horizonResponse = await axios.create({ timeout: 20000 }).get(txURL);
      const paymentIdOnBlock = horizonResponse.data.memo;

      if (paymentIdOnBlock !== order.pi_payment_id) {
        return res.status(400).json({ error: "mismatch", message: "Payment id doesn't match" });
      }

      await paymentCollection.updateOne({ pi_payment_id: paymentId }, { $set: { txid, paid: true } });
      if (order.orderId && ObjectId.isValid(order.orderId)) {
        const marketplaceOrder = await app.locals.marketplaceOrderCollection.findOne({
          _id: new ObjectId(order.orderId),
          buyerId: order.user,
        });
        await app.locals.marketplaceOrderCollection.updateOne(
          { _id: new ObjectId(order.orderId), buyerId: order.user },
          {
            $set: { status: "paid", paymentStatus: "paid", paymentId, paymentTxid: txid, paidAt: new Date(), updatedAt: new Date() },
            $push: { timeline: { status: "paid", label: "Paid", note: "Pi payment was confirmed successfully.", at: new Date().toISOString() } },
          },
        );
        if (marketplaceOrder) {
          await createNotification(app, {
            userId: marketplaceOrder.sellerId,
            type: "order_paid",
            title: "Order paid",
            message: `${marketplaceOrder.productTitle} has been paid with Pi.`,
            relatedId: String(marketplaceOrder._id),
            image: marketplaceOrder.productImage,
          });
        }
      }
      await piAPI.post(`/v2/payments/${paymentId}/complete`, { txid });
      return res.status(200).json({ message: `Handled the incomplete payment ${paymentId}` });
    } catch (err) {
      console.error("Error handling incomplete payment:", err);
      return res.status(500).json({ error: "internal_error", message: "Failed to handle incomplete payment" });
    }
  });

  // approve the current payment
  router.post("/approve", async (req, res) => {
    try {
      const currentUser = await resolveCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
      }

      const app = req.app;
      const paymentId = req.body.paymentId;
      const piAPI = getAppPlatformAPIClient();
      const currentPayment = await piAPI.get(`/v2/payments/${paymentId}`);
      const paymentCollection = app.locals.paymentCollection;
      const orderId = String(currentPayment.data.metadata.orderId || "");

      if (!ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: "bad_request", message: "Payment is missing a valid order" });
      }
      const marketplaceOrder = await app.locals.marketplaceOrderCollection.findOne({
        _id: new ObjectId(orderId),
        buyerId: currentUser.uid,
        status: "pending",
      });
      if (!marketplaceOrder || Number(currentPayment.data.amount) !== Number(marketplaceOrder.pricePi)) {
        return res.status(400).json({ error: "mismatch", message: "Payment does not match the order" });
      }

      /* 
        Implement your logic here 
        e.g. creating an order record, reserve an item if the quantity is limited, etc...
      */

      await paymentCollection.updateOne({ pi_payment_id: paymentId }, { $setOnInsert: {
        pi_payment_id: paymentId,
        orderId,
        product_id: marketplaceOrder.productId,
        user: currentUser.uid,
        txid: null,
        paid: false,
        cancelled: false,
        created_at: new Date(),
      } }, { upsert: true });

      await app.locals.marketplaceOrderCollection.updateOne(
        { _id: marketplaceOrder._id },
        { $set: { paymentStatus: "processing", paymentId, updatedAt: new Date() } },
      );

      await piAPI.post(`/v2/payments/${paymentId}/approve`);
      return res.status(200).json({ message: `Approved the payment ${paymentId}` });
    } catch (err) {
      console.error("Error approving payment:", err);
      return res.status(500).json({ error: "internal_error", message: "Failed to approve payment" });
    }
  });

  // complete the current payment
  router.post("/complete", async (req, res) => {
    try {
      const currentUser = await resolveCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "unauthorized", message: "A signed-in user is required" });
      }

      const app = req.app;
      const paymentId = req.body.paymentId;
      const txid = req.body.txid;
      const paymentCollection = app.locals.paymentCollection;
      const piAPI = getAppPlatformAPIClient();

      if (!paymentId || !txid) {
        return res.status(400).json({ error: "bad_request", message: "Payment id and transaction id are required" });
      }

      /* 
        Implement your logic here
        e.g. verify the transaction, deliver the item to the user, etc...
      */

      const paymentRecord = await paymentCollection.findOne({ pi_payment_id: paymentId });
      if (!paymentRecord || paymentRecord.user !== currentUser.uid) {
        return res.status(404).json({ error: "not_found", message: "Payment record not found" });
      }
      const currentPayment = await piAPI.get(`/v2/payments/${paymentId}`);
      if (String(currentPayment.data.transaction?.txid || "") !== String(txid)) {
        return res.status(400).json({ error: "mismatch", message: "Payment transaction does not match" });
      }
      await paymentCollection.updateOne({ pi_payment_id: paymentId }, { $set: { txid: txid, paid: true } });
      if (ObjectId.isValid(paymentRecord.orderId)) {
        const marketplaceOrder = await app.locals.marketplaceOrderCollection.findOne({
          _id: new ObjectId(paymentRecord.orderId),
          buyerId: currentUser.uid,
        });
        await app.locals.marketplaceOrderCollection.updateOne(
          { _id: new ObjectId(paymentRecord.orderId), buyerId: currentUser.uid },
          {
            $set: { status: "paid", paymentStatus: "paid", paymentId, paymentTxid: txid, paidAt: new Date(), updatedAt: new Date() },
            $push: { timeline: { status: "paid", label: "Paid", note: "Pi payment was confirmed successfully.", at: new Date().toISOString() } },
          },
        );
        if (marketplaceOrder) {
          await createNotification(app, {
            userId: marketplaceOrder.sellerId,
            type: "order_paid",
            title: "Order paid",
            message: `${marketplaceOrder.productTitle} has been paid with Pi.`,
            relatedId: String(marketplaceOrder._id),
            image: marketplaceOrder.productImage,
          });
        }
      }
      await piAPI.post(`/v2/payments/${paymentId}/complete`, { txid });
      return res.status(200).json({ message: `Completed the payment ${paymentId}` });
    } catch (err) {
      console.error("Error completing payment:", err);
      return res.status(500).json({ error: "internal_error", message: "Failed to complete payment" });
    }
  });

  // handle the cancelled payment
  router.post("/cancelled_payment", async (req, res) => {
    try {
      const currentUser = await resolveCurrentUser(req);
      const app = req.app;
      const paymentId = req.body.paymentId;
      const paymentCollection = app.locals.paymentCollection;

      /*
        Implement your logic here
        e.g. mark the order record to cancelled, etc...
      */

      const paymentRecord = await paymentCollection.findOne({ pi_payment_id: paymentId });
      await paymentCollection.updateOne({ pi_payment_id: paymentId }, { $set: { cancelled: true } });
      if (paymentRecord?.orderId && ObjectId.isValid(paymentRecord.orderId) && currentUser?.uid) {
        await app.locals.marketplaceOrderCollection.updateOne(
          { _id: new ObjectId(paymentRecord.orderId), buyerId: currentUser.uid },
          { $set: { status: "pending", paymentStatus: "cancelled", updatedAt: new Date() } },
        );
      }
      return res.status(200).json({ message: `Cancelled the payment ${paymentId}` });
    } catch (err) {
      console.error("Error cancelling payment:", err);
      return res.status(500).json({ error: "internal_error", message: "Failed to cancel payment" });
    }
  });

  router.post("/failed", async (req, res) => {
    // Keep pending orders pending when Pi reports a failure.
    // Do not mark the order as failed automatically.
    return res.status(200).json({ message: "Payment failure received. Order remains pending." });
  });
}
