import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ServiceArt from "../../components/ServiceArt";
import { serviceCatalog } from "../../content/serviceCatalog";
import { formatPiRate } from "../../lib/piPricing";

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const service = useMemo(() => serviceCatalog.find((item) => item.slug === slug || (slug === "food-delivery" && item.slug === "food")), [slug]);
  const [search, setSearch] = useState("");
  const [notified, setNotified] = useState(false);
  useEffect(() => {
    if (!service) return;
    try {
      const current = JSON.parse(window.localStorage.getItem("smaj_recent_services") || "[]");
      const items = Array.isArray(current) ? current : [];
      const to = service.live ? "/store" : `/app/services/${service.slug}`;
      const next = [{ label: service.name, to, meta: "Service" }, ...items.filter((item) => item?.to !== to)].slice(0, 8);
      window.localStorage.setItem("smaj_recent_services", JSON.stringify(next));
    } catch {
      window.localStorage.removeItem("smaj_recent_services");
    }
  }, [service]);
  if (!service) return <Navigate to="/app/services" replace />;
  if (service.live) return <Navigate to="/store" replace />;
  const matches = service.items.filter((item) => item.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="private-page service-detail-page">
      <header className="service-page-header service-page-header-simple">
        <div>
          <Link className="service-header-back" to="/app/services" aria-label="Back to services">
            <ArrowBackOutlinedIcon />
          </Link>
          <ServiceArt index={service.atlasIndex} />
          <strong>{service.name}</strong>
        </div>
        <label><SearchOutlinedIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${service.name}`} /></label>
      </header>
      <section className="service-coming-hero">
        <ServiceArt index={service.atlasIndex} />
        <p className="private-kicker">COMING SOON</p>
        <h1>{service.experience}</h1>
        <p>{service.description}</p>
        <p className="service-payment-rate">{formatPiRate()} across SMAJ services.</p>
        <button className="private-primary-button" onClick={() => setNotified(true)}>{notified ? "Notification requested" : "Notify Me"}</button>
      </section>
      <section className="service-preview-tabs"><strong>Explore what is coming</strong><div>{matches.map((item) => <span key={item}>{item}</span>)}</div></section>
    </main>
  );
};

export default ServiceDetailPage;
