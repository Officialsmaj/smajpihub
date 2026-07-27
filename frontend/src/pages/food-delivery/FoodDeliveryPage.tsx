import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import AppLayout from "../../layouts/AppLayout";
import {
  getFoodCategories,
  getFoodRestaurants,
  type FoodRestaurant,
} from "../../lib/foodDeliveryApi";
import { useFoodCart } from "../../contexts/FoodCartContext";
import RestaurantCard from "../../components/food/RestaurantCard";
import CartSummary from "../../components/food/CartSummary";
import FoodDeliveryHeader from "./FoodDeliveryHeader";
import "./FoodDeliveryPage.css";

const FEATURED_STATS = [
  ["120+", "Restaurants"],
  ["30 min", "Fast delivery"],
  ["Pi", "Secure checkout"],
] as const;

const FoodDeliveryPage = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<FoodRestaurant[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { totalItems } = useFoodCart();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cats, initialRestaurants] = await Promise.all([
          getFoodCategories(),
          getFoodRestaurants(),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setRestaurants(initialRestaurants);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load restaurants. Showing saved preview.");
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
  }, []);

  const filteredRestaurants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const matchesQuery = !q ||
        restaurant.name.toLowerCase().includes(q) ||
        restaurant.categories.some((category) => category.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === "All" || restaurant.categories.includes(selectedCategory);
      return matchesQuery && matchesCategory;
    });
  }, [restaurants, query, selectedCategory]);

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="food-page">
        <FoodDeliveryHeader query={query} onQueryChange={setQuery} cartCount={totalItems} />
        <section className="food-hero">
          <div className="food-hero-copy">
            <span className="food-kicker">SMAJ PI FOOD DELIVERY</span>
            <h1>Hungry? Get it in minutes.</h1>
            <p>
              Order from local restaurants, track your delivery, and pay with Pi.
            </p>
            <div className="food-search" role="search">
              <SearchOutlinedIcon />
              <input
                type="search"
                placeholder="Search restaurants, cuisines..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Link to="#restaurants">Find food</Link>
            </div>
          </div>
          <aside className="food-hero-panel" aria-label="Food delivery preview">
            <div className="food-popular-card">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85"
                alt=""
              />
              <span>Popular near you</span>
            </div>
            <div className="food-delivery-card">
              <div>
                <strong>Live tracking</strong>
                <small>Real-time driver updates</small>
              </div>
              <b>Pi checkout</b>
              <Link to="/dashboard">Open wallet</Link>
            </div>
          </aside>
        </section>

        <section className="food-stats" aria-label="Food delivery overview">
          {FEATURED_STATS.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>

        <section id="restaurants" className="food-section">
          <div className="food-section-head">
            <span className="food-kicker">WHAT YOU CAN ORDER</span>
            <h2>Restaurants near you.</h2>
            <p>
              Browse verified restaurants, track live delivery, and pay securely with Pi.
            </p>
          </div>
          <div className="food-category-grid">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`food-category-tile${selectedCategory === category ? " selected" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === "All" ? <LocalFireDepartmentOutlinedIcon /> : <StarOutlinedIcon />}
                <span>{category}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="food-section">
          <div className="food-section-head compact">
            <span className="food-kicker">RESTAURANTS</span>
            <h2>Start ordering.</h2>
          </div>
          {loading ? (
            <div className="food-loading">Loading restaurants...</div>
          ) : error ? (
            <div className="food-error">
              <p>{error}</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="food-empty">
              <p>No restaurants match your search.</p>
            </div>
          ) : (
            <div className="food-restaurant-grid">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </section>

        <CartSummary onCheckout={() => navigate("/services/food-delivery/cart")} />
      </main>
    </AppLayout>
  );
};

export default FoodDeliveryPage;
