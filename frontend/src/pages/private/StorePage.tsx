import { useCallback, useEffect, useMemo, useState } from "react";
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
import PrivateSkeleton from "../../components/PrivateSkeleton";
import PullToRefresh from "../../components/PullToRefresh";
import { useAuthContext } from "../../contexts/AuthContext";
import { setBuyNowItem } from "../../lib/storeCart";
import { useAddToCartToast } from "../../hooks/useAddToCartToast";
import type { Product } from "../../types/marketplace";
import { heroSlides, promoStripItems } from "../../content/storefront";
import logoImage from "/logo.png";

const STORE_CATEGORIES = ["Deals", "Grocery", "Electronics", "Mobiles", "Laptops", "Fashion", "Beauty", "Home", "Vehicles", "Accessories"];
const mobileMenuCategories = ["Electronics", "Women's Fashion", "Men's Fashion", "Kids Fashion", "Home, Kitchen & Appliances", "Beauty & Fragrance", "Toys", "Baby", "Health & Nutrition"];
const mobileMenuSubcategories: Record<string, string[]> = {
  Electronics: ["Mobiles & Accessories", "iPhone 17 Series", "Laptops & Accessories", "Gaming Essentials", "TVs & Home Entertainment", "Cameras", "All Electronics"],
  "Women's Fashion": ["Dresses", "Shoes", "Bags", "Jewelry", "Beauty Deals", "All Women's Fashion"],
  "Men's Fashion": ["Shirts", "Shoes", "Watches", "Bags", "Grooming", "All Men's Fashion"],
  "Kids Fashion": ["Girls", "Boys", "Baby Clothing", "School Shoes", "Kids Accessories", "All Kids Fashion"],
  "Home, Kitchen & Appliances": ["Kitchen Appliances", "Cookware", "Furniture", "Bedding", "Home Decor", "All Home"],
  "Beauty & Fragrance": ["Perfume", "Skin Care", "Hair Care", "Makeup", "Personal Care", "All Beauty"],
  Toys: ["Learning Toys", "Outdoor Play", "Remote Control", "Baby Toys", "Games", "All Toys"],
  Baby: ["Diapers", "Feeding", "Strollers", "Baby Care", "Baby Clothing", "All Baby"],
  "Health & Nutrition": ["Vitamins", "Fitness", "Wellness", "Medical Supplies", "Nutrition", "All Health"],
};
const shoppingTools = [
  { label: "Sort", items: ["Newest", "Oldest", "Price: Low to High", "Price: High to Low", "Most Popular", "Best Rated"] },
  { label: "Filter", items: ["Category", "Condition", "Brand", "Verified Seller", "In Stock", "Delivery / Pickup"] },
  { label: "Price", items: ["Min Price", "Max Price", "Currency: USDT / Pi", "Price Range"] },
  { label: "Nearby", items: ["Near Me", "Country", "State/Region", "City"], globe: true },
];
const PRODUCT_BATCH_SIZE = 10;
const STORE_PRODUCT_LIMIT_KEY = "smaj_store_product_limit";

const StorePage = () => {
  const { user } = useAuthContext();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [heroIndex, setHeroIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuPanel, setMobileMenuPanel] = useState<"categories" | "subcategories">("categories");
  const [mobileMenuCategory, setMobileMenuCategory] = useState(mobileMenuCategories[0]);
  const [productLimit, setProductLimit] = useState(() => Math.max(PRODUCT_BATCH_SIZE, Number(window.sessionStorage.getItem(STORE_PRODUCT_LIMIT_KEY) || PRODUCT_BATCH_SIZE)));
  const { addProductToCart, cartToast } = useAddToCartToast();
  const profileName = user?.displayName || user?.username || "Pi User";

  const loadCatalog = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const [feed, all, saved] = await Promise.all([
        axiosClient.get<{ latest?: Product[]; recommended?: Product[]; savedIds?: string[]; products?: Product[] }>("/marketplace/feed"),
        axiosClient.get<{ products: Product[] }>("/marketplace/products"),
        axiosClient.get<{ products: Product[] }>("/marketplace/saved").catch(() => null),
      ]);
      const live = feed?.data?.latest?.length ? [...(feed.data.recommended || []), ...(feed.data.latest || [])] : all?.data?.products || [];
      const unique = Array.from(new Map(live.map((item) => [item._id, item])).values());
      setProducts(unique);
      setSavedIds(feed?.data?.savedIds || saved?.data?.products.map((item) => item._id) || []);
      setCatalogError("");
    } catch {
      setProducts([]);
      setSavedIds([]);
      setCatalogError("SMAJ Store cannot reach the live catalog. Check the backend, MongoDB, session, and CORS settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog(true);
  }, [loadCatalog]);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroIndex((value) => (value + 1) % heroSlides.length), 4800);
    return () => window.clearInterval(timer);
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => (category === "All" || product.category === category) && (!query || [product.title, product.category, product.description, product.sellerName].join(" ").toLowerCase().includes(query)));
  }, [category, products, search]);

  const showSearchResults = Boolean(search.trim()) || category !== "All";
  const activeProducts = showSearchResults ? visibleProducts : products;
  const displayedProducts = activeProducts.slice(0, productLimit);
  const hiddenProductCount = Math.max(activeProducts.length - displayedProducts.length, 0);

  useEffect(() => {
    setProductLimit(PRODUCT_BATCH_SIZE);
    window.sessionStorage.setItem(STORE_PRODUCT_LIMIT_KEY, String(PRODUCT_BATCH_SIZE));
  }, [category, search]);

  const updateSearch = (value: string) => {
    setSearch(value);
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value.trim()) next.set("search", value);
      else next.delete("search");
      return next;
    }, { replace: true });
  };

  const showMoreProducts = () => {
    setProductLimit((value) => {
      const next = value + PRODUCT_BATCH_SIZE;
      window.sessionStorage.setItem(STORE_PRODUCT_LIMIT_KEY, String(next));
      return next;
    });
  };

  const toggleFavorite = async (product: Product) => {
    const { data } = await axiosClient.post<{ saved: boolean }>(`/marketplace/products/${product._id}/favorite`);
    setSavedIds((current) => data.saved ? [...new Set([...current, product._id])] : current.filter((id) => id !== product._id));
  };

  const goToCheckout = (product: Product) => {
    setBuyNowItem(product);
    navigate("/checkout");
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
    if (mobileMenuSubcategories[value]?.length) {
      setMobileMenuCategory(value);
      setMobileMenuPanel("subcategories");
      return;
    }
    updateSearch(value);
    if (STORE_CATEGORIES.includes(value)) updateCategory(value);
    setMobileMenuOpen(false);
  };

  const chooseMobileSubcategory = (value: string) => {
    updateSearch(value);
    const normalizedCategory = mobileMenuCategory.includes("Fashion")
      ? "Fashion"
      : mobileMenuCategory.startsWith("Home")
        ? "Home"
        : mobileMenuCategory.startsWith("Beauty")
          ? "Beauty"
          : mobileMenuCategory.startsWith("Health")
            ? "All"
            : mobileMenuCategory;
    updateCategory(STORE_CATEGORIES.includes(normalizedCategory) ? normalizedCategory : "All");
    setMobileMenuOpen(false);
    setMobileMenuPanel("categories");
  };

  return (
    <main className="private-page storefront-page">
      <PullToRefresh onRefresh={() => loadCatalog(false)} />
      {cartToast}
      <section className="storefront-shell">
        <header className="storefront-header">
          <div className="storefront-header-main">
            <Link to="/app/services" className="storefront-back-link">
              <ArrowBackIosNewOutlinedIcon />
              <span>Services</span>
            </Link>
            <Link to="/store" className="storefront-brand storefront-brand-link">
              <strong>SMAJ Store</strong>
              <span className="environment-badge storefront-environment-badge" aria-label="Testnet beta environment">Testnet / Beta</span>
            </Link>
            <button type="button" className="storefront-location storefront-location-button" onClick={() => updateSearch("Abu Dhabi")}>
              <LocationOnOutlinedIcon />
              <span>Location</span>
              <KeyboardArrowDownOutlinedIcon className="storefront-location-chevron" />
            </button>
            <label className="storefront-search">
              <SearchOutlinedIcon />
              <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search in SMAJ Store..." />
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
            <span className="environment-badge storefront-mobile-environment-badge" aria-label="Testnet beta environment">Beta</span>
            <div className="storefront-mobile-actions">
              <Link to="/cart" aria-label="Cart"><ShoppingCartOutlinedIcon /></Link>
              <Link to="/profile" className="storefront-avatar-link" aria-label="Profile">
                {user?.avatar ? <img src={user.avatar} alt="" /> : <span>{profileName.slice(0, 1).toUpperCase()}</span>}
              </Link>
            </div>
          </div>

          <label className="storefront-search storefront-mobile-search">
            <SearchOutlinedIcon />
            <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search in SMAJ Store..." />
          </label>

          {mobileMenuOpen ? (
            <div className="storefront-mobile-drawer-wrap">
              <button type="button" className="storefront-mobile-drawer-backdrop" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />
              <aside className="storefront-mobile-drawer" aria-label="SMAJ Store categories menu">
                <div className="storefront-mobile-drawer-panels" style={{ transform: mobileMenuPanel === "subcategories" ? "translateX(-50%)" : "translateX(0)" }}>
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
                      <h3>{mobileMenuCategory}</h3>
                      <button type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><CloseOutlinedIcon /></button>
                    </header>
                    <nav>
                      {(mobileMenuSubcategories[mobileMenuCategory] || []).map((item) => (
                        <button type="button" key={item} onClick={() => chooseMobileSubcategory(item)}>
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

        <section className="storefront-shopping-tools" aria-label="Shopping tools">
          {shoppingTools.map((tool) => (
            <details className="storefront-tool-menu" key={tool.label}>
              <summary>
                <span>{tool.label}</span>
                {tool.globe ? <span aria-hidden="true">🌍</span> : <KeyboardArrowDownOutlinedIcon />}
              </summary>
              <div>
                {tool.items.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => {
                      if (tool.label === "Nearby" && item === "Near Me") updateSearch("Abu Dhabi");
                      else updateSearch(item);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </section>

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
                  <button type="button" onClick={() => updateSearch(slide.search)}>Shop now</button>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="storefront-arrow right" onClick={() => setHeroIndex((value) => (value + 1) % heroSlides.length)} aria-label="Next banner"><ArrowForwardIosOutlinedIcon /></button>
          <div className="storefront-hero-dots">{heroSlides.map((slide, index) => <button type="button" key={slide.title} className={heroIndex === index ? "active" : ""} onClick={() => setHeroIndex(index)} aria-label={`Go to ${slide.title}`} />)}</div>
        </section>

        {catalogError ? <div className="private-alert error">{catalogError}</div> : null}
        {loading ? <PrivateSkeleton variant="grid" count={6} /> : null}
        {!loading && products.length && !showSearchResults ? (
          <section className="storefront-search-results">
            <div className="storefront-section-head">
              <div><h2>Live products</h2><p>{products.length} real seller products available</p></div>
            </div>
            <div className="storefront-product-grid search-grid">
              {displayedProducts.map((product) => (
                <MarketplaceProductCard
                  key={`live-${product._id}`}
                  product={product}
                  variant="compact"
                  saved={savedIds.includes(product._id)}
                  onFavorite={(item) => void toggleFavorite(item)}
                  onAddToCart={addProductToCart}
                  onBuy={goToCheckout}
                />
              ))}
            </div>
            {hiddenProductCount ? (
              <button type="button" className="storefront-load-more" onClick={showMoreProducts}>
                Show more products
              </button>
            ) : null}
          </section>
        ) : null}

        {showSearchResults ? (
          <section className="storefront-search-results">
            <div className="storefront-section-head">
              <div><h2>{search ? `Results for "${search}"` : `${category} products`}</h2><p>{visibleProducts.length} products found</p></div>
            </div>
            {visibleProducts.length ? <>
              <div className="storefront-product-grid search-grid">
              {displayedProducts.map((product) => (
                <MarketplaceProductCard
                  key={`search-${product._id}`}
                  product={product}
                  variant="compact"
                  saved={savedIds.includes(product._id)}
                  onFavorite={(item) => void toggleFavorite(item)}
                  onAddToCart={addProductToCart}
                  onBuy={goToCheckout}
                />
              ))}
            </div>
            {hiddenProductCount ? (
              <button type="button" className="storefront-load-more" onClick={showMoreProducts}>
                Show more products
              </button>
            ) : null}
            </> : <div className="private-state"><h2>No real products found</h2><p>Try another search or add a seller product.</p></div>}
          </section>
        ) : null}

        <footer className="storefront-footer">
          <div className="storefront-footer-grid">
            <article>
              <strong>SMAJ Store</strong>
              <p>Real seller products, Pi checkout, and marketplace updates in one place.</p>
            </article>
            <article>
              <strong>Shop</strong>
              <button type="button" onClick={() => updateCategory("Deals")}>Deals</button>
              <button type="button" onClick={() => updateCategory("Electronics")}>Electronics</button>
              <button type="button" onClick={() => updateCategory("Fashion")}>Fashion</button>
            </article>
            <article>
              <strong>Seller</strong>
              <button type="button" onClick={() => navigate("/seller")}>Seller Dashboard</button>
              <button type="button" onClick={() => navigate("/add-product")}>Add Product</button>
            </article>
            <article>
              <strong>Account</strong>
              <button type="button" onClick={() => navigate("/orders")}>Orders</button>
              <button type="button" onClick={() => navigate("/saved")}>Saved Products</button>
            </article>
          </div>
          <div className="storefront-footer-bottom">
            <span>Part of SMAJ PI HUB</span>
            <span>Secure marketplace for Pi users.</span>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default StorePage;
