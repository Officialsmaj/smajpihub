import { NavLink } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ServiceMobileMenu from "../../components/ServiceMobileMenu";

const links = [
  ["", "Home"],
  ["live", "Latest"],
  ["matches", "Matches"],
  ["competitions", "Competitions"],
  ["teams", "Teams"],
  ["news", "News"],
  ["community", "Community"],
];

const SportsHeader = ({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) => (
  <header className="sports-header">
    <NavLink to="/app/services" className="sports-back-to-hub" aria-label="Back to SMAJ PI HUB services">
      ← Hub
    </NavLink>
    <NavLink to="/services/sports" className="sports-brand">
      <b>Sports</b>
    </NavLink>
    <nav aria-label="Sports navigation">
      {links.map(([path, label]) => (
        <NavLink key={label} end={!path} to={`/services/sports${path ? `/${path}` : ""}`}>
          {label}
        </NavLink>
      ))}
    </nav>
    <label className="sports-search">
      <SearchRoundedIcon />
      <input
        value={query}
        onChange={event => onQueryChange(event.target.value)}
        placeholder="Search teams, matches and competitions"
      />
    </label>
    <button
      className="sports-icon-button"
      type="button"
      aria-label="Sports notifications coming soon"
      title="Notifications coming soon"
      disabled
    >
      <NotificationsNoneRoundedIcon />
    </button>
    <ServiceMobileMenu
      title="SMAJ Sports"
      accent="#1d64d8"
      items={links.map(([path, label]) => ({
        label,
        to: `/services/sports${path ? `/${path}` : ""}`,
      }))}
    />
  </header>
);

export default SportsHeader;
