import { type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

type HealthHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

const links = [
  ["", "Find care"],
  ["providers", "Providers"],
  ["services", "Services"],
] as const;

const HealthHeader = ({ query, onQueryChange }: HealthHeaderProps) => {
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    navigate(`/services/health${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  };

  return (
    <header className="health-header">
      <Link to="/app/services" className="health-back-to-hub" aria-label="Back to SMAJ PI HUB services">
        ← Hub
      </Link>
      <Link to="/services/health" className="health-brand">
        <b>Health</b>
      </Link>
      <nav aria-label="Health navigation">
        {links.map(([path, label]) => (
          <NavLink key={label} end={!path} to={`/services/health${path ? `/${path}` : ""}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <form className="health-header-search" role="search" onSubmit={submit}>
        <SearchRoundedIcon />
        <input
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search providers, services..."
          aria-label="Search SMAJ PI Health"
        />
      </form>
    </header>
  );
};

export default HealthHeader;
