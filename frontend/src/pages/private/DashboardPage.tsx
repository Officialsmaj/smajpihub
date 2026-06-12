import { Link } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import { useAuthContext } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";
import MarketplaceProductCard from "../../components/MarketplaceProductCard";
const STORE_CATEGORIES = ["Electronics", "Fashion", "Vehicles", "Property", "Food", "Services", "Others"];

const DashboardPage = () => {
  const { user } = useAuthContext();
  const [feed, setFeed] = useState<{ recommended: Product[]; latest: Product[] } | null>(null);
  useEffect(() => { axiosClient.get("/marketplace/feed").then(({ data }) => setFeed(data)).catch(() => undefined); }, []);
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
      <section className="section-title"><div><h2>Popular categories</h2><p>Explore the Store by what you need.</p></div></section>
      <section className="category-grid">{STORE_CATEGORIES.map((category) => <Link key={category} to={`/store?category=${encodeURIComponent(category)}`}>{category}</Link>)}</section>
      {feed?.recommended.length ? <><section className="section-title"><div><h2>Recommended for you</h2><p>Listings based on your marketplace activity.</p></div><Link to="/store">See all</Link></section><section className="product-grid dashboard-products">{feed.recommended.slice(0, 4).map((product) => <MarketplaceProductCard key={product._id} product={product} />)}</section></> : null}
      {feed?.latest.length ? <><section className="section-title"><div><h2>Latest products</h2><p>Fresh listings from SMAJ sellers.</p></div><Link to="/store">Browse Store</Link></section><section className="product-grid dashboard-products">{feed.latest.slice(0, 4).map((product) => <MarketplaceProductCard key={product._id} product={product} />)}</section></> : null}
    </main>
  );
};

export default DashboardPage;
