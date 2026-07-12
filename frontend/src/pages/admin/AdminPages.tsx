import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import PrivateSkeleton from "../../components/PrivateSkeleton";
import PullToRefresh from "../../components/PullToRefresh";
import { axiosClient } from "../../lib/axiosClient";
import { formatPiAmount } from "../../lib/formatters";
import type { Order, Product } from "../../types/marketplace";
import type { User } from "../../types/pi";

const PI_USER_STORAGE_KEY = "smaj_pi_user";

type AdminStats = Record<string, number>;
type AdminActivity = {
  type: string;
  label: string;
  description: string;
  createdAt: string;
  href?: string;
};

const getStoredAccessToken = () => {
  try {
    const stored = window.localStorage.getItem(PI_USER_STORAGE_KEY);
    if (!stored) return "";
    const user = JSON.parse(stored) as { accessToken?: string };
    return user.accessToken || "";
  } catch {
    return "";
  }
};

const adminFetch = async <T,>(path: string): Promise<T> => {
  const accessToken = getStoredAccessToken();
  const response = await axiosClient.get<T>(path, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}`, "X-SMAJ-Access-Token": accessToken } : undefined,
    withCredentials: true,
  });
  return response.data;
};

const Head = ({ title, description, action }: { title: string; description: string; action?: ReactNode }) => (
  <section className="private-page-head">
    <div>
      <p className="private-kicker">ADMIN PANEL</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {action}
  </section>
);

const Notice = ({ text }: { text: string }) => text ? <div className="private-alert success">{text}</div> : null;

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        adminFetch<{ stats: AdminStats; updatedAt: string }>("/admin/stats"),
        adminFetch<{ activity: AdminActivity[]; updatedAt: string }>("/admin/activity"),
      ]);
      setStats(statsResponse.stats);
      setActivity(activityResponse.activity);
      setLastUpdated(new Date(statsResponse.updatedAt || activityResponse.updatedAt || Date.now()));
      setError("");
    } catch {
      setError("Admin stats could not load. Check backend admin access, session, and database collections.");
    } finally {
      if (showRefreshing) setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    let mounted = true;
    const run = async (showRefreshing = false) => {
      if (!mounted) return;
      await load(showRefreshing);
    };
    void run();
    const interval = window.setInterval(() => void run(true), 15_000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [load]);
  const cards = [
    ["totalUsers", "Total Users", "/admin/users"],
    ["activeUsers", "Active Users", "/admin/users"],
    ["piVerifiedUsers", "Pi Verified Users", "/admin/users"],
    ["sellers", "Sellers", "/admin/users"],
    ["sellerVerifiedUsers", "Seller Verified", "/admin/users"],
    ["trustedSellers", "Trusted Sellers", "/admin/users"],
    ["totalProducts", "Total Products", "/admin/products"],
    ["activeProducts", "Active Products", "/admin/products"],
    ["pendingProducts", "Pending Products", "/admin/products"],
    ["rejectedProducts", "Rejected Products", "/admin/products"],
    ["totalOrders", "Total Orders", "/admin/orders"],
    ["pendingOrders", "Pending Orders", "/admin/orders"],
    ["completedOrders", "Completed Orders", "/admin/orders"],
    ["failedCancelledPayments", "Failed/Cancelled Payments", "/admin/orders"],
    ["reports", "Reports", "/admin/reports"],
    ["unreadReports", "Unread Reports", "/admin/reports"],
    ["onboardingApplications", "Seller Applications", "/admin/onboarding"],
    ["pendingOnboarding", "Pending Applications", "/admin/onboarding"],
    ["notifications", "Notifications", "/admin/reports"],
    ["unreadNotifications", "Unread Notifications", "/admin/reports"],
  ] as const;
  const updatedLabel = lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Not loaded";

  return (
    <main className="private-page">
      <PullToRefresh onRefresh={() => load(false)} />
      <Head
        title="Admin Dashboard"
        description="Platform health, moderation, and marketplace operations."
        action={<button className="private-secondary-button" type="button" onClick={() => void load(true)} disabled={refreshing}>{refreshing ? "Refreshing..." : "Refresh"}</button>}
      />
      {error ? <div className="private-alert error">{error}</div> : null}
      {!stats ? <PrivateSkeleton variant="stats" count={6} /> : (
        <>
          <div className="private-alert">Last updated: {updatedLabel}</div>
          <section className="stats-grid admin-stats">
            {cards.map(([key, label, to]) => <Link to={to} key={key}><span>{label}</span><strong>{stats[key] || 0}</strong></Link>)}
          </section>
          <section className="management-list">
            {activity.length ? activity.map((item) => (
              <article className="report-card" key={`${item.type}-${item.createdAt}-${item.description}`}>
                <div>
                  <span>{item.label}</span>
                  <h3>{item.description}</h3>
                  <p>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                {item.href ? <Link to={item.href}>Open</Link> : null}
              </article>
            )) : <div className="private-state compact"><h3>No admin activity yet</h3><p>Real database activity will appear here when users, products, orders, reports, or applications are created.</p></div>}
          </section>
        </>
      )}
    </main>
  );
};

type AdminUser = User & { _id: string; blocked?: boolean; verificationRequested?: boolean; verificationStatus?: "none" | "pending" | "approved" | "rejected"; verificationRequestType?: "pi_verified" | "seller_verified" | "trusted_seller" };

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => setUsers((await axiosClient.get("/admin/users")).data.users), []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const update = async (id: string, body: object) => { await axiosClient.patch(`/admin/users/${id}`, body); setMessage("User updated."); await load(); };

  return (
    <main className="private-page">
      <Head title="Users" description="Manage access, roles, and seller verification requests." />
      <Notice text={message} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>User</th><th>Role</th><th>Verification</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{users.map((user) => (
            <tr key={user._id}>
              <td><strong>{user.displayName}</strong><small>@{user.piUsername || user.username}{user.verificationRequested || user.verificationStatus === "pending" ? ` - Requested ${user.verificationRequestType === "trusted_seller" ? "Trusted Seller" : user.verificationRequestType === "seller_verified" ? "Seller Verified" : "Pi Verified"}` : ""}</small></td>
              <td><select value={user.role} onChange={(event) => void update(user._id, { role: event.target.value })}><option>buyer</option><option>seller</option><option>admin</option></select></td>
              <td>
                <select value={user.verificationLevel || "basic"} onChange={(event) => void update(user._id, { verificationLevel: event.target.value })}><option value="basic">Basic</option><option value="pi_verified">Pi Verified</option><option value="seller_verified">Seller Verified</option><option value="trusted_seller">Trusted Seller</option></select>
                <select value={user.verificationStatus || "none"} onChange={(event) => void update(user._id, { verificationStatus: event.target.value, verificationLevel: event.target.value === "approved" ? user.verificationLevel || "pi_verified" : user.verificationLevel })}><option value="none">No badge</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
              </td>
              <td>{user.blocked ? "Blocked" : "Active"}</td>
              <td>
                <div className="row-actions">
                  {user.verificationRequested || user.verificationStatus === "pending" ? <button onClick={() => void update(user._id, { verificationLevel: user.verificationRequestType || "pi_verified", verificationStatus: "approved" })}>Approve</button> : null}
                  {user.verificationRequested || user.verificationStatus === "pending" ? <button onClick={() => void update(user._id, { verificationStatus: "rejected" })}>Reject</button> : null}
                  {user.verificationStatus === "approved" ? <button onClick={() => void update(user._id, { verificationLevel: "basic", verificationStatus: "none" })}>Remove Badge</button> : null}
                  <button onClick={() => void update(user._id, { blocked: !user.blocked })}>{user.blocked ? "Unblock" : "Block"}</button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </main>
  );
};

type OnboardingApplication = {
  _id: string;
  fullName: string;
  email: string;
  applicationType: string;
  location: string;
  details: string;
  status: "pending" | "approved" | "rejected" | "contacted";
  createdAt: string;
};

export const AdminOnboardingPage = () => {
  const [applications, setApplications] = useState<OnboardingApplication[]>([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const load = useCallback(async () => setApplications((await axiosClient.get("/admin/onboarding")).data.applications), []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const update = async (id: string, status: OnboardingApplication["status"]) => {
    await axiosClient.patch(`/admin/onboarding/${id}`, { status });
    setMessage(`Application marked ${status}.`);
    await load();
  };
  const visible = useMemo(() => filter === "all" ? applications : applications.filter((item) => item.status === filter), [applications, filter]);

  return (
    <main className="private-page">
      <Head title="Onboarding Applications" description="Review sellers, service providers, partners, and community contributors." />
      <Notice text={message} />
      <section className="admin-filter-bar">
        <label>Status filter<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All</option><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
        <span>{visible.length} applications</span>
      </section>
      {visible.length ? <div className="management-list">{visible.map((item) => (
        <article className="report-card onboarding-admin-card" key={item._id}>
          <div><span>{item.applicationType} - {item.status}</span><h3>{item.fullName}</h3><p>{item.email} - {item.location}</p><p>{item.details}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>
          <strong className={item.status === "approved" ? "resolved" : "open"}>{item.status}</strong>
          <div className="row-actions"><button onClick={() => void update(item._id, "contacted")}>Contacted</button><button onClick={() => void update(item._id, "approved")}>Approve</button><button className="danger" onClick={() => void update(item._id, "rejected")}>Reject</button></div>
        </article>
      ))}</div> : <div className="private-state"><h2>No onboarding applications</h2><p>Try another filter or wait for new public applications.</p></div>}
    </main>
  );
};

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const load = useCallback(async () => setProducts((await axiosClient.get("/admin/products")).data.products), []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const update = async (id: string, body: object) => { await axiosClient.patch(`/admin/products/${id}`, body); setMessage("Product updated."); await load(); };
  const reject = async (product: Product) => {
    const reason = window.prompt(`Why is "${product.title}" rejected?`, product.rejectionReason || "Product photos, price, description, or seller details need review.");
    if (!reason?.trim()) return;
    await update(product._id, { approved: false, hidden: false, rejectionReason: reason.trim() });
  };
  const remove = async (id: string) => { if (!window.confirm("Delete this product permanently?")) return; await axiosClient.delete(`/admin/products/${id}`); setMessage("Product deleted."); await load(); };
  const visible = useMemo(() => products.filter((product) => filter === "all" || (filter === "pending" && (product.reviewStatus || (product.approved === false ? "pending" : "approved")) === "pending" && !product.hidden) || (filter === "visible" && product.approved === true && product.reviewStatus === "approved" && !product.hidden) || (filter === "rejected" && product.reviewStatus === "rejected") || (filter === "hidden" && product.hidden)), [products, filter]);

  return (
    <main className="private-page">
      <Head title="Products" description="Approve, hide, or remove marketplace listings." />
      <Notice text={message} />
      <section className="admin-filter-bar">
        <label>Status filter<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All</option><option value="pending">Pending review</option><option value="visible">Visible</option><option value="rejected">Rejected</option><option value="hidden">Hidden</option></select></label>
        <span>{visible.length} products</span>
      </section>
      <div className="management-list">{visible.map((product) => (
        <article className="management-row" key={product._id}>
          <img src={product.image} alt="" />
          <div className="management-main"><h3>{product.title}</h3><p>{product.sellerName} - {formatPiAmount(product.pricePi)}</p></div>
          <span className={`availability ${product.hidden || product.reviewStatus !== "approved" ? "sold" : "available"}`}>{product.hidden ? "Hidden" : product.reviewStatus === "rejected" ? "Rejected" : product.reviewStatus === "approved" ? "Visible" : "Pending"}</span>
          {product.rejectionReason ? <small>{product.rejectionReason}</small> : null}
          <div className="row-actions"><button onClick={() => void update(product._id, { approved: true, hidden: false })}>Approve</button><button onClick={() => void reject(product)}>Reject</button><button onClick={() => void update(product._id, { hidden: !product.hidden })}>{product.hidden ? "Show" : "Hide"}</button><button className="danger" onClick={() => void remove(product._id)}>Delete</button></div>
        </article>
      ))}</div>
    </main>
  );
};

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const load = useCallback(async () => setOrders((await axiosClient.get("/admin/orders")).data.orders), []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const update = async (id: string, status: string) => { await axiosClient.patch(`/admin/orders/${id}`, { status }); setMessage("Order status updated."); await load(); };
  const filteredOrders = statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter);

  return (
    <main className="private-page">
      <Head title="Orders" description="Review order details and correct statuses when necessary." />
      <Notice text={message} />
      <section className="admin-filter-bar"><label>Status filter<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><span>{filteredOrders.length} orders</span></section>
      {filteredOrders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Buyer / Seller</th><th>Price</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order._id}><td>{order.productTitle}</td><td><small>{order.buyerName}<br />{order.sellerName}</small></td><td>{formatPiAmount(order.pricePi)}</td><td><select value={order.status} onChange={(event) => void update(order._id, event.target.value)}><option>pending</option><option>processing</option><option>shipped</option><option>delivered</option><option>completed</option><option>cancelled</option></select></td><td><button onClick={() => setSelected(order)}>Details</button></td></tr>)}</tbody></table></div> : <div className="private-state compact"><h3>No matching orders</h3><p>Choose another status to view more orders.</p></div>}
      {selected ? <div className="detail-panel"><button onClick={() => setSelected(null)}>Close</button><h2>{selected.productTitle}</h2><p>Order ID: {selected._id}</p><p>Payment ID: {selected.paymentId || "Not paid"}</p><p>Transaction: {selected.paymentTxid || "Not available"}</p><p>Created: {new Date(selected.createdAt).toLocaleString()}</p></div> : null}
    </main>
  );
};

type Report = { _id: string; targetType: string; targetId: string; reason: string; details?: string; resolved?: boolean; createdAt: string; source?: "marketplace" | "support" };
export const AdminReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("open");
  const load = useCallback(async () => {
    const [reportResponse, statsResponse, orderResponse, productResponse, userResponse] = await Promise.all([
      axiosClient.get("/admin/reports"),
      axiosClient.get("/admin/stats"),
      axiosClient.get("/admin/orders"),
      axiosClient.get("/admin/products"),
      axiosClient.get("/admin/users"),
    ]);
    setReports(reportResponse.data.reports);
    setStats(statsResponse.data.stats);
    setOrders(orderResponse.data.orders);
    setProducts(productResponse.data.products);
    setUsers(userResponse.data.users);
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const resolve = async (report: Report) => {
    await axiosClient.patch(report.source === "support" ? `/admin/support/${report._id}/resolve` : `/admin/reports/${report._id}/resolve`);
    setMessage("Record resolved.");
    await load();
  };
  const visible = useMemo(() => reports.filter((report) => filter === "all" || (filter === "open" && !report.resolved) || (filter === "resolved" && report.resolved) || report.source === filter), [reports, filter]);
  const totalPi = useMemo(() => orders.filter((order) => ["paid", "processing", "shipped", "delivered", "completed"].includes(order.status)).reduce((sum, order) => sum + order.pricePi, 0), [orders]);
  const pendingRevenue = useMemo(() => orders.filter((order) => order.status === "pending").reduce((sum, order) => sum + order.pricePi, 0), [orders]);
  const visibleProducts = products.filter((product) => product.approved && !product.hidden).length;
  const trustedUsers = users.filter((user) => user.verificationStatus === "approved" && user.verificationLevel === "trusted_seller").length;
  const recentOrders = orders.slice(0, 5);
  const latestProducts = products.slice(0, 5);

  return (
    <main className="private-page">
      <Head title="Analytics & Reports" description="Live platform metrics, marketplace health, reports, support, and operational signals." />
      <Notice text={message} />
      {!stats ? <PrivateSkeleton variant="stats" count={6} /> : (
        <>
          <section className="admin-analytics-grid">
            <article><span>Total users</span><strong>{stats.totalUsers}</strong><small>{trustedUsers} trusted sellers</small></article>
            <article><span>Products</span><strong>{stats.totalProducts}</strong><small>{visibleProducts} visible, {stats.pendingProducts} pending</small></article>
            <article><span>Orders</span><strong>{stats.totalOrders}</strong><small>{stats.pendingOrders} pending, {stats.paidOrders} paid/completed</small></article>
            <article><span>Paid volume</span><strong>{formatPiAmount(totalPi)}</strong><small>{formatPiAmount(pendingRevenue)} pending</small></article>
            <article><span>Open reports</span><strong>{stats.reportedProducts}</strong><small>{stats.supportRequests} support requests</small></article>
            <article><span>Onboarding</span><strong>{stats.pendingOnboarding}</strong><small>pending public applications</small></article>
          </section>
          <section className="admin-analytics-panels">
            <article>
              <div className="section-title compact"><div><h2>Recent orders</h2><p>Live order records from marketplace checkout.</p></div></div>
              {recentOrders.length ? recentOrders.map((order) => <div className="analytics-row" key={order._id}><span>{order.productTitle}</span><strong>{formatPiAmount(order.pricePi)}</strong><small>{order.status}</small></div>) : <p>No orders yet.</p>}
            </article>
            <article>
              <div className="section-title compact"><div><h2>Latest products</h2><p>Real seller listings and review status.</p></div></div>
              {latestProducts.length ? latestProducts.map((product) => <div className="analytics-row" key={product._id}><span>{product.title}</span><strong>{product.reviewStatus || "pending"}</strong><small>{product.sellerName}</small></div>) : <p>No products yet.</p>}
            </article>
          </section>
        </>
      )}
      <section className="admin-filter-bar"><label>Filter<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="open">Open</option><option value="all">All</option><option value="marketplace">Marketplace</option><option value="support">Support</option><option value="resolved">Resolved</option></select></label><span>{visible.length} records</span></section>
      {visible.length === 0 ? <div className="private-state">No records match this filter.</div> : <div className="management-list">{visible.map((report) => <article className="report-card" key={`${report.source}-${report._id}`}><div><span>{report.source || "marketplace"} - {report.targetType}</span><h3>{report.reason}</h3><p>{report.details || `Target: ${report.targetId}`}</p></div><strong className={report.resolved ? "resolved" : "open"}>{report.resolved ? "Resolved" : "Open"}</strong>{!report.resolved ? <button onClick={() => void resolve(report)}>Mark resolved</button> : null}</article>)}</div>}
    </main>
  );
};

export const AdminSettingsPage = () => <main className="private-page"><Head title="Admin Settings" description="Administrative preferences use your main SMAJ settings." /><div className="private-state"><p>Theme, language, notifications, and logout are managed in account settings.</p><Link className="private-primary-button" to="/settings">Open Settings</Link></div></main>;
