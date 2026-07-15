import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { addToCart, getCartItems, saveCartItems, type CartItem } from "../lib/storeCart";
import type { Product } from "../types/marketplace";

type CartToastState = { product: Product; previousItems: CartItem[] };

export const useAddToCartToast = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<CartToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const addProductToCart = (product: Product) => {
    const previousItems = getCartItems();
    addToCart(product);
    setToast({ product, previousItems });
  };

  const undo = () => {
    if (!toast) return;
    saveCartItems(toast.previousItems);
    setToast(null);
  };

  const cartToast = toast ? (
    <aside className="cart-success-toast" role="status" aria-live="polite">
      <span className="cart-success-toast-icon"><CheckCircleRoundedIcon /></span>
      <span className="cart-success-toast-image">{toast.product.image ? <img src={toast.product.image} alt="" /> : null}</span>
      <span className="cart-success-toast-copy"><strong>Added to cart</strong><small>{toast.product.title}</small></span>
      <button type="button" className="cart-success-toast-close" onClick={() => setToast(null)} aria-label="Close"><CloseRoundedIcon /></button>
      <span className="cart-success-toast-actions">
        <button type="button" className="cart-toast-undo" onClick={undo}>Undo</button>
        <button type="button" className="cart-toast-view" onClick={() => navigate("/cart")}>View Cart</button>
      </span>
    </aside>
  ) : null;

  return { addProductToCart, cartToast };
};
