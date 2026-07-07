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
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TelegramIcon from "@mui/icons-material/Telegram";
import ServiceArt from "../../components/ServiceArt";
import { serviceCatalog, type ServiceDefinition } from "../../content/serviceCatalog";

type DiscoveryTab = "for-you" | "trending" | "lifestyle" | "categories";

const why = [[PublicOutlinedIcon, "Access anywhere", "Access multiple digital services from anywhere you are."], [LockOutlinedIcon, "Simple access", "One account for your everyday needs."], [HubOutlinedIcon, "Connect everyone", "People, businesses, and opportunities connected together."], [RocketLaunchOutlinedIcon, "Built for the future", "A growing ecosystem designed for everyday life."]] as const;
const support = [[HelpOutlineOutlinedIcon, "Help Center", "Find guides and answers.", ["FAQs", "Guides", "Common questions"], "/help"], [ShieldOutlinedIcon, "Safety Center", "Use SMAJ PI HUB with confidence.", ["Privacy", "Account safety", "Reports", "Protection"], "/help"], [FeedbackOutlinedIcon, "Feedback", "Help improve SMAJ PI HUB.", ["Send ideas", "Report issues", "Share experience"], "/contact"]] as const;
const discoveryTabs = [["For you", "for-you"], ["Trending", "trending"], ["Lifestyle", "lifestyle"], ["Categories", "categories"]] as const;
const serviceRatings: Record<string, string> = { store: "4.8", food: "4.6", jobs: "4.5", education: "4.7", health: "4.6", transport: "4.4", agro: "4.3", energy: "4.5", charity: "4.9", housing: "4.4", events: "4.6", swap: "4.3", stream: "4.7", sports: "4.6", token: "4.5" };
const serviceHints: Record<string, string> = { store: "Shopping - Deals", food: "Eat - Delivery", jobs: "Work - Hire", education: "Learn - Skills", health: "Care - Doctors", transport: "Ride - Move", agro: "Farm - Trade", energy: "Power - Bills", charity: "Give - Help", housing: "Rent - Buy", events: "Tickets - Fun", swap: "Trade - Exchange", stream: "Watch - Videos", sports: "Play - Scores", token: "Rewards - Utility" };
const lifestyleSlugs = ["food", "health", "housing", "transport", "education", "charity", "events", "agro"];
const trendingSlugs = ["store", "stream", "sports", "events", "food", "jobs", "education", "health", "housing", "transport"];
const serviceGroups = Array.from({ length: 5 }, (_, index) => serviceCatalog.slice(index * 3, index * 3 + 3));

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

const servicePath = (service: ServiceDefinition) => service.live ? "/store" : `/app/services/${service.slug}`;
const tabServices = (tab: DiscoveryTab) => {
  if (tab === "trending") return trendingSlugs.map((slug) => serviceCatalog.find((service) => service.slug === slug)).filter(Boolean) as ServiceDefinition[];
  if (tab === "lifestyle") return lifestyleSlugs.map((slug) => serviceCatalog.find((service) => service.slug === slug)).filter(Boolean) as ServiceDefinition[];
  if (tab === "categories") return serviceCatalog;
  return serviceCatalog.slice(0, 6);
};
const tabTitle = (tab: DiscoveryTab) => tab === "categories" ? "All categories" : tab === "trending" ? "Trending services" : tab === "lifestyle" ? "Lifestyle services" : "Suggested for you";

const DiscoveryTabButtons = ({ activeTab, onTabChange, className }: { activeTab: DiscoveryTab; onTabChange: (tab: DiscoveryTab) => void; className: string }) => (
  <nav className={className} aria-label="Discover SMAJ PI HUB">
    {discoveryTabs.map(([label, tab]) => (
      <button type="button" key={tab} className={activeTab === tab ? "active" : ""} onClick={() => onTabChange(tab)}>
        {label}
      </button>
    ))}
  </nav>
);

const ServiceList = ({ services, mode }: { services: ServiceDefinition[]; mode: "desktop" | "mobile" }) => (
  mode === "desktop" ? (
    <div className="desktop-suggested-grid">
      {services.map((service) => (
        <Link to={servicePath(service)} className="desktop-service-app" key={service.slug}>
          <ServiceArt index={service.atlasIndex} />
          <div><strong>{service.name}</strong><span>{service.items.slice(0, 2).join(" - ")}</span></div>
          <small className={service.live ? "live-rating-badge" : undefined}>{service.live ? "LIVE" : `${serviceRatings[service.slug]} star`}</small>
        </Link>
      ))}
    </div>
  ) : (
    <div className="mobile-services-grid">
      {services.map((service) => (
        <Link key={service.slug} to={servicePath(service)}>
          <ServiceArt index={service.atlasIndex} />
          {service.live ? <em className="live-card-badge">LIVE</em> : null}
          <strong>{service.name.replace("SMAJ ", "")}</strong>
          <span>{serviceHints[service.slug] || service.items.slice(0, 2).join(" - ")}</span>
        </Link>
      ))}
    </div>
  )
);

const MobileHome = ({ activeTab, onTabChange }: { activeTab: DiscoveryTab; onTabChange: (tab: DiscoveryTab) => void }) => {
  const [tabsPinned, setTabsPinned] = useState(false);
  const tabsAnchorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const updatePinnedState = () => {
      const anchor = tabsAnchorRef.current;
      if (anchor) setTabsPinned(anchor.getBoundingClientRect().top <= 0);
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
    <section className="mobile-home-hero"><div className="mobile-home-hero-copy"><span>SMAJ PI HUB</span><h1>Everything you need.<br />One place.</h1><div className="mobile-hero-icons">{serviceCatalog.slice(0, 3).map((service) => <ServiceArt key={service.slug} index={service.atlasIndex} />)}<b>+12</b></div><Link to="/app/services">Explore <ArrowForwardOutlinedIcon /></Link></div></section>
    <div ref={tabsAnchorRef} className={`mobile-home-tabs-anchor ${tabsPinned ? "is-pinned" : ""}`}><DiscoveryTabButtons className="mobile-home-tabs" activeTab={activeTab} onTabChange={onTabChange} /></div>
    {activeTab === "for-you" ? <>
      <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Suggested for you</h2><Link to="/app/services">See all</Link></div><div className="mobile-service-groups">{serviceGroups.map((group, index) => <div className="mobile-service-group" key={index}>{group.map((service) => <Link to={servicePath(service)} className="mobile-service-app" key={service.slug}><ServiceArt index={service.atlasIndex} /><div><strong>{service.name}</strong><span>{service.items.slice(0, 2).join(" - ")}</span><small className={service.live ? "live-rating-badge" : undefined}>{service.live ? "LIVE" : `${serviceRatings[service.slug]} star`}</small></div></Link>)}</div>)}</div></section>
      <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Discover what's new</h2></div><div className="mobile-feature-strip">{featureCards.map((card) => <Link className="mobile-feature-card" to={card.slug === "store" ? "/store" : `/app/services/${card.slug}`} key={card.slug}><img src={card.image} alt="" />{card.slug === "store" ? <b className="live-card-badge feature-live-badge">LIVE</b> : null}<div><h3>{card.title}</h3><p>{card.text}</p><span>Explore <ArrowForwardOutlinedIcon /></span></div></Link>)}</div></section>
      {mediaSections.map((section) => <section className="mobile-feed-section" key={section.slug}><div className="mobile-section-heading"><h2>{section.title}</h2></div><div className="mobile-media-strip">{section.items.map((item, index) => <Link to={`/app/services/${section.slug}`} className="mobile-media-card" key={item}><img src={section.image} alt="" /><div>{section.badges ? <b>{section.badges[index]}</b> : null}<span>{item}</span><small>{section.slug === "stream" ? "SMAJ Stream" : section.slug === "sports" ? "SMAJ Sports" : "SMAJ Events"}</small></div></Link>)}</div></section>)}
      <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Need help?</h2></div><div className="mobile-help-grid">{support.map(([Icon, title, , items, to]) => <Link to={to} key={title}><Icon /><div><strong>{title}</strong><span>{items.slice(0, 3).join(" - ")}</span></div><ArrowForwardOutlinedIcon /></Link>)}</div></section>
    </> : <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>{tabTitle(activeTab)}</h2><Link to="/app/services">See all</Link></div><ServiceList services={tabServices(activeTab)} mode="mobile" /></section>}
    <footer className="mobile-private-footer"><strong>SMAJ PI HUB</strong><p>Connecting everyday services in one platform.</p><nav><Link to="/about">About</Link><Link to="/app/services">Services</Link><Link to="/help">Help Center</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms</Link><Link to="/cookies">Cookie Policy</Link><Link to="/report-abuse">Report Abuse</Link><Link to="/seller-agreement">Seller Agreement</Link><Link to="/contact">Contact</Link></nav><div className="mobile-socials"><span>Follow us</span><a href="https://x.com/smajpihub" aria-label="X" target="_blank" rel="noreferrer"><XIcon /></a><a href="https://t.me/smajpihub" aria-label="Telegram" target="_blank" rel="noreferrer"><TelegramIcon /></a><a href="https://instagram.com/smajpihub" aria-label="Instagram" target="_blank" rel="noreferrer"><InstagramIcon /></a><a href="https://youtube.com/@smajpihub" aria-label="YouTube" target="_blank" rel="noreferrer"><YouTubeIcon /></a><a href="https://www.tiktok.com/@smajpihub" aria-label="TikTok" target="_blank" rel="noreferrer"><MusicNoteOutlinedIcon /></a></div><small>Part of the SMAJ Ecosystem</small><small>(c) 2026 SMAJ PI HUB. All rights reserved.</small></footer>
  </div>;
};

const DesktopFeedHome = ({ activeTab, onTabChange }: { activeTab: DiscoveryTab; onTabChange: (tab: DiscoveryTab) => void }) => <div className="desktop-private-home desktop-feed-home">
  <section className="desktop-feed-hero"><div><p className="private-kicker">SMAJ PI HUB</p><h1>Everything you need.<br />One place.</h1><p>Discover services, products, media, support, and everyday tools from one connected dashboard.</p><div className="desktop-feed-hero-actions"><Link className="private-primary-button" to="/app/services">Explore Services <ArrowForwardOutlinedIcon /></Link><Link className="private-secondary-button" to="/store">Open SMAJ Store</Link></div></div><div className="desktop-feed-hero-icons">{serviceCatalog.slice(0, 6).map((service) => <Link key={service.slug} to={servicePath(service)} title={service.name}><ServiceArt index={service.atlasIndex} />{service.live ? <em>LIVE</em> : null}</Link>)}</div></section>
  <DiscoveryTabButtons className="desktop-feed-tabs" activeTab={activeTab} onTabChange={onTabChange} />
  <div className="desktop-feed-layout"><div className="desktop-feed-main">
    {activeTab === "for-you" ? <>
      <section className="desktop-feed-section"><div className="desktop-feed-section-head"><div><h2>Suggested for you</h2><p>Fast access to the core SMAJ services.</p></div><Link to="/app/services">See all</Link></div><ServiceList services={serviceCatalog.slice(0, 6)} mode="desktop" /></section>
      <section className="desktop-feed-section"><div className="desktop-feed-section-head"><div><h2>Discover what's new</h2><p>Fresh entry points into useful services.</p></div></div><div className="desktop-feature-grid">{featureCards.map((card) => <Link className="desktop-feature-card" to={card.slug === "store" ? "/store" : `/app/services/${card.slug}`} key={card.slug}><img src={card.image} alt="" />{card.slug === "store" ? <b className="live-card-badge feature-live-badge">LIVE</b> : null}<div><h3>{card.title}</h3><p>{card.text}</p><span>Explore <ArrowForwardOutlinedIcon /></span></div></Link>)}</div></section>
      {mediaSections.map((section) => <section className="desktop-feed-section" key={section.slug}><div className="desktop-feed-section-head"><div><h2>{section.title}</h2><p>{section.slug === "stream" ? "Entertainment picks across the ecosystem." : section.slug === "sports" ? "Scores, activities, and sports communities." : "Tickets, events, and local experiences."}</p></div></div><div className="desktop-media-grid">{section.items.map((item, index) => <Link to={`/app/services/${section.slug}`} className="desktop-media-card" key={item}><img src={section.image} alt="" /><div>{section.badges ? <b>{section.badges[index]}</b> : null}<span>{item}</span><small>{section.slug === "stream" ? "SMAJ Stream" : section.slug === "sports" ? "SMAJ Sports" : "SMAJ Events"}</small></div></Link>)}</div></section>)}
    </> : <section className="desktop-feed-section"><div className="desktop-feed-section-head"><div><h2>{tabTitle(activeTab)}</h2><p>{activeTab === "categories" ? "Browse every connected SMAJ PI HUB service." : "Switch services without leaving your dashboard."}</p></div><Link to="/app/services">See all</Link></div><ServiceList services={tabServices(activeTab)} mode="desktop" /></section>}
  </div><aside className="desktop-feed-side"><section><strong>Need help?</strong><div>{support.map(([Icon, title, text, , to]) => <Link to={to} key={title}><Icon /><span><b>{title}</b><small>{text}</small></span></Link>)}</div></section><section><strong>Why SMAJ PI HUB?</strong><div>{why.map(([Icon, title, text]) => <article key={title}><Icon /><span><b>{title}</b><small>{text}</small></span></article>)}</div></section></aside></div>
  <section className="desktop-feed-experience"><div><p className="private-kicker">ONE SIMPLE EXPERIENCE</p><h2>Experience SMAJ PI HUB</h2><p>Everything connected in one simple experience.</p></div><div>{[["Discover", "Explore services in one place"], ["Connect", "Use services and manage activities"], ["Manage", "Your profile, wallet, and settings"]].map(([title, text], index) => <article key={title}><ServiceArt index={[0, 8, 14][index]} /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  <footer className="private-home-footer"><div><strong>SMAJ PI HUB</strong><p>Connecting everyday services in one platform.</p></div><nav><Link to="/about">About</Link><Link to="/app/services">Services</Link><Link to="/help">Help Center</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link><Link to="/cookies">Cookie Policy</Link><Link to="/report-abuse">Report Abuse</Link><Link to="/seller-agreement">Seller Agreement</Link><Link to="/contact">Contact</Link></nav><div><span>Part of the SMAJ Ecosystem</span><span>(c) 2026 SMAJ PI HUB. All rights reserved.</span></div></footer>
</div>;

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("for-you");
  return <main className="private-home"><DesktopFeedHome activeTab={activeTab} onTabChange={setActiveTab} /><MobileHome activeTab={activeTab} onTabChange={setActiveTab} /></main>;
};

export default DashboardPage;
