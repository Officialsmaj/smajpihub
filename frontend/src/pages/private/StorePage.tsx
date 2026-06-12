import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";
import { useAuthContext } from "../../contexts/AuthContext";

const StorePage = () => {
  const { user } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient.get<{ products: Product[] }>("/marketplace/products")
      .then(({ data }) => setProducts(data.products))
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="private-page">
      <section className="private-page-head">
        <div><p className="private-kicker">MARKETPLACE</p><h1>SMAJ Store</h1><p>Discover products from Pi community sellers.</p></div>
        {user?.role === "seller" ? <Link className="private-primary-button" to="/app/add-product"><AddIcon /> Add Product</Link> : null}
      </section>
      {loading ? <div className="private-state">Loading products...</div> : null}
      {error ? <div className="private-alert error">{error}</div> : null}
      {!loading && !error && products.length === 0 ? (
        <div className="private-state"><h2>No products yet</h2><p>The first seller listing will appear here.</p></div>
      ) : null}
      <section className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product._id}>
            <div className="product-image-wrap">
              {product.image ? <img src={product.image} alt={product.title} /> : <span>No image</span>}
              <span className="product-category">{product.category}</span>
            </div>
            <div className="product-card-body">
              <p className="product-location">{product.location}</p>
              <h2>{product.title}</h2>
              <div className="product-card-foot"><strong>{product.pricePi} Pi</strong><Link to={`/app/store/${product._id}`}>View product</Link></div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default StorePage;
