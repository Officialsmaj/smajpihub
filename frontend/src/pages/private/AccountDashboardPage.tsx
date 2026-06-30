import { Link } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { useAuthContext } from "../../contexts/AuthContext";
import TrustBadge from "../../components/TrustBadge";

const quickLinks = [
  ["Profile", "/profile", PersonOutlineOutlinedIcon],
  ["Wallet", "/wallet", AccountBalanceWalletOutlinedIcon],
  ["Safety", "/settings", ShieldOutlinedIcon],
  ["Inbox", "/messages", InboxOutlinedIcon],
] as const;

const accountRows = [
  ["Manage profile", "Name, photo, contact, seller status", "/profile"],
  ["Seller tools", "Products, orders, and marketplace status", "/seller"],
  ["Saved products", "Products you saved from SMAJ Store", "/saved"],
  ["Orders", "Purchases and sales activity", "/orders"],
  ["Help center", "Support and marketplace guidance", "/help"],
  ["Legal", "Terms, privacy, and platform rules", "/terms"],
] as const;

const AccountDashboardPage = () => {
  const { user } = useAuthContext();
  const name = user?.displayName || user?.username || "Pi User";

  return (
    <main className="private-page account-dashboard-page">
      <section className="account-dashboard-identity">
        <div className="account-dashboard-avatar">
          {user?.avatar ? <img src={user.avatar} alt="" /> : name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1>{name}</h1>
          <p>@{user?.piUsername || user?.username}</p>
          <TrustBadge level={user?.verificationLevel} />
        </div>
      </section>

      <section className="account-quick-grid">
        {quickLinks.map(([label, to, Icon]) => (
          <Link to={to} key={label}>
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </section>

      <section className="account-dashboard-list">
        {accountRows.map(([label, description, to]) => (
          <Link to={to} key={label}>
            <span>{label}<small>{description}</small></span>
            <ChevronRightOutlinedIcon />
          </Link>
        ))}
        <div>
          <span>App version</span>
          <small>1.0.0</small>
        </div>
      </section>

      <section className="account-checkup real-account-checkup">
        <StorefrontOutlinedIcon />
        <div>
          <h2>Ready to sell on SMAJ Store?</h2>
          <p>Activate seller tools from your profile, submit products, and wait for admin approval before they appear in Store.</p>
        </div>
        <Link className="private-secondary-button" to="/profile">Seller Setup</Link>
      </section>
    </main>
  );
};

export default AccountDashboardPage;
