import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import PrivateSkeleton from "../../components/PrivateSkeleton";
import { axiosClient } from "../../lib/axiosClient";
import { formatPiAmount } from "../../lib/formatters";
import { useAuthContext } from "../../contexts/AuthContext";
import { usePayments } from "../../hooks/usePayments";
import type { Order, OrderStatus } from "../../types/marketplace";

const OrdersPage = () => {
  const { user, isAuthenticated, requireAuth } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState((location.state as { message?: string } | null)?.message || "");
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState("");

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

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const buyerOrders = useMemo(
    () => orders.filter((order) => order.buyerId === user?.uid),
    [orders, user?.uid]
  );
  const sellerOrders = useMemo(
    () => orders.filter((order) => order.sellerId === user?.uid),
    [orders, user?.uid]
  );

  const { orderProduct, isLoading: paymentLoading, activeOrderId } = usePayments({
    isAuthenticated,
    onRequireAuth: requireAuth,
    onPaymentStatus: setMessage,
    onPaymentComplete: loadOrders,
  });

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await axiosClient.patch(`/marketplace/orders/${orderId}/status`, { status });
      setMessage(`Order marked ${status}.`);
      await loadOrders();
    } catch (err: unknown) {
      setMessage(
        isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || "Could not update order."
          : "Could not update order."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const messageSeller = async (productId: string) => {
    const { data } = await axiosClient.post("/messages/start", { productId });
    navigate(`/messages?conversation=${data.conversation._id}`);
  };

  const submitReview = async () => {
    if (!reviewOrder) return;
    await axiosClient.post(`/marketplace/orders/${reviewOrder._id}/review`, { rating: reviewRating, message: reviewMessage });
    setMessage("Thanks. Your seller review was saved.");
    setReviewOrder(null);
    setReviewMessage("");
  };

  const openReview = (order: Order) => {
    setReviewOrder(order);
    setReviewRating(5);
    setReviewMessage("");
  };

  const renderOrder = (order: Order, mode: "buyer" | "seller") => {
    const isPaying = paymentLoading && activeOrderId === order._id;

    return (
      <article className="order-card" key={order._id}>
        <div className="order-image">
          {order.productImage ? <img src={order.productImage} alt={order.productTitle} /> : <span>PI</span>}
        </div>
        <div className="order-main">
          <small>{mode === "buyer" ? "Purchase" : "Sale"}</small>
          <h2>{order.productTitle}</h2>
          <p>Order ID: {order._id}</p>
          <p>
            {mode === "buyer"
              ? `Seller: ${order.sellerName || order.sellerId}`
              : `Buyer: ${order.buyerName || order.buyerId}`}
          </p>
          <p>{new Date(order.createdAt).toLocaleString()}</p>
          {order.paidAt ? <p>Paid: {new Date(order.paidAt).toLocaleString()}</p> : null}
        </div>
        <strong className="order-price">{formatPiAmount(order.pricePi)}</strong>
        <span className={`order-status ${order.status}`}>{order.status}</span>
        <div className="order-actions">
          <button className="secondary" onClick={() => navigate(`/orders/${order._id}/track`)}>
            Track Order
          </button>
          {mode === "buyer" ? (
            <button className="secondary" onClick={() => void messageSeller(order.productId)}>
              Message Seller
            </button>
          ) : null}
          {mode === "buyer" && order.status === "pending" ? (
            <button
              className="pi-payment-button"
              disabled={paymentLoading || updatingId === order._id}
              onClick={() =>
                void orderProduct(`SMAJ order: ${order.productTitle}`, order.pricePi, {
                  productId: order.productId,
                  orderId: order._id,
                })
              }
            >
              {isPaying ? "Opening Pi payment..." : "Pay with Pi Browser"}
            </button>
          ) : null}
          {order.status === "pending" ? (
            <button
              disabled={updatingId === order._id || isPaying}
              className="secondary"
              onClick={() => void updateStatus(order._id, "cancelled")}
            >
              Cancel Order
            </button>
          ) : null}
          {mode === "seller" && order.status === "paid" ? (
            <button disabled={updatingId === order._id} onClick={() => void updateStatus(order._id, "processing")}>
              Mark Processing
            </button>
          ) : null}
          {mode === "seller" && order.status === "processing" ? (
            <button disabled={updatingId === order._id} onClick={() => void updateStatus(order._id, "shipped")}>
              Mark Shipped
            </button>
          ) : null}
          {mode === "seller" && order.status === "shipped" ? (
            <button disabled={updatingId === order._id} onClick={() => void updateStatus(order._id, "delivered")}>
              Mark Delivered
            </button>
          ) : null}
          {mode === "buyer" && order.status === "delivered" ? (
            <button disabled={updatingId === order._id} onClick={() => void updateStatus(order._id, "completed")}>
              Complete Order
            </button>
          ) : null}
          {mode === "buyer" && order.status === "completed" ? (
            <button onClick={() => openReview(order)}>Rate Seller</button>
          ) : null}
        </div>
        {order.paymentStatus ? (
          <small className={`payment-state ${order.paymentStatus}`}>
            Payment: {order.paymentStatus}
            {order.paymentId ? ` · ID ${order.paymentId}` : ""}
            {order.paymentTxid ? ` · Tx ${order.paymentTxid}` : ""}
          </small>
        ) : null}
      </article>
    );
  };

  const orderSection = (
    title: string,
    description: string,
    list: Order[],
    mode: "buyer" | "seller"
  ) => (
    <section className="orders-section">
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span>{list.length}</span>
      </div>
      {list.length ? (
        <div className="orders-list">{list.map((order) => renderOrder(order, mode))}</div>
      ) : (
        <div className="private-state compact">
          <h3>No {mode === "buyer" ? "buyer" : "seller"} orders</h3>
          <p>
            {mode === "buyer"
              ? "Orders you create from SMAJ Store will appear here."
              : "Orders placed for your products will appear here."}
          </p>
        </div>
      )}
    </section>
  );

  return (
    <main className="private-page">
      <section className="private-page-head">
        <div>
          <p className="private-kicker">STORE ACTIVITY</p>
          <h1>Orders</h1>
          <p>Manage purchases, sales, and Pi payment status.</p>
        </div>
      </section>
      {!window.Pi ? (
        <div className="private-alert">Please open SMAJ PI HUB inside Pi Browser to use Pi payment.</div>
      ) : null}
      {message ? <div className="private-alert success">{message}</div> : null}
      {error ? <div className="private-alert error">{error}</div> : null}
      {loading ? <PrivateSkeleton variant="list" count={4} /> : null}
      {!loading ? (
        <>
          {orderSection("Buyer Orders", "Products you ordered from SMAJ sellers.", buyerOrders, "buyer")}
          {orderSection("Seller Orders", "Orders customers placed for your products.", sellerOrders, "seller")}
        </>
      ) : null}
      {reviewOrder ? (
        <div className="service-modal-backdrop" onMouseDown={() => setReviewOrder(null)}>
          <form className="service-modal marketplace-action-modal" onSubmit={(event) => { event.preventDefault(); void submitReview(); }} onMouseDown={(event) => event.stopPropagation()}>
            <h2>Rate Seller</h2>
            <p>Share a short review for {reviewOrder.sellerName} after completing your order.</p>
            <label>
              Rating
              <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
              </select>
            </label>
            <label>
              Review
              <textarea rows={4} maxLength={300} value={reviewMessage} onChange={(event) => setReviewMessage(event.target.value)} placeholder="Describe your experience..." />
            </label>
            <div className="confirm-modal-actions">
              <button type="button" className="modal-cancel-button" onClick={() => setReviewOrder(null)}>Cancel</button>
              <button type="submit" className="private-primary-button">Submit Review</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
};

export default OrdersPage;
