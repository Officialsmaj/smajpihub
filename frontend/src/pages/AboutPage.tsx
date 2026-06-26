import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

const steps = [
  {
    label: "Step 01",
    title: "Mission",
    text: "Make Pi useful in real life, not just something people explain for 40 minutes at the worst possible time.",
  },
  {
    label: "Step 02",
    title: "Vision",
    text: "Build one trusted Pi-powered place where your identity, wallet, and services stop running in different directions.",
  },
  {
    label: "Step 03",
    title: "Promise",
    text: "Keep things simple, useful, and honest. No mystery buttons. No app jungle. No stress Olympics.",
  },
];

const reasons = [
  "Too many apps ask users to start from zero.",
  "Pi needs more real-world service utility.",
  "People need trusted sellers, providers, and opportunities.",
  "A single hub can make digital life less noisy.",
];

const services = [
  "Marketplace",
  "Jobs",
  "Health",
  "Education",
  "Housing",
  "Transport",
  "Entertainment",
  "Digital Services",
];

const trustItems = [
  ["Verified Users", VerifiedUserOutlinedIcon],
  ["Pi Wallet Flow", AccountBalanceWalletOutlinedIcon],
  ["Trusted Services", CheckCircleOutlineOutlinedIcon],
  ["One Connected Hub", HubOutlinedIcon],
] as const;

const AboutPage = () => {
  return (
    <AppLayout>
      <main className="home-page about-clean-page">
        <section className="home-hero about-hero about-clean-hero">
          <div>
            <span className="home-kicker">ABOUT SMAJ PI HUB</span>
            <h1>A Pi-powered hub for real-world services.</h1>
            <p>
              SMAJ PI HUB connects marketplace, services, opportunities, and digital tools through one Pi identity and
              one Pi wallet. Basically, less app-jumping, more getting things done.
            </p>
            <div className="home-hero-cta">
              <Link to="/services" className="home-hero-primary-btn">
                Explore Services
              </Link>
              <Link to="/white-paper" className="home-hero-secondary-btn">
                Read White Paper
              </Link>
            </div>
          </div>
          <aside className="about-clean-snapshot">
            <HubOutlinedIcon />
            <strong>One Hub</strong>
            <span>Pi identity + Pi wallet + many useful services.</span>
          </aside>
        </section>

        <section className="home-section about-clean-section">
          <div className="home-section-head">
            <span className="home-kicker">WHAT IT IS</span>
            <h2>One place for the services people already need.</h2>
            <p>
              SMAJ PI HUB is not only a crypto page. It is a service platform built around practical Pi utility:
              shopping, work, health, learning, housing, transport, media, and more.
            </p>
          </div>
        </section>

        <section className="home-section about-clean-section">
          <div className="home-section-head">
            <span className="home-kicker">OUR SIMPLE PLAN</span>
            <h2>Mission, vision, promise. Three steps, no long lecture.</h2>
          </div>
          <div className="about-step-grid">
            {steps.map((step) => (
              <article key={step.title} className="about-step-card">
                <span>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section about-clean-section about-why-section">
          <div className="home-section-head">
            <span className="home-kicker">WHY WE ARE BUILDING</span>
            <h2>Because digital life should not feel like carrying 27 keys.</h2>
          </div>
          <div className="about-reason-list">
            {reasons.map((reason) => (
              <article key={reason}>
                <CheckCircleOutlineOutlinedIcon />
                <p>{reason}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section about-clean-section">
          <div className="home-section-head">
            <span className="home-kicker">WHAT WE PROVIDE</span>
            <h2>A growing set of connected services.</h2>
          </div>
          <div className="about-service-strip">
            {services.map((service) => (
              <span key={service}>
                {service === "Marketplace" ? <StorefrontOutlinedIcon /> : <AppsOutlinedIcon />}
                {service}
              </span>
            ))}
          </div>
        </section>

        <section className="home-section about-clean-section">
          <div className="home-section-head">
            <span className="home-kicker">TRUST AND SAFETY</span>
            <h2>Simple access should still feel safe.</h2>
            <p>
              The platform direction is built around verified participation, clearer service flow, and trusted
              marketplace behavior.
            </p>
          </div>
          <div className="about-trust-grid">
            {trustItems.map(([title, Icon]) => (
              <article key={title}>
                <Icon />
                <strong>{title}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section about-clean-section about-final-cta">
          <span className="home-kicker">SMAJ PI HUB</span>
          <h2>One Pi Identity. One Wallet. Multiple Services. Real Utility.</h2>
          <Link to="/services" className="home-hero-primary-btn">
            Explore Services
          </Link>
        </section>
      </main>
    </AppLayout>
  );
};

export default AboutPage;
