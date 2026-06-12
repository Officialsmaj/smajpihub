import { Link } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useAuthContext } from "../../contexts/AuthContext";

const DashboardPage = () => {
  const { user } = useAuthContext();
  return (
    <main className="private-page">
      <section className="private-welcome">
        <p className="private-kicker">PRIVATE DASHBOARD</p>
        <h1>Welcome, @{user?.piUsername || user?.username}</h1>
        <p>Buy, sell, and manage Pi-powered orders from one simple workspace.</p>
      </section>
      <section className="dashboard-grid">
        <article className="dashboard-card wallet-card">
          <AccountBalanceWalletOutlinedIcon />
          <div><span>Wallet status</span><h2>Pi Wallet Connected</h2><p>Authenticated as @{user?.piUsername || user?.username}</p></div>
        </article>
        <Link to="/store" className="dashboard-card">
          <StorefrontOutlinedIcon />
          <div><span>Marketplace</span><h2>SMAJ Store</h2><p>Browse products priced in Pi.</p></div>
        </Link>
        <Link to="/orders" className="dashboard-card">
          <ReceiptLongOutlinedIcon />
          <div><span>Activity</span><h2>Orders</h2><p>Track pending and paid purchases.</p></div>
        </Link>
        <Link to="/profile" className="dashboard-card">
          <PersonOutlineIcon />
          <div><span>Account</span><h2>Profile</h2><p>Manage your name, country, and marketplace role.</p></div>
        </Link>
        <article className="dashboard-card muted-card">
          <AutoAwesomeOutlinedIcon />
          <div><span>Roadmap</span><h2>Coming Soon Services</h2><p>More Pi utility modules are planned after this MVP.</p></div>
        </article>
      </section>
    </main>
  );
};

export default DashboardPage;
