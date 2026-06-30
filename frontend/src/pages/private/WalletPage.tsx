import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";

const maskAddress = (address?: string) => address ? `${address.slice(0, 7)}...${address.slice(-5)}` : "Available after Pi login permission";

const WalletPage = () => {
  const { user } = useAuthContext();
  const hasPi = Boolean(window.Pi);
  const address = maskAddress(user?.wallet_address);

  return (
    <main className="private-page wallet-page">
      <section className="private-page-head">
        <div>
          <h1>Wallet</h1>
          <p>Review wallet connection status and Pi payment readiness. SMAJ PI HUB never stores private keys.</p>
        </div>
        <span className={hasPi ? "wallet-connected-chip" : "wallet-disconnected-chip"}>{hasPi ? "Pi Browser Ready" : "Open in Pi Browser"}</span>
      </section>

      <section className="wallet-hero-card real-wallet-card">
        <div>
          <span>Pi Wallet Status</span>
          <strong>{hasPi ? "Ready for Pi payments" : "Pi Browser required"}</strong>
          <small>Balance display depends on Pi ecosystem permissions and is not estimated by SMAJ PI HUB.</small>
          <Link className="private-primary-button" to="/payment-method">View Payment Method</Link>
        </div>
        <AccountBalanceWalletOutlinedIcon />
      </section>

      <section className="wallet-panel">
        <div>
          <span>Wallet address</span>
          <strong>{address}</strong>
          <p>Only a masked wallet identifier is shown when available. No passphrases or private keys are stored.</p>
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
          <div className="security-line"><ShieldOutlinedIcon /><span><strong>Payment confirmation</strong><small>Orders update only after Pi payment confirmation callbacks.</small></span></div>
          <div className="security-line"><ShieldOutlinedIcon /><span><strong>User control</strong><small>Always review wallet prompts before confirming a payment.</small></span></div>
        </article>
      </section>

      <section className="wallet-transactions">
        <h2>Transactions</h2>
        <div className="private-state compact">
          <h3>No wallet transaction feed yet</h3>
          <p>Confirmed SMAJ Store payments appear in Orders. A full wallet ledger will be added when supported by the production integration.</p>
          <Link className="private-secondary-button" to="/orders">View Orders</Link>
        </div>
      </section>
    </main>
  );
};

export default WalletPage;
