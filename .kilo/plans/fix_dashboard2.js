const fs = require('fs');
const filepath = 'C:\\Users\\Tine\\Desktop\\smajpihub\\frontend\\src\\pages\\private\\DashboardPage.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const components = `
const TrendingMobileContent = ({ products, productsLoading, productsError, sellers, recentItems, recommendedServices, streamRows, streamLoading, sportsCatalog, sportsLoading }: { products: Product[]; productsLoading: boolean; productsError: string; sellers: SellerCard[]; recentItems: RecentItem[]; recommendedServices: ServiceDefinition[]; streamRows: DashboardStreamRow[]; streamLoading: boolean; sportsCatalog: SportsCatalog; sportsLoading: boolean }) => (
  <>
    <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Trending services</h2><Link to="/app/services">See all</Link></div><ServiceList services={trendingSlugs.map((slug) => serviceCatalog.find((service) => service.slug === slug)).filter(Boolean) as ServiceDefinition[]} mode="mobile" /></section>
    <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Popular searches</h2></div><div className="mobile-suggestion-grid">{popularSearches.map((item) => <Link to={\`/store?search=\${encodeURIComponent(item)}\`} key={item}><span>{item}</span><SearchOutlinedIcon /></Link>)}</div></section>
    <DashboardStreamSections rows={streamRows.filter((row) => row.title === "Trending now")} loading={streamLoading} compact />
    <DashboardSportsSection catalog={sportsCatalog} loading={sportsLoading} compact />
    <RecentlyAddedSection compact products={products.slice(0, 3)} loading={productsLoading} error={productsError} />
    <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Events happening now</h2><Link to="/app/services/events">See all</Link></div><div className="mobile-media-strip">{mediaSections.filter((section) => section.slug === "events").map((section) => section.items.slice(0, 3).map((item, index) => <Link to={\`/app/services/\${section.slug}\`} className="mobile-media-card" key={item}><img src={section.image} alt="" /><div>{section.badges ? <b>{section.badges[index]}</b> : null}<span>{item}</span><small>SMAJ Events</small></div></Link>))}</div></section>
  </>
);

const LifestyleMobileContent = ({ products, productsLoading, productsError, sellers, recentItems, recommendedServices, streamRows, streamLoading, sportsCatalog, sportsLoading }: { products: Product[]; productsLoading: boolean; productsError: string; sellers: SellerCard[]; recentItems: RecentItem[]; recommendedServices: ServiceDefinition[]; streamRows: DashboardStreamRow[]; streamLoading: boolean; sportsCatalog: SportsCatalog; sportsLoading: boolean }) => (
  <>
    <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Lifestyle services</h2><Link to="/app/services">See all</Link></div><ServiceList services={lifestyleSlugs.map((slug) => serviceCatalog.find((service) => service.slug === slug)).filter(Boolean) as ServiceDefinition[]} mode="mobile" /></section>
    <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Pick up where you left off</h2></div><div className="mobile-recent-strip">{recentItems.filter((item) => lifestyleSlugs.some((slug) => item.to.includes(slug))).slice(0, 3).map((item) => <Link className="mobile-recent-card" to={item.to} key={\`\${item.to}-\${item.label}\`}><span className="mobile-recent-icon">{recentItemIcon(item.to)}</span><ChevronRightOutlinedIcon className="mobile-recent-arrow" /><strong>{item.label}</strong><small>{item.meta && item.meta !== "Recent page" ? item.meta : "Recently viewed"}</small></Link>)}</div></section>
    <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Featured providers</h2></div><div className="mobile-services-grid">{sellers.slice(0, 3).map((seller) => <Link to={\`/seller/\${seller.id}\`} key={seller.id}><div><strong>{seller.name}</strong><small>{seller.location}</small></div><small>{seller.rating} star • {seller.listings} listings</small></Link>)}</div></section>
    <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>Health & education</h2></div><div className="mobile-feature-strip">{featureCards.filter((card) => card.slug === "health" || card.slug === "education").map((card) => <Link className="mobile-feature-card" to={card.slug === "store" ? "/store" : \`/app/services/\${card.slug}\`} key={card.slug}><img src={card.image} alt="" /><div><h3>{card.title}</h3><p>{card.text}</p><span>Explore <ArrowForwardOutlinedIcon /></span></div></Link>)}</div></section>
  </>
);

const CategoriesMobileContent = ({ products, productsLoading, productsError, sellers, recentItems, recommendedServices, streamRows, streamLoading, sportsCatalog, sportsLoading }: { products: Product[]; productsLoading: boolean; productsError: string; sellers: SellerCard[]; recentItems: RecentItem[]; recommendedServices: ServiceDefinition[]; streamRows: DashboardStreamRow[]; streamLoading: boolean; sportsCatalog: SportsCatalog; sportsLoading: boolean }) => (
  <>
    <section className="mobile-feed-section"><div className="mobile-section-heading"><h2>All services</h2><Link to="/app/services">See all</Link></div><ServiceList services={serviceCatalog} mode="mobile" /></section>
    {categoryGroups.map((group) => <section className="mobile-feed-section" key={group.title}><div className="mobile-section-heading"><h2>{group.title}</h2></div><div className="mobile-services-grid">{group.slugs.map((slug) => { const service = serviceCatalog.find((s) => s.slug === slug); if (!service) return null; return <Link key={service.slug} to={servicePath(service)} className="mobile-service-app"><ServiceArt index={service.atlasIndex} /><div><strong>{service.name}</strong><span>{service.items.slice(0, 2).join(" - ")}</span><small className={service.live ? "live-rating-badge" : undefined}>{service.live ? "LIVE" : \`\${serviceRatings[service.slug]} star\`}</small></div></Link>; })}</div></section>)}
  </>
);
`;

const marker = 'const DashboardStreamSections';
const idx = content.indexOf(marker);
if (idx !== -1) {
  content = content.slice(0, idx) + components + '\n' + content.slice(idx);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('MARKER NOT FOUND');
}
