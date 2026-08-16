import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import "./EducationHeader.css";

const links = [
  ["/services/education/courses", "Explore Courses"],
  ["/services/education/partners", "Partners"],
  ["/onboarding", "Teach on SMAJ"],
  ["/help", "Help"],
] as const;

const EducationHeader = ({ query, onQueryChange, searchPath = "/services/education/courses" }: { query: string; onQueryChange: (value: string) => void; searchPath?: string }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMenuOpen(false);
    const term = query.trim();
    navigate(`${searchPath}${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  };

  return (
    <header className="education-header">
      <Link to="/app/services" className="education-back-to-hub" aria-label="Back to SMAJ PI HUB services">
        ← Hub
      </Link>
      <Link to="/services/education" className="education-brand">
        <b>Education</b>
      </Link>
      <nav className={menuOpen ? "open" : ""} aria-label="Education navigation">
        {links.map(([to, label]) => (
          <NavLink key={label} to={to} onClick={() => setMenuOpen(false)}>
            {label}
          </NavLink>
        ))}
      </nav>
      <form className="education-header-search" role="search" onSubmit={submit}>
        <SearchRoundedIcon />
        <input
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search courses, tutors, certificates"
          aria-label="Search SMAJ PI Education"
        />
      </form>
      <button
        className="education-menu-button"
        type="button"
        aria-label={menuOpen ? "Close Education menu" : "Open Education menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(value => !value)}
      >
        {menuOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
      </button>
      {menuOpen ? (
        <div className="education-mobile-menu open">
          <form className="education-mobile-search" role="search" onSubmit={submit}>
            <SearchRoundedIcon />
            <input
              type="search"
              value={query}
              onChange={event => onQueryChange(event.target.value)}
              placeholder="What do you want to learn?"
              aria-label="Search SMAJ PI Education"
            />
            <button type="submit">Search</button>
          </form>
          {links.map(([to, label]) => (
            <NavLink key={label} to={to} onClick={() => setMenuOpen(false)}>
              {label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </header>
  );
};

export default EducationHeader;
