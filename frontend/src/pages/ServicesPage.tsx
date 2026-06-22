import AppLayout from "../layouts/AppLayout";
import Card from "../components/Card";
import Section from "../components/Section";
import ActionButton from "../components/ActionButton";
import { platformDefinitions } from "../content/platforms";

const ServicesPage = () => {
  return (
    <AppLayout>
      <main className="home-page">
        <Section variant="hero" className="home-hero">
          <div className="content-hero-grid">
            <div>
              <span className="home-kicker">ALL-IN-ONE PI SERVICE HUB</span>
              <h1>Access Every SMAJ Platform From One Place</h1>
              <p>Connect your wallet once and unlock all 15 SMAJ ecosystem platforms from one trusted gateway.</p>
              <div className="home-hero-cta">
                <ActionButton to="/dashboard">
                  Open Unified Dashboard
                </ActionButton>
                <ActionButton to="/how-it-works" variant="secondary">
                  How It Works
                </ActionButton>
              </div>
            </div>
            <aside className="content-panel">
              <h3>Cross-Platform Access</h3>
              <p>One wallet, one identity, one user journey across connected SMAJ services.</p>
            </aside>
          </div>
        </Section>

        <Section className="home-section" title="Platform Directory" description="Choose where to go next.">
          <div className="home-service-grid">
            {platformDefinitions.map((platform) => (
              <Card key={platform.routeSegment} title={platform.name}>
                <p>{platform.description}</p>
                <span className={`status-chip ${platform.status === "Live" ? "live-status-chip" : ""}`}>{platform.status}</span>
                <p style={{ marginTop: "0.75rem" }}>
                  <ActionButton to={`/services/${platform.routeSegment}`} variant="secondary">
                    View Page
                  </ActionButton>
                </p>
              </Card>
            ))}
          </div>
        </Section>
      </main>
    </AppLayout>
  );
};

export default ServicesPage;
