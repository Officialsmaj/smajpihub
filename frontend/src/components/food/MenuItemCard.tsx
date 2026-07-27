import type { FoodMenuItem } from "../../types/food";
import { formatServicePrice } from "../../lib/piPricing";

type MenuItemCardProps = {
  item: FoodMenuItem;
  onAdd: (item: FoodMenuItem) => void;
};

const MenuItemCard = ({ item, onAdd }: MenuItemCardProps) => (
  <article className="food-menu-item">
    <img src={item.image} alt="" />
    <div>
      <h4>{item.name}</h4>
      <p>{item.description}</p>
      <footer>
        <strong>{formatServicePrice(item.price)}</strong>
        <button type="button" onClick={() => onAdd(item)}>
          Add
        </button>
      </footer>
    </div>
  </article>
);

export default MenuItemCard;
