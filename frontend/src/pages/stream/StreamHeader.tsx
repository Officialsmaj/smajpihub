import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import "./StreamHeader.css";

type StreamHeaderProps = {
  query?: string;
  onQueryChange?: (value: string) => void;
};

const links = [
  ["Home", "/app/services/stream"],
  ["Movies", "/app/services/stream/movies"],
  ["Series", "/app/services/stream/series"],
  ["Live", "/app/services/stream/live"],
  ["My List", "/app/services/stream/my-list"],
  ["Studio", "/app/services/stream/studio"],
] as const;

const StreamHeader = ({ query, onQueryChange }: StreamHeaderProps) => {
  const [localQuery, setLocalQuery] = useState("");
  const navigate = useNavigate();
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
    <nav aria-label="SMAJ Stream navigation">{links.map(([label, to]) => <NavLink key={to} to={to} end={to === "/app/services/stream"}>{label}</NavLink>)}</nav>
  </header>;
};

export default StreamHeader;
