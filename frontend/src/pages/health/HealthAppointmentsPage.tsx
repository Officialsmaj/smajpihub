import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AppLayout from "../../layouts/AppLayout";
import HealthHeader from "./HealthHeader";
import "./HealthPage.css";

type Appointment = {
  bookingId: string;
  providerName: string;
  serviceName: string;
  date: string;
  time: string;
  total: number;
  status: string;
};

const HealthAppointmentsPage = () => {
  const [query, setQuery] = useState("");
  const appointments = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("smaj_health_appointments") || "[]") as Appointment[];
    } catch {
      return [];
    }
  }, []);
  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="health-page">
        <HealthHeader query={query} onQueryChange={setQuery} />
        <section className="health-section health-subpage">
          <div className="health-section-head">
            <span className="health-kicker">MY APPOINTMENTS</span>
            <h2>Your care schedule.</h2>
          </div>
          {appointments.length ? (
            <div className="health-appointment-list">
              {appointments.map(item => (
                <article key={item.bookingId}>
                  <EventAvailableOutlinedIcon />
                  <div>
                    <h3>{item.serviceName}</h3>
                    <p>{item.providerName}</p>
                    <small>
                      {item.date} at {item.time}
                    </small>
                  </div>
                  <div>
                    <b>{item.status}</b>
                    <strong>π {item.total.toFixed(2)}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="health-empty">
              <p>No appointments booked yet.</p>
              <Link to="/services/health">Find a provider</Link>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
};
export default HealthAppointmentsPage;
