import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

const steps = [
  {
    label: "Step 01",
    title: "Mission",
    text: "Transform Pi from only a digital currency into a practical utility layer for buying, selling, working, learning, accessing services, and participating in digital commerce.",
  },
  {
    label: "Step 02",
    title: "Vision",
    text: "Build a leading Pi-powered digital super platform where one verified identity and one Pi wallet connect people to trusted real-world services.",
  },
  {
    label: "Step 03",
    title: "Promise",
    text: "Keep the platform useful, transparent, and service-focused while growing carefully through verification, safety systems, and real marketplace demand.",
  },
];

const reasons = [
  "Digital users are tired of separate accounts, wallets, apps, and repeated verification.",
  "Pi needs real services where people can use it for practical daily activity.",
  "Buyers, sellers, freelancers, providers, and communities need stronger trust signals.",
  "A unified hub can reduce friction while giving each service room to grow.",
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

const companyFacts = [
  ["Company Focus", "Pi-powered super platform for marketplace, services, and digital utility."],
  ["Launch Layer", "SMAJ Store marketplace with Pi login, listings, chat, payments, reviews, and safety flows."],
  ["User Access", "One Pi identity and one Pi wallet across connected services."],
  ["Operating Model", "Digital marketplace and service platform. Not a bank or financial institution."],
] as const;

const platformLayers = [
  ["Identity Layer", "Pi login and account signals help reduce fake participation.", VerifiedUserOutlinedIcon],
  ["Wallet Layer", "Pi wallet access supports native Pi payments and transparent service pricing.", AccountBalanceWalletOutlinedIcon],
  ["Marketplace Layer", "SMAJ Store starts the ecosystem with product discovery, seller profiles, chat, reviews, and dispute support.", StorefrontOutlinedIcon],
  ["Service Layer", "Fifteen connected service categories expand the hub from commerce into daily life.", AppsOutlinedIcon],
  ["AI Guidance", "SMAJ AI Assistant helps users find services, understand flows, and move faster inside the platform.", AutoAwesomeOutlinedIcon],
  ["Trust Layer", "Verification, provider checks, dispute support, fraud prevention, and clear service status shape safer participation.", SecurityOutlinedIcon],
] as const;

const audiences = [
  ["Pioneers", "Use one Pi-powered account to discover services, products, opportunities, and support tools."],
  ["Sellers", "List products, build trust, communicate with buyers, and prepare for Pi-powered commerce flows."],
  ["Service Providers", "Bring jobs, health, education, transport, housing, events, and other services into one verified hub."],
  ["Partners", "Collaborate on infrastructure, merchant onboarding, community growth, compliance, and service expansion."],
] as const;

const operatingPrinciples = [
  ["Real Utility First", "Every major feature should help people do something useful, not just decorate the product."],
  ["Trust Before Scale", "Growth must include verification, marketplace safety, provider accountability, and user protection."],
  ["Clear Service Status", "Live, coming soon, and experimental features should be labeled honestly."],
  ["Local to Global", "The hub starts with practical marketplace needs, then expands into broader global Pi utility."],
] as const;

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
            <h1>A real company building practical Pi utility.</h1>
            <p>
              SMAJ PI HUB is a Pi-powered digital service company building a unified hub for marketplace, services,
              opportunities, and daily digital tools through one Pi identity and one Pi wallet.
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
            <strong>One Company. One Hub.</strong>
            <span>Marketplace, services, identity, wallet access, and trust systems built around real Pi utility.</span>
          </aside>
        </section>

        <section className="home-section about-clean-section">
          <div className="home-section-head">
            <span className="home-kicker">WHO WE ARE</span>
            <h2>A digital infrastructure company for the Pi economy.</h2>
            <p>
              SMAJ PI HUB is not only a crypto page, finance app, or product directory. It is a service platform that
              brings identity, wallet access, marketplace activity, trusted providers, and service discovery into one
              connected ecosystem.
            </p>
          </div>
          <div className="about-fact-grid">
            {companyFacts.map(([title, text]) => (
              <article key={title}>
                <strong>{title}</strong>
                <p>{text}</p>
              </article>
            ))}
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

        <section className="home-section about-clean-section">
          <div className="home-section-head">
            <span className="home-kicker">HOW THE COMPANY WORKS</span>
            <h2>Six layers that make the hub more than a landing page.</h2>
            <p>
              The company is building a modular ecosystem. Each service can grow independently, but users still move
              through one familiar SMAJ PI HUB experience.
            </p>
          </div>
          <div className="about-layer-grid">
            {platformLayers.map(([title, text, Icon]) => (
              <article key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section about-clean-section about-why-section">
          <div className="home-section-head">
            <span className="home-kicker">WHY WE ARE BUILDING</span>
            <h2>Because real utility needs trust, access, and useful services.</h2>
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
            <span className="home-kicker">WHO WE SERVE</span>
            <h2>Built for users, sellers, providers, and partners.</h2>
          </div>
          <div className="about-audience-grid">
            {audiences.map(([title, text]) => (
              <article key={title}>
                <Diversity3OutlinedIcon />
                <h3>{title}</h3>
                <p>{text}</p>
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
            <span className="home-kicker">OPERATING PRINCIPLES</span>
            <h2>The standards guiding the company.</h2>
          </div>
          <div className="about-principle-list">
            {operatingPrinciples.map(([title, text]) => (
              <article key={title}>
                <CheckCircleOutlineOutlinedIcon />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
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

        <section className="home-section about-clean-section about-company-status">
          <div>
            <span className="home-kicker">COMPANY STATUS</span>
            <h2>Focused rollout, honest status.</h2>
            <p>
              SMAJ PI HUB is under active development. The first major company focus is SMAJ Store, followed by staged
              service expansion, stronger verification systems, AI guidance, and broader partner onboarding.
            </p>
          </div>
          <div className="about-status-grid">
            <article>
              <StorefrontOutlinedIcon />
              <strong>MVP Marketplace</strong>
              <span>Store, listings, chat, payments, reviews, support.</span>
            </article>
            <article>
              <PaymentsOutlinedIcon />
              <strong>Pi Utility</strong>
              <span>Pi login, Pi wallet access, Pi-denominated service flows.</span>
            </article>
            <article>
              <GavelOutlinedIcon />
              <strong>Clear Disclaimer</strong>
              <span>Digital marketplace platform, not banking or investment advice.</span>
            </article>
            <article>
              <PublicOutlinedIcon />
              <strong>Global Direction</strong>
              <span>Designed to grow with local services, providers, and Pi communities.</span>
            </article>
          </div>
        </section>

        <section className="home-section about-clean-section about-final-cta">
          <span className="home-kicker">SMAJ PI HUB</span>
          <h2>One Pi Identity. One Wallet. Multiple Services. Real Utility.</h2>
          <div className="home-hero-cta">
            <Link to="/services" className="home-hero-primary-btn">
              Explore Services
            </Link>
            <Link to="/contact" className="home-hero-secondary-btn">
              Contact SMAJ
            </Link>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default AboutPage;
