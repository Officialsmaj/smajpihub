import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TelegramIcon from "@mui/icons-material/Telegram";
import ServiceArt from "../../components/ServiceArt";
import { serviceCatalog, type ServiceDefinition } from "../../content/serviceCatalog";

const why = [[PublicOutlinedIcon,"Access anywhere","Access multiple digital services from anywhere you are."],[LockOutlinedIcon,"Simple access","One account for your everyday needs."],[HubOutlinedIcon,"Connect everyone","People, businesses, and opportunities connected together."],[RocketLaunchOutlinedIcon,"Built for the future","A growing ecosystem designed for everyday life."]] as const;
const support = [[HelpOutlineOutlinedIcon,"Help Center","Find guides and answers.",["FAQs","Guides","Common questions"],"/help"],[ShieldOutlinedIcon,"Safety Center","Use SMAJ PI HUB with confidence.",["Privacy","Account safety","Reports","Protection"],"/help"],[FeedbackOutlinedIcon,"Feedback","Help improve SMAJ PI HUB.",["Send ideas","Report issues","Share experience"],"/contact"]] as const;

const servicePath = (service: ServiceDefinition) => service.live ? "/store" : `/app/services/${service.slug}`;
const serviceGroups = Array.from({ length: 5 }, (_, index) => serviceCatalog.slice(index * 3, index * 3 + 3));
const serviceRatings: Record<string, string> = { store:"4.8",food:"4.6",jobs:"4.5",education:"4.7",health:"4.6",transport:"4.4",agro:"4.3",energy:"4.5",charity:"4.9",housing:"4.4",events:"4.6",swap:"4.3",stream:"4.7",sports:"4.6",token:"4.5" };
const tabs = ["For you", "Trending", "Lifestyle", "Categories"] as const;
type HomeTab = typeof tabs[number];

const featureCards = [
  { title: "Take care of your health", text: "Find doctors, pharmacies and health services", slug: "health", image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=85" },
  { title: "Find your next home", text: "Discover houses, apartments and properties", slug: "housing", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85" },
  { title: "Build your skills", text: "Courses, training and certifications", slug: "education", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85" },
  { title: "Discover new products", text: "Shop from sellers and stores", slug: "store", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=85" },
];
const mediaSections = [
  { title: "Watch anytime", slug: "stream", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85", items: ["Trending movies", "Popular series", "Top creators", "New releases"] },
  { title: "Live sports", slug: "sports", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=85", items: ["Live matches", "Latest scores", "Top teams", "Tournament highlights"] },
  { title: "Events happening now", slug: "events", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85", items: ["Concerts", "Conferences", "Shows", "Experiences"], badges: ["Live now", "Starts today", "This weekend", "Ends on 7/8/26"] },
];

const ServiceStrip = ({ services }: { services: ServiceDefinition[] }) => <div className="mobile-service-groups">{Array.from({ length: Math.ceil(services.length / 3) }, (_, groupIndex) => <div className="mobile-service-group" key={groupIndex}>{services.slice(groupIndex * 3, groupIndex * 3 + 3).map((service) => <Link to={servicePath(service)} className="mobile-service-app" key={service.slug}><ServiceArt index={service.atlasIndex} /><div><strong>{service.name}</strong><span>{service.items.slice(0, 2).join(" • ")}</span><small>{serviceRatings[service.slug]}★</small></div></Link>)}</div>)}</div>;

const MobileHome = () => {
  const [activeTab, setActiveTab] = useState<HomeTab>("For you");
  const [tabsPinned, setTabsPinned] = useState(false);
  const tabsAnchorRef = useRef<HTMLDivElement>(null);
  const lifestyleSlugs = ["food", "health", "housing", "transport", "education", "charity"];
  const tabServices = activeTab === "Lifestyle" ? serviceCatalog.filter((service) => lifestyleSlugs.includes(service.slug)) : activeTab === "Trending" ? serviceCatalog.filter((service) => ["store", "stream", "sports", "events", "food", "jobs"].includes(service.slug)) : serviceCatalog;
  useEffect(() => {
    const updatePinnedState = () => {
      const anchor = tabsAnchorRef.current;
      if (!anchor) return;
      setTabsPinned(anchor.getBoundingClientRect().top <= 0);
    };
    updatePinnedState();
    window.addEventListener("scroll", updatePinnedState, { passive: true });
    window.addEventListener("resize", updatePinnedState);
    return () => {
      window.removeEventListener("scroll", updatePinnedState);
      window.removeEventListener("resize", updatePinnedState);
    };
  }, []);
  return <div className="mobile-super-home">
    <section className="mobile-home-hero">
      <div className="mobile-home-hero-copy"><span>SMAJ PI HUB</span><h1>Everything you need.<br />One place.</h1><div className="mobile-hero-icons">{serviceCatalog.slice(0, 3).map((service) => <ServiceArt key={service.slug} index={service.atlasIndex} />)}<b>+12</b></div><Link to="/app/services">Explore <ArrowForwardOutlinedIcon /></Link></div>
    </section>
    <div ref={tabsAnchorRef} className={`mobile-home-tabs-anchor ${tabsPinned ? "is-pinned" : ""}`}><div className="mobile-home-tabs" role="tablist">{tabs.map((tab) => <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div></div>

    {activeTab === "Categories" ? <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Service categories</h2><p>Explore the complete SMAJ PI HUB ecosystem.</p></div><ServiceStrip services={tabServices} /></section> : <>
      <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>{activeTab === "For you" ? "Suggested for you" : activeTab}</h2><Link to="/app/services">See all</Link></div>{activeTab === "For you" ? <div className="mobile-service-groups">{serviceGroups.map((group, index) => <div className="mobile-service-group" key={index}>{group.map((service) => <Link to={servicePath(service)} className="mobile-service-app" key={service.slug}><ServiceArt index={service.atlasIndex} /><div><strong>{service.name}</strong><span>{service.items.slice(0, 2).join(" • ")}</span><small>{serviceRatings[service.slug]}★</small></div></Link>)}</div>)}</div> : <ServiceStrip services={tabServices} />}</section>
      <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Discover what's new</h2></div><div className="mobile-feature-strip">{featureCards.map((card) => <Link className="mobile-feature-card" to={card.slug === "store" ? "/store" : `/app/services/${card.slug}`} key={card.slug}><img src={card.image} alt="" /><div><h3>{card.title}</h3><p>{card.text}</p><span>Explore <ArrowForwardOutlinedIcon /></span></div></Link>)}</div></section>
      {mediaSections.map((section) => <section className="mobile-feed-section" key={section.slug}><div className="mobile-section-heading"><h2>{section.title}</h2></div><div className="mobile-media-strip">{section.items.map((item, index) => <Link to={`/app/services/${section.slug}`} className="mobile-media-card" key={item}><img src={section.image} alt="" /><div>{section.badges ? <b>{section.badges[index]}</b> : null}<span>{item}</span><small>{section.slug === "stream" ? "SMAJ Stream" : section.slug === "sports" ? "SMAJ Sports" : "SMAJ Events"}</small></div></Link>)}</div></section>)}
      <section className="mobile-feed-section mobile-experience"><div className="mobile-section-heading"><div><h2>Experience SMAJ PI HUB</h2><p>Everything connected in one simple experience.</p></div></div><div className="mobile-phone-strip">{[["Discover","Explore services in one place"],["Connect","Use services and manage activities"],["Manage","Your profile, wallet and settings"]].map(([title,text]) => <article key={title}><div className="mobile-phone-screen"><i /><i /><i /></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Need help?</h2></div><div className="mobile-help-grid">{support.map(([Icon,title,,items,to]) => <Link to={to} key={title}><Icon /><div><strong>{title}</strong><span>{items.slice(0,3).join(" • ")}</span></div><ArrowForwardOutlinedIcon /></Link>)}</div></section>
    </>}
    <footer className="mobile-private-footer"><strong>SMAJ PI HUB</strong><p>Connecting everyday services in one platform.</p><nav><Link to="/about">About</Link><Link to="/app/services">Services</Link><Link to="/help">Help Center</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms</Link><Link to="/contact">Contact</Link></nav><div className="mobile-socials"><span>Follow us</span><a href="https://facebook.com" aria-label="Facebook"><FacebookIcon /></a><a href="https://instagram.com" aria-label="Instagram"><InstagramIcon /></a><a href="https://x.com" aria-label="X"><XIcon /></a><a href="https://youtube.com" aria-label="YouTube"><YouTubeIcon /></a><a href="https://telegram.org" aria-label="Telegram"><TelegramIcon /></a></div><small>Part of the SMAJ Ecosystem</small><small>© 2026 SMAJ PI HUB. All rights reserved.</small></footer>
  </div>;
};

const DesktopHome = () => <div className="desktop-private-home"><section className="ecosystem-hero"><div><p className="private-kicker">SMAJ PI HUB</p><h1>Everything you need.<br />One place.</h1><p>Discover services built for everyday life.</p><Link className="private-primary-button" to="/app/services">Explore Services <ArrowForwardOutlinedIcon /></Link></div><div className="ecosystem-hero-art">{serviceCatalog.slice(0,6).map((service) => <ServiceArt key={service.slug} index={service.atlasIndex} />)}</div></section>
  <section className="ecosystem-section"><div className="ecosystem-section-head"><p className="private-kicker">SUPER APP EXPERIENCES</p><h2>Built around everyday life</h2><p>Choose an experience and discover everything connected to it.</p></div><div className="experience-grid">{serviceCatalog.map((service) => <Link className={`experience-card experience-${service.atlasIndex % 5}`} key={service.slug} to={servicePath(service)}><ServiceArt index={service.atlasIndex} /><div><span>{service.name}</span><h3>{service.experience}</h3><ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul></div><i><ArrowForwardOutlinedIcon /></i></Link>)}</div></section>
  <section className="ecosystem-section"><div className="ecosystem-section-head"><h2>Why SMAJ PI HUB?</h2></div><div className="why-grid">{why.map(([Icon,title,text]) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  <section className="experience-showcase"><div><p className="private-kicker">ONE SIMPLE EXPERIENCE</p><h2>Experience SMAJ PI HUB</h2><p>Everything connected in one simple experience.</p></div><div className="phone-carousel"><article><div className="phone-screen"><ServiceArt index={0} /><span>Discover</span></div><h3>Discover</h3><p>Explore all SMAJ PI HUB services</p></article><article><div className="phone-screen"><ServiceArt index={8} /><span>Connect</span></div><h3>Connect</h3><p>Access services and communities</p></article><article><div className="phone-screen"><ServiceArt index={14} /><span>Manage</span></div><h3>Manage</h3><p>Your account, wallet, and settings</p></article></div></section>
  <section className="ecosystem-section"><div className="ecosystem-section-head"><h2>Building the future of digital access</h2></div><div className="trust-growth-grid"><article><strong>Global Vision</strong><p>Connecting users and services worldwide</p></article><article><strong>Trusted Experience</strong><p>Designed with safety and transparency</p></article><article><strong>Continuous Growth</strong><p>New services and improvements over time</p></article></div></section>
  <section className="ecosystem-section"><div className="ecosystem-section-head"><h2>Need help?</h2><p>We are here for you.</p></div><div className="support-grid">{support.map(([Icon,title,text,items,to]) => <Link key={title} to={to}><Icon /><h3>{title}</h3><p>{text}</p><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></Link>)}</div></section>
  <footer className="private-home-footer"><div><strong>SMAJ PI HUB</strong><p>Connecting everyday services in one platform.</p></div><nav><Link to="/about">About</Link><Link to="/app/services">Services</Link><Link to="/help">Help Center</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link><Link to="/contact">Contact</Link></nav><div><span>Part of the SMAJ Ecosystem</span><span>© 2026 SMAJ PI HUB. All rights reserved.</span></div></footer></div>;

const DashboardPage = () => <main className="private-home"><DesktopHome /><MobileHome /></main>;
export default DashboardPage;
