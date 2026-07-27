import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AppLayout from "../../layouts/AppLayout";
import { getFoodMenu, getFoodRestaurant } from "../../lib/foodDeliveryApi";
import type { FoodRestaurant, FoodMenuItem } from "../../types/food";
import MenuItemCard from "../../components/food/MenuItemCard";
import { useFoodCart } from "../../contexts/FoodCartContext";
import CartSummary from "../../components/food/CartSummary";
import FoodDeliveryHeader from "./FoodDeliveryHeader";
import "./FoodDeliveryPage.css";
import { formatServicePrice } from "../../lib/piPricing";

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<FoodRestaurant | undefined>(undefined);
  const [menu, setMenu] = useState<FoodMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, totalItems } = useFoodCart();
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [restaurantData, menuData] = await Promise.all([getFoodRestaurant(id), getFoodMenu(id)]);
        if (!cancelled) {
          setRestaurant(restaurantData);
          setMenu(menuData);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load restaurant details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="food-page">
          <FoodDeliveryHeader query={query} onQueryChange={setQuery} cartCount={totalItems} />
          <div className="food-loading">Loading restaurant...</div>
        </main>
      </AppLayout>
    );
  }

  if (error || !restaurant) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="food-page">
          <FoodDeliveryHeader query={query} onQueryChange={setQuery} cartCount={totalItems} />
          <div className="food-error">
            <p>{error || "Restaurant not found."}</p>
            <Link to="/services/food-delivery" className="food-search a">
              <ArrowBackRoundedIcon />
              Back to restaurants
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  const categories = Array.from(new Set(menu.map(item => item.category)));

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="food-page">
        <FoodDeliveryHeader query={query} onQueryChange={setQuery} cartCount={totalItems} />
        <Link to="/services/food-delivery" className="food-back-link">
          <ArrowBackRoundedIcon />
          Back to restaurants
        </Link>
        <section className="food-restaurant-hero">
          <img src={restaurant.image} alt="" />
          <div>
            <span className="food-kicker">{restaurant.categories.join(" · ")}</span>
            <h1>{restaurant.name}</h1>
            <p className="food-restaurant-meta">
              <StarRoundedIcon />
              {restaurant.rating} · {restaurant.deliveryTime} · Delivery fee{" "}
              {formatServicePrice(restaurant.deliveryFee)}
            </p>
            <p>{restaurant.description}</p>
          </div>
        </section>

        <section className="food-section">
          <div className="food-section-head compact">
            <span className="food-kicker">MENU</span>
            <h2>Choose your meal.</h2>
          </div>
          {categories.map(category => (
            <div key={category} className="food-menu-category">
              <h3>{category}</h3>
              <div className="food-menu-grid">
                {menu
                  .filter(item => item.category === category)
                  .map(item => (
                    <MenuItemCard key={item.id} item={item} onAdd={addItem} />
                  ))}
              </div>
            </div>
          ))}
        </section>

        <CartSummary onCheckout={() => window.location.assign("/services/food-delivery/cart")} />
      </main>
    </AppLayout>
  );
};

export default RestaurantDetailPage;
