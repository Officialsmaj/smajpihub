import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import PrivateSkeleton from "../../components/PrivateSkeleton";
import PullToRefresh from "../../components/PullToRefresh";
import { axiosClient } from "../../lib/axiosClient";
import { formatPiAmount } from "../../lib/formatters";
import type { Order, Product } from "../../types/marketplace";
import type { User } from "../../types/pi";
import { getStreamAdminOverview, type StreamAdminOverview } from "../../lib/streamAdmin";
import ActionDialog from "../../components/ActionDialog";
import { showFeedback } from "../../lib/feedback";
import {
  getJobsAdminReview,
  moderateJobPosting,
  moderateJobCompany,
  verifyJobsCompany,
  verifyJobsCandidate,
  type JobsAdminReviewJob,
  type JobsAdminReviewCompany,
  type JobsAdminReviewProfile,
} from "../../lib/jobsApi";

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
  const [streamOverview, setStreamOverview] = useState<StreamAdminOverview | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [statsResponse, activityResponse, streamResponse] = await Promise.all([
        adminFetch<{ stats: AdminStats; updatedAt: string }>("/admin/stats"),
        adminFetch<{ activity: AdminActivity[]; updatedAt: string }>("/admin/activity"),
        getStreamAdminOverview().catch(() => null),
      ]);
      setStats(statsResponse.stats);
      setActivity(activityResponse.activity);
      setStreamOverview(streamResponse);
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
    ["totalProducts", "Total Products", "/admin/products"],
    ["totalOrders", "Total Orders", "/admin/orders"],
    ["completedOrders", "Completed Orders", "/admin/orders"],
  ] as const;
  const attention = [
    ["Pending products", stats?.pendingProducts || 0, "/admin/products"],
    ["Seller applications", stats?.pendingOnboarding || 0, "/admin/onboarding"],
    ["Open reports", stats?.unreadReports || 0, "/admin/reports"],
    ["Failed or cancelled payments", stats?.failedCancelledPayments || 0, "/admin/orders"],
    ["Jobs moderation", stats?.pendingJobsModeration || 0, "/admin/jobs"],
    ["Stream moderation", streamOverview?.stats.pendingVideos || 0, "/admin/stream/moderation"],
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
          <div className="private-alert admin-live-status"><i /> Live operations · updated {updatedLabel}</div>
          <section className="stats-grid admin-stats admin-summary-stats">
            {cards.map(([key, label, to]) => <Link to={to} key={key}><span>{label}</span><strong>{stats[key] || 0}</strong></Link>)}
            <Link to="/admin/stream"><span>Published Stream titles</span><strong>{streamOverview?.stats.publishedVideos || 0}</strong></Link>
          </section>
          <section className="admin-attention-panel">
            <div className="section-title compact"><div><p className="private-kicker">ACTION CENTER</p><h2>Needs attention</h2><p>One queue for marketplace and Stream operations.</p></div></div>
            <div>{attention.map(([label, count, to]) => <Link to={to} key={label}><span>{label}</span><strong>{count}</strong><small>{count ? "Review now" : "All clear"}</small></Link>)}</div>
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

export const AdminJobsReviewPage = () => {
  const [jobs, setJobs] = useState<JobsAdminReviewJob[]>([]);
  const [companies, setCompanies] = useState<JobsAdminReviewCompany[]>([]);
  const [profiles, setProfiles] = useState<JobsAdminReviewProfile[]>([]);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const data = await getJobsAdminReview();
    setJobs(data.jobs);
    setCompanies(data.companies);
    setProfiles(data.profiles);
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const reportError = (error: unknown, fallback: string) =>
    showFeedback((error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback, "error");
  const decideJob = async (id: string, status: "approved" | "rejected") => {
    try {
      await moderateJobPosting(id, status);
      setMessage(`Job ${status}.`);
      await load();
    } catch (error) {
      reportError(error, "Job could not be updated.");
    }
  };
  const decideCompany = async (id: string, status: "verified" | "rejected") => {
    try {
      await Promise.all([
        verifyJobsCompany(id, status),
        moderateJobCompany(id, status === "verified" ? "approved" : "rejected"),
      ]);
      setMessage(`Company ${status === "verified" ? "verified and listed" : "rejected"}.`);
      await load();
    } catch (error) {
      reportError(error, "Company could not be updated.");
    }
  };
  const decideCandidate = async (userId: string, status: "verified" | "rejected") => {
    try {
      await verifyJobsCandidate(userId, status);
      setMessage(`Candidate ${status === "verified" ? "verified" : "rejected"}.`);
      await load();
    } catch (error) {
      reportError(error, "Candidate could not be updated.");
    }
  };

  return (
    <main className="private-page">
      <Head title="Jobs Review" description="Approve job postings and review employer and candidate verification requests." />
      <Notice text={message} />

      <section className="admin-filter-bar"><span>{jobs.length} job postings pending review</span></section>
      {jobs.length ? <div className="management-list">{jobs.map((job) => (
        <article className="report-card" key={job.id}>
          <div>
            <span>{job.category} · {job.type}</span>
            <h3>{job.title}</h3>
            <p>{job.company} · {job.location}</p>
            <small>{job.createdAt ? new Date(job.createdAt).toLocaleString() : ""}</small>
          </div>
          <div className="row-actions">
            <button onClick={() => void decideJob(job.id, "approved")}>Approve</button>
            <button className="danger" onClick={() => void decideJob(job.id, "rejected")}>Reject</button>
          </div>
        </article>
      ))}</div> : <div className="private-state"><h2>No job postings awaiting review</h2><p>New postings will show here until approved.</p></div>}

      <section className="admin-filter-bar"><span>{companies.length} company verification requests</span></section>
      {companies.length ? <div className="management-list">{companies.map((company) => (
        <article className="report-card" key={company.id}>
          <div>
            <span>{company.field}</span>
            <h3>{company.name}</h3>
            <p>{company.website || "No website provided"}</p>
            {company.verificationEvidence ? (
              <p>Reg. {company.verificationEvidence.registrationNumber || "—"} · {company.verificationEvidence.businessEmail || "—"}</p>
            ) : null}
            <small>{company.verificationRequestedAt ? new Date(company.verificationRequestedAt).toLocaleString() : ""}</small>
          </div>
          <div className="row-actions">
            <button onClick={() => void decideCompany(company.id, "verified")}>Verify</button>
            <button className="danger" onClick={() => void decideCompany(company.id, "rejected")}>Reject</button>
          </div>
        </article>
      ))}</div> : <div className="private-state"><h2>No company verification requests</h2><p>Employer verification submissions will show here.</p></div>}

      <section className="admin-filter-bar"><span>{profiles.length} candidate verification requests</span></section>
      {profiles.length ? <div className="management-list">{profiles.map((profile) => (
        <article className="report-card" key={profile.userId}>
          <div>
            <span>{profile.title || "Candidate"}</span>
            <h3>{profile.candidateName}</h3>
            {profile.verificationEvidence ? <p>{profile.verificationEvidence.credential || "No credential provided"}</p> : null}
            <small>{profile.verificationRequestedAt ? new Date(profile.verificationRequestedAt).toLocaleString() : ""}</small>
          </div>
          <div className="row-actions">
            <button onClick={() => void decideCandidate(profile.userId, "verified")}>Verify</button>
            <button className="danger" onClick={() => void decideCandidate(profile.userId, "rejected")}>Reject</button>
          </div>
        </article>
      ))}</div> : <div className="private-state"><h2>No candidate verification requests</h2><p>Candidate verification submissions will show here.</p></div>}
    </main>
  );
};

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialog, setDialog] = useState<{ type: "reject" | "delete"; product: Product } | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const load = useCallback(async () => setProducts((await axiosClient.get("/admin/products")).data.products), []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const update = async (id: string, body: object) => {
    try {
      await axiosClient.patch(`/admin/products/${id}`, body);
      setMessage("Product updated.");
      await load();
    } catch (error) {
      showFeedback((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Product could not be updated.", "error");
    }
  };
  const completeDialog = async (value: string) => {
    if (!dialog) return;
    try {
      setDialogBusy(true);
      if (dialog.type === "reject") await axiosClient.patch(`/admin/products/${dialog.product._id}`, { approved: false, hidden: false, rejectionReason: value });
      else await axiosClient.delete(`/admin/products/${dialog.product._id}`);
      setMessage(dialog.type === "reject" ? "Product rejected." : "Product deleted.");
      setDialog(null);
      await load();
    } catch (error) {
      showFeedback((error as { response?: { data?: { message?: string } } }).response?.data?.message || `Product could not be ${dialog.type === "reject" ? "rejected" : "deleted"}.`, "error");
    } finally {
      setDialogBusy(false);
    }
  };
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
          <div className="row-actions"><button onClick={() => void update(product._id, { approved: true, hidden: false })}>Approve</button><button onClick={() => setDialog({ type: "reject", product })}>Reject</button><button onClick={() => void update(product._id, { hidden: !product.hidden })}>{product.hidden ? "Show" : "Hide"}</button><button className="danger" onClick={() => setDialog({ type: "delete", product })}>Delete</button></div>
        </article>
      ))}</div>
      <ActionDialog open={Boolean(dialog)} title={dialog?.type === "reject" ? `Reject “${dialog.product.title}”?` : `Delete “${dialog?.product.title || "product"}”?`} description={dialog?.type === "reject" ? "The seller will see this reason and can update the listing." : "This permanently removes the listing and cannot be undone."} confirmLabel={dialog?.type === "reject" ? "Reject product" : "Delete product"} danger busy={dialogBusy} inputLabel={dialog?.type === "reject" ? "Rejection reason" : undefined} initialValue={dialog?.product.rejectionReason || "Product photos, price, description, or seller details need review."} minLength={5} onCancel={() => setDialog(null)} onConfirm={value => void completeDialog(value)} />
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

export const AdminUniversitiesPage = () => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const [uniResponse, claimsResponse, statsResponse] = await Promise.all([
        axiosClient.get("/admin/universities"),
        axiosClient.get("/admin/universities/claims"),
        axiosClient.get("/admin/universities/stats"),
      ]);
      setUniversities(uniResponse.data.universities);
      setClaims(claimsResponse.data.claims);
      setStats(statsResponse.data.stats);
    } catch {
      setMessage("Failed to load university data.");
    }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const updateClaim = async (id: string, reviewStatus: string, reviewNotes?: string) => {
    await axiosClient.patch(`/admin/universities/claims/${id}`, { review_status: reviewStatus, review_notes: reviewNotes });
    setMessage("Claim updated.");
    await load();
  };

  const updateUniversity = async (id: string, body: any) => {
    await axiosClient.patch(`/admin/universities/${id}`, body);
    setMessage("University updated.");
    await load();
  };

  return (
    <main className="private-page">
      <Head title="Universities" description="Manage university listings, partnerships, programs, claims, and Pi-enabled services." action={<button className="private-secondary-button" type="button" onClick={() => void load()}>Refresh</button>} />
      <Notice text={message} />
      {stats && (
        <section className="stats-grid admin-stats admin-summary-stats">
          <div><span>Total Universities</span><strong>{stats.totalUniversities}</strong></div>
          <div><span>Programs</span><strong>{stats.totalPrograms}</strong></div>
          <div><span>Pending Claims</span><strong>{stats.pendingClaims}</strong></div>
          <div><span>Applications</span><strong>{stats.totalApplications}</strong></div>
          <div><span>Completed Payments</span><strong>{stats.completedPayments}</strong></div>
        </section>
      )}
      <section className="management-list">
        <h2>Universities</h2>
        {universities.length === 0 ? <div className="private-state"><h3>No universities</h3><p>Add universities via the API or admin tools.</p></div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>University</th><th>Country</th><th>Type</th><th>Recognition</th><th>Partnership</th><th>Actions</th></tr></thead>
              <tbody>{universities.map((uni) => (
                <tr key={uni.id}>
                  <td><strong>{uni.official_name}</strong><small>{uni.short_name}</small></td>
                  <td>{uni.country}</td>
                  <td>{uni.institution_type}</td>
                  <td>{uni.recognition_status?.replace(/_/g, " ")}</td>
                  <td>{uni.partnership_status?.replace(/_/g, " ")}</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => updateUniversity(uni.id, { partnership_status: uni.partnership_status === "smaj_verified_partner" ? "directory" : "smaj_verified_partner" })}>
                        {uni.partnership_status === "smaj_verified_partner" ? "Remove Partner" : "Make Partner"}
                      </button>
                      <button onClick={() => updateUniversity(uni.id, { pi_payments_enabled: !uni.pi_payments_enabled })}>
                        {uni.pi_payments_enabled ? "Disable Pi" : "Enable Pi"}
                      </button>
                      <button onClick={() => updateUniversity(uni.id, { applications_enabled: !uni.applications_enabled })}>
                        {uni.applications_enabled ? "Disable Apps" : "Enable Apps"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
      <section className="management-list">
        <h2>University Claims</h2>
        {claims.length === 0 ? <div className="private-state"><h3>No claims</h3><p>University representative claims will appear here.</p></div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>University</th><th>Representative</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{claims.map((claim) => (
                <tr key={claim.id}>
                  <td><strong>{claim.university_name}</strong></td>
                  <td>{claim.representative_full_name}<small>{claim.job_title}</small></td>
                  <td>{claim.institutional_email}</td>
                  <td>{claim.review_status?.replace(/_/g, " ")}</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => void updateClaim(claim.id, "approved", "Identity verified.")}>Approve</button>
                      <button onClick={() => void updateClaim(claim.id, "rejected", "Could not verify authority.")}>Reject</button>
                      <button onClick={() => void updateClaim(claim.id, "additional_information_required", "Please provide more documents.")}>Request Info</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export const AdminCoursesPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const [coursesResponse, statsResponse] = await Promise.all([
        axiosClient.get("/admin/courses"),
        axiosClient.get("/admin/courses/stats"),
      ]);
      setCourses(coursesResponse.data.courses);
      setStats(statsResponse.data.stats);
    } catch {
      setMessage("Failed to load courses.");
    }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const updateCourse = async (id: string, body: any) => {
    await axiosClient.patch(`/admin/courses/${id}`, body);
    setMessage("Course updated.");
    await load();
  };

  return (
    <main className="private-page">
      <Head title="Courses" description="Manage online courses, review submissions, and inspect enrollments." action={<button className="private-secondary-button" type="button" onClick={() => void load()}>Refresh</button>} />
      <Notice text={message} />
      {stats && (
        <section className="stats-grid admin-stats admin-summary-stats">
          <div><span>Total Courses</span><strong>{stats.totalCourses}</strong></div>
          <div><span>Published</span><strong>{stats.publishedCourses}</strong></div>
          <div><span>Drafts</span><strong>{stats.draftCourses}</strong></div>
          <div><span>Pending Review</span><strong>{stats.pendingReview}</strong></div>
          <div><span>Enrollments</span><strong>{stats.totalEnrollments}</strong></div>
          <div><span>Certificates</span><strong>{stats.totalCertificates}</strong></div>
        </section>
      )}
      <section className="management-list">
        <h2>Courses</h2>
        {courses.length === 0 ? <div className="private-state"><h3>No courses</h3><p>Courses will appear here once created.</p></div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Course</th><th>Category</th><th>Type</th><th>Level</th><th>Status</th><th>Enrollments</th><th>Actions</th></tr></thead>
              <tbody>{courses.map((course) => (
                <tr key={course.id}>
                  <td><strong>{course.title}</strong><small>{course.short_description}</small></td>
                  <td>{course.category}</td>
                  <td>{course.course_type}</td>
                  <td>{course.level}</td>
                  <td>{course.status}</td>
                  <td>{course.enrollment_count}</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => updateCourse(course.id, { status: course.status === "published" ? "archived" : "published" })}>
                        {course.status === "published" ? "Archive" : "Publish"}
                      </button>
                      <button onClick={() => updateCourse(course.id, { status: "rejected", review_notes: "Does not meet standards." })}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};
