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

const PublicStorePage = () => (
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
            <LoginWithPiButton className="home-hero-primary-btn">Login with Pi</LoginWithPiButton>
            <Link to="/onboarding" className="home-hero-secondary-btn">Seller Onboarding</Link>
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

export default PublicStorePage;
