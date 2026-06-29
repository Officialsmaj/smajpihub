import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

const steps = [
  ["01", "Login with Pi", "Use your Pi identity to enter SMAJ PI HUB once.", AccountCircleOutlinedIcon],
  ["02", "Choose a service", "Open SMAJ Store or explore jobs, health, learning, transport, housing, and more.", SearchOutlinedIcon],
  ["03", "Talk and confirm", "Chat with sellers or providers, check details, and understand the service status.", ChatOutlinedIcon],
  ["04", "Use Pi safely", "Follow the Pi payment flow, reviews, escrow logic, and support process where available.", PaymentsOutlinedIcon],
] as const;

const phoneItems = ["Pi Login", "SMAJ Store", "Verified Seller", "Pi Payment"];

const HowItWorksPage = () => {
  return (
    <AppLayout>
      <main className="home-page how-company-page">
        <section className="home-hero how-company-hero">
          <div>
            <span className="home-kicker">HOW SMAJ PI HUB WORKS</span>
            <h1>One login, one wallet, many real services.</h1>
            <p>
              SMAJ PI HUB is designed to feel simple: users enter with Pi, choose a trusted service, communicate
              clearly, then complete the service flow with Pi-powered utility.
            </p>
            <div className="home-hero-cta">
              <Link to="/services" className="home-hero-primary-btn">
                Explore Services
              </Link>
              <Link to="/services/store" className="home-hero-secondary-btn">
                Open SMAJ Store
              </Link>
            </div>
          </div>
          <aside className="how-phone-mockup" aria-label="Animated SMAJ PI HUB phone flow">
            <div className="how-phone-screen">
              <span>SMAJ PI HUB</span>
              <strong>Everything you need in one place</strong>
              <div>
                {phoneItems.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="home-section how-company-section">
          <div className="home-section-head">
            <span className="home-kicker">USER FLOW</span>
            <h2>The experience in four clear steps.</h2>
          </div>
          <div className="how-step-grid">
            {steps.map(([num, title, description, Icon]) => (
              <article key={num}>
                <span>{num}</span>
                <Icon />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section how-company-section how-company-explain">
          <div>
            <VerifiedUserOutlinedIcon />
            <h2>Trust is part of the flow.</h2>
            <p>
              The company direction includes verified users, seller/provider checks, clear service status, escrow logic,
              reviews, dispute support, and platform guidance so people know what is live and what is coming next.
            </p>
          </div>
          <Link to="/white-paper">
            Read White Paper
            <ArrowForwardOutlinedIcon />
          </Link>
        </section>

        <section className="home-section how-company-section how-store-callout">
          <StorefrontOutlinedIcon />
          <div>
            <span className="home-kicker">MVP START</span>
            <h2>SMAJ Store is the first practical service layer.</h2>
            <p>Products, seller profiles, buyer/seller chat, Pi payment flow, reviews, and support logic start here.</p>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default HowItWorksPage;
