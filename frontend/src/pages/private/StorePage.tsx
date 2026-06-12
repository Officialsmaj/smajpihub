import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";
import MarketplaceProductCard from "../../components/MarketplaceProductCard";

const STORE_CATEGORIES = ["Electronics", "Fashion", "Vehicles", "Property", "Food", "Services", "Others"];
const StorePage = () => {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]); const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [search, setSearch] = useState(""); const [category, setCategory] = useState(params.get("category") || "All"); const [location, setLocation] = useState(""); const [sort, setSort] = useState("newest");
  useEffect(() => { Promise.all([axiosClient.get<{ products: Product[] }>("/marketplace/products"), axiosClient.get<{ products: Product[] }>("/marketplace/saved")]).then(([all, saved]) => { setProducts(all.data.products); setSavedIds(saved.data.products.map((item) => item._id)); }).catch(() => setError("Could not load products.")).finally(() => setLoading(false)); }, []);
  const visibleProducts = useMemo(() => { const query = search.trim().toLowerCase(); const place = location.trim().toLowerCase(); return products.filter((p) => (category === "All" || p.category === category) && (!place || p.location.toLowerCase().includes(place)) && (!query || [p.title, p.sellerName, p.category].join(" ").toLowerCase().includes(query))).sort((a, b) => sort === "price-low" ? a.pricePi - b.pricePi : sort === "price-high" ? b.pricePi - a.pricePi : +new Date(b.createdAt) - +new Date(a.createdAt)); }, [category, location, products, search, sort]);
  const toggleFavorite = async (product: Product) => { const { data } = await axiosClient.post<{ saved: boolean }>(`/marketplace/products/${product._id}/favorite`); setSavedIds((current) => data.saved ? [...new Set([...current, product._id])] : current.filter((id) => id !== product._id)); };
  return <main className="private-page"><section className="private-page-head"><div><p className="private-kicker">MARKETPLACE</p><h1>SMAJ Store</h1><p>Find trusted products and services offered by the Pi community.</p></div><Link className="private-primary-button" to="/add-product"><AddIcon /> Add Product</Link></section>
    <section className="category-strip">{["All", ...STORE_CATEGORIES].map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</section>
    <section className="store-tools"><label><span>Search</span><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Product name" /></label><label><span>Location</span><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or country" /></label><label><span>Sort</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></section>
    {loading ? <div className="private-state">Loading products...</div> : null}{error ? <div className="private-alert error">{error}</div> : null}
    {!loading && !error && !visibleProducts.length ? <div className="private-state"><h2>No matching products</h2><p>Try another search, category, or location.</p></div> : <section className="product-grid">{visibleProducts.map((product) => <MarketplaceProductCard key={product._id} product={product} saved={savedIds.includes(product._id)} onFavorite={(item) => void toggleFavorite(item)} />)}</section>}
  </main>;
};
export default StorePage;
