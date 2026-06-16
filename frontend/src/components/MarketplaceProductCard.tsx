import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import type { Product } from "../types/marketplace";

const usd = (pi: number) => (pi * 3.14159).toFixed(5);

type MarketplaceProductCardProps = {
  product: Product;
  saved?: boolean;
  onFavorite?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBuy?: (product: Product) => void;
};

const badgeTypes = ["Best Seller", "New", "Hot Deal"] as const;

const MarketplaceProductCard = ({ product, saved, onFavorite, onAddToCart, onBuy }: MarketplaceProductCardProps) => {
  const discount = 10 + ((product.title.length + Math.round(product.pricePi * 10000)) % 41);
  const reviewCount = 40 + ((product.title.length * 17) % 860);
  const badge = badgeTypes[(product.title.length + Math.round(product.pricePi * 10000)) % badgeTypes.length];
  const deliveryLabel = product.pricePi < 0.01 ? "Pi checkout available" : "Delivery updates in app";

  return (
    <article className="product-card product-card-link storefront-product-card">
      <span className={`storefront-product-badge badge-${badge.toLowerCase().replace(/\s+/g, "-")}`}>{badge}</span>
      {onFavorite ? (
        <button className="favorite-button storefront-favorite-button" type="button" onClick={() => onFavorite(product)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}>
          {saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </button>
      ) : null}

      <Link
        to={`/product/${product._id}`}
        onClick={() => {
          if (product._id.startsWith("demo-product-")) {
            window.localStorage.setItem(`smaj_${product._id}`, JSON.stringify(product));
          }
        }}
        aria-label={`View ${product.title}`}
      >
        <div className="product-image-wrap storefront-product-image-wrap">
          {product.image ? <img src={product.image} alt={product.title} /> : <span>No image</span>}
        </div>

        <div className="product-card-body storefront-product-body">
          <h2>{product.title}</h2>
          <div className="storefront-product-rating">
            <span>{(product.rating || 4.7).toFixed(1)}★</span>
            <small>({reviewCount} reviews)</small>
          </div>
          <div className="storefront-price-stack">
            <strong>{product.pricePi.toFixed(4)} Pi</strong>
            <small>${usd(product.pricePi)}</small>
          </div>
          <div className="storefront-product-meta">
            <span className="storefront-product-discount">{discount}% off</span>
            <small>{deliveryLabel}</small>
          </div>
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
