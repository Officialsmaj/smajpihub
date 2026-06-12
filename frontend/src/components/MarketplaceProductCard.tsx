import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import type { Product } from "../types/marketplace";

const MarketplaceProductCard = ({ product, saved, onFavorite }: { product: Product; saved?: boolean; onFavorite?: (product: Product) => void }) => <article className="product-card product-card-link">
  <Link to={`/product/${product._id}`} aria-label={`View ${product.title}`}><div className="product-image-wrap">{product.image ? <img src={product.image} alt={product.title} /> : <span>No image</span>}<span className="product-category">{product.category}</span></div><div className="product-card-body"><p className="product-location">{product.location}</p><h2>{product.title}</h2><p className="product-seller">Sold by {product.sellerName || product.piUsername}</p><div className="product-card-foot"><strong>{product.pricePi} Pi</strong><span className="product-view-button">View</span></div></div></Link>
  {onFavorite ? <button className="favorite-button" type="button" onClick={() => onFavorite(product)} aria-label={saved ? "Remove saved product" : "Save product"}>{saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}</button> : null}
</article>;
export default MarketplaceProductCard;
