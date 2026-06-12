import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import { useAuthContext } from "../../contexts/AuthContext";
import type { Order, OrderStatus } from "../../types/marketplace";
import { usePayments } from "../../hooks/usePayments";
import { isAxiosError } from "axios";

const OrdersPage = () => {
  const { user, isAuthenticated, requireAuth } = useAuthContext();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState((location.state as { message?: string } | null)?.message || "");
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await axiosClient.get<{ orders: Order[] }>("/marketplace/orders");
      setOrders(data.orders);
      setError("");
    } catch {
      setError("Could not load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);
  const { orderProduct, isLoading: paymentLoading } = usePayments({
    isAuthenticated,
    onRequireAuth: requireAuth,
    onPaymentStatus: setMessage,
    onPaymentComplete: loadOrders,
  });
  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await axiosClient.patch(`/marketplace/orders/${orderId}/status`, { status });
      setMessage(status === "paid" ? "Test payment successful. Order marked paid." : `Order marked ${status}.`);
      await loadOrders();
    } catch (error: unknown) {
      setMessage(isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || "Could not update order." : "Could not update order.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <main className="private-page">
      <section className="private-page-head"><div><p className="private-kicker">STORE ACTIVITY</p><h1>Orders</h1><p>Manage purchases, sales, and Pi payment status.</p></div></section>
      {message ? <div className="private-alert">{message}</div> : null}
      {error ? <div className="private-alert error">{error}</div> : null}
      {loading ? <div className="private-state">Loading orders...</div> : null}
      {!loading && orders.length === 0 ? <div className="private-state"><h2>No orders yet</h2><p>Create an order from a product page to begin.</p></div> : null}
      <section className="orders-list">
        {orders.map((order) => {
          const isBuyer = order.buyerId === user?.uid;
          return (
            <article className="order-card" key={order._id}>
              <div className="order-image">{order.productImage ? <img src={order.productImage} alt="" /> : <span>PI</span>}</div>
              <div className="order-main">
                <small>{isBuyer ? "Purchase" : "Sale"}</small>
                <h2>{order.productTitle}</h2>
                <p>Buyer: {order.buyerName || order.buyerId}</p>
                <p>Seller: {order.sellerName || order.sellerId}</p>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <strong className="order-price">{order.pricePi} Pi</strong>
              <span className={`order-status ${order.status}`}>{order.status}</span>
              <div className="order-actions">
                {isBuyer && order.status === "pending" ? <button disabled={paymentLoading || updatingId === order._id} onClick={() => void orderProduct(`SMAJ order: ${order.productTitle}`, order.pricePi, { productId: order.productId, orderId: order._id })}>{paymentLoading ? "Opening Pi payment..." : "Pay with Pi Browser"}</button> : null}
                {isBuyer && order.status === "pending" ? <button disabled={updatingId === order._id || paymentLoading} className="secondary" onClick={() => void updateStatus(order._id, "paid")}>Pay with Pi (Test)</button> : null}
                {isBuyer && order.status === "pending" ? <button disabled={updatingId === order._id} className="secondary" onClick={() => void updateStatus(order._id, "cancelled")}>Cancel order</button> : null}
                {!isBuyer && order.status === "paid" ? <button disabled={updatingId === order._id} onClick={() => void updateStatus(order._id, "completed")}>Mark as completed</button> : null}
              </div>
              {order.paymentStatus && order.paymentStatus !== "pending" ? <small className={`payment-state ${order.paymentStatus}`}>Payment: {order.paymentStatus}{order.paymentTxid ? ` · Tx ${order.paymentTxid}` : ""}</small> : null}
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default OrdersPage;
