import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import ServiceArt from "../components/ServiceArt";
import { serviceCatalog, type ServiceDefinition } from "../content/serviceCatalog";
import { useAuthContext } from "../contexts/AuthContext";
import LoginWithPiButton from "../components/LoginWithPiButton";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import WalletOutlinedIcon from "@mui/icons-material/WalletOutlined";

const publicServicePath = (service: ServiceDefinition) =>
  `/services/${service.slug === "food" ? "food-delivery" : service.slug}`;
const publicServiceGroups = Array.from({ length: 5 }, (_, index) => serviceCatalog.slice(index * 3, index * 3 + 3));

const valuePillars = [
  {
    title: "One Pi Identity",
    text: "Users enter through a verified Pi-first identity layer instead of repeating account setup across services.",
    Icon: AccountCircleOutlinedIcon,
  },
  {
    title: "One Pi Wallet",
    text: "Marketplace and service flows are designed around Pi wallet access, Pi pricing, and Pi utility.",
    Icon: WalletOutlinedIcon,
  },
  {
    title: "Multiple Services",
    text: "Commerce, jobs, health, education, transport, housing, media, and more connect through one hub.",
    Icon: HubOutlinedIcon,
  },
];

const howItWorks = [
  ["Connect", "Login with Pi and enter the SMAJ PI HUB experience.", AccountCircleOutlinedIcon],
  ["Verify", "Use identity and seller/provider checks to build trust.", VerifiedUserOutlinedIcon],
  ["Choose", "Open marketplace, jobs, health, education, housing, media, or other services.", TravelExploreOutlinedIcon],
  ["Use Pi", "Buy, sell, access services, and follow trusted platform flows.", PaymentsOutlinedIcon],
] as const;

const trustFeatures = [
  ["Verified Access", "Pi-first identity and account signals reduce fake participation.", ShieldOutlinedIcon],
  ["Marketplace Safety", "Escrow logic, reviews, ratings, and dispute support shape the MVP marketplace.", LockOutlinedIcon],
  ["AI Guidance", "A platform assistant helps users find services and understand next steps.", SmartToyOutlinedIcon],
  ["Clear Status", "Live and planned services are labeled so users know what is ready now.", CheckCircleOutlineOutlinedIcon],
] as const;

const mvpFeatures = [
  ["Product Listings", ShoppingCartOutlinedIcon],
  ["Buyer/Seller Chat", ChatOutlinedIcon],
  ["Pi Payment Flow", PaymentsOutlinedIcon],
  ["Escrow Logic", LockOutlinedIcon],
  ["Reviews & Ratings", CheckCircleOutlineOutlinedIcon],
  ["Dispute Support", ShieldOutlinedIcon],
] as const;

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const [servicesPage, setServicesPage] = useState(0);
  const [isMobileServices, setIsMobileServices] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const updateServicesMode = () => setIsMobileServices(media.matches);

    updateServicesMode();
    media.addEventListener("change", updateServicesMode);
    return () => media.removeEventListener("change", updateServicesMode);
  }, []);

  const serviceCarouselPages = useMemo(() => {
    if (isMobileServices) return publicServiceGroups.map((group) => [group]);
    return Array.from({ length: Math.ceil(publicServiceGroups.length / 2) }, (_, index) =>
      publicServiceGroups.slice(index * 2, index * 2 + 2),
    );
  }, [isMobileServices]);

  useEffect(() => {
    setServicesPage((currentPage) => Math.min(currentPage, Math.max(serviceCarouselPages.length - 1, 0)));
  }, [serviceCarouselPages.length]);

  const isFirstServicesPage = servicesPage === 0;
  const isLastServicesPage = servicesPage >= serviceCarouselPages.length - 1;
  const goToPreviousServicesPage = () => setServicesPage((currentPage) => Math.max(currentPage - 1, 0));
  const goToNextServicesPage = () =>
    setServicesPage((currentPage) => Math.min(currentPage + 1, serviceCarouselPages.length - 1));
  const getServiceStatus = (service: ServiceDefinition) => service.live || service.slug === "store";

  if (isLoading || isAuthenticated) return null;

  return (
    <AppLayout>
      <main className="home-page public-home-page">
        <section className="home-hero public-home-hero">
          <div className="home-hero-grid public-home-hero-grid">
            <div>
              <span className="home-kicker">ONE PI IDENTITY. ONE WALLET. MULTIPLE SERVICES.</span>
              <h1>The Pi-Powered Super App for Real-World Utility</h1>
              <p>
                SMAJ PI HUB connects verified users to marketplace, services, opportunities, and daily digital tools
                through one Pi identity and one Pi wallet.
              </p>
              <div className="home-hero-cta">
                <LoginWithPiButton className="home-hero-primary-btn">
                  {isLoading ? "Signing in..." : "Login with Pi"}
                </LoginWithPiButton>
                <Link to="/services" className="home-hero-secondary-btn">
                  Explore Services
                </Link>
              </div>
            </div>

            <aside className="public-home-phone-visual" aria-label="SMAJ PI HUB mobile app preview">
              <div className="public-home-phone-glow" />
              <img src="/assets/smaj-hero-hand-phone.png" alt="Hand holding a premium phone showing a mobile app" />
              <div className="public-home-infinity-orbit" aria-hidden="true">
                {serviceCatalog.map((service, index) => (
                  <span key={service.slug} className={`public-home-floating-service public-home-floating-service-${index + 1}`}>
                    <ServiceArt index={service.atlasIndex} />
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="home-section public-home-section">
          <div className="home-section-head public-home-section-head">
            <span className="home-kicker">CLEAR PRODUCT PROMISE</span>
            <h2>One Access Point for Real Pi Utility</h2>
            <p>
              The public page explains the platform. The private dashboard becomes the workspace where users actually
              explore, manage, and use SMAJ services.
            </p>
          </div>
          <div className="home-highlight-grid public-home-pillar-grid">
            {valuePillars.map(({ title, text, Icon }) => (
              <article key={title} className="home-highlight-card public-home-icon-card">
                <span className="public-home-card-icon">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section public-home-section public-home-services-section">
          <div className="home-section-head public-home-section-head">
            <span className="home-kicker">SMAJ PI HUB SERVICES</span>
            <h2>15 Connected Services, One Familiar Direction</h2>
            <p>
              Users should instantly understand what each platform does, which service is live, and how everything fits
              into the Pi-powered hub.
            </p>
          </div>
          <div className="public-home-service-carousel">
            <div className="public-home-service-carousel-top">
              <span>
                {servicesPage + 1} / {serviceCarouselPages.length}
              </span>
              <div>
                <button
                  type="button"
                  className="public-home-service-arrow"
                  onClick={goToPreviousServicesPage}
                  disabled={isFirstServicesPage}
                  aria-label="Show previous services"
                >
                  <ArrowBackIosNewOutlinedIcon />
                </button>
                <button
                  type="button"
                  className="public-home-service-arrow"
                  onClick={goToNextServicesPage}
                  disabled={isLastServicesPage}
                  aria-label="Show next services"
                >
                  <ArrowForwardIosOutlinedIcon />
                </button>
              </div>
            </div>
            <div className="public-home-service-viewport">
              <div className="public-home-service-track" style={{ transform: `translateX(-${servicesPage * 100}%)` }}>
                {serviceCarouselPages.map((page, pageIndex) => (
                  <div className="public-home-service-grid" key={pageIndex}>
                    {page.map((group, groupIndex) => (
                      <div className="public-home-service-group" key={`${pageIndex}-${groupIndex}`}>
                        {group.map((service) => (
                          <Link to={publicServicePath(service)} key={service.slug} className="public-home-service-card">
                            <ServiceArt index={service.atlasIndex} />
                            <div>
                              <h3>{service.name}</h3>
                              <p>{service.items.slice(0, 2).join(" • ")}</p>
                            </div>
                            <small className={getServiceStatus(service) ? "live-rating-badge" : undefined}>
                              {getServiceStatus(service) ? "LIVE" : "SOON"}
                            </small>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-section public-home-section public-home-mvp-section">
          <div className="public-home-mvp-copy">
            <span className="home-kicker">MVP STARTS HERE</span>
            <h2>SMAJ Store Is the First Marketplace Layer</h2>
            <p>
              The launch focus is a trusted marketplace where users can discover products, sellers can list items, and
              Pi-powered payments can become practical inside a real service flow.
            </p>
            <Link to="/services/store" className="home-hero-secondary-btn">
              View Store Service
            </Link>
          </div>
          <div className="public-home-mvp-grid">
            {mvpFeatures.map(([title, Icon]) => (
              <article key={title} className="public-home-mini-card">
                <Icon />
                <strong>{title}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section public-home-section">
          <div className="home-section-head public-home-section-head">
            <span className="home-kicker">HOW IT WORKS</span>
            <h2>A Simple Flow Users Can Follow</h2>
          </div>
          <div className="public-home-steps">
            {howItWorks.map(([title, text, Icon], index) => (
              <article key={title}>
                <span>{index + 1}</span>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section public-home-section">
          <div className="home-section-head public-home-section-head">
            <span className="home-kicker">TRUST LAYER</span>
            <h2>Built Around Verified Participation</h2>
            <p>
              The platform message stays practical: trust, clear service access, marketplace safety, and real-world Pi
              utility.
            </p>
          </div>
          <div className="home-trust-grid">
            {trustFeatures.map(([title, text, Icon]) => (
              <article key={title} className="home-trust-card public-home-icon-card">
                <span className="public-home-card-icon">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section public-home-section public-home-final-cta">
          <span className="home-kicker">SMAJ PI HUB</span>
          <h2>One Pi Identity. One Wallet. Multiple Services. Real Utility.</h2>
          <div className="home-hero-cta">
            <LoginWithPiButton className="home-hero-primary-btn">Login with Pi</LoginWithPiButton>
            <Link to="/white-paper" className="home-hero-secondary-btn">
              Read White Paper
            </Link>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default HomePage;
