import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ServiceArt from "../../components/ServiceArt";
import { serviceCatalog } from "../../content/serviceCatalog";

const ServicesHubPage = () => { const [search, setSearch] = useState(""); const visible = useMemo(() => serviceCatalog.filter((service) => [service.name, service.description, ...service.items].join(" ").toLowerCase().includes(search.trim().toLowerCase())), [search]); return <main className="private-page services-launcher"><section className="private-page-head"><div><p className="private-kicker">SMAJ ECOSYSTEM</p><h1>All SMAJ PI HUB Services</h1><p>Explore one connected ecosystem for everyday life.</p></div></section><label className="services-search"><SearchOutlinedIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Discover anything..." /></label><section className="services-hub-grid">{visible.map((service) => <Link key={service.slug} to={service.live ? "/store" : `/app/services/${service.slug}`}><ServiceArt index={service.atlasIndex} /><span className={`service-status ${service.live ? "live" : "soon"}`}>{service.live ? "LIVE" : "Coming Soon"}</span><strong>{service.name}</strong><p>{service.description}</p><i><ArrowForwardOutlinedIcon /></i></Link>)}</section>{!visible.length ? <div className="private-state">No service matches your search.</div> : null}</main>; };
export default ServicesHubPage;
