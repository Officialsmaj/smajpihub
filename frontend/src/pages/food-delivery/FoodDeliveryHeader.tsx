import { type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ServiceMobileMenu from "../../components/ServiceMobileMenu";
import "./FoodDeliveryHeader.css";

type FoodDeliveryHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  cartCount: number;
};

const links = [
  ["", "Restaurants"],
  ["deals", "Deals"],
  ["orders", "My orders"],
] as const;

const FoodDeliveryHeader = ({ query, onQueryChange, cartCount }: FoodDeliveryHeaderProps) => {
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    navigate(`/services/food-delivery${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  };

  return (
    <header className="food-header">
      <Link to="/app/services" className="food-back-to-hub" aria-label="Back to SMAJ PI HUB services">
        ← Hub
      </Link>
      <Link to="/services/food-delivery" className="food-brand">
        <b>Food</b>
      </Link>
      <nav aria-label="Food Delivery navigation">
        {links.map(([path, label]) => (
          <NavLink key={label} end={!path} to={`/services/food-delivery${path ? `/${path}` : ""}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <form className="food-header-search" role="search" onSubmit={submit}>
        <SearchRoundedIcon />
        <input
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search restaurants, cuisines..."
          aria-label="Search SMAJ PI Food"
        />
      </form>
      <Link to="/services/food-delivery/cart" className="food-cart-icon" aria-label="Open cart">
        <ShoppingCartRoundedIcon />
        {cartCount > 0 ? <span>{cartCount}</span> : null}
      </Link>
      <ServiceMobileMenu
        title="SMAJ Food"
        accent="#e85d2a"
        items={[
          { label: "Restaurants", to: "/services/food-delivery" },
          { label: "Deals", to: "/services/food-delivery/deals" },
          { label: "My orders", to: "/services/food-delivery/orders" },
          { label: "Cart", to: "/services/food-delivery/cart" },
        ]}
      />
    </header>
  );
};

export default FoodDeliveryHeader;
