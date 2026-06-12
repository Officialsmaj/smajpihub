import { Link } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
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
      <section className="dashboard-quick-actions" aria-label="Quick actions">
        <Link to="/add-product"><AddBoxOutlinedIcon />Add Product</Link>
        <Link to="/store"><StorefrontOutlinedIcon />View Store</Link>
        <Link to="/orders"><ReceiptLongOutlinedIcon />My Orders</Link>
        <Link to="/profile"><PersonOutlineIcon />Edit Profile</Link>
      </section>
      <section className="dashboard-grid">
        <Link to="/wallet" className="dashboard-card wallet-card">
          <AccountBalanceWalletOutlinedIcon />
          <div><span>Wallet status</span><h2>Pi Wallet Connected</h2><p>Authenticated as @{user?.piUsername || user?.username}</p></div>
        </Link>
        <Link to="/store" className="dashboard-card">
          <StorefrontOutlinedIcon />
          <div><span>Marketplace</span><h2>Store</h2><p>Browse products priced in Pi.</p></div>
        </Link>
        <Link to="/orders" className="dashboard-card">
          <ReceiptLongOutlinedIcon />
          <div><span>Activity</span><h2>Orders</h2><p>Track pending and paid purchases.</p></div>
        </Link>
        <Link to="/seller" className="dashboard-card">
          <SellOutlinedIcon />
          <div><span>Seller tools</span><h2>Seller Dashboard</h2><p>Manage listings and incoming orders.</p></div>
        </Link>
        <Link to="/services" className="dashboard-card muted-card">
          <AutoAwesomeOutlinedIcon />
          <div><span>Roadmap</span><h2>Coming Soon Services</h2><p>More Pi utility modules are planned after this MVP.</p></div>
        </Link>
      </section>
    </main>
  );
};

export default DashboardPage;
