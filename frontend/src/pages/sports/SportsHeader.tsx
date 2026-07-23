import { NavLink } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const links = [
  ["", "Home"],
  ["live", "Live"],
  ["matches", "Matches"],
  ["competitions", "Competitions"],
  ["teams", "Teams"],
  ["news", "News"],
  ["community", "Community"],
];

const SportsHeader = ({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) => (
  <header className="sports-header">
    <NavLink to="/app/services" className="sports-back-to-hub" aria-label="Back to SMAJ PI HUB services">
      <ArrowBackRoundedIcon />
      <span>Back to Hub</span>
    </NavLink>
    <NavLink to="/services/sports" className="sports-brand">
      <span>
        <SportsSoccerRoundedIcon />
      </span>
      <b>SMAJ</b> Sports
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
        placeholder="Search teams, matches..."
      />
    </label>
    <button className="sports-icon-button" type="button" aria-label="Sports notifications">
      <NotificationsNoneRoundedIcon />
    </button>
  </header>
);

export default SportsHeader;
