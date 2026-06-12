import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";

const StorePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    axiosClient.get<{ products: Product[] }>("/marketplace/products")
      .then(({ data }) => setProducts(data.products))
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((product) => product.category))).sort()], [products]);
  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesSearch = !query || [product.title, product.location, product.sellerName, product.category]
        .join(" ").toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, products, search]);

  return (
    <main className="private-page">
      <section className="private-page-head">
        <div><p className="private-kicker">MARKETPLACE</p><h1>SMAJ Store</h1><p>Discover products from Pi community sellers.</p></div>
        <Link className="private-primary-button" to="/add-product"><AddIcon /> Add Product</Link>
      </section>
      <section className="store-tools">
        <label><span>Search products</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, seller, or location" /></label>
        <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </section>
      {loading ? <div className="private-state">Loading products...</div> : null}
      {error ? <div className="private-alert error">{error}</div> : null}
      {!loading && !error && products.length === 0 ? (
        <div className="private-state"><h2>No products yet</h2><p>The first seller listing will appear here.</p></div>
      ) : null}
      <section className="product-grid">
        {visibleProducts.map((product) => (
          <Link className="product-card product-card-link" key={product._id} to={`/product/${product._id}`} aria-label={`View ${product.title}`}>
            <div className="product-image-wrap">
              {product.image ? <img src={product.image} alt={product.title} /> : <span>No image</span>}
              <span className="product-category">{product.category}</span>
            </div>
            <div className="product-card-body">
              <p className="product-location">{product.location}</p>
              <h2>{product.title}</h2>
              <p className="product-seller">Sold by {product.sellerName || product.piUsername}</p>
              <div className="product-card-foot"><strong>{product.pricePi} Pi</strong><span className="product-view-button">View</span></div>
            </div>
          </Link>
        ))}
      </section>
      {!loading && products.length > 0 && visibleProducts.length === 0 ? <div className="private-state"><h2>No matching products</h2><p>Try another search or category.</p></div> : null}
    </main>
  );
};

export default StorePage;
