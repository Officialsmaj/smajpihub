import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";
import { useAuthContext } from "../../contexts/AuthContext";
import { isAxiosError } from "axios";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [message, setMessage] = useState("");

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
      navigate("/orders", { state: { message: "Order created successfully." } });
    } catch (err: unknown) {
      setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || "Could not create order." : "Could not create order.");
    } finally {
      setSubmitting(false);
    }
  };

  const reportProduct = async () => {
    if (!product) return;
    const reason = window.prompt("Why are you reporting this product?", "Misleading or inappropriate listing");
    if (!reason?.trim()) return;
    setReporting(true);
    setError("");
    try {
      await axiosClient.post(`/marketplace/products/${product._id}/report`, { reason: reason.trim() });
      setMessage("Product report submitted for admin review.");
    } catch (err: unknown) {
      setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || "Could not report product." : "Could not report product.");
    } finally {
      setReporting(false);
    }
  };

  if (!product && !error) return <main className="private-page"><div className="private-state">Loading product...</div></main>;
  if (!product) return <main className="private-page"><div className="private-alert error">{error}</div></main>;

  return (
    <main className="private-page">
      <Link to="/store" className="private-back-link"><ArrowBackIcon /> Back to Store</Link>
      <section className="product-detail">
        <div className="product-detail-image">{product.image ? <img src={product.image} alt={product.title} /> : <span>No image supplied</span>}</div>
        <div className="product-detail-content">
          <span className="product-category inline">{product.category}</span>
          <h1>{product.title}</h1>
          <p className="product-detail-price">{product.pricePi} Pi</p>
          <p>{product.description}</p>
          <section className="seller-info-card">
            <StorefrontOutlinedIcon />
            <div><span>Seller</span><strong>{product.sellerName}</strong><p>{product.piUsername ? `@${product.piUsername}` : "Pi seller"} · {product.location}</p><p>{product.sellerContact}</p></div>
          </section>
          {message ? <div className="private-alert success">{message}</div> : null}
          {error ? <div className="private-alert error">{error}</div> : null}
          {product.sellerId === user?.uid ? <p className="private-alert">This is your listing.</p> : (
            <div className="product-detail-actions"><button className="private-primary-button" onClick={() => void createOrder()} disabled={submitting}>{submitting ? "Creating order..." : "Create Order"}</button><button className="private-secondary-button" onClick={() => void reportProduct()} disabled={reporting}><FlagOutlinedIcon />{reporting ? "Reporting..." : "Report Product"}</button></div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProductDetailPage;
