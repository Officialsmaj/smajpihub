import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";

const collaborationTracks = [
  ["Service Collaboration", "Bring a real service category into the SMAJ PI HUB ecosystem.", HubOutlinedIcon],
  ["Merchant Onboarding", "Help onboard sellers, providers, local operators, and verified businesses.", HandshakeOutlinedIcon],
  ["Regional Growth", "Support local Pi utility education and community service adoption.", PublicOutlinedIcon],
  ["Operations Support", "Collaborate on support, trust, moderation, logistics, or launch readiness.", SupportAgentOutlinedIcon],
] as const;

const reviewPoints = [
  "What service, community, or business do you represent?",
  "Which SMAJ PI HUB service category do you support?",
  "What users, providers, or locations can you help serve?",
  "What verification, operational, or compliance needs should be reviewed?",
];

const CollaboratePage = () => (
  <AppLayout>
    <main className="home-page program-page">
      <section className="home-hero program-hero">
        <div>
          <span className="home-kicker">COLLABORATE WITH US</span>
          <h1>Build useful services with the SMAJ PI HUB team.</h1>
          <p>
            Collaboration is open to serious builders, providers, communities, businesses, and operators who can help
            turn Pi utility into real user experiences.
          </p>
          <div className="home-hero-cta">
            <Link to="/contact" className="home-hero-primary-btn">Start Collaboration</Link>
            <Link to="/partners" className="home-hero-secondary-btn">Partner Page</Link>
          </div>
        </div>
        <aside className="program-hero-card">
          <AccountTreeOutlinedIcon />
          <strong>Structured collaboration</strong>
          <span>Services, partners, communities, trust, and launch operations.</span>
        </aside>
      </section>

      <section className="home-section program-section">
        <div className="home-section-head">
          <span className="home-kicker">COLLABORATION TRACKS</span>
          <h2>Where teams can work with SMAJ PI HUB.</h2>
        </div>
        <div className="program-card-grid">
          {collaborationTracks.map(([title, text, Icon]) => (
            <article key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section program-section program-process-panel">
        <div>
          <span className="home-kicker">REVIEW QUESTIONS</span>
          <h2>Tell us what you can help build.</h2>
          <p>Clear proposals help the team understand fit, readiness, and next steps.</p>
        </div>
        <ol>
          {reviewPoints.map((point) => (
            <li key={point}>
              <CheckCircleOutlineOutlinedIcon />
              {point}
            </li>
          ))}
        </ol>
      </section>
    </main>
  </AppLayout>
);

export default CollaboratePage;
