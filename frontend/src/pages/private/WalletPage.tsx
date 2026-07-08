import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { useAuthContext } from "../../contexts/AuthContext";
import { axiosClient } from "../../lib/axiosClient";
import { formatPiAmount } from "../../lib/formatters";

type WalletPayment = {
  orderId: string;
  productTitle: string;
  productImage?: string;
  amountPi: number;
  paymentId?: string;
  txid?: string;
  status: string;
  orderStatus: string;
  role: "buyer" | "seller";
  createdAt: string;
  updatedAt?: string;
  paidAt?: string | null;
};

type WalletSummary = {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
};

const emptySummary: WalletSummary = { total: 0, paid: 0, pending: 0, cancelled: 0 };
const shortId = (value?: string) => value ? `${value.slice(0, 8)}...${value.slice(-6)}` : "Not available";
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString() : "Live status pending";
const paymentStatusLabel = (status: string) => {
  const value = status.toLowerCase();
  if (value.includes("fail") || value.includes("error")) return "Failed";
  if (value.includes("cancel")) return "Cancelled";
  if (value.includes("complete") || value.includes("paid")) return "Completed";
  if (value.includes("approve")) return "Approved";
  return "Pending";
};

const WalletPage = () => {
  const { user } = useAuthContext();
  const hasPi = Boolean(window.Pi);
  const [payments, setPayments] = useState<WalletPayment[]>([]);
  const [summary, setSummary] = useState<WalletSummary>(emptySummary);
  const [serverTime, setServerTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activitySummary = useMemo(() => {
    const counts = { paidOrders: 0, pending: 0, completed: 0, cancelled: 0, failed: 0 };
    payments.forEach((payment) => {
      const label = paymentStatusLabel(payment.status);
      if (label === "Pending") counts.pending += 1;
      if (label === "Completed" || label === "Approved") counts.completed += 1;
      if (label === "Cancelled") counts.cancelled += 1;
      if (label === "Failed") counts.failed += 1;
      if (payment.orderStatus === "paid" || payment.orderStatus === "completed" || label === "Completed" || label === "Approved") counts.paidOrders += 1;
    });
    return counts;
  }, [payments]);

  const loadPayments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const { data } = await axiosClient.get<{ payments: WalletPayment[]; summary: WalletSummary; serverTime: string }>("/payments");
      setPayments(data.payments || []);
      setSummary(data.summary || emptySummary);
      setServerTime(data.serverTime || new Date().toISOString());
    } catch {
      setError("Live Pi payment activity could not be loaded.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
    const timer = window.setInterval(() => void loadPayments(true), 15000);
    return () => window.clearInterval(timer);
  }, [loadPayments]);

  const openPiWallet = () => {
    window.location.href = "pi://wallet";
  };

  return (
    <main className="private-page wallet-page">
      <section className="private-page-head">
        <div>
          <h1>SMAJ PI Activity</h1>
          <p>SMAJ PI HUB does not hold your Pi or private keys. Payments are handled through Pi Wallet.</p>
        </div>
        <button className={hasPi ? "wallet-connected-chip" : "wallet-disconnected-chip"} type="button" onClick={() => void loadPayments()}>
          <RefreshOutlinedIcon /> {hasPi ? "Live Pi ready" : "Open in Pi Browser"}
        </button>
      </section>

      <section className="wallet-hero-card real-wallet-card">
        <div>
          <span>SMAJ PI Activity</span>
          <strong>{activitySummary.paidOrders}</strong>
          <small>Paid orders tracked from SMAJ PI HUB checkout. Testnet payments only. Do not treat as real funds.</small>
          <small>Last sync: {serverTime ? formatDate(serverTime) : "Syncing..."}</small>
          <div className="wallet-action-row">
            <Link className="private-primary-button" to="/orders">View Orders</Link>
            <a className="private-secondary-button" href="#payment-history">Payment History</a>
            <button className="private-secondary-button" type="button" onClick={openPiWallet}>Open Pi Wallet</button>
          </div>
        </div>
        <AccountBalanceWalletOutlinedIcon />
      </section>

      <section className="wallet-live-summary">
        <article><span>Paid orders</span><strong>{activitySummary.paidOrders}</strong><small>{formatPiAmount(summary.paid)}</small></article>
        <article><span>Pending payments</span><strong>{activitySummary.pending || summary.pending}</strong><small>{formatPiAmount(summary.pending)}</small></article>
        <article><span>Completed payments</span><strong>{activitySummary.completed}</strong><small>{formatPiAmount(summary.paid)}</small></article>
        <article><span>Cancelled payments</span><strong>{activitySummary.cancelled || summary.cancelled}</strong><small>{formatPiAmount(summary.cancelled)}</small></article>
        <article><span>Failed payments</span><strong>{activitySummary.failed}</strong><small>Needs review</small></article>
      </section>

      <section className="wallet-panel">
        <div>
          <span>Pi account</span>
          <strong>@{user?.piUsername || user?.username || "pi-user"}</strong>
          <p>SMAJ PI HUB shows only payment and order activity created inside this app. It does not store Pi, private keys, recovery phrases, or Pi Wallet funds.</p>
          <div className="wallet-status-list" aria-label="Payment statuses">
            {["Pending", "Approved", "Completed", "Cancelled", "Failed"].map((status) => (
              <span className={`order-status ${status.toLowerCase()}`} key={status}>{status}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="wallet-grid">
        <article>
          <h2>Payment Method</h2>
          <div className="payment-method active">
            <PaymentsOutlinedIcon />
            <span><strong>Pi Wallet</strong><small>{hasPi ? "Available inside Pi Browser" : "Open the app in Pi Browser to pay"}</small></span>
          </div>
        </article>
        <article>
          <h2>Payment Safety</h2>
          <div className="security-line"><ShieldOutlinedIcon /><span><strong>No custody</strong><small>SMAJ PI HUB does not hold user Pi or private keys.</small></span></div>
          <div className="security-line"><ShieldOutlinedIcon /><span><strong>Real activity only</strong><small>Amounts come from marketplace orders and Pi payment callbacks.</small></span></div>
          <div className="security-line"><ShieldOutlinedIcon /><span><strong>Testnet only</strong><small>Testnet payments only. Do not treat as real funds.</small></span></div>
        </article>
      </section>

      <section className="wallet-transactions" id="payment-history">
        <div className="wallet-section-head">
          <h2>Payment History</h2>
          <button type="button" className="private-secondary-button" onClick={() => void loadPayments()} disabled={loading}>
            <RefreshOutlinedIcon /> {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {error ? <div className="private-alert error">{error}</div> : null}
        {!loading && !payments.length ? (
          <div className="private-state compact">
            <h3>No SMAJ Pi payments yet</h3>
            <p>Paid, pending, completed, cancelled, and failed payment activity will appear here after checkout.</p>
            <Link className="private-secondary-button" to="/store">Open Store</Link>
          </div>
        ) : null}
        {payments.map((payment) => (
          <article key={`${payment.orderId}-${payment.paymentId || payment.status}`}>
            <div>
              <strong>{payment.productTitle}</strong>
              <span className={`order-status ${paymentStatusLabel(payment.status).toLowerCase()}`}>{paymentStatusLabel(payment.status)}</span>
              <small>{payment.role === "buyer" ? "Paid order" : "Seller order"} · {payment.orderStatus}</small>
              <small>Payment: {shortId(payment.paymentId)} · Tx: {shortId(payment.txid)}</small>
            </div>
            <div>
              <strong>{formatPiAmount(payment.amountPi)}</strong>
              <small>{formatDate(payment.paidAt || payment.updatedAt || payment.createdAt)}</small>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default WalletPage;
