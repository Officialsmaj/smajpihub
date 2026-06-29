import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

const affiliateBenefits = [
  ["Community Growth", "Help introduce verified users, sellers, and service providers to the hub.", GroupsOutlinedIcon],
  ["Tracked Referrals", "Affiliate activity will be designed around clear referral signals and responsible promotion.", InsightsOutlinedIcon],
  ["Brand Assets", "Use approved SMAJ PI HUB messaging, links, and public education material.", CampaignOutlinedIcon],
  ["Trust First", "Affiliates must promote accurate information and avoid investment-style promises.", VerifiedUserOutlinedIcon],
] as const;

const affiliateSteps = [
  "Apply with your community, region, channel, or business profile.",
  "Review SMAJ PI HUB brand and compliance guidelines.",
  "Share approved links, education, and service updates.",
  "Help onboard users, sellers, and providers responsibly.",
];

const AffiliatePage = () => (
  <AppLayout>
    <main className="home-page program-page">
      <section className="home-hero program-hero">
        <div>
          <span className="home-kicker">AFFILIATE PROGRAM</span>
          <h1>Grow real Pi utility with responsible promotion.</h1>
          <p>
            The SMAJ PI HUB Affiliate Program is for community builders, creators, educators, and local operators who
            can help users understand the platform and onboard responsibly.
          </p>
          <div className="home-hero-cta">
            <Link to="/contact" className="home-hero-primary-btn">Apply / Contact</Link>
            <Link to="/trust" className="home-hero-secondary-btn">Read Trust Rules</Link>
          </div>
        </div>
        <aside className="program-hero-card">
          <CampaignOutlinedIcon />
          <strong>Promote utility, not hype</strong>
          <span>Education, onboarding, and trusted service awareness.</span>
        </aside>
      </section>

      <section className="home-section program-section">
        <div className="home-section-head">
          <span className="home-kicker">PROGRAM BENEFITS</span>
          <h2>Built for serious community growth.</h2>
        </div>
        <div className="program-card-grid">
          {affiliateBenefits.map(([title, text, Icon]) => (
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
          <span className="home-kicker">HOW IT WORKS</span>
          <h2>Affiliate onboarding starts with trust.</h2>
          <p>Program details, referral rules, and reward mechanics will be released through official SMAJ PI HUB channels.</p>
        </div>
        <ol>
          {affiliateSteps.map((step) => (
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

export default AffiliatePage;
