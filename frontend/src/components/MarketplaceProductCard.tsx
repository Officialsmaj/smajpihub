import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import TrustBadge from "./TrustBadge";
import type { Product } from "../types/marketplace";
import { countryDisplayName, countryFlag, formatPiAmount, formatUsdAmount } from "../lib/formatters";

const PI_USDT_RATE = 314159;
const usdt = (product: Product) => formatUsdAmount(product.priceUsdt ?? product.pricePi * PI_USDT_RATE);
const pi = (product: Product) => product.pricePi > 0 ? product.pricePi : (product.priceUsdt || 0) / PI_USDT_RATE;

type MarketplaceProductCardProps = {
  product: Product;
  saved?: boolean;
  onFavorite?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBuy?: (product: Product) => void;
};

const MarketplaceProductCard = ({ product, saved, onFavorite, onAddToCart, onBuy }: MarketplaceProductCardProps) => {
  const country = countryDisplayName(product.country || product.location.split(" - ")[0]);
  const flag = countryFlag(product.country || product.location.split(" - ")[0]);
  const location = [country, product.stateRegion, product.city].filter(Boolean).join(" - ") || product.location;
  const reviewLabel = product.reviewCount ? `(${product.reviewCount} reviews)` : "No reviews yet";
  const ratingLabel = product.rating ? product.rating.toFixed(1) : "New";
  const deliveryLabel = product.deliveryOption || "Delivery updates in app";

  return (
    <article className="product-card product-card-link storefront-product-card">
      <span className="storefront-product-badge badge-real">Real listing</span>
      {onFavorite ? (
        <button className="favorite-button storefront-favorite-button" type="button" onClick={() => onFavorite(product)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}>
          {saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </button>
      ) : null}

      <Link
        to={`/product/${product._id}`}
        aria-label={`View ${product.title}`}
      >
        <div className="product-image-wrap storefront-product-image-wrap">
          {product.image ? <img src={product.image} alt={product.title} /> : <span>No image</span>}
        </div>

        <div className="product-card-body storefront-product-body">
          <h2>{product.title}</h2>
          <div className="storefront-product-rating">
            <span>{ratingLabel} star</span>
            <small>{reviewLabel}</small>
          </div>
          <div className="storefront-price-stack">
            <strong>{usdt(product)} USDT</strong>
            <small>{formatPiAmount(pi(product))}</small>
          </div>
          <div className="storefront-product-meta">
            <span className="storefront-product-discount">{product.condition}</span>
            <small>{flag ? `${flag} ` : ""}{location}</small>
          </div>
          <div className="storefront-product-meta">
            <span className="seller-name-line storefront-seller-name">
              <small className="seller-name-text">{product.sellerName}</small>
              <TrustBadge level={product.verificationLevel} status={product.verificationStatus} />
            </span>
          </div>
          <div className="storefront-product-meta">
            <small>{deliveryLabel}</small>
            <small>{product.quantity ? `${product.quantity} in stock` : "Stock updates in app"}</small>
          </div>
          {typeof product.viewCount === "number" ? <small className="storefront-real-views">{product.viewCount} views</small> : null}
        </div>
      </Link>

      <div className="storefront-product-actions">
        <button className="storefront-product-add" type="button" onClick={() => onAddToCart?.(product)} aria-label={`Quick add ${product.title}`}>
          <AddOutlinedIcon />
        </button>
        <button className="product-action-button product-action-secondary storefront-product-cart" type="button" onClick={() => onAddToCart?.(product)}>
          <AddShoppingCartOutlinedIcon />
          Add to Cart
        </button>
        <button className="product-action-button product-action-primary storefront-product-buy" type="button" onClick={() => onBuy?.(product)}>
          Buy Now
        </button>
      </div>
    </article>
  );
};

export default MarketplaceProductCard;
