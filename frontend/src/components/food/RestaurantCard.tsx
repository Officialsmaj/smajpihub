import { Link } from "react-router-dom";
import type { FoodRestaurant } from "../../types/food";

type RestaurantCardProps = {
  restaurant: FoodRestaurant;
};

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => (
  <article className="food-restaurant-card">
    <Link to={`/services/food-delivery/restaurants/${restaurant.id}`}>
      <img src={restaurant.image} alt="" />
      <div>
        <div className="food-restaurant-header">
          <h3>{restaurant.name}</h3>
          <span className="food-rating">{restaurant.rating}</span>
        </div>
        <p className="food-restaurant-meta">
          {restaurant.categories.join(" · ")} · {restaurant.deliveryTime}
        </p>
        <p className="food-restaurant-delivery">
          Delivery fee π {restaurant.deliveryFee.toFixed(2)}
        </p>
      </div>
    </Link>
  </article>
);

export default RestaurantCard;
