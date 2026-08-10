import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SubscriptionsOutlinedIcon from "@mui/icons-material/SubscriptionsOutlined";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FamilyRestroomRoundedIcon from "@mui/icons-material/FamilyRestroomRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import "./StreamHeader.css";

type StreamHeaderProps = {
  query?: string;
  onQueryChange?: (value: string) => void;
};

const links = [
  ["Trending", "/app/services/stream"],
  ["Movies", "/app/services/stream/movies"],
  ["Series", "/app/services/stream/series"],
  ["TV Shows", "/app/services/stream/category/tv-channels"],
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
  ["Creators", "/app/services/stream/creators"],
] as const;

const StreamHeader = ({ query, onQueryChange }: StreamHeaderProps) => {
  const [localSearch, setLocalSearch] = useState({ locationSearch: "", value: "" });
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const urlQuery = new URLSearchParams(location.search).get("q") || "";
  const value = query ?? (localSearch.locationSearch === location.search ? localSearch.value : urlQuery);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const changeQuery = (next: string) => {
    setLocalSearch({ locationSearch: location.search, value: next });
    onQueryChange?.(next);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const term = value.trim();
    navigate(`/app/services/stream/search${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  };

  return (
    <>
      <header className="stream-global-header">
        <div className="stream-global-row">
          <Link className="stream-global-back" to="/app/services">
            &lt;- Hub
          </Link>
          <Link className="stream-global-title" to="/app/services/stream">
            Stream
          </Link>
          <form className="stream-global-search" role="search" onSubmit={submit}>
            <SearchRoundedIcon />
            <input
              type="search"
              enterKeyHint="search"
              value={value}
              onChange={event => changeQuery(event.target.value)}
              placeholder="Search movies, series and creators"
              aria-label="Search SMAJ Stream"
            />
          </form>
          <button
            className="stream-global-menu-button"
            type="button"
            aria-label="Open Stream menu"
            aria-expanded={menuOpen}
            aria-controls="stream-side-menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuRoundedIcon />
          </button>
        </div>
        <nav ref={navRef} aria-label="SMAJ Stream categories">
          {links.map(([label, to]) => {
            const current = `${location.pathname}${location.search}`;
            const active = to === "/app/services/stream" ? location.pathname === to : current === to;
            return (
              <Link key={`${label}-${to}`} className={active ? "active" : ""} aria-current={active ? "page" : undefined} to={to}>
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      {menuOpen ? (
        <div className="stream-menu-layer">
          <button className="stream-menu-overlay" type="button" onClick={() => setMenuOpen(false)} aria-label="Close Stream menu" />
          <aside id="stream-side-menu" className="stream-side-menu" aria-label="Stream account and creator menu">
            <header>
              <div>
                <span>
                  <PlayArrowRoundedIcon />
                </span>
                <b>SMAJ Stream</b>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <CloseRoundedIcon />
              </button>
            </header>
            <section>
              <b>YOUR STREAM</b>
              <Link to="/app/services/stream/downloads">
                <BookmarkBorderRoundedIcon /> Downloads
              </Link>
              <Link to="/app/services/stream/my-list">
                <BookmarkBorderRoundedIcon /> My List
              </Link>
              <Link to="/app/services/stream/history">
                <HistoryRoundedIcon /> Watch History
              </Link>
              <Link to="/app/services/stream/subscriptions">
                <SubscriptionsOutlinedIcon /> Subscriptions
              </Link>
              <Link to="/app/services/stream/plans">
                <PaymentsRoundedIcon /> Plans & payments
              </Link>
            </section>
            <section>
              <b>CREATOR</b>
              <Link to="/app/services/stream/creators">
                <VideoCallRoundedIcon /> Creators
              </Link>
              <Link to="/app/services/stream/studio">
                <VideoCallRoundedIcon /> Creator Studio
              </Link>
              <Link to="/app/services/stream/studio/upload">
                <UploadRoundedIcon /> Add video
              </Link>
              <Link to="/app/services/stream/studio/content">
                <PlayArrowRoundedIcon /> Content Manager
              </Link>
            </section>
            <section>
              <b>SETTINGS & HELP</b>
              <Link to="/app/services/stream/parental">
                <FamilyRestroomRoundedIcon /> Parental Controls
              </Link>
              <Link to="/settings">
                <SettingsOutlinedIcon /> Settings
              </Link>
              <Link to="/app/help-center">
                <HelpOutlineRoundedIcon /> Help Center
              </Link>
              <Link to="/app/services">&lt;- Back to SMAJ Hub</Link>
            </section>
          </aside>
        </div>
      ) : null}
    </>
  );
};

export default StreamHeader;
