import { useCallback, useEffect, useState } from "react";
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
const maskAddress = (address?: string) => address ? `${address.slice(0, 7)}...${address.slice(-5)}` : "Available after Pi login permission";
const shortId = (value?: string) => value ? `${value.slice(0, 8)}...${value.slice(-6)}` : "Not available";
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString() : "Live status pending";

const WalletPage = () => {
  const { user } = useAuthContext();
  const hasPi = Boolean(window.Pi);
  const [payments, setPayments] = useState<WalletPayment[]>([]);
  const [summary, setSummary] = useState<WalletSummary>(emptySummary);
  const [serverTime, setServerTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const address = maskAddress(user?.wallet_address);

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

  return (
    <main className="private-page wallet-page">
      <section className="private-page-head">
        <div>
          <h1>Wallet</h1>
          <p>Real SMAJ PI HUB payment activity from your orders. Pi balance and private keys stay inside Pi Wallet.</p>
        </div>
        <button className={hasPi ? "wallet-connected-chip" : "wallet-disconnected-chip"} type="button" onClick={() => void loadPayments()}>
          <RefreshOutlinedIcon /> {hasPi ? "Live Pi ready" : "Open in Pi Browser"}
        </button>
      </section>

      <section className="wallet-hero-card real-wallet-card">
        <div>
          <span>Real-time SMAJ Pi activity</span>
          <strong>{formatPiAmount(summary.paid)}</strong>
          <small>Confirmed in-app Pi payments. Last sync: {serverTime ? formatDate(serverTime) : "Syncing..."}</small>
          <Link className="private-primary-button" to="/orders">View Orders</Link>
        </div>
        <AccountBalanceWalletOutlinedIcon />
      </section>

      <section className="wallet-live-summary">
        <article><span>Paid</span><strong>{formatPiAmount(summary.paid)}</strong></article>
        <article><span>Pending</span><strong>{formatPiAmount(summary.pending)}</strong></article>
        <article><span>Cancelled</span><strong>{formatPiAmount(summary.cancelled)}</strong></article>
      </section>

      <section className="wallet-panel">
        <div>
          <span>Pi account</span>
          <strong>@{user?.piUsername || user?.username || "pi-user"}</strong>
          <p>Wallet address: {address}. SMAJ PI HUB reads only app payment records, not your full Pi Wallet balance.</p>
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
          <h2>Wallet Safety</h2>
          <div className="security-line"><ShieldOutlinedIcon /><span><strong>No custody</strong><small>SMAJ PI HUB does not hold user Pi or private keys.</small></span></div>
          <div className="security-line"><ShieldOutlinedIcon /><span><strong>Real activity only</strong><small>Amounts come from marketplace orders and Pi payment callbacks.</small></span></div>
          <div className="security-line"><ShieldOutlinedIcon /><span><strong>Live refresh</strong><small>This page refreshes payment activity every 15 seconds.</small></span></div>
        </article>
      </section>

      <section className="wallet-transactions">
        <div className="wallet-section-head">
          <h2>Live Pi payment activity</h2>
          <button type="button" className="private-secondary-button" onClick={() => void loadPayments()} disabled={loading}>
            <RefreshOutlinedIcon /> {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {error ? <div className="private-alert error">{error}</div> : null}
        {!loading && !payments.length ? (
          <div className="private-state compact">
            <h3>No SMAJ Pi payments yet</h3>
            <p>When you create or receive paid orders, real payment IDs and transaction IDs will appear here.</p>
            <Link className="private-secondary-button" to="/store">Open Store</Link>
          </div>
        ) : null}
        {payments.map((payment) => (
          <article key={`${payment.orderId}-${payment.paymentId || payment.status}`}>
            <div>
              <strong>{payment.productTitle}</strong>
              <small>{payment.role === "buyer" ? "Paid by you" : "Received as seller"} · {payment.status}</small>
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
