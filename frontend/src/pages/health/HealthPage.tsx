import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import AppLayout from "../../layouts/AppLayout";
import {
  getHealthCategories,
  getHealthProviders,
} from "../../lib/healthApi";
import type { HealthProvider } from "../../types/health";
import { useHealthBooking } from "../../contexts/HealthBookingContext";
import ProviderCard from "../../components/health/ProviderCard";
import BookingSummary from "../../components/health/BookingSummary";
import HealthHeader from "./HealthHeader";
import "./HealthPage.css";

const FEATURED_STATS = [
  ["80+", "Providers"],
  ["24/7", "Support"],
  ["Pi", "Secure checkout"],
] as const;

const HealthPage = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [providers, setProviders] = useState<HealthProvider[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedService } = useHealthBooking();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cats, initialProviders] = await Promise.all([
          getHealthCategories(),
          getHealthProviders(),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setProviders(initialProviders);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load providers. Showing saved preview.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProviders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return providers.filter((provider) => {
      const matchesQuery = !q ||
        provider.name.toLowerCase().includes(q) ||
        provider.specialty.toLowerCase().includes(q) ||
        provider.location.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === "All" || provider.specialty === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [providers, query, selectedCategory]);

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="health-page">
        <HealthHeader query={query} onQueryChange={setQuery} />
        <section className="health-hero">
          <div className="health-hero-copy">
            <span className="health-kicker">SMAJ PI HEALTH</span>
            <h1>Care when you need it.</h1>
            <p>
              Book appointments with verified doctors, clinics, diagnostics, and pharmacies. Pay securely with Pi.
            </p>
            <div className="health-search" role="search">
              <SearchOutlinedIcon />
              <input
                type="search"
                placeholder="Search providers, services..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Link to="#providers">Find care</Link>
            </div>
          </div>
          <aside className="health-hero-panel" aria-label="Health booking preview">
            <div className="health-popular-card">
              <img
                src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=900&q=85"
                alt=""
              />
              <span>Trusted providers</span>
            </div>
            <div className="health-booking-card">
              <div>
                <strong>Easy booking</strong>
                <small>Same-day appointments available</small>
              </div>
              <b>Pi checkout</b>
              <Link to="/dashboard">Open wallet</Link>
            </div>
          </aside>
        </section>

        <section className="health-stats" aria-label="Health overview">
          {FEATURED_STATS.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>

        <section id="providers" className="health-section">
          <div className="health-section-head">
            <span className="health-kicker">WHAT YOU CAN BOOK</span>
            <h2>Find care near you.</h2>
            <p>
              Browse verified providers, check availability, and book appointments in minutes.
            </p>
          </div>
          <div className="health-category-grid">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`health-category-tile${selectedCategory === category ? " selected" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                <StarOutlinedIcon />
                <span>{category}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="health-section">
          <div className="health-section-head compact">
            <span className="health-kicker">PROVIDERS</span>
            <h2>Start booking.</h2>
          </div>
          {loading ? (
            <div className="health-loading">Loading providers...</div>
          ) : error ? (
            <div className="health-error">
              <p>{error}</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="health-empty">
              <p>No providers match your search.</p>
            </div>
          ) : (
            <div className="health-provider-grid">
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </section>

        {selectedService ? (
          <BookingSummary
            providerName={selectedService.providerId}
            service={selectedService}
            onCheckout={() => navigate(`/services/health/book/${selectedService.providerId}/${selectedService.id}`)}
          />
        ) : null}
      </main>
    </AppLayout>
  );
};

export default HealthPage;
