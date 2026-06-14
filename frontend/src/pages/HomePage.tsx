import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "../layouts/AppLayout";
import ActionButton from "../components/ActionButton";
import heroImage from "/smaj-hero.png";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import { useAuthContext } from "../contexts/AuthContext";
import LoginWithPiButton from "../components/LoginWithPiButton";

const previewServices = [
  {
    name: "STORE",
    description: "Shop ecosystem products and services with Pi.",
    to: "/services/store",
    icon: <StorefrontOutlinedIcon fontSize="small" />,
  },
  {
    name: "JOBS",
    description: "Find opportunities and verified freelance work.",
    to: "/services/jobs",
    icon: <WorkOutlineOutlinedIcon fontSize="small" />,
  },
  {
    name: "HEALTH",
    description: "Discover care options and booking tools.",
    to: "/services/health",
    icon: <LocalHospitalOutlinedIcon fontSize="small" />,
  },
  {
    name: "EDU",
    description: "Access courses, mentorship, and upskilling.",
    to: "/services/education",
    icon: <SchoolOutlinedIcon fontSize="small" />,
  },
  {
    name: "SPORTS",
    description: "Engage with fan utilities and sports services.",
    to: "/services/sports",
    icon: <SportsSoccerOutlinedIcon fontSize="small" />,
  },
  {
    name: "STREAM",
    description: "Watch and support creator-first streaming.",
    to: "/services/stream",
    icon: <LiveTvOutlinedIcon fontSize="small" />,
  },
];

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();
  useEffect(() => { if (!isLoading && isAuthenticated) navigate("/dashboard", { replace: true }); }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || isAuthenticated) return null;

  return (
    <AppLayout>
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero-grid">
            <div>
              <span className="home-kicker">15+ PLATFORMS CONNECTED</span>
              <h1>The Unified Pi-Powered Digital Ecosystem</h1>
              <p>
                Access shopping, jobs, healthcare, education, transport, entertainment and more — all with one Pi
                login.
              </p>
              <div className="home-hero-cta">
                <LoginWithPiButton className="home-hero-primary-btn">
                  {isLoading ? "Signing in..." : "Login with Pi"}
                </LoginWithPiButton>
                <Link to="/services" className="home-hero-secondary-btn">
                  Explore Services
                </Link>
              </div>
              <div className="home-proof">
                <div className="home-proof-award">
                  <div className="home-laurel-badge">
                    <SpaOutlinedIcon className="home-laurel-icon" />
                    <div className="home-laurel-content">
                      <strong>No.1</strong>
                      <span>Unified Access</span>
                    </div>
                    <SpaOutlinedIcon className="home-laurel-icon home-laurel-icon-mirrored" />
                  </div>
                  <span>15+ Services</span>
                </div>
                <div className="home-proof-award">
                  <div className="home-laurel-badge">
                    <SpaOutlinedIcon className="home-laurel-icon" />
                    <div className="home-laurel-content">
                      <strong>No.1</strong>
                      <span>Pi Utility Ecosystem</span>
                    </div>
                    <SpaOutlinedIcon className="home-laurel-icon home-laurel-icon-mirrored" />
                  </div>
                  <span>Global Vision</span>
                </div>
                <div>
                  <strong>250K+ Users</strong>
                  <span>40K+ Transactions • 12K+ Verified Providers</span>
                </div>
              </div>
            </div>
            <article className="home-hero-card">
              <img src={heroImage} alt="SMAJ PI HUB dashboard preview" />
            </article>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <h2>Services Preview</h2>
            <p>A quick look at key platforms in the SMAJ PI HUB ecosystem.</p>
          </div>
          <div className="home-service-grid">
            {previewServices.map((service) => (
              <article key={service.name} className="home-service-card">
                <p style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem", color: "#d4dbea" }}>
                  {service.icon}
                  <strong>{service.name}</strong>
                </p>
                <p>{service.description}</p>
                <ActionButton to={service.to} variant="secondary">
                  Explore
                </ActionButton>
              </article>
            ))}
          </div>
          <p style={{ marginTop: "1rem" }}>
            <Link to="/services">View All Services &rarr;</Link>
          </p>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <h2>Why Users Trust SMAJ PI HUB</h2>
            <p>Designed for clarity, security, and real Pi utility.</p>
          </div>
          <div className="home-highlight-grid">
            <article className="home-highlight-card">
              <h3>Unified Wallet</h3>
              <p>Connect your Pi wallet once to access ecosystem services.</p>
            </article>
            <article className="home-highlight-card">
              <h3>Verified Escrow System</h3>
              <p>Secure transactions with built-in escrow protection.</p>
            </article>
            <article className="home-highlight-card">
              <h3>Pi-Powered Utility</h3>
              <p>Services and products payable in Pi.</p>
            </article>
            <article className="home-highlight-card">
              <h3>Global Access</h3>
              <p>Access services from anywhere.</p>
            </article>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <h2>Trust & Verification</h2>
            <p>
              A multi-layered verification model is planned to reduce fraud, improve safety, and help users transact
              with confidence across the ecosystem.
            </p>
          </div>
          <div className="home-trust-grid">
            <article className="home-trust-card">
              <h3>KYC + Account Signals</h3>
              <p>Identity and account-level checks to strengthen platform credibility.</p>
            </article>
            <article className="home-trust-card">
              <h3>Escrow-First Payments</h3>
              <p>Transaction protection with milestone-based fund release patterns.</p>
            </article>
            <article className="home-trust-card">
              <h3>Reputation Layer</h3>
              <p>Ratings and history to help users choose reliable sellers and service providers.</p>
            </article>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default HomePage;
