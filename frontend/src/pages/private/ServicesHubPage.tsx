import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import AgricultureOutlinedIcon from "@mui/icons-material/AgricultureOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";

const services = [
  ["store", "SMAJ Store / Marketplace", "Buy and sell products with Pi.", StorefrontOutlinedIcon, true],
  ["food-delivery", "SMAJ Food Delivery", "Order food from restaurants.", RestaurantOutlinedIcon],
  ["jobs", "SMAJ Jobs", "Jobs, freelance, opportunities.", WorkOutlineOutlinedIcon],
  ["health", "SMAJ Health", "Healthcare and consultations.", HealthAndSafetyOutlinedIcon],
  ["education", "SMAJ Education", "Learning and skills.", SchoolOutlinedIcon],
  ["transport", "SMAJ Transport", "Transport and mobility services.", DirectionsCarOutlinedIcon],
  ["agro", "SMAJ Agro", "Agriculture marketplace.", AgricultureOutlinedIcon],
  ["energy", "SMAJ Energy", "Utilities and energy services.", BoltOutlinedIcon],
  ["charity", "SMAJ Charity", "Verified donations and social good.", VolunteerActivismOutlinedIcon],
  ["housing", "SMAJ Housing", "Property and rentals.", HomeWorkOutlinedIcon],
  ["events", "SMAJ Events", "Events and tickets.", EventOutlinedIcon],
  ["swap", "SMAJ Swap", "Peer-to-peer exchange.", SwapHorizOutlinedIcon],
  ["stream", "SMAJ Stream", "Movies, series, and content.", MovieOutlinedIcon],
  ["sports", "SMAJ Sports", "Sports, scores, and entertainment.", SportsSoccerOutlinedIcon],
  ["token", "SMAJ Token", "Rewards and ecosystem utility.", TokenOutlinedIcon],
] as const;

const ServicesHubPage = () => { const navigate = useNavigate(); const [selected, setSelected] = useState<(typeof services)[number] | null>(null); const [notified, setNotified] = useState(false); const open = (service: (typeof services)[number]) => { if (service[4]) navigate("/store"); else { setSelected(service); setNotified(false); } }; return <main className="private-page"><section className="private-page-head"><div><p className="private-kicker">SMAJ ECOSYSTEM</p><h1>Services</h1><p>One Pi-powered account for commerce and future everyday services.</p></div></section><section className="services-hub-grid">{services.map((service) => { const Icon = service[3]; return <button key={service[0]} onClick={() => open(service)}><span className="service-icon"><Icon /></span><span className={`service-status ${service[4] ? "live" : "soon"}`}>{service[4] ? "LIVE" : "Coming Soon"}</span><strong>{service[1]}</strong><p>{service[2]}</p></button>; })}</section>{selected ? <div className="service-modal-backdrop" onMouseDown={() => setSelected(null)}><section className="service-modal" onMouseDown={(event) => event.stopPropagation()}><span className="service-icon">{(() => { const Icon = selected[3]; return <Icon />; })()}</span><h2>{selected[1]}</h2><p>This service is coming soon.</p><p>{selected[2]}</p>{notified ? <div className="private-alert success">You will be notified when this service launches.</div> : null}<div className="form-actions"><button className="private-primary-button" onClick={() => setNotified(true)}>Notify Me</button><button className="private-secondary-button" onClick={() => setSelected(null)}>Close</button></div></section></div> : null}</main>; };
export default ServicesHubPage;
