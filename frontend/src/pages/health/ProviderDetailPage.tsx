import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AppLayout from "../../layouts/AppLayout";
import { getHealthServices, getHealthProvider } from "../../lib/healthApi";
import type { HealthProvider, HealthService } from "../../types/health";
import { useHealthBooking } from "../../contexts/HealthBookingContext";
import ServiceCard from "../../components/health/ServiceCard";
import BookingSummary from "../../components/health/BookingSummary";
import HealthHeader from "./HealthHeader";
import "./HealthPage.css";

const ProviderDetailPage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState<HealthProvider | undefined>(undefined);
  const [services, setServices] = useState<HealthService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const { selectService, selectedService } = useHealthBooking();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [providerData, servicesData] = await Promise.all([getHealthProvider(id), getHealthServices(id)]);
        if (!cancelled) {
          setProvider(providerData);
          setServices(servicesData);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load provider details.");
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
  }, [id]);

  if (loading) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="health-page">
          <HealthHeader query={query} onQueryChange={setQuery} />
          <div className="health-loading">Loading provider...</div>
        </main>
      </AppLayout>
    );
  }

  if (error || !provider) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="health-page">
          <HealthHeader query={query} onQueryChange={setQuery} />
          <div className="health-error">
            <p>{error || "Provider not found."}</p>
            <Link to="/services/health" className="health-search a">
              <ArrowBackRoundedIcon />
              Back to providers
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="health-page">
        <HealthHeader query={query} onQueryChange={setQuery} />
        <Link to="/services/health" className="health-back-link">
          <ArrowBackRoundedIcon />
          Back to providers
        </Link>
        <section className="health-provider-hero">
          <img src={provider.image} alt="" />
          <div>
            <span className="health-kicker">{provider.specialty}</span>
            <h1>{provider.name}</h1>
            <p className="health-provider-meta">
              <StarRoundedIcon />
              {provider.rating} · {provider.location} · {provider.nextSlot}
            </p>
            <p>{provider.description}</p>
          </div>
        </section>

        <section className="health-section">
          <div className="health-section-head compact">
            <span className="health-kicker">SERVICES</span>
            <h2>Choose a service.</h2>
          </div>
          <div className="health-service-list">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} onSelect={() => selectService(service)} />
            ))}
          </div>
        </section>

        {selectedService?.providerId === provider.id ? (
          <BookingSummary
            providerName={provider.name}
            service={selectedService}
            onCheckout={() => navigate(`/services/health/book/${provider.id}/${selectedService.id}`)}
          />
        ) : null}
      </main>
    </AppLayout>
  );
};

export default ProviderDetailPage;
