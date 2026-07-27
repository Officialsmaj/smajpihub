import { type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const links = [
  ["", "Courses"],
  ["courses", "All Courses"],
  ["partners", "Partners"],
] as const;

const EducationHeader = ({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) => {
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
      <nav aria-label="Education navigation">
        {links.map(([path, label]) => (
          <NavLink key={label} end={!path} to={`/services/education${path ? `/${path}` : ""}`}>
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
    </header>
  );
};

export default EducationHeader;
