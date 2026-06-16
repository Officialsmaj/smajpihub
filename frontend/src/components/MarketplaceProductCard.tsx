import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import type { Product } from "../types/marketplace";

const usd = (pi: number) => (pi * 3.14159).toFixed(5);

type MarketplaceProductCardProps = {
  product: Product;
  saved?: boolean;
  onFavorite?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBuy?: (product: Product) => void;
};

const MarketplaceProductCard = ({ product, saved, onFavorite, onAddToCart, onBuy }: MarketplaceProductCardProps) => {
  const discount = 10 + ((product.title.length + Math.round(product.pricePi * 10000)) % 41);
  const reviewCount = 40 + ((product.title.length * 17) % 860);

  return (
    <article className="product-card product-card-link">
      <Link
        to={`/product/${product._id}`}
        onClick={() => {
          if (product._id.startsWith("demo-product-")) {
            window.localStorage.setItem(`smaj_${product._id}`, JSON.stringify(product));
          }
        }}
        aria-label={`View ${product.title}`}
      >
        <div className="product-image-wrap">
          {product.image ? <img src={product.image} alt={product.title} /> : <span>No image</span>}
          <span className="product-category">{product.category}</span>
        </div>
        <div className="product-card-body">
          <h2>{product.title}</h2>
          <p className="product-seller">Sold by {product.sellerName || product.piUsername}</p>
          <div className="product-meta-row">
            <span className="product-rating">{(product.rating || 4.7).toFixed(1)}★</span>
            <small>{reviewCount} reviews</small>
          </div>
          <div className="product-price-stack">
            <strong>{product.pricePi.toFixed(4)} Pi</strong>
            <small>≈ ${usd(product.pricePi)}</small>
          </div>
          <div className="product-meta-row">
            <small>{product.location}</small>
            <span className="product-discount">-{discount}%</span>
          </div>
        </div>
      </Link>
      <div className="product-card-actions">
        <button className="product-action-button product-action-secondary" type="button" onClick={() => onAddToCart?.(product)}>
          <AddShoppingCartOutlinedIcon />
          Add to Cart
        </button>
        <button className="product-action-button product-action-primary" type="button" onClick={() => onBuy?.(product)}>
          Buy
        </button>
      </div>
      {onFavorite ? (
        <button className="favorite-button" type="button" onClick={() => onFavorite(product)} aria-label={saved ? "Remove saved product" : "Save product"}>
          {saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </button>
      ) : null}
    </article>
  );
};

export default MarketplaceProductCard;
