import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import type { Order, Product } from "../../types/marketplace";
import type { User } from "../../types/pi";

const Head = ({ title, description }: { title: string; description: string }) => (
  <section className="private-page-head">
    <div>
      <p className="private-kicker">ADMIN PANEL</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  </section>
);

const Notice = ({ text }: { text: string }) => text ? <div className="private-alert success">{text}</div> : null;

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => { axiosClient.get("/admin/stats").then(({ data }) => setStats(data.stats)); }, []);
  const cards = [
    ["totalUsers", "Total Users", "/admin/users"],
    ["totalProducts", "Total Products", "/admin/products"],
    ["pendingProducts", "Pending Products", "/admin/products"],
    ["pendingOnboarding", "Onboarding", "/admin/onboarding"],
    ["supportRequests", "Support Requests", "/admin/reports"],
    ["reportedProducts", "Reports", "/admin/reports"],
  ] as const;

  return (
    <main className="private-page">
      <Head title="Admin Dashboard" description="Platform health, moderation, and marketplace operations." />
      {!stats ? <div className="private-state">Loading platform totals...</div> : (
        <section className="stats-grid admin-stats">
          {cards.map(([key, label, to]) => <Link to={to} key={key}><span>{label}</span><strong>{stats[key] || 0}</strong></Link>)}
        </section>
      )}
    </main>
  );
};

type AdminUser = User & { _id: string; blocked?: boolean; verificationRequested?: boolean };

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => setUsers((await axiosClient.get("/admin/users")).data.users), []);
  useEffect(() => { void load(); }, [load]);
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
              <td><strong>{user.displayName}</strong><small>@{user.piUsername || user.username}{user.verificationRequested ? " - Requested trust review" : ""}</small></td>
              <td><select value={user.role} onChange={(event) => void update(user._id, { role: event.target.value })}><option>buyer</option><option>seller</option><option>admin</option></select></td>
              <td><select value={user.verificationLevel || "basic"} onChange={(event) => void update(user._id, { verificationLevel: event.target.value })}><option value="basic">Basic</option><option value="verified">Verified</option><option value="trusted_seller">Trusted Seller</option></select></td>
              <td>{user.blocked ? "Blocked" : "Active"}</td>
              <td><button onClick={() => void update(user._id, { blocked: !user.blocked })}>{user.blocked ? "Unblock" : "Block"}</button></td>
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
  useEffect(() => { void load(); }, [load]);
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
  useEffect(() => { void load(); }, [load]);
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
          <div className="management-main"><h3>{product.title}</h3><p>{product.sellerName} - {product.pricePi} Pi</p></div>
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
  useEffect(() => { void load(); }, [load]);
  const update = async (id: string, status: string) => { await axiosClient.patch(`/admin/orders/${id}`, { status }); setMessage("Order status updated."); await load(); };
  const filteredOrders = statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter);

  return (
    <main className="private-page">
      <Head title="Orders" description="Review order details and correct statuses when necessary." />
      <Notice text={message} />
      <section className="admin-filter-bar"><label>Status filter<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><span>{filteredOrders.length} orders</span></section>
      {filteredOrders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Buyer / Seller</th><th>Price</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order._id}><td>{order.productTitle}</td><td><small>{order.buyerName}<br />{order.sellerName}</small></td><td>{order.pricePi} Pi</td><td><select value={order.status} onChange={(event) => void update(order._id, event.target.value)}><option>pending</option><option>processing</option><option>shipped</option><option>delivered</option><option>completed</option><option>cancelled</option></select></td><td><button onClick={() => setSelected(order)}>Details</button></td></tr>)}</tbody></table></div> : <div className="private-state compact"><h3>No matching orders</h3><p>Choose another status to view more orders.</p></div>}
      {selected ? <div className="detail-panel"><button onClick={() => setSelected(null)}>Close</button><h2>{selected.productTitle}</h2><p>Order ID: {selected._id}</p><p>Payment ID: {selected.paymentId || "Not paid"}</p><p>Transaction: {selected.paymentTxid || "Not available"}</p><p>Created: {new Date(selected.createdAt).toLocaleString()}</p></div> : null}
    </main>
  );
};

type Report = { _id: string; targetType: string; targetId: string; reason: string; details?: string; resolved?: boolean; createdAt: string; source?: "marketplace" | "support" };

export const AdminReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("open");
  const load = useCallback(async () => setReports((await axiosClient.get("/admin/reports")).data.reports), []);
  useEffect(() => { void load(); }, [load]);
  const resolve = async (report: Report) => {
    await axiosClient.patch(report.source === "support" ? `/admin/support/${report._id}/resolve` : `/admin/reports/${report._id}/resolve`);
    setMessage("Record resolved.");
    await load();
  };
  const visible = useMemo(() => reports.filter((report) => filter === "all" || (filter === "open" && !report.resolved) || (filter === "resolved" && report.resolved) || report.source === filter), [reports, filter]);

  return (
    <main className="private-page">
      <Head title="Reports & Support" description="Review marketplace reports, public contact messages, abuse reports, and support requests." />
      <Notice text={message} />
      <section className="admin-filter-bar"><label>Filter<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="open">Open</option><option value="all">All</option><option value="marketplace">Marketplace</option><option value="support">Support</option><option value="resolved">Resolved</option></select></label><span>{visible.length} records</span></section>
      {visible.length === 0 ? <div className="private-state">No records match this filter.</div> : <div className="management-list">{visible.map((report) => <article className="report-card" key={`${report.source}-${report._id}`}><div><span>{report.source || "marketplace"} - {report.targetType}</span><h3>{report.reason}</h3><p>{report.details || `Target: ${report.targetId}`}</p></div><strong className={report.resolved ? "resolved" : "open"}>{report.resolved ? "Resolved" : "Open"}</strong>{!report.resolved ? <button onClick={() => void resolve(report)}>Mark resolved</button> : null}</article>)}</div>}
    </main>
  );
};

export const AdminSettingsPage = () => <main className="private-page"><Head title="Admin Settings" description="Administrative preferences use your main SMAJ settings." /><div className="private-state"><p>Theme, language, notifications, and logout are managed in account settings.</p><Link className="private-primary-button" to="/settings">Open Settings</Link></div></main>;
