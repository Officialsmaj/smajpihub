import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import AppLayout from "../layouts/AppLayout";
import { axiosClient } from "../lib/axiosClient";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

const onboardingTracks = [
  {
    title: "Sellers",
    text: "List products, build a seller profile, chat with buyers, and prepare for Pi-powered marketplace transactions.",
    icon: StorefrontOutlinedIcon,
  },
  {
    title: "Service Providers",
    text: "Bring useful services into the hub, from delivery and transport to education, health, housing, and events.",
    icon: BusinessCenterOutlinedIcon,
  },
  {
    title: "Partners",
    text: "Work with SMAJ PI HUB on verified programs, local expansion, ecosystem support, and operational growth.",
    icon: HandshakeOutlinedIcon,
  },
  {
    title: "Community Contributors",
    text: "Help test, educate users, report issues, invite builders, and support trusted Pi utility adoption.",
    icon: GroupsOutlinedIcon,
  },
] as const;

const readinessItems = [
  "Clear business or service description",
  "Verified contact information",
  "Product, service, or partnership category",
  "Location or target market",
  "Readiness to follow trust and safety rules",
];

const OnboardingPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setSubmitted(false);
    setError("");
    try {
      await axiosClient.post("/onboarding", {
        fullName: String(form.get("fullName") || ""),
        email: String(form.get("email") || ""),
        applicationType: String(form.get("applicationType") || ""),
        location: String(form.get("location") || ""),
        details: String(form.get("details") || ""),
      });
      event.currentTarget.reset();
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || "Could not submit this application."
          : "Could not submit this application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <main className="home-page onboarding-page">
        <section className="home-hero onboarding-hero">
          <div>
            <span className="home-kicker">APPLY TO JOIN</span>
            <h1>Apply to Join SMAJ PI HUB</h1>
            <p>
              Join the SMAJ PI HUB ecosystem as a seller, service provider, partner, or community contributor.
              Help build real-world Pi utility from day one.
            </p>
            <div className="home-hero-cta">
              <a href="#onboarding-form" className="home-hero-primary-btn">Start Application</a>
              <Link to="/services/store" className="home-hero-secondary-btn">View SMAJ Store</Link>
            </div>
          </div>
          <aside className="onboarding-hero-card">
            <VerifiedUserOutlinedIcon />
            <strong>Trusted access first</strong>
            <span>Pi identity, verified profiles, safer listings, support review, and real marketplace readiness.</span>
          </aside>
        </section>

        <section className="home-section onboarding-track-section">
          <div className="home-section-head">
            <span className="home-kicker">WHO CAN APPLY</span>
            <h2>Four clear paths into the ecosystem.</h2>
          </div>
          <div className="onboarding-track-grid">
            {onboardingTracks.map(({ title, text, icon: Icon }) => (
              <article key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section onboarding-form-section" id="onboarding-form">
          <form className="contact-form onboarding-form" onSubmit={handleSubmit}>
            <div className="contact-form-head">
              <span className="home-kicker">APPLICATION</span>
              <h2>Tell us how you want to join.</h2>
              <p>The team will review launch-fit applications and contact selected applicants through email.</p>
            </div>
            <label htmlFor="onboarding-name">
              <span>Full Name</span>
            <input id="onboarding-name" name="fullName" type="text" placeholder="Your full name" required />
            </label>
            <label htmlFor="onboarding-email">
              <span>Email</span>
            <input id="onboarding-email" name="email" type="email" placeholder="info@example.com" required />
            </label>
            <label htmlFor="onboarding-track">
              <span>Application Type</span>
              <select id="onboarding-track" name="applicationType" defaultValue="" required>
                <option value="" disabled>Select application type</option>
                <option>Seller</option>
                <option>Service Provider</option>
                <option>Partner</option>
                <option>Community Contributor</option>
              </select>
            </label>
            <label htmlFor="onboarding-location">
              <span>Location / Market</span>
            <input id="onboarding-location" name="location" type="text" placeholder="City, country, or target market" required />
            </label>
            <label htmlFor="onboarding-details">
              <span>Business, Service, or Contribution</span>
              <textarea
                id="onboarding-details"
                name="details"
                rows={6}
                placeholder="Describe what you sell, provide, or want to contribute..."
                required
              />
            </label>
            <button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Application"}</button>
            {error ? <p className="contact-form-success error">{error}</p> : null}
            {submitted ? (
              <p className="contact-form-success">
                Application submitted. The SMAJ PI HUB team will review it and contact selected applicants.
              </p>
            ) : null}
          </form>

          <aside className="onboarding-readiness-card">
            <span className="home-kicker">READY BEFORE APPLYING</span>
            <h2>What helps your application.</h2>
            <ul>
              {readinessItems.map((item) => (
                <li key={item}>
                  <VerifiedUserOutlinedIcon />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
    </AppLayout>
  );
};

export default OnboardingPage;
