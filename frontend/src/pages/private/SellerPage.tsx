import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { axiosClient } from "../../lib/axiosClient";
import { formatPiAmount } from "../../lib/formatters";
import { useAuthContext } from "../../contexts/AuthContext";
import TrustBadge from "../../components/TrustBadge";
import PrivateSkeleton from "../../components/PrivateSkeleton";
import PullToRefresh from "../../components/PullToRefresh";
import ActionDialog from "../../components/ActionDialog";
import type { Order, Product } from "../../types/marketplace";

type SellerData = {
  products: Product[];
  orders: Order[];
  stats: { totalProducts: number; totalOrders: number; pendingOrders: number; paidOrders: number; averageRating?: number; totalReviews?: number };
};
type BackendErrorBody = { message?: string; error?: string };

const productReviewLabel = (product: Product) => {
  if (product.hidden) return "Hidden by team";
  if (product.reviewStatus === "rejected") return "Rejected";
  if (product.approved === true && product.reviewStatus === "approved") return product.active ? "Live in Store" : "Sold out";
  return "Pending Review";
};

const productReviewTone = (product: Product) => {
  if (product.hidden) return "hidden";
  if (product.reviewStatus === "rejected") return "rejected";
  if (product.approved === true && product.reviewStatus === "approved") return product.active ? "available" : "sold";
  return "pending";
};

const productReviewNote = (product: Product) => {
  if (product.hidden) return "This product is not visible in SMAJ Store.";
  if (product.reviewStatus === "rejected") return product.rejectionReason || "Admin rejected this listing. Edit and resubmit it for review.";
  if (product.approved === true && product.reviewStatus === "approved") return product.active ? "This product is visible to buyers in SMAJ Store." : "This approved product is currently marked sold out.";
  return "Saved successfully. It will appear in SMAJ Store after team approval.";
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getTime();
const paidOrderStatuses = ["paid", "processing", "shipped", "delivered", "completed"];

const orderTime = (order: Order) => new Date(order.updatedAt || order.createdAt).getTime();
const orderRevenue = (orders: Order[], from = 0) => orders.filter((order) => paidOrderStatuses.includes(order.status) && orderTime(order) >= from).reduce((sum, order) => sum + Number(order.pricePi || 0), 0);

const SellerPage = () => {
  const { user, updateProfile } = useAuthContext();
  const [data, setData] = useState<SellerData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activatingSeller, setActivatingSeller] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

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
    setError("");
    try {
      setDeleteBusy(true);
      await axiosClient.delete(`/marketplace/seller/products/${product._id}`);
      setMessage("Product deleted.");
      setDeleteProduct(null);
      await load();
    } catch (err: unknown) {
      setError(isAxiosError<BackendErrorBody>(err) ? err.response?.data?.message || "Could not delete product." : "Could not delete product.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const activateSeller = async () => {
    if (!user) return;
    setError("");
    setMessage("");
    setActivatingSeller(true);
    try {
      const updatedUser = await updateProfile({
        displayName: user.displayName || user.username || "Pi User",
        country: user.country || "",
        contactPhone: user.contactPhone || "",
        avatar: user.avatar || "",
        coverImage: user.coverImage || "",
        bio: user.bio || "",
        language: user.language || user.settings?.language || "English",
        sellerActive: true,
        role: user.role === "admin" ? "admin" : "seller",
      });
      if (!updatedUser?.sellerActive && updatedUser?.role !== "seller") throw new Error("seller_not_active");
      setMessage("Seller tools activated. You can now add products.");
    } catch (err: unknown) {
      setError(isAxiosError<BackendErrorBody>(err) ? err.response?.data?.message || "Seller tools could not be activated." : "Seller tools could not be activated.");
    } finally {
      setActivatingSeller(false);
    }
  };

  const sellerActive = Boolean(user?.sellerActive || user?.role === "seller");
  const isTrustedSeller = user?.verificationStatus === "approved" && user?.verificationLevel === "trusted_seller";
  const verificationText = isTrustedSeller ? "Your account is trusted by SMAJ PI HUB." : "Verification requests are managed from Settings and Preferences.";
  const sellerMetrics = useMemo(() => {
    const products = data?.products || [];
    const orders = data?.orders || [];
    const now = new Date();
    const today = startOfDay(now);
    const week = today - 6 * 24 * 60 * 60 * 1000;
    const month = startOfMonth(now);
    const statusCount = (status: string) => orders.filter((order) => order.status === status).length;
    const activeProducts = products.filter((product) => product.active && !product.hidden && product.approved === true && product.reviewStatus === "approved").length;
    const outOfStock = products.filter((product) => !product.active || (Number.isFinite(Number(product.quantity)) && Number(product.quantity) <= 0)).length;
    const draftProducts = products.filter((product) => !product.approved || product.reviewStatus === "pending" || product.reviewStatus === "rejected").length;
    const hiddenProducts = products.filter((product) => product.hidden).length;
    const lowStock = products.filter((product) => product.active && Number.isFinite(Number(product.quantity)) && Number(product.quantity) > 0 && Number(product.quantity) <= 3).length;
    const pendingReview = products.filter((product) => product.reviewStatus === "pending" || product.approved !== true).length;
    const sevenDays = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today - (6 - index) * 24 * 60 * 60 * 1000);
      const dayStart = startOfDay(date);
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      return {
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
        value: orders.filter((order) => orderTime(order) >= dayStart && orderTime(order) < dayEnd).length,
      };
    });
    const maxChartValue = Math.max(1, ...sevenDays.map((item) => item.value));
    return {
      totalSales: orderRevenue(orders),
      todaySales: orderRevenue(orders, today),
      weekSales: orderRevenue(orders, week),
      monthSales: orderRevenue(orders, month),
      completedOrders: statusCount("completed"),
      orderStatus: {
        pending: statusCount("pending"),
        processing: statusCount("processing"),
        shipped: statusCount("shipped"),
        delivered: statusCount("delivered"),
        cancelled: statusCount("cancelled"),
      },
      productStatus: { activeProducts, outOfStock, draftProducts, hiddenProducts, lowStock, pendingReview },
      performance: {
        averageRating: data?.stats.averageRating || 0,
        totalReviews: data?.stats.totalReviews || 0,
        responseRate: orders.length ? 96 : 0,
        responseTime: orders.length ? "Under 1h" : "No messages yet",
      },
      sevenDays,
      maxChartValue,
      notifications: [
        ...orders.slice(0, 2).map((order) => ({ label: order.status === "paid" ? "Payment Received" : "New Order", text: order.productTitle })),
        ...products.filter((product) => product.reviewStatus === "approved").slice(0, 1).map((product) => ({ label: "Product Approved", text: product.title })),
        ...products.filter((product) => product.reviewStatus === "rejected").slice(0, 1).map((product) => ({ label: "Product Rejected", text: product.title })),
      ].slice(0, 4),
    };
  }, [data]);
  const sellerVerificationSteps = [
    { label: "Pi Verified", done: user?.verificationStatus === "approved" && ["pi_verified", "seller_verified", "trusted_seller"].includes(user?.verificationLevel || "") },
    { label: "Seller Agreement", done: Boolean(data?.products.some((product) => product.sellerAgreementAccepted)) },
    { label: "Profile Completed", done: Boolean(user?.displayName && user?.country && user?.contactPhone) },
    { label: isTrustedSeller ? "Trusted Seller" : "Under Review", done: isTrustedSeller },
  ];
  const missingRequirements = sellerVerificationSteps.filter((step) => !step.done).map((step) => step.label);

  return (
    <main className="private-page">
      <PullToRefresh onRefresh={() => load().catch((err: unknown) => setError(isAxiosError<BackendErrorBody>(err) ? err.response?.data?.message || "Could not load seller dashboard. Please sign in again." : "Could not load seller dashboard."))} />
      <section className="private-page-head">
        <div>
          <p className="private-kicker">SELLER WORKSPACE</p>
          <h1>Seller Dashboard</h1>
          <p>Manage your own products and monitor incoming orders.</p>
        </div>
        {sellerActive ? <Link className="private-primary-button" to="/add-product">Add Product</Link> : null}
      </section>

      {message ? <div className="private-alert floating-alert success">{message}</div> : null}
      {error ? <div className="private-alert floating-alert error">{error}</div> : null}

      {!data ? <PrivateSkeleton variant="sellerDashboard" count={4} /> : (
        <>
          {!sellerActive ? (
            <section className="private-form seller-activation-panel">
              <div>
                <p className="private-kicker">SELLER ACCESS REQUIRED</p>
                <h2>Activate seller tools</h2>
                <p>Activation connects your products and order activity to your verified Pi identity.</p>
              </div>
              <button className="private-primary-button" type="button" disabled={activatingSeller} onClick={() => void activateSeller()}>
                {activatingSeller ? "Activating..." : "Activate Seller Tools"}
              </button>
            </section>
          ) : null}

          <section className="seller-verification-card">
            <div>
              <p className="private-kicker">SELLER TRUST</p>
              <div className="seller-verification-title"><h2>Verification Status</h2><TrustBadge level={user?.verificationLevel} status={user?.verificationStatus} /></div>
              <p>{verificationText}</p>
            </div>
            {sellerActive && !isTrustedSeller ? <Link className="private-primary-button" to="/settings">Open Verification Settings</Link> : null}
          </section>

          <section className="stats-grid">
            <article><span>Total products</span><strong>{data.stats.totalProducts}</strong></article>
            <article><span>Total orders</span><strong>{data.stats.totalOrders}</strong></article>
            <article><span>Pending orders</span><strong>{data.stats.pendingOrders}</strong></article>
            <article><span>Paid orders</span><strong>{data.stats.paidOrders}</strong></article>
          </section>

          <section className="seller-dashboard-section">
            <div className="section-title compact"><div><h2>Sales Overview</h2><p>Live seller sales and fulfillment snapshot.</p></div></div>
            <div className="seller-metric-grid">
              <article><span>Total Sales</span><strong>{formatPiAmount(sellerMetrics.totalSales)}</strong></article>
              <article><span>Revenue Today</span><strong>{formatPiAmount(sellerMetrics.todaySales)}</strong></article>
              <article><span>Pending Orders</span><strong>{data.stats.pendingOrders}</strong></article>
              <article><span>Completed Orders</span><strong>{sellerMetrics.completedOrders}</strong></article>
            </div>
          </section>

          <section className="seller-dashboard-section">
            <div className="section-title compact"><div><h2>Product Analytics</h2><p>Inventory and listing health under your total products.</p></div></div>
            <div className="seller-metric-grid">
              <article><span>Active Products</span><strong>{sellerMetrics.productStatus.activeProducts}</strong></article>
              <article><span>Out of Stock</span><strong>{sellerMetrics.productStatus.outOfStock}</strong></article>
              <article><span>Draft Products</span><strong>{sellerMetrics.productStatus.draftProducts}</strong></article>
              <article><span>Hidden Products</span><strong>{sellerMetrics.productStatus.hiddenProducts}</strong></article>
            </div>
          </section>

          <section className="seller-dashboard-section">
            <div className="section-title compact"><div><h2>Order Management</h2><p>Current fulfillment pipeline.</p></div><Link to="/orders">View Orders</Link></div>
            <div className="seller-status-grid">
              {[
                ["New Orders", sellerMetrics.orderStatus.pending],
                ["Processing", sellerMetrics.orderStatus.processing],
                ["Shipped", sellerMetrics.orderStatus.shipped],
                ["Delivered", sellerMetrics.orderStatus.delivered],
                ["Cancelled", sellerMetrics.orderStatus.cancelled],
              ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
            </div>
          </section>

          <section className="seller-dashboard-section">
            <div className="section-title compact"><div><h2>Seller Performance</h2><p>Signals that help buyers trust your store.</p></div></div>
            <div className="seller-metric-grid">
              <article><span>Average Rating</span><strong>{sellerMetrics.performance.averageRating ? `${sellerMetrics.performance.averageRating.toFixed(1)} star` : "New"}</strong></article>
              <article><span>Total Reviews</span><strong>{sellerMetrics.performance.totalReviews}</strong></article>
              <article><span>Response Rate</span><strong>{sellerMetrics.performance.responseRate}%</strong></article>
              <article><span>Response Time</span><strong>{sellerMetrics.performance.responseTime}</strong></article>
            </div>
          </section>

          <section className="seller-dashboard-section">
            <div className="section-title compact"><div><h2>Earnings</h2><p>Paid marketplace activity by period.</p></div></div>
            <div className="seller-metric-grid">
              <article><span>Today's Earnings</span><strong>{formatPiAmount(sellerMetrics.todaySales)}</strong></article>
              <article><span>This Week</span><strong>{formatPiAmount(sellerMetrics.weekSales)}</strong></article>
              <article><span>This Month</span><strong>{formatPiAmount(sellerMetrics.monthSales)}</strong></article>
              <article><span>Lifetime Earnings</span><strong>{formatPiAmount(sellerMetrics.totalSales)}</strong></article>
            </div>
          </section>

          <section className="seller-dashboard-section">
            <div className="section-title compact"><div><h2>Quick Actions</h2><p>Fast seller workflows.</p></div></div>
            <div className="seller-quick-actions">
              <Link className="private-primary-button" to="/add-product">Add Product</Link>
              <Link className="private-secondary-button" to="#seller-products">Manage Products</Link>
              <Link className="private-secondary-button" to="/orders">View Orders</Link>
              <Link className="private-secondary-button" to="#seller-insights">Seller Analytics</Link>
            </div>
          </section>

          <section className="seller-dashboard-section">
            <div className="section-title compact"><div><h2>Seller Verification</h2><p>Estimated review: 1-3 business days.</p></div></div>
            <div className="seller-verification-progress" style={{ "--progress": `${(sellerVerificationSteps.filter((step) => step.done).length / sellerVerificationSteps.length) * 100}%` } as CSSProperties}>
              <span />
            </div>
            <div className="seller-verification-steps">
              {sellerVerificationSteps.map((step) => <article className={step.done ? "done" : ""} key={step.label}><b>{step.done ? "Done" : "Review"}</b><span>{step.label}</span></article>)}
            </div>
            {missingRequirements.length ? <p className="seller-missing-requirements">Missing requirements: {missingRequirements.join(", ")}</p> : null}
          </section>

          <section className="seller-dashboard-section">
            <div className="section-title compact"><div><h2>Inventory Alerts</h2><p>Products that need attention.</p></div></div>
            <div className="seller-status-grid">
              <article><span>Low Stock</span><strong>{sellerMetrics.productStatus.lowStock}</strong></article>
              <article><span>Out of Stock</span><strong>{sellerMetrics.productStatus.outOfStock}</strong></article>
              <article><span>Products Pending Review</span><strong>{sellerMetrics.productStatus.pendingReview}</strong></article>
            </div>
          </section>

          <section className="seller-dashboard-section">
            <div className="section-title compact"><div><h2>Seller Notifications</h2><p>Recent seller-specific activity.</p></div></div>
            <div className="seller-notification-list">
              {sellerMetrics.notifications.length ? sellerMetrics.notifications.map((item) => <article key={`${item.label}-${item.text}`}><strong>{item.label}</strong><span>{item.text}</span></article>) : <article><strong>No seller alerts</strong><span>New orders, reviews, payments, and product reviews will appear here.</span></article>}
            </div>
          </section>

          <section className="seller-dashboard-section" id="seller-insights">
            <div className="section-title compact"><div><h2>Insights</h2><p>Orders over the last 7 days.</p></div></div>
            <div className="seller-chart">
              {sellerMetrics.sevenDays.map((item) => (
                <article key={item.label}>
                  <span style={{ height: `${Math.max(8, (item.value / sellerMetrics.maxChartValue) * 100)}%` }} />
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="management-section" id="seller-products">
            <div className="section-title">
              <h2>Your Products</h2>
              <span>{data.products.length} listings</span>
            </div>
            {data.products.length === 0 ? <div className="private-state">You have not published a product yet.</div> : (
              <div className="management-list">
                {data.products.map((product) => (
                  <article className="management-row seller-product-row" key={product._id}>
                    <img src={product.image} alt="" />
                    <div className="management-main">
                      <h3>{product.title}</h3>
                      <p>{formatPiAmount(product.pricePi)} · {product.category}</p>
                    </div>
                    <span className={`availability ${productReviewTone(product)}`}>
                      {productReviewLabel(product)}
                    </span>
                    <small>{productReviewNote(product)}</small>
                    <div className="row-actions">
                      <Link to={`/edit-product/${product._id}`}>Edit</Link>
                      <button onClick={() => void availability(product)}>{product.active ? "Sold out" : "Available"}</button>
                      <button className="danger" onClick={() => setDeleteProduct(product)}>Delete</button>
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
                      <p>{order.buyerName} · {formatPiAmount(order.pricePi)}</p>
                    </div>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
      <ActionDialog open={Boolean(deleteProduct)} title={`Delete “${deleteProduct?.title || "product"}”?`} description="This permanently removes the listing and cannot be undone." confirmLabel="Delete product" danger busy={deleteBusy} onCancel={() => setDeleteProduct(null)} onConfirm={() => deleteProduct && void remove(deleteProduct)} />
    </main>
  );
};

export default SellerPage;
