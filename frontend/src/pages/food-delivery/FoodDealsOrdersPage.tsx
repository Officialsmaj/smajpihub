import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AppLayout from "../../layouts/AppLayout";
import { useFoodCart } from "../../contexts/FoodCartContext";
import FoodDeliveryHeader from "./FoodDeliveryHeader";
import "./FoodDeliveryPage.css";
import { formatServicePrice, usdtFromPi } from "../../lib/piPricing";

type StoredOrder = {
  id: string;
  createdAt: string;
  status: string;
  address: string;
  total: number;
  totalUsdt?: number;
  items: Array<{ quantity: number; menuItem: { name: string } }>;
};

const FoodDealsOrdersPage = ({ kind }: { kind: "deals" | "orders" }) => {
  const [query, setQuery] = useState("");
  const { totalItems } = useFoodCart();
  const orders = useMemo(() => {
    try {
      return JSON.parse(window.localStorage.getItem("smaj_food_orders") || "[]") as StoredOrder[];
    } catch {
      return [];
    }
  }, []);

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="food-page">
        <FoodDeliveryHeader query={query} onQueryChange={setQuery} cartCount={totalItems} />
        <section className="food-section food-subpage">
          <div className="food-section-head">
            <span className="food-kicker">{kind === "deals" ? "FOOD DEALS" : "MY ORDERS"}</span>
            <h2>{kind === "deals" ? "Save Pi on your next meal." : "Track your food orders."}</h2>
          </div>
          {kind === "deals" ? (
            <div className="food-deals-grid">
              {[
                ["Free delivery", "On your first order from SMAJ Bites.", "smaj-bites"],
                ["10% off pizza", "Save on orders of 20 Pi or more.", "pioneer-pizza"],
                ["Healthy lunch deal", "Selected bowls from African Spice House.", "african-spice"],
              ].map(([title, text, restaurant]) => (
                <article key={title}>
                  <LocalOfferOutlinedIcon />
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <Link to={`/services/food-delivery/restaurants/${restaurant}`}>View restaurant</Link>
                </article>
              ))}
            </div>
          ) : orders.length ? (
            <div className="food-order-list">
              {orders.map(order => (
                <article key={order.id}>
                  <ReceiptLongOutlinedIcon />
                  <div>
                    <h3>{order.id}</h3>
                    <p>{order.items.map(item => `${item.quantity}× ${item.menuItem.name}`).join(", ")}</p>
                    <small>
                      {new Date(order.createdAt).toLocaleString()} · {order.address}
                    </small>
                  </div>
                  <div>
                    <b>{order.status}</b>
                    <strong>{formatServicePrice(order.totalUsdt ?? usdtFromPi(order.total))}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="food-empty">
              <ReceiptLongOutlinedIcon />
              <p>You have no food orders yet.</p>
              <Link to="/services/food-delivery">Browse restaurants</Link>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
};

export default FoodDealsOrdersPage;
