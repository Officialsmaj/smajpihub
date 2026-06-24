import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { axiosClient } from "../../lib/axiosClient";
import MarketplaceProductCard from "../../components/MarketplaceProductCard";
import { addToCart, setBuyNowItem } from "../../lib/storeCart";
import type { Product } from "../../types/marketplace";
import {
  categoryGroups,
  footerColumns,
  heroSlides,
  homeSections,
  infoItems,
  popularSearches,
  promoStripItems,
  storeCategoryShowcases,
  storeOfferCards,
  storeTopNav,
  vehicleTiles,
} from "../../content/storefront";
import logoImage from "/logo.png";

const STORE_CATEGORIES = ["Deals", "Grocery", "Electronics", "Mobiles", "Laptops", "Fashion", "Beauty", "Home", "Vehicles", "Accessories"];
const mobileMenuCategories = ["Electronics", "Women's Fashion", "Men's Fashion", "Kids Fashion", "Home, Kitchen & Appliances", "Beauty & Fragrance", "Toys", "Baby", "Health & Nutrition"];
const electronicsSubcategories = ["Mobiles & Accessories", "iPhone 17 Series", "Laptops & Accessories", "Gaming Essentials", "TVs & Home Entertainment", "Cameras", "All Electronics"];

const scrollRail = (target: HTMLDivElement | null, direction: "left" | "right") => {
  if (!target) return;
  target.scrollBy({ left: direction === "left" ? -target.clientWidth * 0.9 : target.clientWidth * 0.9, behavior: "smooth" });
};

const pickProducts = (products: Product[], section: { category?: string; search?: string }, count = 12) => {
  const filtered = products.filter((product) => (!section.category || product.category === section.category) && (!section.search || [product.title, product.category, product.description, product.sellerName].join(" ").toLowerCase().includes(section.search.toLowerCase())));
  return (filtered.length ? filtered : products).slice(0, count);
};

const StorePage = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [heroIndex, setHeroIndex] = useState(0);
  const [categoryPage, setCategoryPage] = useState(0);
  const [infoOpen, setInfoOpen] = useState<string>(infoItems[0].title);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuPanel, setMobileMenuPanel] = useState<"categories" | "electronics">("categories");
  const vehiclesRef = useRef<HTMLDivElement>(null);
  const railRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    Promise.all([
      axiosClient.get<{ latest?: Product[]; recommended?: Product[]; savedIds?: string[]; products?: Product[] }>("/marketplace/feed"),
      axiosClient.get<{ products: Product[] }>("/marketplace/products"),
      axiosClient.get<{ products: Product[] }>("/marketplace/saved").catch(() => null),
    ]).then(([feed, all, saved]) => {
      const live = feed?.data?.latest?.length ? [...(feed.data.recommended || []), ...(feed.data.latest || [])] : all?.data?.products || [];
      const unique = Array.from(new Map(live.map((item) => [item._id, item])).values());
      setProducts(unique);
      setSavedIds(feed?.data?.savedIds || saved?.data?.products.map((item) => item._id) || []);
      setCatalogError(live.length ? "" : "No live products are available yet. Add a seller product to open the marketplace.");
    }).catch(() => {
      setProducts([]);
      setSavedIds([]);
      setCatalogError("SMAJ Store cannot reach the live catalog. Check the backend, MongoDB, session, and CORS settings.");
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroIndex((value) => (value + 1) % heroSlides.length), 4800);
    return () => window.clearInterval(timer);
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => (category === "All" || product.category === category) && (!query || [product.title, product.category, product.description, product.sellerName].join(" ").toLowerCase().includes(query)));
  }, [category, products, search]);

  const homepageProducts = visibleProducts.length ? visibleProducts : products;
  const showSearchResults = Boolean(search.trim()) || category !== "All";
  const activeCategoryItems = categoryGroups[categoryPage]?.items || [];
  const dealCards = [
    { title: "Best Deals", body: "Sharp Pi prices on everyday picks." },
    { title: "New Arrivals", body: "Fresh drops from SMAJ sellers." },
    { title: "Top Rated", body: "Best reviewed products this week." },
    { title: "Verified Sellers", body: "Shop with trusted Pi merchants." },
  ];

  const setRailRef = (key: string, node: HTMLDivElement | null) => {
    railRefs.current[key] = node;
  };

  const toggleFavorite = async (product: Product) => {
    const { data } = await axiosClient.post<{ saved: boolean }>(`/marketplace/products/${product._id}/favorite`);
    setSavedIds((current) => data.saved ? [...new Set([...current, product._id])] : current.filter((id) => id !== product._id));
  };

  const goToCheckout = (product: Product) => {
    setBuyNowItem(product);
    navigate("/checkout");
  };

  const addProductToCart = (product: Product) => {
    addToCart(product);
    navigate("/cart", { state: { message: `${product.title} added to cart.` } });
  };

  const updateCategory = (value: string) => {
    setCategory(value);
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value === "All") next.delete("category");
      else next.set("category", value);
      return next;
    });
  };

  const chooseMobileCategory = (value: string) => {
    if (value === "Electronics") {
      setMobileMenuPanel("electronics");
      return;
    }
    setSearch(value);
    if (STORE_CATEGORIES.includes(value)) updateCategory(value);
    setMobileMenuOpen(false);
  };

  const chooseElectronicsSubcategory = (value: string) => {
    setSearch(value);
    updateCategory("Electronics");
    setMobileMenuOpen(false);
    setMobileMenuPanel("categories");
  };

  return (
    <main className="private-page storefront-page">
      <section className="storefront-shell">
        <header className="storefront-header">
          <div className="storefront-header-main">
            <Link to="/store" className="storefront-brand storefront-brand-link">
              <strong>SMAJ Store</strong>
            </Link>
            <button type="button" className="storefront-location storefront-location-button" onClick={() => setSearch("Lagos")}>
              <LocationOnOutlinedIcon />
              <span>Location</span>
              <KeyboardArrowDownOutlinedIcon className="storefront-location-chevron" />
            </button>
            <label className="storefront-search">
              <SearchOutlinedIcon />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search in SMAJ Store..." />
            </label>
            <nav className="storefront-quick-links">
              <Link to="/orders"><span>Orders</span></Link>
              <Link to="/saved"><span>Wishlist</span></Link>
              <Link to="/cart"><span>Cart</span></Link>
              <Link to="/profile"><span>Profile</span></Link>
            </nav>
          </div>

          <div className="storefront-mobile-top">
            <button type="button" className="storefront-mobile-menu-button" aria-label="Open categories menu" onClick={() => { setMobileMenuPanel("categories"); setMobileMenuOpen(true); }}>
              <MenuOutlinedIcon />
            </button>
            <Link to="/store" className="storefront-mobile-logo" aria-label="SMAJ Store">
              <img src={logoImage} alt="SMAJ Store" />
            </Link>
            <div className="storefront-mobile-actions">
              <Link to="/cart" aria-label="Cart"><ShoppingCartOutlinedIcon /></Link>
              <Link to="/profile" aria-label="Profile"><span>P</span></Link>
            </div>
          </div>

          <label className="storefront-search storefront-mobile-search">
            <SearchOutlinedIcon />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search in SMAJ Store..." />
          </label>

          <nav className="storefront-category-nav">
            {storeTopNav.map((item) => (
              <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => updateCategory(item === "More" ? "All" : item)}>
                {item}
              </button>
            ))}
          </nav>

          {mobileMenuOpen ? (
            <div className="storefront-mobile-drawer-wrap">
              <button type="button" className="storefront-mobile-drawer-backdrop" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />
              <aside className="storefront-mobile-drawer" aria-label="SMAJ Store categories menu">
                <div className="storefront-mobile-drawer-panels" style={{ transform: mobileMenuPanel === "electronics" ? "translateX(-50%)" : "translateX(0)" }}>
                  <section className="storefront-mobile-drawer-panel">
                    <header>
                      <Link to="/store" aria-label="SMAJ Store" onClick={() => setMobileMenuOpen(false)}><img src={logoImage} alt="SMAJ Store" /></Link>
                      <button type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><CloseOutlinedIcon /></button>
                    </header>
                    <h3>Categories</h3>
                    <nav>
                      {mobileMenuCategories.map((item) => (
                        <button type="button" key={item} onClick={() => chooseMobileCategory(item)}>
                          <span>{item}</span>
                          <ArrowForwardIosOutlinedIcon />
                        </button>
                      ))}
                    </nav>
                  </section>
                  <section className="storefront-mobile-drawer-panel">
                    <header>
                      <button type="button" className="storefront-mobile-drawer-back" aria-label="Back to categories" onClick={() => setMobileMenuPanel("categories")}><ArrowBackIosNewOutlinedIcon /></button>
                      <h3>Electronics</h3>
                      <button type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><CloseOutlinedIcon /></button>
                    </header>
                    <nav>
                      {electronicsSubcategories.map((item) => (
                        <button type="button" key={item} onClick={() => chooseElectronicsSubcategory(item)}>
                          <span>{item}</span>
                          <ArrowForwardIosOutlinedIcon />
                        </button>
                      ))}
                    </nav>
                  </section>
                </div>
              </aside>
            </div>
          ) : null}
        </header>

        <section className="storefront-promo-strip" aria-label="Store benefits">
          <div>{[...promoStripItems, ...promoStripItems, ...promoStripItems].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
        </section>

        <section className="storefront-hero">
          <button type="button" className="storefront-arrow left" onClick={() => setHeroIndex((value) => (value - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous banner"><ArrowBackIosNewOutlinedIcon /></button>
          <div className="storefront-hero-track" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
            {heroSlides.map((slide) => (
              <article className="storefront-hero-slide" key={slide.title}>
                <img src={slide.image} alt={slide.title} />
                <div>
                  <span>SMAJ Store</span>
                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>
                  <button type="button" onClick={() => setSearch(slide.search)}>Shop now</button>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="storefront-arrow right" onClick={() => setHeroIndex((value) => (value + 1) % heroSlides.length)} aria-label="Next banner"><ArrowForwardIosOutlinedIcon /></button>
          <div className="storefront-hero-dots">{heroSlides.map((slide, index) => <button type="button" key={slide.title} className={heroIndex === index ? "active" : ""} onClick={() => setHeroIndex(index)} aria-label={`Go to ${slide.title}`} />)}</div>
        </section>

        <section className="storefront-carousel-section storefront-browse-section">
          <div className="storefront-section-head">
            <div><h2>Browse by category</h2><p>Real products across every SMAJ Store department.</p></div>
          </div>
          <div className="storefront-category-page">
            <button type="button" className="storefront-browse-arrow left" disabled={categoryPage === 0} onClick={() => setCategoryPage((value) => Math.max(0, value - 1))} aria-label="Show previous categories"><ArrowBackIosNewOutlinedIcon /></button>
            <div className="storefront-category-rail storefront-category-rail-grid">
              {activeCategoryItems.map((tile) => (
                <button type="button" key={tile.name} className="storefront-category-card storefront-browse-card" onClick={() => { if (tile.search) setSearch(tile.search); if (STORE_CATEGORIES.includes(tile.name)) updateCategory(tile.name); }}>
                  <img src={tile.image} alt={tile.name} />
                  <strong>{tile.name}</strong>
                  <span>{tile.hint}</span>
                </button>
              ))}
            </div>
            <button type="button" className="storefront-browse-arrow right" disabled={categoryPage === categoryGroups.length - 1} onClick={() => setCategoryPage((value) => Math.min(categoryGroups.length - 1, value + 1))} aria-label="Show next categories"><ArrowForwardIosOutlinedIcon /></button>
            <div className="storefront-category-pager" aria-label="Category pages">
              {categoryGroups.map((group, index) => (
                <button type="button" key={group.id} className={index === categoryPage ? "active" : ""} aria-label={`Open category page ${index + 1}`} onClick={() => setCategoryPage(index)} />
              ))}
            </div>
          </div>
        </section>

        <section className="storefront-deal-grid">
          {dealCards.map((card) => <article key={card.title}><strong>{card.title}</strong><p>{card.body}</p></article>)}
        </section>

        {catalogError ? <div className="private-alert error">{catalogError}</div> : null}
        {loading ? <div className="private-state">Loading SMAJ Store...</div> : null}
        {!loading && !products.length ? (
          <section className="private-state">
            <h2>Live catalog is empty</h2>
            <p>Add the first seller product or reconnect the backend catalog before testing checkout.</p>
            <div className="form-actions">
              <Link className="private-primary-button" to="/add-product">Add Product</Link>
              <Link className="private-secondary-button" to="/seller">Open Seller Dashboard</Link>
            </div>
          </section>
        ) : null}

        {!loading ? (
          <>
            {products.length ? homeSections.filter((section) => section.title !== "Vehicle Deals").map((section) => {
              const sectionProducts = pickProducts(homepageProducts, section);
              return (
                <section className="storefront-product-section" key={section.title}>
                  <div className="storefront-section-head">
                    <div><h2>{section.title}</h2>{section.subtitle ? <p>{section.subtitle}</p> : null}</div>
                    <button type="button" className="section-view-all" onClick={() => { if (section.search) setSearch(section.search); if (section.category) updateCategory(section.category); }}>View All</button>
                  </div>
                  <div className="storefront-product-rail" ref={(node) => setRailRef(section.title, node)}>
                    {sectionProducts.map((product) => (
                      <MarketplaceProductCard
                        key={`${section.title}-${product._id}`}
                        product={product}
                        saved={savedIds.includes(product._id)}
                        onFavorite={(item) => void toggleFavorite(item)}
                        onAddToCart={addProductToCart}
                        onBuy={goToCheckout}
                      />
                    ))}
                  </div>
                  <div className="storefront-inline-arrows">
                    <button type="button" onClick={() => scrollRail(railRefs.current[section.title], "left")} aria-label={`Scroll ${section.title} left`}><ArrowBackIosNewOutlinedIcon /></button>
                    <button type="button" onClick={() => scrollRail(railRefs.current[section.title], "right")} aria-label={`Scroll ${section.title} right`}><ArrowForwardIosOutlinedIcon /></button>
                  </div>
                </section>
              );
            }) : null}

            <section className="storefront-carousel-section">
              <div className="storefront-section-head">
                <div><h2>Maximize your savings</h2><p>Real products, rotating offers, and Pi-friendly value.</p></div>
              </div>
              <div className="storefront-offer-rail" ref={(node) => setRailRef("offers", node)}>
                {storeOfferCards.map((offer) => (
                  <button type="button" key={offer.title} className="storefront-offer-card" onClick={() => setSearch(offer.search)}>
                    <img src={offer.image} alt={offer.title} />
                    <strong>{offer.title}</strong>
                    <span>{offer.description}</span>
                  </button>
                ))}
              </div>
              <div className="storefront-inline-arrows">
                <button type="button" onClick={() => scrollRail(railRefs.current.offers, "left")} aria-label="Scroll offers left"><ArrowBackIosNewOutlinedIcon /></button>
                <button type="button" onClick={() => scrollRail(railRefs.current.offers, "right")} aria-label="Scroll offers right"><ArrowForwardIosOutlinedIcon /></button>
              </div>
            </section>

            <section className="storefront-carousel-section">
              <div className="storefront-section-head">
                <div><h2>Vehicle Deals</h2><p>Cars, bikes, trucks, ships, airplanes, and helicopters.</p></div>
                <div className="storefront-arrow-pair">
                  <button type="button" onClick={() => scrollRail(vehiclesRef.current, "left")} aria-label="Scroll vehicles left"><ArrowBackIosNewOutlinedIcon /></button>
                  <button type="button" onClick={() => scrollRail(vehiclesRef.current, "right")} aria-label="Scroll vehicles right"><ArrowForwardIosOutlinedIcon /></button>
                </div>
              </div>
              <div className="storefront-category-rail vehicle-rail" ref={vehiclesRef}>
                {[...vehicleTiles, ...vehicleTiles].map((tile, index) => (
                  <button type="button" key={`${tile.name}-${index}`} className="storefront-category-card vehicle-card" onClick={() => { updateCategory("Vehicles"); setSearch(tile.search || tile.name); }}>
                    <img src={tile.image} alt={tile.name} />
                    <strong>{tile.name}</strong>
                    <span>{tile.hint}</span>
                  </button>
                ))}
              </div>
            </section>

            {storeCategoryShowcases.map((section) => (
              <section className="storefront-carousel-section" key={section.title}>
                <div className="storefront-section-head">
                  <div><h2>{section.title}</h2><p>Browse curated picks in this department.</p></div>
                  <button type="button" className="section-view-all" onClick={() => setSearch(section.title)}>View All</button>
                </div>
                <div className="storefront-showcase-rail" ref={(node) => setRailRef(section.title, node)}>
                  {section.items.map((item) => (
                    <button type="button" key={`${section.title}-${item.name}`} className="storefront-showcase-card" onClick={() => setSearch(item.search || item.name)}>
                      <img src={item.image} alt={item.name} />
                      <strong>{item.name}</strong>
                      <span>{item.hint}</span>
                    </button>
                  ))}
                </div>
                <div className="storefront-inline-arrows">
                  <button type="button" onClick={() => scrollRail(railRefs.current[section.title], "left")} aria-label={`Scroll ${section.title} left`}><ArrowBackIosNewOutlinedIcon /></button>
                  <button type="button" onClick={() => scrollRail(railRefs.current[section.title], "right")} aria-label={`Scroll ${section.title} right`}><ArrowForwardIosOutlinedIcon /></button>
                </div>
              </section>
            ))}

            <section className="storefront-info">
              <div className="storefront-section-head">
                <div><h2>Popular searches</h2><p>Jump straight into what SMAJ shoppers are browsing.</p></div>
              </div>
              <div className="popular-search-chips">
                {popularSearches.map((term) => <button type="button" key={term} onClick={() => setSearch(term)}>{term}</button>)}
              </div>
            </section>

            <section className="storefront-info">
              <div className="storefront-section-head">
                <div><h2>Store information</h2><p>Pi payment only, built inside the SMAJ PI HUB ecosystem.</p></div>
              </div>
              <div className="storefront-accordion">
                {infoItems.map((item) => (
                  <article key={item.title}>
                    <button type="button" className={infoOpen === item.title ? "active" : ""} onClick={() => setInfoOpen((value) => value === item.title ? "" : item.title)}>
                      <span>{item.title}</span>
                      <ArrowForwardIosOutlinedIcon />
                    </button>
                    {infoOpen === item.title ? <p>{item.body}</p> : null}
                  </article>
                ))}
              </div>
            </section>

            <footer className="storefront-footer">
              <div className="storefront-footer-top">
                <div>
                  <strong>We're Always Here To Help</strong>
                  <p>Help Center and Email Support for every SMAJ Store order.</p>
                </div>
              </div>
              <div className="storefront-footer-grid">
                {footerColumns.map((column) => (
                  <article key={column.title}>
                    <strong>{column.title}</strong>
                    <div>{column.links.map((link) => <button type="button" key={link} onClick={() => setSearch(link)}>{link}</button>)}</div>
                  </article>
                ))}
                <article>
                  <strong>SMAJ Global</strong>
                  <p>One account. One Pi wallet. Multiple digital services.</p>
                  <strong>Follow SMAJ</strong>
                  <div className="storefront-socials">
                    {["Facebook", "Instagram", "X", "YouTube", "Telegram"].map((name) => <span key={name}>{name}</span>)}
                  </div>
                </article>
              </div>
              <div className="storefront-footer-bottom">
                <span>SMAJ Store - Powered by Pi</span>
                <span>(c) 2026 SMAJ PI HUB. All rights reserved.</span>
                <span>Part of the SMAJ Ecosystem</span>
              </div>
            </footer>
          </>
        ) : null}

        {showSearchResults ? (
          <section className="storefront-search-results">
            <div className="storefront-section-head">
              <div><h2>{search ? `Results for "${search}"` : `${category} products`}</h2><p>{visibleProducts.length} products found</p></div>
            </div>
            <div className="storefront-product-grid search-grid">
              {visibleProducts.slice(0, 18).map((product) => (
                <MarketplaceProductCard
                  key={`search-${product._id}`}
                  product={product}
                  saved={savedIds.includes(product._id)}
                  onFavorite={(item) => void toggleFavorite(item)}
                  onAddToCart={addProductToCart}
                  onBuy={goToCheckout}
                />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
};

export default StorePage;

