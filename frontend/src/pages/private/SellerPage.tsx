import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { axiosClient } from "../../lib/axiosClient";
import { useAuthContext } from "../../contexts/AuthContext";
import TrustBadge from "../../components/TrustBadge";
import type { Order, Product } from "../../types/marketplace";

type SellerData = {
  products: Product[];
  orders: Order[];
  stats: { totalProducts: number; totalOrders: number; pendingOrders: number; paidOrders: number };
};
type BackendErrorBody = { message?: string; error?: string };

const productReviewLabel = (product: Product) => {
  if (product.hidden) return "Hidden by admin";
  if (product.reviewStatus === "rejected") return "Rejected";
  if (product.approved === true && product.reviewStatus === "approved") return product.active ? "Live in Store" : "Sold out";
  return "Pending Review";
};

const productReviewNote = (product: Product) => {
  if (product.hidden) return "This product is not visible in SMAJ Store.";
  if (product.reviewStatus === "rejected") return product.rejectionReason || "Admin rejected this listing. Edit and resubmit it for review.";
  if (product.approved === true && product.reviewStatus === "approved") return product.active ? "This product is visible to buyers in SMAJ Store." : "This approved product is currently marked sold out.";
  return "Saved successfully. It will appear in SMAJ Store after admin approval.";
};

const SellerPage = () => {
  const { user } = useAuthContext();
  const [data, setData] = useState<SellerData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(false);

  const load = useCallback(async () => {
    const response = await axiosClient.get<SellerData>("/marketplace/seller");
    setData(response.data);
  }, []);

  useEffect(() => {
    load().catch((err: unknown) => setError(isAxiosError<BackendErrorBody>(err) ? err.response?.data?.message || "Could not load seller dashboard. Please sign in again." : "Could not load seller dashboard."));
  }, [load]);

  useEffect(() => {
    if (!message && !error) return;
    const timer = window.setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [message, error]);

  const availability = async (product: Product) => {
    setError("");
    try {
      await axiosClient.patch(`/marketplace/seller/products/${product._id}/availability`, { active: !product.active });
      setMessage(product.active ? "Product marked sold out." : "Product marked available.");
      await load();
    } catch (err: unknown) {
      setError(isAxiosError<BackendErrorBody>(err) ? err.response?.data?.message || "Could not update product availability." : "Could not update product availability.");
    }
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Delete ${product.title}? This cannot be undone.`)) return;
    setError("");
    try {
      await axiosClient.delete(`/marketplace/seller/products/${product._id}`);
      setMessage("Product deleted.");
      await load();
    } catch (err: unknown) {
      setError(isAxiosError<BackendErrorBody>(err) ? err.response?.data?.message || "Could not delete product." : "Could not delete product.");
    }
  };

  const requestVerification = async () => {
    setError("");
    setMessage("");
    setRequestingVerification(true);
    try {
      await axiosClient.post("/user/verification-request");
      setVerificationRequested(true);
      setMessage("Trusted seller verification requested. Admin will review your account.");
    } catch (err: unknown) {
      setError(isAxiosError<BackendErrorBody>(err) ? err.response?.data?.message || "Could not request verification. Make sure seller tools are active." : "Could not request verification. Make sure seller tools are active.");
    } finally {
      setRequestingVerification(false);
    }
  };

  const hasRequestedVerification = verificationRequested || Boolean(user?.verificationRequested);
  const verificationText = user?.verificationLevel === "trusted_seller" ? "Your account is trusted by SMAJ PI HUB." : hasRequestedVerification ? "Admin is reviewing your trusted seller request." : "Request trusted seller review to increase buyer confidence.";

  return (
    <main className="private-page">
      <section className="private-page-head">
        <div>
          <p className="private-kicker">SELLER WORKSPACE</p>
          <h1>Seller Dashboard</h1>
          <p>Manage your own products and monitor incoming orders.</p>
        </div>
        <Link className="private-primary-button" to="/add-product">Add Product</Link>
      </section>

      {message ? <div className="private-alert floating-alert success">{message}</div> : null}
      {error ? <div className="private-alert floating-alert error">{error}</div> : null}

      {!data ? <div className="private-state">Loading seller dashboard...</div> : (
        <>
          <section className="seller-verification-card">
            <div>
              <p className="private-kicker">SELLER TRUST</p>
              <h2>Verification Status</h2>
              <p>{verificationText}</p>
              <TrustBadge level={user?.verificationLevel} />
            </div>
            {user?.verificationLevel === "trusted_seller" ? null : (
              <button className="private-primary-button" type="button" disabled={requestingVerification || hasRequestedVerification} onClick={() => void requestVerification()}>
                {hasRequestedVerification ? "Review Requested" : requestingVerification ? "Requesting..." : "Request Trusted Seller Verification"}
              </button>
            )}
          </section>

          <section className="stats-grid">
            <article><span>Total products</span><strong>{data.stats.totalProducts}</strong></article>
            <article><span>Total orders</span><strong>{data.stats.totalOrders}</strong></article>
            <article><span>Pending orders</span><strong>{data.stats.pendingOrders}</strong></article>
            <article><span>Paid orders</span><strong>{data.stats.paidOrders}</strong></article>
          </section>

          <section className="management-section">
            <div className="section-title">
              <h2>Your Products</h2>
              <span>{data.products.length} listings</span>
            </div>
            {data.products.length === 0 ? <div className="private-state">You have not published a product yet.</div> : (
              <div className="management-list">
                {data.products.map((product) => (
                  <article className="management-row" key={product._id}>
                    <img src={product.image} alt="" />
                    <div className="management-main">
                      <h3>{product.title}</h3>
                      <p>{product.pricePi} Pi · {product.category}</p>
                    </div>
                    <span className={`availability ${product.hidden || !product.active || product.reviewStatus !== "approved" ? "sold" : "available"}`}>
                      {productReviewLabel(product)}
                    </span>
                    <small>{productReviewNote(product)}</small>
                    <div className="row-actions">
                      <Link to={`/edit-product/${product._id}`}>Edit</Link>
                      <button onClick={() => void availability(product)}>{product.active ? "Sold out" : "Available"}</button>
                      <button className="danger" onClick={() => void remove(product)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="management-section">
            <div className="section-title">
              <h2>Recent Orders</h2>
              <Link to="/orders">View all</Link>
            </div>
            {data.orders.length === 0 ? <div className="private-state">No orders yet. New buyer orders will appear here.</div> : (
              <div className="management-list">
                {data.orders.slice(0, 5).map((order) => (
                  <article className="management-row compact" key={order._id}>
                    <div className="management-main">
                      <h3>{order.productTitle}</h3>
                      <p>{order.buyerName} · {order.pricePi} Pi</p>
                    </div>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default SellerPage;
