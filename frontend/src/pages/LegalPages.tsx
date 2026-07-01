import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { axiosClient } from "../lib/axiosClient";

const legalEmail = "info@smajpihub.com";

const LegalShell = ({
  kicker,
  title,
  description,
  backTo,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  backTo?: string;
  children: ReactNode;
}) => (
  <AppLayout>
    <main className="home-page legal-company-page">
      {backTo ? (
        <Link className="legal-back-link" to={backTo}>
          <ArrowBackIcon />
          Back
        </Link>
      ) : null}
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

const LegalTextDocument = ({
  title,
  sections,
}: {
  title: string;
  sections: { heading: string; paragraphs?: string[]; items?: string[] }[];
}) => (
  <section className="home-section legal-text-document">
    <div className="legal-text-intro">
      <span className="home-kicker">TEXT DOCUMENT</span>
      <h2>{title}</h2>
      <p>Read the policy directly on this page. This text is written for clear user understanding across mobile and desktop.</p>
    </div>
    {sections.map((section, index) => (
      <article className="legal-text-section" key={section.heading}>
        <h3>{index + 1}. {section.heading}</h3>
        {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.items?.length ? (
          <ul>
            {section.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : null}
      </article>
    ))}
  </section>
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
    <LegalTextDocument
      title="SMAJ PI HUB Privacy Policy"
      sections={[
        {
          heading: "Purpose",
          paragraphs: [
            "SMAJ PI HUB respects user privacy and handles personal data only to operate the platform, protect users, improve services, and support verified marketplace activity.",
            "The platform is designed around Pi identity, Pi wallet access, marketplace participation, service discovery, communication, support, and future real-world utility services.",
          ],
        },
        {
          heading: "Information We Collect",
          items: [
            "Account details such as Pi username, display name, profile photo, country, language, contact details, and seller status.",
            "Marketplace details such as product listings, images, prices, orders, reviews, saved products, seller profiles, and buyer/seller communication.",
            "Support and safety details such as reports, feedback, dispute records, abuse reports, and communication with the SMAJ PI HUB team.",
            "Technical details such as device/browser data, session information, login state, app performance, security events, and user preferences.",
          ],
        },
        {
          heading: "How We Use Information",
          items: [
            "To create and secure user accounts.",
            "To support product listing, seller review, order handling, marketplace trust, and customer support.",
            "To detect abuse, scams, fake sellers, unsafe listings, spam, and policy violations.",
            "To improve navigation, loading, theme preference, language preference, and platform reliability.",
          ],
        },
        {
          heading: "Sharing and Disclosure",
          paragraphs: [
            "SMAJ PI HUB does not sell personal data as a business model. Information may be shared only when needed to operate services, comply with law, prevent harm, investigate abuse, support transactions, or protect the platform.",
          ],
        },
        {
          heading: "User Rights and Contact",
          paragraphs: [
            `Users may request privacy support, correction, or account-related assistance by contacting ${legalEmail}.`,
          ],
        },
      ]}
    />
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
    <LegalTextDocument
      title="SMAJ PI HUB Terms and Conditions"
      sections={[
        {
          heading: "Acceptance of Terms",
          paragraphs: [
            "By accessing SMAJ PI HUB, users agree to use the platform honestly, lawfully, and responsibly. These terms apply to visitors, buyers, sellers, service providers, partners, and account holders.",
          ],
        },
        {
          heading: "Account Responsibility",
          items: [
            "Users must provide accurate information and keep account details secure.",
            "Users must not impersonate another person, company, seller, buyer, Pi Network representative, or SMAJ PI HUB representative.",
            "Users are responsible for actions taken through their account.",
          ],
        },
        {
          heading: "Marketplace Rules",
          items: [
            "Listings must be real, accurate, lawful, and supported by clear product or service information.",
            "Sellers must honor delivery, pickup, refund, communication, and customer support responsibilities.",
            "Buyers must review listing details carefully before placing orders or confirming transactions.",
            "SMAJ PI HUB may review, reject, remove, hide, or restrict listings that create risk or violate policy.",
          ],
        },
        {
          heading: "Payments and Pi Utility",
          paragraphs: [
            "SMAJ PI HUB is a marketplace and service platform. It is not a bank, investment adviser, wallet custodian, or financial institution. Users are responsible for reviewing wallet actions, payment confirmations, and local legal requirements.",
          ],
        },
        {
          heading: "Limitation and Changes",
          paragraphs: [
            "Service availability, roadmap timing, supported features, payment flow, pricing display, seller tools, and service categories may change as the platform develops.",
          ],
        },
      ]}
    />
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
    <LegalTextDocument
      title="SMAJ PI HUB Cookie Policy"
      sections={[
        {
          heading: "Purpose of Cookies and Storage",
          paragraphs: [
            "SMAJ PI HUB may use cookies, local storage, and similar browser storage to keep the website functional, remember preferences, support account sessions, and improve user experience.",
          ],
        },
        {
          heading: "Storage We Use",
          items: [
            "Theme preference such as light or dark mode.",
            "Session state needed for account access and protected pages.",
            "Language, country, search, navigation, or interface preferences.",
            "Performance, security, and reliability signals used to improve the platform.",
          ],
        },
        {
          heading: "User Control",
          paragraphs: [
            "Users can clear or block browser storage from browser settings. Some features may not work correctly if required session or preference storage is disabled.",
          ],
        },
        {
          heading: "No Investment Tracking",
          paragraphs: [
            "SMAJ PI HUB does not use cookies to promise investment returns, guarantee token value, or provide financial advice.",
          ],
        },
      ]}
    />
  </LegalShell>
);

export const SellerAgreementPage = () => (
  <LegalShell
    kicker="SELLER AGREEMENT"
    title="Seller rules for listing products on SMAJ PI HUB."
    description="Read the official seller agreement before listing products, accepting orders, or using seller tools."
    backTo="/add-product"
  >
    <section className="home-section legal-company-section">
      <LegalPanel
        title="Before You List"
        items={[
          "Products must be real, accurately described, and supported by clear product images.",
          "Seller contact, delivery details, location, quantity, price, and condition must be truthful.",
          "SMAJ PI HUB may review, reject, hide, or remove listings that are unsafe, fake, misleading, or incomplete.",
          "Sellers are responsible for customer communication, delivery promises, refunds, and legal compliance.",
        ]}
      />
      <LegalPanel
        title="Marketplace Trust"
        items={[
          "Do not request users to bypass SMAJ PI HUB safety, order, or payment flows.",
          "Do not impersonate another seller, brand, company, buyer, or Pi Network representative.",
          "Fraud, unsafe items, abuse, spam, counterfeit goods, and prohibited content may lead to account restriction.",
          "By accepting the seller agreement, you confirm your listing is review-ready and connected to your verified account.",
        ]}
      />
    </section>
    <LegalTextDocument
      title="SMAJ PI HUB Seller Agreement"
      sections={[
        {
          heading: "Seller Eligibility",
          paragraphs: [
            "Seller tools are connected to a user account and verified platform identity. Sellers must keep profile details, contact information, and location details accurate before listing products.",
          ],
        },
        {
          heading: "Listing Requirements",
          items: [
            "The product or service must be real and available.",
            "Photos must represent the actual item or service clearly.",
            "Title, description, price, quantity, condition, delivery option, location, and seller contact must be accurate.",
            "Listings must not include fake products, scams, prohibited items, misleading claims, spam, or unsafe content.",
          ],
        },
        {
          heading: "Review and Approval",
          paragraphs: [
            "SMAJ PI HUB may review seller listings before they appear publicly in SMAJ Store. The platform may approve, reject, hide, remove, or request changes to listings when needed for trust and safety.",
          ],
        },
        {
          heading: "Seller Responsibilities",
          items: [
            "Respond to buyers respectfully and within a reasonable time.",
            "Deliver products or services as described.",
            "Handle refunds, disputes, and customer issues honestly.",
            "Do not ask users to bypass SMAJ PI HUB safety, order, payment, or dispute flows.",
          ],
        },
        {
          heading: "Enforcement",
          paragraphs: [
            "SMAJ PI HUB may restrict seller tools, remove listings, suspend marketplace access, or take other safety action when a seller violates this agreement or creates user risk.",
          ],
        },
      ]}
    />
  </LegalShell>
);

export const ReportAbusePage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitted(false);
    setError("");
    try {
      await axiosClient.post("/support", {
        source: "report-abuse",
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        topic: String(form.get("type") || ""),
        message: String(form.get("details") || ""),
      });
      event.currentTarget.reset();
      setSubmitted(true);
    } catch {
      setError("Could not submit this report. Please email info@smajpihub.com.");
    }
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
            <input id="report-name" name="name" type="text" placeholder="Your full name" required />
          </label>
          <label htmlFor="report-email">
            <span>Email</span>
            <input id="report-email" name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label htmlFor="report-type">
            <span>Report Type</span>
            <select id="report-type" name="type" required defaultValue="">
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
            <textarea id="report-details" name="details" rows={6} placeholder="Describe what happened..." required />
          </label>
          <button type="submit">Submit Report</button>
          {submitted ? <p className="contact-form-success">Thank you. Your report has been recorded for review.</p> : null}
          {error ? <p className="contact-form-success error">{error}</p> : null}
        </form>
        <aside className="legal-report-card">
          <ReportProblemOutlinedIcon />
          <h2>What to Include</h2>
          <p>Share links, usernames, listing titles, screenshots description, payment context, and any timeline details.</p>
          <p>For urgent company contact, email <a href={`mailto:${legalEmail}`}>{legalEmail}</a>.</p>
        </aside>
      </section>
      <LegalTextDocument
        title="SMAJ PI HUB Report Abuse Policy"
        sections={[
          {
            heading: "What Users Can Report",
            items: [
              "Fake sellers, fake buyers, suspicious accounts, scams, or impersonation.",
              "Unsafe listings, prohibited content, misleading product information, or harmful behavior.",
              "Payment pressure, off-platform payment requests, spam, harassment, or abuse.",
              "Any activity that may harm users, sellers, providers, partners, or the SMAJ PI HUB community.",
            ],
          },
          {
            heading: "Information to Include",
            items: [
              "Username, seller name, listing title, order reference, or page link.",
              "Screenshots description, messages, payment context, timeline, and what happened.",
              "Your contact email so the team can follow up when needed.",
            ],
          },
          {
            heading: "Review Process",
            paragraphs: [
              "SMAJ PI HUB may review reports, contact involved users, hide listings, restrict accounts, preserve evidence, or take safety action where needed.",
            ],
          },
          {
            heading: "Urgent Contact",
            paragraphs: [
              `For urgent safety or company contact, email ${legalEmail}.`,
            ],
          },
        ]}
      />
    </LegalShell>
  );
};
