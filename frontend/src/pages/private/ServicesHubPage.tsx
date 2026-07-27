import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ServiceArt from "../../components/ServiceArt";
import { serviceAppPath, serviceCatalog } from "../../content/serviceCatalog";
import { formatPiRate } from "../../lib/piPricing";

const serviceHints: Record<string, string> = {
  store: "Shopping • Deals",
  food: "Eat • Delivery",
  jobs: "Work • Hire",
  education: "Learn • Skills",
  health: "Care • Doctors",
  transport: "Ride • Move",
  agro: "Farm • Trade",
  energy: "Power • Bills",
  charity: "Give • Help",
  housing: "Rent • Buy",
  events: "Tickets • Fun",
  swap: "Trade • Exchange",
  stream: "Watch • Videos",
  sports: "Play • Scores",
  token: "Rewards • Utility",
};

const servicePath = (slug: string, live?: boolean) => {
  return live ? serviceAppPath(slug) : `/app/services/${slug}`;
};
const prioritySlugs = ["store", "stream", "sports"];
const orderedServices = [...serviceCatalog].sort((left, right) => {
  const leftIndex = prioritySlugs.indexOf(left.slug);
  const rightIndex = prioritySlugs.indexOf(right.slug);
  const leftPriority = leftIndex === -1 ? prioritySlugs.length : leftIndex;
  const rightPriority = rightIndex === -1 ? prioritySlugs.length : rightIndex;
  return leftPriority - rightPriority;
});
const isInProgress = (slug: string) => serviceCatalog.some((service) => service.slug === slug && service.inProgress);

const ServicesHubPage = () => {
  const [search, setSearch] = useState("");
  const visible = useMemo(() => orderedServices.filter((service) => [service.name, service.description, ...service.items].join(" ").toLowerCase().includes(search.trim().toLowerCase())), [search]);

  return <main className="private-page services-launcher">
    <div className="services-desktop-view">
      <section className="private-page-head"><div><p className="private-kicker">SMAJ ECOSYSTEM</p><h1>All SMAJ PI HUB Services</h1><p>Explore one connected ecosystem for everyday life. {formatPiRate()} across services.</p></div></section>
      <label className="services-search"><SearchOutlinedIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Discover anything..." /></label>
      <section className="services-hub-grid">{visible.map((service) => isInProgress(service.slug) ? <article className="service-in-progress-card" key={service.slug}><ServiceArt index={service.atlasIndex} /><span className="service-status in-progress">IN PROGRESS</span><strong>{service.name}</strong><p>{service.description}</p></article> : <Link key={service.slug} to={servicePath(service.slug, service.live)}><ServiceArt index={service.atlasIndex} /><span className={`service-status ${service.live ? "live" : "soon"}`}>{service.live ? "LIVE" : "Coming Soon"}</span><strong>{service.name}</strong><p>{service.description}</p><i><ArrowForwardOutlinedIcon /></i></Link>)}</section>
      {!visible.length ? <div className="private-state">No service matches your search.</div> : null}
    </div>

    <section className="services-mobile-view">
      <header><h1>Services</h1><p>Access multiple digital services from anywhere you are. {formatPiRate()}.</p></header>
      <div className="mobile-services-grid">{orderedServices.map((service) => isInProgress(service.slug) ? <article className="service-in-progress-card" key={service.slug}><ServiceArt index={service.atlasIndex} /><em className="service-in-progress-badge">IN PROGRESS</em><strong>{service.name.replace("SMAJ ", "")}</strong><span>{serviceHints[service.slug]}</span></article> : <Link key={service.slug} to={servicePath(service.slug, service.live)}><ServiceArt index={service.atlasIndex} />{service.live ? <em className="live-card-badge">LIVE</em> : null}<strong>{service.name.replace("SMAJ ", "")}</strong><span>{serviceHints[service.slug]}</span></Link>)}</div>
    </section>
  </main>;
};

export default ServicesHubPage;
