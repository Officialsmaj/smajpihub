import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import { useAuthContext } from "../../contexts/AuthContext";
import { usePayments } from "../../hooks/usePayments";
import type { Order, OrderStatus } from "../../types/marketplace";

const OrdersPage = () => {
  const { user, isAuthenticated, requireAuth } = useAuthContext();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState((location.state as { message?: string } | null)?.message || "");

  const loadOrders = useCallback(async () => {
    const { data } = await axiosClient.get<{ orders: Order[] }>("/marketplace/orders");
    setOrders(data.orders);
    setLoading(false);
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);
  const { orderProduct, isLoading: paymentLoading } = usePayments({
    isAuthenticated,
    onRequireAuth: requireAuth,
    onPaymentStatus: (text) => { setMessage(text); void loadOrders(); },
  });

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await axiosClient.patch(`/marketplace/orders/${orderId}/status`, { status });
    setMessage(`Order marked ${status}.`);
    await loadOrders();
  };

  return (
    <main className="private-page">
      <section className="private-page-head"><div><p className="private-kicker">STORE ACTIVITY</p><h1>Orders</h1><p>Manage purchases, sales, and Pi payment status.</p></div></section>
      {message ? <div className="private-alert">{message}</div> : null}
      {loading ? <div className="private-state">Loading orders...</div> : null}
      {!loading && orders.length === 0 ? <div className="private-state"><h2>No orders yet</h2><p>Create an order from a product page to begin.</p></div> : null}
      <section className="orders-list">
        {orders.map((order) => {
          const isBuyer = order.buyerId === user?.uid;
          return (
            <article className="order-card" key={order._id}>
              <div className="order-image">{order.productImage ? <img src={order.productImage} alt="" /> : <span>PI</span>}</div>
              <div className="order-main"><small>{isBuyer ? "Purchase" : "Sale"}</small><h2>{order.productTitle}</h2><p>{new Date(order.createdAt).toLocaleDateString()}</p></div>
              <strong className="order-price">{order.pricePi} Pi</strong>
              <span className={`order-status ${order.status}`}>{order.status}</span>
              <div className="order-actions">
                {isBuyer && order.status === "pending" ? <button disabled={paymentLoading} onClick={() => void orderProduct(`SMAJ Store: ${order.productTitle}`, order.pricePi, { productId: order.productId, orderId: order._id })}>Pay with Pi (Test)</button> : null}
                {isBuyer && order.status === "pending" ? <button className="secondary" onClick={() => void updateStatus(order._id, "cancelled")}>Cancel</button> : null}
                {!isBuyer && order.status === "paid" ? <button onClick={() => void updateStatus(order._id, "completed")}>Mark completed</button> : null}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default OrdersPage;
