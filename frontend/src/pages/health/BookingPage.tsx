import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AppLayout from "../../layouts/AppLayout";
import { getHealthProvider, getHealthServices, createHealthBooking } from "../../lib/healthApi";
import type { HealthProvider, HealthService } from "../../types/health";
import { useHealthBooking } from "../../contexts/HealthBookingContext";
import HealthHeader from "./HealthHeader";
import "./HealthPage.css";
const TODAY = new Date().toISOString().slice(0, 10);

const BookingPage = () => {
  const { providerId, serviceId } = useParams();
  const [provider, setProvider] = useState<HealthProvider | undefined>(undefined);
  const [services, setServices] = useState<HealthService[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ date: "", time: "", patientName: "", patientEmail: "", notes: "" });
  const { selectedService, clearBooking } = useHealthBooking();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!providerId) return;
      setLoading(true);
      setError(null);
      try {
        const [providerData, servicesData] = await Promise.all([
          getHealthProvider(providerId),
          getHealthServices(providerId),
        ]);
        if (!cancelled) {
          setProvider(providerData);
          setServices(servicesData);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load booking details.");
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
  }, [providerId]);

  const service = services.find(s => s.id === serviceId) || selectedService;

  const updateField = (field: string, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!providerId || !serviceId || !service || !provider) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = await createHealthBooking({
        providerId,
        serviceId,
        date: form.date,
        time: form.time,
        patientName: form.patientName,
        patientEmail: form.patientEmail,
        notes: form.notes,
      });
      const appointments = JSON.parse(localStorage.getItem("smaj_health_appointments") || "[]") as unknown[];
      appointments.unshift({
        bookingId: result.bookingId,
        providerName: provider.name,
        serviceName: service.name,
        date: form.date,
        time: form.time,
        total: service.price * 1.05,
        status: "Confirmed",
      });
      localStorage.setItem("smaj_health_appointments", JSON.stringify(appointments));
      setBookingId(result.bookingId);
      setSuccess(true);
      clearBooking();
    } catch {
      setError("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="health-page">
          <HealthHeader query={query} onQueryChange={setQuery} />
          <div className="health-loading">Loading booking...</div>
        </main>
      </AppLayout>
    );
  }

  if (!provider || !service) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="health-page">
          <HealthHeader query={query} onQueryChange={setQuery} />
          <div className="health-error">
            <p>{error || "Booking details not found."}</p>
            <Link to="/services/health" className="health-search a">
              <ArrowBackRoundedIcon />
              Back to providers
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  if (success) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="health-page">
          <HealthHeader query={query} onQueryChange={setQuery} />
          <section className="health-section">
            <div className="health-success">
              <span>✓</span>
              <h2>Booking confirmed</h2>
              <p>Your appointment with {provider.name} has been booked.</p>
              <p>Reference: {bookingId}</p>
              <Link to="/services/health/appointments" className="health-action-link">
                View appointments
              </Link>
            </div>
          </section>
        </main>
      </AppLayout>
    );
  }

  const deliveryFee = 0;
  const serviceFee = service.price * 0.05;
  const total = service.price + deliveryFee + serviceFee;

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="health-page">
        <HealthHeader query={query} onQueryChange={setQuery} />
        <Link to={`/services/health/providers/${provider.id}`} className="health-back-link">
          <ArrowBackRoundedIcon />
          Back to provider
        </Link>
        <section className="health-section">
          <div className="health-section-head compact">
            <span className="health-kicker">BOOK APPOINTMENT</span>
            <h2>Confirm your booking.</h2>
          </div>
          <div className="health-booking-layout">
            <form className="health-booking-form" onSubmit={handleSubmit}>
              <div className="health-form-row">
                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    min={TODAY}
                    value={form.date}
                    onChange={event => updateField("date", event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Time</span>
                  <input
                    type="time"
                    value={form.time}
                    onChange={event => updateField("time", event.target.value)}
                    required
                  />
                </label>
              </div>
              <label>
                <span>Full name</span>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={event => updateField("patientName", event.target.value)}
                  placeholder="Patient full name"
                  required
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={form.patientEmail}
                  onChange={event => updateField("patientEmail", event.target.value)}
                  placeholder="Email for confirmation"
                  required
                />
              </label>
              <label>
                <span>Notes (optional)</span>
                <textarea
                  value={form.notes}
                  onChange={event => updateField("notes", event.target.value)}
                  placeholder="Symptoms, preferences, or special requests"
                  rows={3}
                />
              </label>
              {error ? <p className="health-error">{error}</p> : null}
              <button className="health-booking-submit" type="submit" disabled={submitting}>
                {submitting ? "Booking..." : `Confirm appointment · π ${total.toFixed(2)}`}
              </button>
            </form>
            <aside className="health-booking-summary-card">
              <h3>Appointment summary</h3>
              <p>
                <strong>{provider.name}</strong>
              </p>
              <p>
                {service.name} · {service.duration}
              </p>
              <div className="health-summary-row">
                <span>Consultation</span>
                <strong>π {service.price.toFixed(2)}</strong>
              </div>
              <div className="health-summary-row">
                <span>Service fee</span>
                <strong>π {serviceFee.toFixed(2)}</strong>
              </div>
              <div className="health-summary-row total">
                <span>Total</span>
                <strong>π {total.toFixed(2)}</strong>
              </div>
              <p className="health-payment-note">
                <AccountBalanceWalletOutlinedIcon />
                Pi payment integration pending
              </p>
            </aside>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default BookingPage;
