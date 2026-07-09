import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import StarIcon from "@mui/icons-material/Star";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import TrustBadge from "./TrustBadge";
import type { Product } from "../types/marketplace";
import { countryDisplayName, countryFlag, formatPiAmount, formatUsdAmount } from "../lib/formatters";

const PI_USDT_RATE = 314159;
const usdt = (product: Product) => formatUsdAmount(product.priceUsdt ?? product.pricePi * PI_USDT_RATE);
const pi = (product: Product) => product.pricePi > 0 ? product.pricePi : (product.priceUsdt || 0) / PI_USDT_RATE;
const countryTokens = [
  "United Arab Emirates",
  "UAE",
  "United States",
  "USA",
  "Germany",
  "Italy",
  "United Kingdom",
  "UK",
  "Nigeria",
  "India",
  "Pakistan",
  "Philippines",
  "Malaysia",
  "Indonesia",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Turkey",
  "Egypt",
  "Morocco",
  "Kenya",
];

const productCountry = (product: Product) => {
  const explicitCountry = product.country?.trim();
  if (explicitCountry) return explicitCountry;

  const location = product.location || "";
  const splitCountry = location.split(/\s+-\s+|,/).map((item) => item.trim()).find((item) => countryFlag(item));
  if (splitCountry) return splitCountry;

  return countryTokens.find((country) => new RegExp(`\\b${country.replace(/\s+/g, "\\s+")}\\b`, "i").test(location)) || "";
};

type MarketplaceProductCardProps = {
  product: Product;
  variant?: "default" | "compact";
  saved?: boolean;
  onFavorite?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBuy?: (product: Product) => void;
};

const MarketplaceProductCard = ({ product, variant = "default", saved, onFavorite, onAddToCart, onBuy }: MarketplaceProductCardProps) => {
  const compact = variant === "compact";
  const countrySource = productCountry(product);
  const country = countryDisplayName(countrySource);
  const flag = countryFlag(countrySource);
  const location = [country, product.stateRegion, product.city].filter(Boolean).join(" - ") || product.location;
  const reviewLabel = `(${product.reviewCount || 0})`;
  const ratingLabel = product.rating ? product.rating.toFixed(1) : "";
  const deliveryLabel = product.deliveryOption || "Delivery updates in app";
  const imageCount = Math.max(product.images?.length || (product.image ? 1 : 0), 1);
  const availabilityLabel = product.quantity ? "In Stock" : "Stock updates";

  return (
    <article className={`product-card product-card-link storefront-product-card${compact ? " storefront-product-card-compact" : ""}`}>
      {flag ? <span className="storefront-card-country" aria-label={country}>{flag}</span> : null}
      <span className="storefront-product-badge badge-real">{product.condition || "New"}</span>
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
          <span className="storefront-image-dots"><i /><i /><i /></span>
          <span className="storefront-image-count">1/{imageCount}</span>
        </div>

        <div className="product-card-body storefront-product-body">
          <h2>{product.title}</h2>
          <div className="storefront-product-rating">
            <span className="storefront-stars" aria-label={ratingLabel ? `${ratingLabel} rating` : "New rating"}>
              {Array.from({ length: 5 }).map((_, index) => <StarIcon key={index} />)}
            </span>
            <small>{reviewLabel}</small>
          </div>
          <div className="storefront-price-stack">
            <strong>{usdt(product)}</strong>
            <small><PaidOutlinedIcon /> {formatPiAmount(pi(product))}</small>
          </div>
          <div className="storefront-product-meta storefront-seller-row">
            <span className="storefront-seller-avatar">{product.sellerAvatar ? <img src={product.sellerAvatar} alt="" /> : <AccountCircleIcon />}</span>
            <span className="seller-name-line storefront-seller-name">
              <small className="seller-name-text">{product.sellerName}</small>
              <TrustBadge level={product.verificationLevel} status={product.verificationStatus} />
            </span>
          </div>
          <div className="storefront-product-meta storefront-location-row">
            <small><LocationOnOutlinedIcon /> {location}{flag ? ` ${flag}` : ""}</small>
          </div>
          <div className="storefront-stock-row">
            <span><i /> {availabilityLabel}</span>
            {!compact && typeof product.viewCount === "number" ? <small>{product.viewCount} views</small> : null}
          </div>
          {!compact ? <small className="storefront-real-views">{deliveryLabel}</small> : null}
        </div>
      </Link>

      <div className="storefront-product-actions">
        {!compact ? (
          <button className="storefront-product-add" type="button" onClick={() => onAddToCart?.(product)} aria-label={`Quick add ${product.title}`}>
            <AddOutlinedIcon />
          </button>
        ) : null}
        <button className="product-action-button product-action-secondary storefront-product-cart" type="button" onClick={() => onAddToCart?.(product)}>
          <AddShoppingCartOutlinedIcon />
          {compact ? null : "Add to Cart"}
        </button>
        <button className="product-action-button product-action-primary storefront-product-buy" type="button" onClick={() => onBuy?.(product)}>
          Buy Now
        </button>
      </div>
    </article>
  );
};

export default MarketplaceProductCard;
