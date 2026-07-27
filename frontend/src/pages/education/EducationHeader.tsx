import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import "./EducationHeader.css";

const links = [
  ["", "Courses"],
  ["courses", "All Courses"],
  ["partners", "Partners"],
] as const;

const EducationHeader = ({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    navigate(`/services/education/courses${term ? `?q=${encodeURIComponent(term)}` : ""}`);
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
        {links.map(([path, label]) => (
          <NavLink key={label} end={!path} to={`/services/education${path ? `/${path}` : ""}`} onClick={() => setMenuOpen(false)}>
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
          <NavLink end to="/services/education" onClick={() => setMenuOpen(false)}>Courses</NavLink>
          <NavLink to="/services/education/courses" onClick={() => setMenuOpen(false)}>All Courses</NavLink>
          <NavLink to="/services/education/partners" onClick={() => setMenuOpen(false)}>Partners</NavLink>
          <Link to="/app/services">Back to SMAJ Hub</Link>
        </div>
      ) : null}
    </header>
  );
};

export default EducationHeader;
