import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ServiceArt from "../components/ServiceArt";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { serviceCatalog } from "../content/serviceCatalog";

type GenericPageProps = {
  title: string;
  description: string;
  routeSegment?: string;
  status?: "Live" | "Coming Soon" | "In Progress";
};

const normalizeRoute = (routeSegment?: string) => routeSegment === "food-delivery" ? "food" : routeSegment;

const GenericPage = ({ title, description, routeSegment, status = "Coming Soon" }: GenericPageProps) => {
  const service = serviceCatalog.find((item) => item.slug === normalizeRoute(routeSegment));
  const isLive = status === "Live" || service?.live || service?.slug === "store";
  const inProgress = status === "In Progress" || service?.inProgress;
  const serviceItems = service?.items ?? ["Verified access", "Pi wallet flow", "Provider onboarding", "Support"];

  return (
    <AppLayout>
      <main className="home-page service-detail-public-page">
        <section className="home-hero service-detail-hero">
          <div>
            <span className="home-kicker">SMAJ PI HUB SERVICE</span>
            <h1>{title}</h1>
            <p>{description}</p>
            <div className="home-hero-cta">
              <Link to="/contact" className="home-hero-primary-btn">
                Join / Partner
              </Link>
              <Link to="/services" className="home-hero-secondary-btn">
                Back to Services
              </Link>
            </div>
          </div>
          <aside className="service-detail-status-card">
            {service ? <ServiceArt index={service.atlasIndex} /> : <CheckCircleOutlineOutlinedIcon />}
            <span className={isLive ? "live-rating-badge" : inProgress ? "status-chip in-progress" : "status-chip"}>{isLive ? "LIVE" : inProgress ? "IN PROGRESS" : "COMING SOON"}</span>
            <strong>{service?.experience ?? "Service preview"}</strong>
            <p>{service?.description ?? "A connected SMAJ PI HUB service built around identity, wallet, and trust."}</p>
          </aside>
        </section>

        <section className="home-section service-detail-section">
          <div className="home-section-head">
            <span className="home-kicker">WHAT USERS CAN EXPECT</span>
            <h2>A clear service path before launch.</h2>
            <p>
              Every SMAJ PI HUB service follows the same company standard: clear status, verified participation,
              practical Pi utility, and a simple path for users and providers.
            </p>
          </div>
          <div className="service-detail-feature-grid">
            {serviceItems.slice(0, 4).map((item) => (
              <article key={item}>
                <CheckCircleOutlineOutlinedIcon />
                <h3>{item}</h3>
                <p>Designed for real user activity inside the SMAJ PI HUB ecosystem.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section service-detail-section service-detail-trust">
          <article>
            <VerifiedUserOutlinedIcon />
            <h3>Verified Access</h3>
            <p>Pi identity and account signals support safer participation.</p>
          </article>
          <article>
            <AccountBalanceWalletOutlinedIcon />
            <h3>Pi Wallet Flow</h3>
            <p>Service experiences are planned around Pi wallet access and Pi utility.</p>
          </article>
          <article>
            <SecurityOutlinedIcon />
            <h3>Trust Layer</h3>
            <p>Provider checks, reviews, support, and dispute logic shape the company standard.</p>
          </article>
        </section>

        <section className="home-section service-detail-section service-detail-cta">
          <div>
            <span className="home-kicker">NEXT STEP</span>
            <h2>Want to provide or partner on this service?</h2>
            <p>Contact the SMAJ PI HUB team for onboarding, provider interest, or ecosystem collaboration.</p>
          </div>
          <Link to="/contact">
            Contact Team
            <ArrowForwardOutlinedIcon />
          </Link>
        </section>
      </main>
    </AppLayout>
  );
};

export default GenericPage;
