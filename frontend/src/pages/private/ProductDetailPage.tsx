import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { isAxiosError } from "axios";
import MarketplaceProductCard from "../../components/MarketplaceProductCard";
import PrivateSkeleton from "../../components/PrivateSkeleton";
import TrustBadge from "../../components/TrustBadge";
import { useAuthContext } from "../../contexts/AuthContext";
import { axiosClient } from "../../lib/axiosClient";
import { countryDisplayName, countryFlag, formatPiAmount, formatUsdAmount } from "../../lib/formatters";
import { setBuyNowItem } from "../../lib/storeCart";
import type { Product, SellerSummary } from "../../types/marketplace";

const supportEmail = "info@smajpihub.com";
const PI_USDT_RATE = 314159;

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerSummary | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [saved, setSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Misleading or inappropriate listing");

  useEffect(() => {
    axiosClient
      .get(`/marketplace/products/${id}`)
      .then(({ data }) => {
        setProduct(data.product);
        setSeller(data.seller);
        setRelated(data.related || []);
        setSaved(Boolean(data.saved));
        setSelectedImage(data.product.images?.[0] || data.product.image);
        window.localStorage.setItem("smaj_last_viewed_product", data.product._id);
      })
      .catch(() => {
        setError("Product not found.");
      });
  }, [id]);

  const action = async (kind: "order" | "report" | "message" | "favorite") => {
    if (!product) return;

    setSubmitting(true);
    setError("");

    try {
      if (kind === "order") {
        setBuyNowItem(product);
        navigate("/checkout");
      } else if (kind === "favorite") {
        const { data } = await axiosClient.post(`/marketplace/products/${product._id}/favorite`);
        setSaved(data.saved);
      } else if (kind === "message") {
        const { data } = await axiosClient.post("/messages/start", { productId: product._id });
        navigate(`/messages?conversation=${data.conversation._id}`);
      }
    } catch (err: unknown) {
      setError(
        isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || "Action could not be completed."
          : "Action could not be completed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitReport = async () => {
    if (!product || !reportReason.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await axiosClient.post(`/marketplace/products/${product._id}/report`, { reason: reportReason.trim() });
      setMessage("Product report submitted for admin review.");
      setReportOpen(false);
      setReportReason("Misleading or inappropriate listing");
    } catch (err: unknown) {
      setError(
        isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || "Report could not be submitted."
          : "Report could not be submitted."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return (
      <main className="private-page">
        {error ? <div className="private-state">{error}</div> : <PrivateSkeleton variant="product" />}
      </main>
    );
  }

  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  const sellerAvatar = seller?.avatar || product.sellerAvatar || "";
  const sellerName = seller?.displayName || product.sellerName;
  const sellerCountry = countryDisplayName(seller?.country || product.country || product.location.split(" - ")[0]);
  const sellerFlag = countryFlag(seller?.country || product.country || product.location.split(" - ")[0]);
  const sellerLocation = [sellerCountry, product.stateRegion, product.city, product.areaAddress].filter(Boolean).join(" - ") || product.location;
  const piPrice = product.pricePi > 0 ? product.pricePi : (product.priceUsdt || 0) / PI_USDT_RATE;

  return (
    <main className="private-page">
      <Link to="/store" className="private-back-link">
        <ArrowBackIcon /> Back to Store
      </Link>

      <section className="product-detail">
        <div className="product-gallery">
          <div className="product-detail-image">
            {selectedImage ? <img src={selectedImage} alt={product.title} /> : <span>No image supplied</span>}
          </div>
          {images.length > 1 ? (
            <div className="gallery-thumbnails">
              {images.map((image) => (
                <button
                  className={selectedImage === image ? "active" : ""}
                  key={image.slice(-30)}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-detail-content">
          <span className="product-category inline">{product.category}</span>
          <h1>{product.title}</h1>
          <p className="product-detail-price">
            {formatUsdAmount(product.priceUsdt ?? product.pricePi * PI_USDT_RATE)} USDT <small>{formatPiAmount(piPrice)}</small>
          </p>
          <p>{product.description}</p>

          <Link className="seller-info-card" to={`/seller/${product.sellerId}`}>
            <div className="profile-avatar small">
              {sellerAvatar ? <img src={sellerAvatar} alt={sellerName} /> : <span>{sellerName.slice(0, 1)}</span>}
            </div>
            <div>
              <span>Seller</span>
              <strong className="seller-name-line">
                <span className="seller-name-text">{sellerName}</span>
                <TrustBadge level={seller?.verificationLevel || product.verificationLevel} />
              </strong>
              <p>
                @{seller?.piUsername || product.piUsername} · {sellerFlag ? `${sellerFlag} ` : ""}{sellerLocation}
              </p>
            </div>
          </Link>

          {message ? <div className="private-alert success">{message}</div> : null}
          {error ? <div className="private-alert error">{error}</div> : null}

          {product.sellerId === user?.uid ? (
            <p className="private-alert">This is your listing.</p>
          ) : (
            <div className="product-detail-actions">
              <button className="private-primary-button" onClick={() => void action("order")} disabled={submitting}>
                Buy / Create Order
              </button>
              <button className="private-secondary-button" onClick={() => void action("message")}>
                <ChatOutlinedIcon /> Message Seller
              </button>
              <button className="private-secondary-button" onClick={() => void action("favorite")}>
                {saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                {saved ? "Saved" : "Save"}
              </button>
              <button className="private-secondary-button" onClick={() => setReportOpen(true)}>
                <FlagOutlinedIcon /> Report
              </button>
            </div>
          )}
        </div>
      </section>

      {related.length ? (
        <>
          <section className="section-title">
            <div>
              <h2>Related products</h2>
              <p>More listings in {product.category}</p>
            </div>
          </section>
          <section className="product-grid">
            {related.map((item) => (
              <MarketplaceProductCard product={item} key={item._id} />
            ))}
          </section>
        </>
      ) : null}
      {reportOpen ? (
        <div className="service-modal-backdrop" onMouseDown={() => setReportOpen(false)}>
          <form className="service-modal marketplace-action-modal" onSubmit={(event) => { event.preventDefault(); void submitReport(); }} onMouseDown={(event) => event.stopPropagation()}>
            <h2>Report Product</h2>
            <p>Tell the SMAJ PI HUB team what looks unsafe, misleading, or abusive.</p>
            <label>
              Reason
              <textarea rows={5} maxLength={300} value={reportReason} onChange={(event) => setReportReason(event.target.value)} required />
            </label>
            <p>
              You can also email a detailed report to <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
            </p>
            <div className="confirm-modal-actions">
              <button type="button" className="modal-cancel-button" onClick={() => setReportOpen(false)}>Cancel</button>
              <button type="submit" className="modal-signout-button" disabled={submitting}>{submitting ? "Submitting..." : "Submit Report"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
};

export default ProductDetailPage;
