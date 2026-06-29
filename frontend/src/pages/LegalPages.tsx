import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import AppLayout from "../layouts/AppLayout";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

const legalEmail = "info@smajpihub.com";

const LegalShell = ({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <AppLayout>
    <main className="home-page legal-company-page">
      <section className="home-hero legal-company-hero">
        <div>
          <span className="home-kicker">{kicker}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <aside className="legal-hero-card">
          <GavelOutlinedIcon />
          <strong>SMAJ PI HUB</strong>
          <span>Digital marketplace and service platform.</span>
        </aside>
      </section>
      {children}
    </main>
  </AppLayout>
);

const LegalPanel = ({ title, items }: { title: string; items: string[] }) => (
  <article className="legal-policy-panel">
    <h2>{title}</h2>
    <ul>
      {items.map((item) => (
        <li key={item}>
          <ShieldOutlinedIcon />
          {item}
        </li>
      ))}
    </ul>
  </article>
);

export const PrivacyPage = () => (
  <LegalShell
    kicker="PRIVACY POLICY"
    title="How SMAJ PI HUB handles user and marketplace data."
    description="This page explains the public privacy position for account access, Pi Browser login flows, marketplace activity, and support."
  >
    <section className="home-section legal-company-section">
      <LegalPanel
        title="Information We May Use"
        items={[
          "Pi identity information required for login, account access, and platform participation where supported.",
          "Marketplace activity such as listings, seller profiles, buyer/seller communication, reviews, and support records.",
          "Technical information used for security, fraud prevention, performance, analytics, and service reliability.",
          "Contact information submitted through forms, provider onboarding, reports, or partnership requests.",
        ]}
      />
      <LegalPanel
        title="How We Protect Users"
        items={[
          "SMAJ PI HUB uses access controls, verification signals, and safety workflows to reduce abuse.",
          "Sensitive service flows are designed around user awareness, transaction confirmation, and support review.",
          "We do not sell personal data as a business model.",
          "Questions about privacy can be sent to info@smajpihub.com.",
        ]}
      />
    </section>
  </LegalShell>
);

export const TermsPage = () => (
  <LegalShell
    kicker="TERMS & CONDITIONS"
    title="Rules for using SMAJ PI HUB services."
    description="These terms summarize the platform expectations for users, sellers, providers, partners, and visitors."
  >
    <section className="home-section legal-company-section">
      <LegalPanel
        title="Platform Use"
        items={[
          "Users must provide accurate information and must not impersonate others, abuse listings, or attempt fraud.",
          "Sellers and providers are responsible for truthful listings, service delivery, legal compliance, and customer support.",
          "SMAJ PI HUB may restrict access when users abuse the platform, bypass safety systems, or harm other participants.",
          "Service availability, roadmap timing, payment flows, and token utility may change as the platform develops.",
        ]}
      />
      <LegalPanel
        title="Important Disclaimer"
        items={[
          "SMAJ PI HUB is a digital marketplace and service platform, not a bank or financial institution.",
          "The platform does not provide investment advice, guarantee profits, guarantee token value, or provide custody services.",
          "Users are responsible for complying with laws and regulations in their own jurisdictions.",
          "Pi wallet actions should be reviewed carefully by each user before confirmation.",
        ]}
      />
    </section>
  </LegalShell>
);

export const CookiesPage = () => (
  <LegalShell
    kicker="COOKIE POLICY"
    title="How cookies and local storage support the website."
    description="SMAJ PI HUB uses browser storage carefully to support sessions, theme preference, performance, and user experience."
  >
    <section className="home-section legal-company-section">
      <LegalPanel
        title="Storage We May Use"
        items={[
          "Theme preference such as light or dark mode.",
          "Session and account continuity where login and authentication flows require it.",
          "Recent search or navigation preferences that improve user experience.",
          "Analytics or performance signals used to improve service reliability and launch readiness.",
        ]}
      />
      <LegalPanel
        title="User Control"
        items={[
          "Users can manage cookies and browser storage through their browser settings.",
          "Disabling some storage may affect login, theme preference, account sessions, and service behavior.",
          "SMAJ PI HUB does not use cookies to make investment promises or financial guarantees.",
        ]}
      />
    </section>
  </LegalShell>
);

export const ReportAbusePage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <LegalShell
      kicker="REPORT ABUSE"
      title="Report suspicious activity, unsafe listings, or platform abuse."
      description="Use this page to report scams, impersonation, harmful content, fake sellers, unsafe service behavior, or policy violations."
    >
      <section className="home-section legal-company-section legal-report-grid">
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="contact-form-head">
            <span className="home-kicker">ABUSE REPORT</span>
            <h2>Submit a Report</h2>
            <p>Include enough detail for the SMAJ PI HUB team to review the issue.</p>
          </div>
          <label htmlFor="report-name">
            <span>Name</span>
            <input id="report-name" type="text" placeholder="Your full name" required />
          </label>
          <label htmlFor="report-email">
            <span>Email</span>
            <input id="report-email" type="email" placeholder="you@example.com" required />
          </label>
          <label htmlFor="report-type">
            <span>Report Type</span>
            <select id="report-type" required defaultValue="">
              <option value="" disabled>Select report type</option>
              <option>Fake seller or provider</option>
              <option>Scam or suspicious payment request</option>
              <option>Impersonation</option>
              <option>Unsafe listing or content</option>
              <option>Other platform abuse</option>
            </select>
          </label>
          <label htmlFor="report-details">
            <span>Report Details</span>
            <textarea id="report-details" rows={6} placeholder="Describe what happened..." required />
          </label>
          <button type="submit">Submit Report</button>
          {submitted ? <p className="contact-form-success">Thank you. Your report has been recorded for review.</p> : null}
        </form>
        <aside className="legal-report-card">
          <ReportProblemOutlinedIcon />
          <h2>What to Include</h2>
          <p>Share links, usernames, listing titles, screenshots description, payment context, and any timeline details.</p>
          <p>For urgent company contact, email <a href={`mailto:${legalEmail}`}>{legalEmail}</a>.</p>
        </aside>
      </section>
    </LegalShell>
  );
};
