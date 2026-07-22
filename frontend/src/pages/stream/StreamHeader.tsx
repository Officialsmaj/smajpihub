import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import "./StreamHeader.css";

type StreamHeaderProps = {
  query?: string;
  onQueryChange?: (value: string) => void;
};

const links = [
  ["Trending", "/app/services/stream"],
  ["Movies", "/app/services/stream/movies"],
  ["Series", "/app/services/stream/series"],
  ["TV Channels", "/app/services/stream/live?mode=channels"],
  ["Hollywood", "/app/services/stream/category/hollywood"],
  ["Bollywood", "/app/services/stream/category/bollywood"],
  ["Nollywood", "/app/services/stream/category/nollywood"],
  ["Kannywood", "/app/services/stream/category/kannywood"],
  ["Anime", "/app/services/stream/category/anime"],
  ["K-Drama", "/app/services/stream/category/k-drama"],
  ["Chinese Drama", "/app/services/stream/category/chinese-drama"],
  ["African Movies", "/app/services/stream/category/african-movies"],
  ["Documentaries", "/app/services/stream/category/documentaries"],
  ["Kids", "/app/services/stream/category/kids"],
  ["Action", "/app/services/stream/category/action"],
  ["Comedy", "/app/services/stream/category/comedy"],
  ["Romance", "/app/services/stream/category/romance"],
  ["Horror", "/app/services/stream/category/horror"],
  ["Sports", "/app/services/stream/category/sports"],
  ["WWE / WWV", "/app/services/stream/search?q=WWE%20WWV"],
  ["Live", "/app/services/stream/live"],
  ["My List", "/app/services/stream/my-list"],
  ["Studio", "/app/services/stream/studio"],
] as const;

const StreamHeader = ({ query, onQueryChange }: StreamHeaderProps) => {
  const [localQuery, setLocalQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const value = query ?? localQuery;
  const changeQuery = (next: string) => {
    setLocalQuery(next);
    onQueryChange?.(next);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/app/services/stream/search${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ""}`);
  };

  return <header className="stream-global-header">
    <div className="stream-global-row">
      <Link className="stream-global-back" to="/app/services">← Hub</Link>
      <Link className="stream-global-brand" to="/app/services/stream" aria-label="SMAJ Stream home"><span><PlayArrowRoundedIcon /></span><b>SMAJ</b><em>Stream</em></Link>
      <form className="stream-global-search" onSubmit={submit}><SearchRoundedIcon /><input value={value} onChange={(event) => changeQuery(event.target.value)} placeholder="Search movies, series and creators" aria-label="Search SMAJ Stream" /></form>
      <Link className="stream-global-create" to="/app/services/stream/studio"><VideoCallRoundedIcon /><span>Create</span></Link>
    </div>
    <nav aria-label="SMAJ Stream categories">{links.map(([label, to]) => {
      const current = `${location.pathname}${location.search}`;
      const active = to === "/app/services/stream" ? location.pathname === to : current === to;
      return <Link key={`${label}-${to}`} className={active ? "active" : ""} aria-current={active ? "page" : undefined} to={to}>{label}</Link>;
    })}</nav>
  </header>;
};

export default StreamHeader;
