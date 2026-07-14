import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import ServiceArt from "../../components/ServiceArt";
import PrivateSkeleton from "../../components/PrivateSkeleton";
import PullToRefresh from "../../components/PullToRefresh";
import { useAuthContext } from "../../contexts/AuthContext";
import { serviceCatalog, type ServiceDefinition } from "../../content/serviceCatalog";
import { axiosClient } from "../../lib/axiosClient";
import { countryDisplayName } from "../../lib/formatters";
import type { Product } from "../../types/marketplace";

type DiscoveryTab = "for-you" | "trending" | "lifestyle" | "categories";

const why = [[PublicOutlinedIcon, "Access anywhere", "Access multiple digital services from anywhere you are."], [LockOutlinedIcon, "Simple access", "One account for your everyday needs."], [HubOutlinedIcon, "Connect everyone", "People, businesses, and opportunities connected together."], [RocketLaunchOutlinedIcon, "Built for the future", "A growing ecosystem designed for everyday life."]] as const;
const support = [[HelpOutlineOutlinedIcon, "Help Center", "Find guides and answers.", ["FAQs", "Guides", "Common questions"], "/help"], [ShieldOutlinedIcon, "Safety Center", "Use SMAJ PI HUB with confidence.", ["Privacy", "Account safety", "Reports", "Protection"], "/help"], [FeedbackOutlinedIcon, "Feedback", "Help improve SMAJ PI HUB.", ["Send ideas", "Report issues", "Share experience"], "/contact"]] as const;
const discoveryTabs = [["For you", "for-you"], ["Trending", "trending"], ["Lifestyle", "lifestyle"], ["Categories", "categories"]] as const;
const serviceRatings: Record<string, string> = { store: "4.8", food: "4.6", jobs: "4.5", education: "4.7", health: "4.6", transport: "4.4", agro: "4.3", energy: "4.5", charity: "4.9", housing: "4.4", events: "4.6", swap: "4.3", stream: "4.7", sports: "4.6", token: "4.5" };
const serviceHints: Record<string, string> = { store: "Shopping - Deals", food: "Eat - Delivery", jobs: "Work - Hire", education: "Learn - Skills", health: "Care - Doctors", transport: "Ride - Move", agro: "Farm - Trade", energy: "Power - Bills", charity: "Give - Help", housing: "Rent - Buy", events: "Tickets - Fun", swap: "Trade - Exchange", stream: "Watch - Videos", sports: "Play - Scores", token: "Rewards - Utility" };
const lifestyleSlugs = ["food", "health", "housing", "transport", "education", "charity", "events", "agro"];
const trendingSlugs = ["store", "stream", "sports", "events", "food", "jobs", "education", "health", "housing", "transport"];
const serviceGroups = Array.from({ length: 5 }, (_, index) => serviceCatalog.slice(index * 3, index * 3 + 3));
const popularSearches = ["Electronics", "Phones", "Food", "Cars", "Jobs", "Housing", "Health", "Education", "Transport"];
const trustedFallbackSellers = [
  { id: "beta-seller-1", name: "SMAJ Verified Market", location: "Global", rating: "4.8", listings: 12 },
  { id: "beta-seller-2", name: "Pi Community Deals", location: "UAE", rating: "4.7", listings: 8 },
  { id: "beta-seller-3", name: "Trusted Local Seller", location: "Africa", rating: "4.6", listings: 6 },
];
const betaActivity = [
  "New product listed in SMAJ Store",
  "New trusted seller joined the beta",
  "SMAJ Health service preview added",
  "Pi users are exploring services globally",
];
const trustIndicators = ["Pi verified users", "Reviewed listings", "Buyer/seller chat", "Safer marketplace support"];

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
type RecentItem = { label: string; to: string; meta?: string };
type SellerCard = { id: string; name: string; location: string; rating: string; listings: number };

const readRecentItems = (key: string) => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item?.label && item?.to).slice(0, 6) as RecentItem[] : [];
  } catch {
    return [];
  }
};

const sortNewestProducts = (products: Product[]) => [...products].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
const recommendedServicesForCountry = (country?: string) => {
  const normalized = countryDisplayName(country || "").toLowerCase();
  const localSlugs = normalized.includes("united arab emirates") || normalized.includes("uae") ? ["store", "transport", "food", "jobs", "housing", "health"] : ["store", "jobs", "education", "health", "transport", "housing"];
  return localSlugs.map((slug) => serviceCatalog.find((service) => service.slug === slug)).filter(Boolean) as ServiceDefinition[];
};

const SectionState = ({ loading, error, empty, children, skeleton = "grid" }: { loading?: boolean; error?: string; empty?: string; children: ReactNode; skeleton?: "grid" | "list" | "stats" }) => {
  if (loading) return <PrivateSkeleton variant={skeleton} count={skeleton === "list" ? 3 : 4} />;
  if (error) return <div className="private-state compact error"><h3>Could not load this section</h3><p>{error}</p></div>;
  if (empty) return <div className="private-state compact"><h3>{empty}</h3><p>As beta activity grows, this area will update automatically.</p></div>;
  return <>{children}</>;
};

const ContinueSection = ({ items, compact = false }: { items: RecentItem[]; compact?: boolean }) => (
  <section className={compact ? "mobile-feed-section beta-home-section" : "desktop-feed-section beta-home-section"}>
    <div className="desktop-feed-section-head mobile-section-heading"><div><h2>Continue Where You Left Off</h2><p>Recent services, products, and pages.</p></div></div>
    <SectionState empty={!items.length ? "No history yet" : ""} skeleton="list">
      <div className="beta-recent-list">{items.map((item) => <Link to={item.to} key={`${item.to}-${item.label}`}><strong>{item.label}</strong><span>{item.meta || "Open again"}</span></Link>)}</div>
    </SectionState>
  </section>
);

const PopularSearchSection = ({ compact = false }: { compact?: boolean }) => (
  <section className={compact ? "mobile-feed-section beta-home-section" : "desktop-feed-section beta-home-section"}>
    <div className="desktop-feed-section-head mobile-section-heading"><div><h2>Popular Searches</h2><p>Fast paths into marketplace and services.</p></div></div>
    <SectionState empty={!popularSearches.length ? "No popular searches yet" : ""}>
      <div className="beta-search-chips">{popularSearches.map((term) => <Link to={`/store?search=${encodeURIComponent(term)}`} key={term}>{term}</Link>)}</div>
    </SectionState>
  </section>
);

const RecentlyAddedSection = ({ products, loading, error, compact = false }: { products: Product[]; loading: boolean; error: string; compact?: boolean }) => (
  <section className={compact ? "mobile-feed-section beta-home-section" : "desktop-feed-section beta-home-section"}>
    <div className="desktop-feed-section-head mobile-section-heading"><div><h2>Recently Added</h2><p>Newest live listings and services.</p></div><Link to="/store">See all</Link></div>
    <SectionState loading={loading} error={error} empty={!products.length ? "No recent listings yet" : ""}>
      <div className="beta-product-strip">{products.slice(0, 6).map((product) => <Link to={`/product/${product._id}`} className="beta-product-card" key={product._id}>{product.image ? <img src={product.image} alt="" /> : <span /> }<strong>{product.title}</strong><small>{product.category} - {product.location || "Global"}</small></Link>)}</div>
    </SectionState>
  </section>
);

const FeaturedSellersSection = ({ sellers, loading, error, compact = false }: { sellers: SellerCard[]; loading: boolean; error: string; compact?: boolean }) => (
  <section className={compact ? "mobile-feed-section beta-home-section" : "desktop-feed-section beta-home-section"}>
    <div className="desktop-feed-section-head mobile-section-heading"><div><h2>Featured Sellers</h2><p>Trusted sellers active in beta.</p></div></div>
    <SectionState loading={loading} error={error} empty={!sellers.length ? "No featured sellers yet" : ""}>
      <div className="beta-seller-grid">{sellers.map((seller) => <article className="beta-seller-card" key={seller.id}><div><strong>{seller.name}</strong><span>{seller.location}</span></div><b>Trusted</b><small>{seller.rating} star - {seller.listings} listings</small></article>)}</div>
    </SectionState>
  </section>
);

const RecommendedSection = ({ services, compact = false }: { services: ServiceDefinition[]; compact?: boolean }) => (
  <section className={compact ? "mobile-feed-section beta-home-section" : "desktop-feed-section beta-home-section"}>
    <div className="desktop-feed-section-head mobile-section-heading"><div><h2>Recommended For You</h2><p>Based on your region and beta favorites.</p></div></div>
    <SectionState empty={!services.length ? "No recommendations yet" : ""}>
      <ServiceList services={services.slice(0, compact ? 4 : 6)} mode={compact ? "mobile" : "desktop"} />
    </SectionState>
  </section>
);

const ActivityFeedSection = ({ products, loading, error, compact = false }: { products: Product[]; loading: boolean; error: string; compact?: boolean }) => {
  const activity = products.slice(0, 3).map((product) => `New product listed: ${product.title}`).concat(betaActivity).slice(0, 5);
  return <section className={compact ? "mobile-feed-section beta-home-section" : "desktop-feed-section beta-home-section"}>
    <div className="desktop-feed-section-head mobile-section-heading"><div><h2>Live Activity</h2><p>What is moving across SMAJ PI HUB.</p></div></div>
    <SectionState loading={loading} error={error} empty={!activity.length ? "No live activity yet" : ""} skeleton="list">
      <div className="beta-activity-list">{activity.map((item) => <article key={item}><span />{item}</article>)}</div>
    </SectionState>
  </section>;
};

const TrustSection = ({ compact = false }: { compact?: boolean }) => (
  <section className={compact ? "mobile-feed-section beta-home-section" : "desktop-feed-section beta-home-section"}>
    <div className="desktop-feed-section-head mobile-section-heading"><div><h2>Trust Indicators</h2><p>Signals that help keep beta safer.</p></div></div>
    <SectionState empty={!trustIndicators.length ? "No trust indicators yet" : ""} skeleton="stats">
      <div className="beta-trust-grid">{trustIndicators.map((item) => <article key={item}><ShieldOutlinedIcon /><strong>{item}</strong></article>)}</div>
    </SectionState>
  </section>
);

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

const MobileHome = ({ activeTab, onTabChange, products, productsLoading, productsError, sellers, recentItems, recommendedServices }: { activeTab: DiscoveryTab; onTabChange: (tab: DiscoveryTab) => void; products: Product[]; productsLoading: boolean; productsError: string; sellers: SellerCard[]; recentItems: RecentItem[]; recommendedServices: ServiceDefinition[] }) => {
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
    <section className="mobile-home-hero"><div className="mobile-home-hero-copy"><span>WELCOME TO</span><h1>SMAJ PI HUB</h1><p>Everything you need. One place.</p><div className="mobile-hero-icons">{serviceCatalog.slice(0, 3).map((service) => <ServiceArt key={service.slug} index={service.atlasIndex} />)}<b>+12</b></div><Link to="/app/services">Explore <ArrowForwardOutlinedIcon /></Link></div></section>
    <div ref={tabsAnchorRef} className={`mobile-home-tabs-anchor ${tabsPinned ? "is-pinned" : ""}`}><DiscoveryTabButtons className="mobile-home-tabs" activeTab={activeTab} onTabChange={onTabChange} /></div>
    <ContinueSection compact items={recentItems} />
    <PopularSearchSection compact />
    <RecentlyAddedSection compact products={products} loading={productsLoading} error={productsError} />
    <FeaturedSellersSection compact sellers={sellers} loading={productsLoading} error={productsError} />
    <RecommendedSection compact services={recommendedServices} />
    <ActivityFeedSection compact products={products} loading={productsLoading} error={productsError} />
    <TrustSection compact />
    {activeTab === "for-you" ? <>
      <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Suggested for you</h2><Link to="/app/services">See all</Link></div><div className="mobile-service-groups">{serviceGroups.map((group, index) => <div className="mobile-service-group" key={index}>{group.map((service) => <Link to={servicePath(service)} className="mobile-service-app" key={service.slug}><ServiceArt index={service.atlasIndex} /><div><strong>{service.name}</strong><span>{service.items.slice(0, 2).join(" - ")}</span><small className={service.live ? "live-rating-badge" : undefined}>{service.live ? "LIVE" : `${serviceRatings[service.slug]} star`}</small></div></Link>)}</div>)}</div></section>
      <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Discover what's new</h2></div><div className="mobile-feature-strip">{featureCards.map((card) => <Link className="mobile-feature-card" to={card.slug === "store" ? "/store" : `/app/services/${card.slug}`} key={card.slug}><img src={card.image} alt="" />{card.slug === "store" ? <b className="live-card-badge feature-live-badge">LIVE</b> : null}<div><h3>{card.title}</h3><p>{card.text}</p><span>Explore <ArrowForwardOutlinedIcon /></span></div></Link>)}</div></section>
      {mediaSections.map((section) => <section className="mobile-feed-section" key={section.slug}><div className="mobile-section-heading"><h2>{section.title}</h2></div><div className="mobile-media-strip">{section.items.map((item, index) => <Link to={`/app/services/${section.slug}`} className="mobile-media-card" key={item}><img src={section.image} alt="" /><div>{section.badges ? <b>{section.badges[index]}</b> : null}<span>{item}</span><small>{section.slug === "stream" ? "SMAJ Stream" : section.slug === "sports" ? "SMAJ Sports" : "SMAJ Events"}</small></div></Link>)}</div></section>)}
      <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Need help?</h2></div><div className="mobile-help-grid">{support.map(([Icon, title, , items, to]) => <Link to={to} key={title}><Icon /><div><strong>{title}</strong><span>{items.slice(0, 3).join(" - ")}</span></div><ArrowForwardOutlinedIcon /></Link>)}</div></section>
    </> : <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>{tabTitle(activeTab)}</h2><Link to="/app/services">See all</Link></div><ServiceList services={tabServices(activeTab)} mode="mobile" /></section>}
    <footer className="mobile-private-footer"><small>Part of the SMAJ Ecosystem</small><small>(c) 2026 SMAJ PI HUB. All rights reserved.</small></footer>
  </div>;
};

const DesktopFeedHome = ({ activeTab, onTabChange, products, productsLoading, productsError, sellers, recentItems, recommendedServices }: { activeTab: DiscoveryTab; onTabChange: (tab: DiscoveryTab) => void; products: Product[]; productsLoading: boolean; productsError: string; sellers: SellerCard[]; recentItems: RecentItem[]; recommendedServices: ServiceDefinition[] }) => <div className="desktop-private-home desktop-feed-home">
  <section className="desktop-feed-hero"><div><p className="private-kicker">SMAJ PI HUB</p><h1>Everything you need.<br />One place.</h1><p>Discover services, products, media, support, and everyday tools from one connected dashboard.</p><div className="desktop-feed-hero-actions"><Link className="private-primary-button" to="/app/services">Explore Services <ArrowForwardOutlinedIcon /></Link><Link className="private-secondary-button" to="/store">Open SMAJ Store</Link></div></div><div className="desktop-feed-hero-icons">{serviceCatalog.slice(0, 6).map((service) => <Link key={service.slug} to={servicePath(service)} title={service.name}><ServiceArt index={service.atlasIndex} />{service.live ? <em>LIVE</em> : null}</Link>)}</div></section>
  <DiscoveryTabButtons className="desktop-feed-tabs" activeTab={activeTab} onTabChange={onTabChange} />
  <div className="desktop-feed-priority-grid">
    <ContinueSection items={recentItems} />
    <PopularSearchSection />
  </div>
  <RecentlyAddedSection products={products} loading={productsLoading} error={productsError} />
  <div className="desktop-feed-priority-grid">
    <FeaturedSellersSection sellers={sellers} loading={productsLoading} error={productsError} />
    <TrustSection />
  </div>
  <div className="desktop-feed-layout"><div className="desktop-feed-main">
    <RecommendedSection services={recommendedServices} />
    <ActivityFeedSection products={products} loading={productsLoading} error={productsError} />
    {activeTab === "for-you" ? <>
      <section className="desktop-feed-section"><div className="desktop-feed-section-head"><div><h2>Suggested for you</h2><p>Fast access to the core SMAJ services.</p></div><Link to="/app/services">See all</Link></div><ServiceList services={serviceCatalog.slice(0, 6)} mode="desktop" /></section>
      <section className="desktop-feed-section"><div className="desktop-feed-section-head"><div><h2>Discover what's new</h2><p>Fresh entry points into useful services.</p></div></div><div className="desktop-feature-grid">{featureCards.map((card) => <Link className="desktop-feature-card" to={card.slug === "store" ? "/store" : `/app/services/${card.slug}`} key={card.slug}><img src={card.image} alt="" />{card.slug === "store" ? <b className="live-card-badge feature-live-badge">LIVE</b> : null}<div><h3>{card.title}</h3><p>{card.text}</p><span>Explore <ArrowForwardOutlinedIcon /></span></div></Link>)}</div></section>
      {mediaSections.map((section) => <section className="desktop-feed-section" key={section.slug}><div className="desktop-feed-section-head"><div><h2>{section.title}</h2><p>{section.slug === "stream" ? "Entertainment picks across the ecosystem." : section.slug === "sports" ? "Scores, activities, and sports communities." : "Tickets, events, and local experiences."}</p></div></div><div className="desktop-media-grid">{section.items.map((item, index) => <Link to={`/app/services/${section.slug}`} className="desktop-media-card" key={item}><img src={section.image} alt="" /><div>{section.badges ? <b>{section.badges[index]}</b> : null}<span>{item}</span><small>{section.slug === "stream" ? "SMAJ Stream" : section.slug === "sports" ? "SMAJ Sports" : "SMAJ Events"}</small></div></Link>)}</div></section>)}
    </> : <section className="desktop-feed-section"><div className="desktop-feed-section-head"><div><h2>{tabTitle(activeTab)}</h2><p>{activeTab === "categories" ? "Browse every connected SMAJ PI HUB service." : "Switch services without leaving your dashboard."}</p></div><Link to="/app/services">See all</Link></div><ServiceList services={tabServices(activeTab)} mode="desktop" /></section>}
  </div><aside className="desktop-feed-side"><section><strong>Need help?</strong><div>{support.map(([Icon, title, text, , to]) => <Link to={to} key={title}><Icon /><span><b>{title}</b><small>{text}</small></span></Link>)}</div></section><section><strong>Why SMAJ PI HUB?</strong><div>{why.map(([Icon, title, text]) => <article key={title}><Icon /><span><b>{title}</b><small>{text}</small></span></article>)}</div></section></aside></div>
  <section className="desktop-feed-experience"><div><p className="private-kicker">ONE SIMPLE EXPERIENCE</p><h2>Experience SMAJ PI HUB</h2><p>Everything connected in one simple experience.</p></div><div>{[["Discover", "Explore services in one place"], ["Connect", "Use services and manage activities"], ["Manage", "Your profile, wallet, and settings"]].map(([title, text], index) => <article key={title}><ServiceArt index={[0, 8, 14][index]} /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  <footer className="private-home-footer"><span>Part of the SMAJ Ecosystem</span><span>(c) 2026 SMAJ PI HUB. All rights reserved.</span></footer>
</div>;

const DashboardPage = () => {
  const { user } = useAuthContext();
  const [params, setParams] = useSearchParams();
  const initialTab = discoveryTabs.some(([, tab]) => tab === params.get("tab")) ? params.get("tab") as DiscoveryTab : "for-you";
  const [activeTab, setActiveTabState] = useState<DiscoveryTab>(initialTab);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const setActiveTab = useCallback((tab: DiscoveryTab) => {
    setActiveTabState(tab);
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (tab === "for-you") next.delete("tab");
      else next.set("tab", tab);
      return next;
    }, { replace: true });
  }, [setParams]);
  const loadProducts = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setProductsLoading(true);
    try {
      const { data } = await axiosClient.get<{ products: Product[] }>("/marketplace/products");
      setProducts(sortNewestProducts(data.products || []));
      setProductsError("");
    } catch {
      setProducts([]);
      setProductsError("Live marketplace data is not available right now.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    setRecentItems([
      ...readRecentItems("smaj_recent_products"),
      ...readRecentItems("smaj_recent_services"),
      ...readRecentItems("smaj_recent_pages"),
    ].filter((item, index, items) => items.findIndex((candidate) => candidate.to === item.to) === index).slice(0, 6));
  }, []);

  useEffect(() => {
    const nextTab = discoveryTabs.some(([, tab]) => tab === params.get("tab")) ? params.get("tab") as DiscoveryTab : "for-you";
    setActiveTabState(nextTab);
  }, [params]);

  useEffect(() => {
    void loadProducts(true);
  }, [loadProducts]);

  const sellers = useMemo(() => {
    const map = new Map<string, SellerCard>();
    products.forEach((product) => {
      if (!product.sellerId) return;
      const existing = map.get(product.sellerId);
      if (existing) {
        existing.listings += 1;
        return;
      }
      map.set(product.sellerId, {
        id: product.sellerId,
        name: product.sellerName || product.piUsername || "Pi seller",
        location: product.location || product.country || "Global",
        rating: (product.rating || 4.6).toFixed(1),
        listings: 1,
      });
    });
    const realSellers = Array.from(map.values()).sort((a, b) => b.listings - a.listings).slice(0, 4);
    return realSellers.length ? realSellers : trustedFallbackSellers;
  }, [products]);

  const recommendedServices = useMemo(() => recommendedServicesForCountry(user?.country), [user?.country]);

  if (productsLoading) {
    return <main className="private-home"><PrivateSkeleton variant="home" count={6} /></main>;
  }

  return <main className="private-home"><PullToRefresh onRefresh={() => loadProducts(false)} /><DesktopFeedHome activeTab={activeTab} onTabChange={setActiveTab} products={products} productsLoading={productsLoading} productsError={productsError} sellers={sellers} recentItems={recentItems} recommendedServices={recommendedServices} /><MobileHome activeTab={activeTab} onTabChange={setActiveTab} products={products} productsLoading={productsLoading} productsError={productsError} sellers={sellers} recentItems={recentItems} recommendedServices={recommendedServices} /></main>;
};

export default DashboardPage;
