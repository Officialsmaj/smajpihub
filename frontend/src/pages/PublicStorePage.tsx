import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import LoginWithPiButton from "../components/LoginWithPiButton";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { axiosClient } from "../lib/axiosClient";
import type { Product } from "../types/marketplace";

const storeFeatures = [
  ["Product Listings", "Sellers can prepare clear products, categories, images, and marketplace details.", StorefrontOutlinedIcon],
  ["Buyer / Seller Chat", "Users can ask questions and confirm service details before moving forward.", ChatOutlinedIcon],
  ["Pi Payment Flow", "Marketplace flows are designed around Pi wallet access and Pi-denominated utility.", PaymentsOutlinedIcon],
  ["Dispute Support", "The product direction includes payment confirmation, support review, and safer transaction handling.", LockOutlinedIcon],
  ["Reviews & Ratings", "Trust signals help buyers and sellers build credible marketplace history.", RateReviewOutlinedIcon],
  ["Verified Sellers", "Provider checks and profile signals support safer participation.", VerifiedUserOutlinedIcon],
] as const;

const launchSteps = [
  "Login with Pi in Pi Browser.",
  "Explore product listings and trusted seller profiles.",
  "Chat, confirm details, and follow the Pi payment flow.",
  "Review the experience and use support if a dispute needs attention.",
];

const PublicStorePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void axiosClient.get<{ products: Product[] }>("/marketplace/products")
      .then(({ data }) => { if (active) setProducts(data.products.slice(0, 8)); })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
  <AppLayout>
    <main className="home-page public-store-page">
      <section className="home-hero public-store-hero">
        <div>
          <span className="home-kicker">SMAJ STORE</span>
          <h1>The first marketplace layer of SMAJ PI HUB.</h1>
          <p>
            SMAJ Store is the MVP starting point for real Pi utility: product discovery, seller profiles,
            buyer/seller chat, Pi payment flow, payment confirmation, reviews, and marketplace support.
          </p>
          <div className="home-hero-cta">
            <LoginWithPiButton className="home-hero-primary-btn" redirectTo="/store">Open SMAJ Store</LoginWithPiButton>
            <Link to="/onboarding" className="home-hero-secondary-btn">Apply to Join</Link>
          </div>
        </div>
        <aside className="public-store-status-card">
          <StorefrontOutlinedIcon />
          <span className="live-rating-badge">LIVE MVP</span>
          <strong>Marketplace first</strong>
          <p>Start with store activity, then expand into the wider service ecosystem.</p>
        </aside>
      </section>

      <section className="home-section public-store-section">
        <div className="home-section-head">
          <span className="home-kicker">LIVE MARKETPLACE</span>
          <h2>Browse products before signing in.</h2>
          <p>Product discovery is public. Pi login is requested when you open a product or start shopping.</p>
        </div>
        {loading ? <p className="public-store-catalog-state">Loading marketplace products...</p> : products.length ? (
          <div className="public-store-product-grid">
            {products.map(product => (
              <article key={product._id} className="public-store-product-card">
                <div>{product.image ? <img src={product.image} alt={product.title} /> : <span>No image</span>}</div>
                <small>{product.category || "Marketplace"}</small>
                <h3>{product.title}</h3>
                <p>{product.sellerName || "SMAJ Seller"}</p>
                <strong>π {product.pricePi.toFixed(2)}</strong>
                <LoginWithPiButton redirectTo={`/product/${product._id}`}>View product</LoginWithPiButton>
              </article>
            ))}
          </div>
        ) : <div className="public-store-catalog-state"><p>No live products are available yet.</p><LoginWithPiButton redirectTo="/store">Open authenticated Store</LoginWithPiButton></div>}
      </section>

      <section className="home-section public-store-section">
        <div className="home-section-head">
          <span className="home-kicker">MARKETPLACE FEATURES</span>
          <h2>Clear enough for buyers. Structured enough for sellers.</h2>
        </div>
        <div className="public-store-feature-grid">
          {storeFeatures.map(([title, text, Icon]) => (
            <article key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section public-store-section public-store-flow-panel">
        <div>
          <span className="home-kicker">HOW STORE WORKS</span>
          <h2>A simple marketplace flow for Pi users.</h2>
          <p>Store is designed to be the first practical place where users understand SMAJ PI HUB utility.</p>
        </div>
        <ol>
          {launchSteps.map((step) => (
            <li key={step}>
              <CheckCircleOutlineOutlinedIcon />
              {step}
            </li>
          ))}
        </ol>
      </section>
    </main>
  </AppLayout>
  );
};

export default PublicStorePage;
