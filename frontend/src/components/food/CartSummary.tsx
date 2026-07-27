import { Link } from "react-router-dom";
import { useFoodCart } from "../../contexts/FoodCartContext";

type CartSummaryProps = {
  onCheckout: () => void;
};

const CartSummary = ({ onCheckout }: CartSummaryProps) => {
  const { items, totalItems, totalPrice } = useFoodCart();

  if (items.length === 0) return null;

  return (
    <div className="food-cart-summary">
      <div className="food-cart-summary-inner">
        <div>
          <strong>
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </strong>
          <span>π {totalPrice.toFixed(2)}</span>
        </div>
        <div>
          <Link to="/services/food-delivery/cart" className="food-cart-view-btn">
            View cart
          </Link>
          <button type="button" className="food-cart-checkout-btn" onClick={onCheckout}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
