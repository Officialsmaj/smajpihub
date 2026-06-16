import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { axiosClient } from "../../lib/axiosClient";
import MarketplaceProductCard from "../../components/MarketplaceProductCard";
import { addToCart, setBuyNowItem } from "../../lib/storeCart";
import type { Product } from "../../types/marketplace";
import { categoryGroups, footerColumns, heroSlides, homeSections, infoItems, popularSearches, promoStripItems, sectionCategories, storeTopNav, vehicleTiles } from "../../content/storefront";

const STORE_CATEGORIES = ["Deals", "Grocery", "Electronics", "Mobiles", "Laptops", "Fashion", "Beauty", "Home", "Vehicles", "Accessories"];
const demoNames = ["Wireless Earbuds", "Smart Watch", "Portable Speaker", "Classic Sneakers", "Travel Backpack", "Android Phone", "Laptop Computer", "Skincare Set", "Modern Sofa", "City Bicycle", "Kitchen Blender", "Office Chair", "Summer Dress", "Gaming Mouse", "Power Bank", "Digital Camera", "Family Sedan", "Graphic Design Service", "Fresh Food Box", "Premium Perfume", "Smart Television", "Gaming Console", "Coffee Maker", "Luxury Handbag", "Sports Shoes", "Road Bicycle", "Baby Stroller", "Noise Cancelling Headphones", "Printer Bundle", "Men Care Kit"];
const demoLocations = ["Lagos, Nigeria", "Abuja, Nigeria", "Kano, Nigeria", "Accra, Ghana", "Nairobi, Kenya", "Dakar, Senegal", "Johannesburg, South Africa", "London, UK"];
const demoImageKeyword: Record<string, string> = { Deals: "shopping", Grocery: "grocery", Electronics: "electronics", Mobiles: "smartphone", Laptops: "laptop", Fashion: "fashion", Beauty: "beauty", Home: "furniture", Vehicles: "car", Accessories: "accessories" };
const DEMO_PRODUCTS: Product[] = Array.from({ length: 500 }, (_, index) => {
  const category = STORE_CATEGORIES[index % STORE_CATEGORIES.length];
  const title = `${demoNames[index % demoNames.length]} ${Math.floor(index / demoNames.length) + 1}`;
  const pricePi = Number((0.0005 + ((index * 137) % 145) / 10000).toFixed(4));
  return {
    _id: `demo-product-${index + 1}`,
    sellerId: "smaj-demo-store",
    sellerName: ["SMAJ Market", "Amina Store", "Ahmed Electronics", "Musa Gadgets"][index % 4],
    piUsername: "smajmarket",
    title,
    image: `https://loremflickr.com/640/480/${demoImageKeyword[category]}?lock=${index + 1}`,
    images: [`https://loremflickr.com/900/700/${demoImageKeyword[category]}?lock=${index + 1}`, `https://loremflickr.com/900/700/${demoImageKeyword[category]}?lock=${index + 501}`],
    pricePi,
    description: `${title} from a trusted SMAJ PI HUB demo seller. Contact the seller for availability and delivery details.`,
    category,
    location: demoLocations[index % demoLocations.length],
    sellerContact: "@smajmarket",
    active: true,
    approved: true,
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
    rating: Number((4.1 + (index % 9) / 10).toFixed(1)),
  };
});

const scrollRail = (target: HTMLDivElement | null, direction: "left" | "right") => {
  if (!target) return;
  target.scrollBy({ left: direction === "left" ? -target.clientWidth * 0.9 : target.clientWidth * 0.9, behavior: "smooth" });
};

const pickProducts = (products: Product[], section: { category?: string; search?: string }, count = 12) => {
  const filtered = products.filter((product) => (!section.category || product.category === section.category) && (!section.search || [product.title, product.category, product.description].join(" ").toLowerCase().includes(section.search.toLowerCase())));
  return (filtered.length ? filtered : products).slice(0, count);
};

const StorePage = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [heroIndex, setHeroIndex] = useState(0);
  const [categoryPage, setCategoryPage] = useState(0);
  const [infoOpen, setInfoOpen] = useState<string>(infoItems[0].title);
  const vehiclesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      axiosClient.get<{ latest?: Product[]; recommended?: Product[]; savedIds?: string[]; products?: Product[] }>("/marketplace/feed").catch(() => null),
      axiosClient.get<{ products: Product[] }>("/marketplace/products").catch(() => null),
      axiosClient.get<{ products: Product[] }>("/marketplace/saved").catch(() => null),
    ]).then(([feed, all, saved]) => {
      const live = feed?.data?.latest?.length ? [...(feed.data.recommended || []), ...(feed.data.latest || [])] : all?.data?.products || [];
      const unique = Array.from(new Map((live.length ? live : DEMO_PRODUCTS).map((item) => [item._id, item])).values());
      setProducts(unique.length ? unique : DEMO_PRODUCTS);
      setSavedIds(feed?.data?.savedIds || saved?.data?.products.map((item) => item._id) || []);
      setUsingFallback(!live.length);
    }).catch(() => {
      setProducts(DEMO_PRODUCTS);
      setUsingFallback(true);
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

  const toggleFavorite = async (product: Product) => {
    if (product._id.startsWith("demo-product-")) {
      setSavedIds((current) => current.includes(product._id) ? current.filter((id) => id !== product._id) : [...current, product._id]);
      return;
    }
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

  return (
    <main className="private-page storefront-page">
      <section className="storefront-shell">
        <header className="storefront-header">
          <div className="storefront-header-main">
            <div className="storefront-brand">
              <strong>SMAJ Store</strong>
              <small>Powered by Pi inside SMAJ PI HUB</small>
            </div>
            <div className="storefront-location"><LocationOnOutlinedIcon /><span>Lagos, Nigeria</span></div>
            <label className="storefront-search">
              <SearchOutlinedIcon />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands, and categories" />
            </label>
            <nav className="storefront-quick-links">
              <Link to="/orders"><Inventory2OutlinedIcon /><span>Orders</span></Link>
              <Link to="/saved"><FavoriteBorderOutlinedIcon /><span>Wishlist</span></Link>
              <Link to="/cart"><ShoppingCartOutlinedIcon /><span>Cart</span></Link>
              <Link to="/profile"><PersonOutlineOutlinedIcon /><span>Profile</span></Link>
            </nav>
          </div>
          <div className="storefront-mobile-top">
            <div className="storefront-brand">
              <strong>SMAJ Store</strong>
              <small>Inside SMAJ PI HUB</small>
            </div>
            <div className="storefront-mobile-actions">
              <Link to="/cart" aria-label="Cart"><ShoppingCartOutlinedIcon /></Link>
              <Link to="/profile" aria-label="Profile"><PersonOutlineOutlinedIcon /></Link>
            </div>
          </div>
          <label className="storefront-search storefront-mobile-search">
            <SearchOutlinedIcon />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search SMAJ Store" />
          </label>
          <nav className="storefront-category-nav">
            {storeTopNav.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => updateCategory(item === "More" ? "All" : item)}>{item}</button>)}
          </nav>
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

        <section className="storefront-carousel-section">
          <div className="storefront-section-head">
            <div><h2>Browse by category</h2><p>Real products across every SMAJ Store department.</p></div>
            <div className="storefront-arrow-pair">
              <button type="button" disabled={categoryPage === 0} onClick={() => setCategoryPage((value) => Math.max(0, value - 1))} aria-label="Show previous categories"><ArrowBackIosNewOutlinedIcon /></button>
              <button type="button" disabled={categoryPage === categoryGroups.length - 1} onClick={() => setCategoryPage((value) => Math.min(categoryGroups.length - 1, value + 1))} aria-label="Show next categories"><ArrowForwardIosOutlinedIcon /></button>
            </div>
          </div>
          <div className="storefront-category-page">
            <div className="storefront-category-rail storefront-category-rail-grid">
            {activeCategoryItems.map((tile) => (
              <button type="button" key={tile.name} className="storefront-category-card storefront-browse-card" onClick={() => { if (tile.search) setSearch(tile.search); if (STORE_CATEGORIES.includes(tile.name)) updateCategory(tile.name); }}>
                <img src={tile.image} alt={tile.name} />
                <strong>{tile.name}</strong>
                <span>{tile.hint}</span>
              </button>
            ))}
            </div>
            <div className="storefront-category-pager" aria-label="Category pages">
              {categoryGroups.map((group, index) => (
                <button
                  type="button"
                  key={group.id}
                  className={index === categoryPage ? "active" : ""}
                  aria-label={`Open category page ${index + 1}`}
                  onClick={() => setCategoryPage(index)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="storefront-deal-grid">
          {dealCards.map((card) => <article key={card.title}><strong>{card.title}</strong><p>{card.body}</p></article>)}
        </section>

        {usingFallback ? <div className="private-alert">Showing SMAJ Store demo products while the live catalog reconnects.</div> : null}
        {loading ? <div className="private-state">Loading SMAJ Store...</div> : null}

        {!loading ? (
          <>
            {homeSections.filter((section) => section.title !== "Vehicle Deals").map((section) => {
              const sectionProducts = pickProducts(homepageProducts, section);
              return (
                <section className="storefront-product-section" key={section.title}>
                  <div className="storefront-section-head">
                    <div><h2>{section.title}</h2>{section.subtitle ? <p>{section.subtitle}</p> : null}</div>
                    <button type="button" className="section-view-all" onClick={() => { if (section.search) setSearch(section.search); if (section.category) updateCategory(section.category); }}>View All</button>
                  </div>
                  <div className="storefront-product-grid">
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
                </section>
              );
            })}

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

            {sectionCategories.map((tile) => (
              <section className="storefront-carousel-section" key={tile.name}>
                <div className="storefront-section-head">
                  <div><h2>{tile.name}</h2><p>{tile.hint}</p></div>
                  <button type="button" className="section-view-all" onClick={() => setSearch(tile.search || tile.name)}>View All</button>
                </div>
                <div className="storefront-category-rail compact-rail">
                  {pickProducts(homepageProducts, { search: tile.search || tile.name }, 8).map((product) => (
                    <button type="button" key={`${tile.name}-${product._id}`} className="storefront-mini-card" onClick={() => goToCheckout(product)}>
                      <img src={product.image} alt={product.title} />
                      <strong>{product.title}</strong>
                    </button>
                  ))}
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
                <span>SMAJ Store • Powered by Pi</span>
                <span>© 2026 SMAJ PI HUB. All rights reserved.</span>
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
