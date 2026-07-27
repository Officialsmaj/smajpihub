import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AppLayout from "../../layouts/AppLayout";
import { useFoodCart } from "../../contexts/FoodCartContext";
import FoodDeliveryHeader from "./FoodDeliveryHeader";
import "./FoodDeliveryPage.css";
import { formatServicePrice, piFromUsdt, PI_USDT_RATE } from "../../lib/piPricing";

const CartPage = () => {
  const { items, addItem, decreaseItem, removeItem, clearCart, totalItems, totalPrice } = useFoodCart();
  const [query, setQuery] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const deliveryFee = items.length > 0 ? 3.5 : 0;
  const serviceFee = totalPrice * 0.05;
  const grandTotal = totalPrice + deliveryFee + serviceFee;
  const checkout = () => {
    if (!address.trim() || items.length === 0) return;
    const orders = JSON.parse(window.localStorage.getItem("smaj_food_orders") || "[]") as unknown[];
    orders.unshift({
      id: `FOOD-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: "Preparing",
      address: address.trim(),
      total: piFromUsdt(grandTotal),
      totalUsdt: grandTotal,
      piRateUsed: PI_USDT_RATE,
      items,
    });
    window.localStorage.setItem("smaj_food_orders", JSON.stringify(orders));
    clearCart();
    navigate("/services/food-delivery/orders");
  };

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="food-page">
        <FoodDeliveryHeader query={query} onQueryChange={setQuery} cartCount={totalItems} />
        <Link to="/services/food-delivery" className="food-back-link">
          <ArrowBackRoundedIcon />
          Back to restaurants
        </Link>
        <section className="food-section">
          <div className="food-section-head compact">
            <span className="food-kicker">YOUR CART</span>
            <h2>
              {totalItems} item{totalItems !== 1 ? "s" : ""} ready to order.
            </h2>
          </div>
          {items.length === 0 ? (
            <div className="food-empty">
              <p>Your cart is empty.</p>
              <Link to="/services/food-delivery" className="food-search a">
                Browse restaurants
              </Link>
            </div>
          ) : (
            <div className="food-cart-layout">
              <div className="food-cart-items">
                {items.map(cartItem => (
                  <article key={cartItem.menuItem.id} className="food-cart-item">
                    <img src={cartItem.menuItem.image} alt="" />
                    <div>
                      <h4>{cartItem.menuItem.name}</h4>
                      <p>{formatServicePrice(cartItem.menuItem.price)} each</p>
                      <div className="food-cart-item-actions">
                        <button
                          type="button"
                          onClick={() => decreaseItem(cartItem.menuItem.id)}
                          aria-label={`Remove one ${cartItem.menuItem.name}`}
                        >
                          −
                        </button>
                        <span>Qty: {cartItem.quantity}</span>
                        <button
                          type="button"
                          onClick={() => addItem(cartItem.menuItem)}
                          aria-label={`Add one ${cartItem.menuItem.name}`}
                        >
                          +
                        </button>
                        <button type="button" onClick={() => removeItem(cartItem.menuItem.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <strong>{formatServicePrice(cartItem.menuItem.price * cartItem.quantity)}</strong>
                  </article>
                ))}
              </div>
              <aside className="food-cart-summary-card">
                <h3>Order summary</h3>
                <div className="food-summary-row">
                  <span>Subtotal</span>
                  <strong>{formatServicePrice(totalPrice)}</strong>
                </div>
                <div className="food-summary-row">
                  <span>Delivery fee</span>
                  <strong>{formatServicePrice(deliveryFee)}</strong>
                </div>
                <div className="food-summary-row">
                  <span>Service fee</span>
                  <strong>{formatServicePrice(serviceFee)}</strong>
                </div>
                <div className="food-summary-row total">
                  <span>Total</span>
                  <strong>{formatServicePrice(grandTotal)}</strong>
                </div>
                <label className="food-address-field">
                  Delivery address
                  <textarea
                    value={address}
                    onChange={event => setAddress(event.target.value)}
                    placeholder="Street, city, delivery instructions"
                  />
                </label>
                <button className="food-cart-checkout-btn" type="button" onClick={checkout} disabled={!address.trim()}>
                  Place Pi order
                  <AccountBalanceWalletOutlinedIcon />
                </button>
              </aside>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
};

export default CartPage;
