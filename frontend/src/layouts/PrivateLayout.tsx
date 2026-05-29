import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useAuthContext } from "../contexts/AuthContext";
import { privatePages } from "../content/privatePages";
import { privateSearchPopular } from "../content/privateSearch";
import logoImage from "/logo.png";

type PrivateLayoutProps = {
  children: ReactNode;
};

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const { signOut, isLoading, user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchPhraseIndex, setSearchPhraseIndex] = useState(0);
  const navigate = useNavigate();

  const rotatingSearchPhrases = [
    "Search jobs...",
    "Search products...",
    "Search transport...",
    "Search housing...",
    "Search Pi services...",
    "Search freelancers...",
    "Search healthcare...",
    "Search courses...",
    "Search events...",
    "Search sports...",
    "Search movies...",
    "Search charity...",
  ];

  const trendingSearches = ["Jobs", "Phones", "Apartments", "Sports", "Food Delivery"];

  const coreLinks = useMemo(() => privatePages.filter((page) => page.section === "core"), []);
  const workspaceLinks = useMemo(
    () => {
      const roles = user?.roles ?? [];

      return privatePages.filter((page) => {
        if (page.section !== "workspace") {
          return false;
        }
        if (!page.roles) {
          return true;
        }
        return page.roles.some((role) => roles.includes(role));
      });
    },
    [user?.roles],
  );

  const submitSearch = (value: string) => {
    const query = value.trim();
    if (!query) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSearchPhraseIndex((index) => (index + 1) % rotatingSearchPhrases.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [rotatingSearchPhrases.length]);

  return (
    <div className="private-shell">
      <header className="private-header">
        <div className="private-header-inner">
          <Link to="/app/dashboard" className="private-logo-link" aria-label="SMAJ PI HUB Dashboard">
            <img src={logoImage} alt="SMAJ PI HUB Logo" className="private-logo" />
          </Link>
          <button
            type="button"
            className="private-search-mobile-toggle"
            aria-label="Open search"
            onClick={() => setMobileSearchOpen(true)}
          >
            <SearchIcon fontSize="small" />
          </button>
          <button
            type="button"
            className="private-menu-toggle"
            aria-label="Toggle private navigation"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </button>
          <nav className="private-header-nav" aria-label="Private header">
            <NavLink to="/app/dashboard">Dashboard</NavLink>
            <div
              className={`private-services-menu ${servicesMenuOpen ? "private-services-menu-open" : ""}`}
              onMouseEnter={() => setServicesMenuOpen(true)}
              onMouseLeave={() => setServicesMenuOpen(false)}
            >
              <button
                type="button"
                className="private-services-trigger"
                onClick={() => setServicesMenuOpen((open) => !open)}
                aria-expanded={servicesMenuOpen}
              >
                Services <KeyboardArrowDownIcon fontSize="small" />
              </button>
              <div className="private-services-dropdown">
                <Link to="/services/store">Commerce</Link>
                <Link to="/services/jobs">Jobs</Link>
                <Link to="/services/health">Health</Link>
                <Link to="/services/education">Education</Link>
                <Link to="/services/transport">Transport</Link>
                <Link to="/services/stream">Entertainment</Link>
                <Link to="/services">More Services</Link>
              </div>
            </div>
            <NavLink to="/app/wallet">Wallet</NavLink>
            <NavLink to="/app/messages">Messages</NavLink>
            <NavLink to="/app/notifications">Notifications</NavLink>
            <form
              className="private-search-form"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch(searchTerm);
              }}
            >
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 100)}
                placeholder={rotatingSearchPhrases[searchPhraseIndex]}
                aria-label="Search SMAJ PI HUB"
              />
              <button type="submit" aria-label="Submit search">
                <SearchIcon fontSize="small" />
              </button>
            </form>
            {searchFocused && !searchTerm.trim() ? (
              <div className="private-search-trending">
                <p>Trending:</p>
                <div className="private-search-trending-list">
                  {trendingSearches.map((trend) => (
                    <button key={trend} type="button" onClick={() => setSearchTerm(trend.toLowerCase())}>
                      • {trend}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <NavLink to="/app/profile">Profile</NavLink>
          </nav>
        </div>
      </header>

      {mobileSearchOpen ? (
        <div className="private-search-mobile-overlay">
          <div className="private-search-mobile-card">
            <div className="private-search-mobile-head">
              <h2>Search SMAJ PI HUB</h2>
              <button type="button" onClick={() => setMobileSearchOpen(false)} aria-label="Close search">
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <form
              className="private-search-mobile-form"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch(searchTerm);
                setMobileSearchOpen(false);
              }}
            >
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 100)}
                placeholder={rotatingSearchPhrases[searchPhraseIndex]}
                autoFocus
              />
              <button type="submit">Search</button>
            </form>
            {searchFocused && !searchTerm.trim() ? (
              <>
                <p className="private-search-mobile-popular-title">Trending:</p>
                <div className="private-search-mobile-popular">
                  {trendingSearches.map((trend) => (
                    <button key={trend} type="button" onClick={() => setSearchTerm(trend.toLowerCase())}>
                      • {trend}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
            <p className="private-search-mobile-popular-title">Popular:</p>
            <div className="private-search-mobile-popular">
              {privateSearchPopular.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(item.label.toLowerCase())}`);
                    setMobileSearchOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="private-body">
        <aside className={`private-sidebar ${sidebarOpen ? "private-sidebar-open" : ""}`}>
          <div className="private-sidebar-block">
            <h3>Core Pages</h3>
            {coreLinks.map((page) => (
              <NavLink key={page.path} to={`/app/${page.path}`} onClick={() => setSidebarOpen(false)}>
                {page.title}
              </NavLink>
            ))}
          </div>
          <div className="private-sidebar-block">
            <h3>Role Workspaces</h3>
            {workspaceLinks.length ? (
              workspaceLinks.map((page) => (
                <NavLink key={page.path} to={`/app/${page.path}`} onClick={() => setSidebarOpen(false)}>
                  {page.title}
                </NavLink>
              ))
            ) : (
              <p className="private-side-note">No role workspace active yet.</p>
            )}
          </div>
          <div className="private-sidebar-block">
            <h3>Account</h3>
            <button type="button" className="private-sidebar-logout" onClick={signOut} disabled={isLoading}>
              <LogoutIcon fontSize="small" />
              Logout
            </button>
          </div>
        </aside>

        {sidebarOpen ? <button type="button" className="private-overlay" onClick={() => setSidebarOpen(false)} /> : null}
        <div className="private-content">{children}</div>
      </div>

      <footer className="private-footer">
        <p>One login, one wallet, all services. Pi wallet authentication with verified identity.</p>
      </footer>
    </div>
  );
};

export default PrivateLayout;
