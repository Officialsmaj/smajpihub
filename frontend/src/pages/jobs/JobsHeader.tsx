import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const links = [
  ["", "Home"],
  ["search", "Find jobs"],
  ["freelance", "Freelance"],
  ["companies", "Companies"],
  ["applications", "Applications"],
] as const;

const JobsHeader = ({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    navigate(`/services/jobs/search${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  };

  return (
    <header className="jobs-header">
      <Link to="/app/services" className="jobs-hub-link">
        ← Hub
      </Link>
      <NavLink end to="/services/jobs" className="jobs-brand">
        Jobs
      </NavLink>
      <nav className={menuOpen ? "open" : ""} aria-label="Jobs navigation">
        {links.map(([path, label]) => (
          <NavLink
            key={label}
            end={!path}
            to={`/services/jobs${path ? `/${path}` : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}
        <NavLink className="jobs-mobile-post" to="/services/jobs/post">
          Post a job
        </NavLink>
      </nav>
      <form className="jobs-header-search" role="search" onSubmit={submit}>
        <SearchRoundedIcon />
        <input
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search jobs or skills"
          aria-label="Search SMAJ PI Jobs"
        />
      </form>
      <NavLink className="jobs-notification" to="/notifications" aria-label="Notifications">
        <NotificationsNoneRoundedIcon />
      </NavLink>
      <NavLink className="jobs-post-button" to="/services/jobs/post">
        Post a job
      </NavLink>
      <button
        className="jobs-menu-button"
        type="button"
        aria-label={menuOpen ? "Close Jobs menu" : "Open Jobs menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(value => !value)}
      >
        {menuOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
      </button>
    </header>
  );
};

export default JobsHeader;
