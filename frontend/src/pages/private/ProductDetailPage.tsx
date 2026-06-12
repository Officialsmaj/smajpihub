import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";
import { useAuthContext } from "../../contexts/AuthContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosClient.get<{ product: Product }>(`/marketplace/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setError("Product not found."));
  }, [id]);

  const createOrder = async () => {
    if (!product) return;
    setSubmitting(true);
    setError("");
    try {
      await axiosClient.post("/marketplace/orders", { productId: product._id });
      navigate("/app/orders", { state: { message: "Order created. Complete the Pi payment when ready." } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!product && !error) return <main className="private-page"><div className="private-state">Loading product...</div></main>;
  if (!product) return <main className="private-page"><div className="private-alert error">{error}</div></main>;

  return (
    <main className="private-page">
      <Link to="/app/store" className="private-back-link"><ArrowBackIcon /> Back to store</Link>
      <section className="product-detail">
        <div className="product-detail-image">{product.image ? <img src={product.image} alt={product.title} /> : <span>No image supplied</span>}</div>
        <div className="product-detail-content">
          <span className="product-category inline">{product.category}</span>
          <h1>{product.title}</h1>
          <p className="product-detail-price">{product.pricePi} Pi</p>
          <p>{product.description}</p>
          <dl className="product-facts">
            <div><dt>Location</dt><dd>{product.location}</dd></div>
            <div><dt>Seller</dt><dd>{product.sellerName}</dd></div>
            <div><dt>Contact</dt><dd>{product.sellerContact}</dd></div>
          </dl>
          {error ? <div className="private-alert error">{error}</div> : null}
          {product.sellerId === user?.uid ? <p className="private-alert">This is your listing.</p> : (
            <button className="private-primary-button wide" onClick={() => void createOrder()} disabled={submitting}>{submitting ? "Creating order..." : "Create Order"}</button>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProductDetailPage;
