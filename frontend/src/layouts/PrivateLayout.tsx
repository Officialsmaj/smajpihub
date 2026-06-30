import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useAuthContext } from "../contexts/AuthContext";
import { axiosClient } from "../lib/axiosClient";
import ConfirmSignOutModal from "../components/ConfirmSignOutModal";
import logoImage from "/logo.png";
import { serviceCatalog } from "../content/serviceCatalog";
import useRouteScrollTop from "../hooks/useRouteScrollTop";

type PrivateLayoutProps = { children: ReactNode };
const SIDEBAR_STORAGE_KEY = "smaj_private_sidebar_collapsed";
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/store": "Store",
  "/add-product": "Add Product",
  "/orders": "Orders",
  "/seller": "Seller Dashboard",
  "/profile": "Profile",
  "/settings": "Settings",
  "/search": "Search",
  "/messages": "Messages",
  "/notifications": "Notifications",
  "/saved": "Saved Products",
  "/app/services": "Services",
  "/trending": "Trending",
  "/lifestyle": "Lifestyle",
  "/categories": "Categories",
  "/app/help-center": "Help Center",
  "/app/wallet": "Wallet",
};

const links = [
  { to: "/dashboard", label: "Home", icon: <DashboardOutlinedIcon /> },
  { to: "/app/services", label: "Services", icon: <AppsOutlinedIcon /> },
  { to: "/store", label: "Marketplace", icon: <StorefrontOutlinedIcon /> },
  { to: "/messages", label: "Messages", icon: <ChatOutlinedIcon /> },
];

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  useRouteScrollTop();
  const { signOut, isLoading, user, updateSettings } = useAuthContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => window.localStorage.getItem("smaj_public_theme") === "dark" ? "dark" : "light");
  const [showSignOut, setShowSignOut] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const profileAvatarRef = useRef<HTMLButtonElement | null>(null);
  const [profileMenuPosition, setProfileMenuPosition] = useState<{ top: number; left: number }>({ top: 64, left: 16 });
  const navigate = useNavigate();
  const location = useLocation();
  const isStoreShell = location.pathname === "/store";
  const pageTitle = location.pathname.startsWith("/product/") ? "Product Details"
    : location.pathname.startsWith("/app/services/") ? "Service"
    : location.pathname.startsWith("/edit-product/") ? "Edit Product"
      : pageTitles[location.pathname] || "SMAJ PI HUB";

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem("smaj_public_theme", themeMode);
  }, [themeMode]);

  useEffect(() => { axiosClient.get("/notifications").then(({ data }) => setUnreadCount(data.unreadCount || 0)).catch(() => undefined); }, [location.pathname]);
  useEffect(() => { document.body.style.overflow = mobileSidebarOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileSidebarOpen]);
  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const logout = async () => {
    await signOut();
    setShowSignOut(false);
    navigate("/home", { replace: true });
  };

  const toggleTheme = async () => {
    const settings = user?.settings || { theme: "light" as const, language: "English", notifications: true };
    const next = themeMode === "light" ? "dark" : "light";
    setThemeMode(next);
    await updateSettings({ ...settings, theme: next }).catch(() => undefined);
  };
  const themeIcon = themeMode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />;
  const headerResults = useMemo(() => { const query = headerSearch.trim().toLowerCase(); if (!query) return []; const services = serviceCatalog.filter((item) => [item.name, item.experience, item.description, ...item.items].join(" ").toLowerCase().includes(query)).map((item) => ({ group: "Services", label: item.name, to: item.live ? "/store" : `/app/services/${item.slug}` })); const pages = [{ group: "Account", label: "Profile", to: "/profile" }, { group: "Account", label: "Wallet", to: "/wallet" }, { group: "Account", label: "Settings", to: "/settings" }, { group: "Support", label: "Help Center", to: "/help" }, { group: "Marketplace", label: "Products and sellers", to: `/store?search=${encodeURIComponent(query)}` }].filter((item) => item.label.toLowerCase().includes(query) || ["products", "stores", "sellers", "help", "settings"].some((term) => query.includes(term))); return [...services, ...pages].slice(0, 10); }, [headerSearch]);
  const submitHeaderSearch = (event: FormEvent) => { event.preventDefault(); if (headerResults[0]) { navigate(headerResults[0].to); setSearchOpen(false); setHeaderSearch(""); } else if (headerSearch.trim()) navigate(`/store?search=${encodeURIComponent(headerSearch.trim())}`); };
  const positionProfileMenu = () => {
    const avatar = profileAvatarRef.current;
    if (!avatar) return;
    const rect = avatar.getBoundingClientRect();
    const width = 220;
    const gutter = 16;
    const top = Math.max(gutter, Math.min(window.innerHeight - gutter, rect.bottom + 10));
    const preferredLeft = rect.right - width;
    const maxLeft = window.innerWidth - width - gutter;
    const left = Math.max(gutter, Math.min(maxLeft, preferredLeft));
    setProfileMenuPosition({ top, left });
  };

  useEffect(() => {
    if (!profileMenuOpen) return;
    positionProfileMenu();
    window.addEventListener("resize", positionProfileMenu);
    window.addEventListener("scroll", positionProfileMenu, true);
    return () => {
      window.removeEventListener("resize", positionProfileMenu);
      window.removeEventListener("scroll", positionProfileMenu, true);
    };
  }, [profileMenuOpen]);

  return (
    <div className={`private-shell ${isStoreShell ? "store-private-shell" : ""} ${location.pathname === "/dashboard" ? "mobile-home-shell" : ""} ${location.pathname === "/categories" ? "mobile-category-shell" : ""}`}>
      <header className="private-header">
        <div className="mobile-private-header-content">
          <Link to="/dashboard" className="mobile-private-brand" aria-label="SMAJ PI HUB Home"><img src={logoImage} alt="SMAJ PI HUB" /></Link>
          <div className="mobile-private-header-actions">
            <Link className="mobile-private-icon notification-icon" to="/notifications" aria-label="Notifications"><NotificationsNoneOutlinedIcon />{unreadCount ? <span>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}</Link>
            <Link className="mobile-private-avatar" to="/settings" aria-label="Open settings">
              {user?.avatar ? <img src={user.avatar} alt="" /> : (user?.displayName || user?.username || "U").slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </div>
        <button className="private-menu-toggle" type="button" onClick={() => setMobileSidebarOpen((open) => !open)} aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}>
          {mobileSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <Link to="/dashboard" className="private-header-brand"><img src={logoImage} alt="" /><span>SMAJ PI HUB</span></Link>
        <form className="private-global-search" onSubmit={submitHeaderSearch}><SearchOutlinedIcon /><input value={headerSearch} onFocus={() => setSearchOpen(true)} onChange={(event) => { setHeaderSearch(event.target.value); setSearchOpen(true); }} placeholder="Search SMAJ PI HUB..." />{searchOpen && headerSearch.trim() ? <div className="private-search-results">{headerResults.length ? Object.entries(headerResults.reduce<Record<string, typeof headerResults>>((groups, item) => { (groups[item.group] ||= []).push(item); return groups; }, {})).map(([group, items]) => <section key={group}><strong>{group}</strong>{items.map((item) => <button type="button" key={`${group}-${item.label}`} onClick={() => { navigate(item.to); setHeaderSearch(""); setSearchOpen(false); }}>{item.label}</button>)}</section>) : <button type="submit">Search Marketplace for “{headerSearch}”</button>}</div> : null}</form>
        <div className="private-header-title"><span>Workspace</span><strong>{pageTitle}</strong></div>
        <div className="private-header-actions">
          <Link className="private-header-icon notification-icon" to="/notifications" aria-label="Notifications" title="Notifications"><NotificationsNoneOutlinedIcon />{unreadCount ? <span>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}</Link>
          <button className="private-header-icon" type="button" onClick={() => void toggleTheme()} aria-label="Toggle theme" title="Toggle light or dark mode">
            {themeIcon}
          </button>
          <div className="private-header-profile">
            {profileMenuOpen ? <div className="private-profile-menu private-header-profile-menu" style={profileMenuPosition}><Link to="/profile" onClick={() => setProfileMenuOpen(false)}><PersonOutlineIcon />Profile</Link><Link to="/wallet" onClick={() => setProfileMenuOpen(false)}><AccountBalanceWalletOutlinedIcon />Wallet</Link><Link to="/settings" onClick={() => setProfileMenuOpen(false)}><SettingsOutlinedIcon />Settings</Link><Link to="/app/help-center" onClick={() => setProfileMenuOpen(false)}><HelpOutlineOutlinedIcon />Help Center</Link><button type="button" onClick={() => void toggleTheme()}>{themeIcon}Theme</button><button type="button" className="profile-menu-logout" onClick={() => { setProfileMenuOpen(false); setShowSignOut(true); }}><LogoutIcon />Logout</button></div> : null}
            <button ref={profileAvatarRef} type="button" className="private-header-avatar" title="Profile" aria-label="Open profile menu" aria-expanded={profileMenuOpen} onClick={() => { positionProfileMenu(); setProfileMenuOpen((open) => !open); }}>{user?.avatar ? <img src={user.avatar} alt="" /> : (user?.displayName || user?.username || "U").slice(0, 1).toUpperCase()}</button>
          </div>
        </div>
      </header>

      <div className={`private-body ${sidebarCollapsed ? "private-body-collapsed" : ""}`}>
        <aside className={`private-sidebar ${sidebarCollapsed ? "private-sidebar-collapsed" : ""} ${mobileSidebarOpen ? "private-sidebar-open" : ""}`}>
          <div className="private-sidebar-top">
            <Link to="/dashboard" className="private-sidebar-brand" title="SMAJ PI HUB"><img src={logoImage} alt="SMAJ PI HUB" /></Link>
            <button className="private-sidebar-toggle" type="button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {sidebarCollapsed ? <KeyboardDoubleArrowRightIcon /> : <KeyboardDoubleArrowLeftIcon />}
            </button>
          </div>
          <nav aria-label="Private navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setMobileSidebarOpen(false)} title={sidebarCollapsed ? link.label : undefined} aria-label={link.label}>
                {link.icon}
                <span className="private-nav-label">{link.label}</span>
                {link.to === "/notifications" && unreadCount ? <b className="sidebar-count">{unreadCount}</b> : null}
              </NavLink>
            ))}
          </nav>
          <div className="private-sidebar-account">
            {profileMenuOpen ? <div className="private-profile-menu"><Link to="/profile" onClick={() => setProfileMenuOpen(false)}><PersonOutlineIcon />Profile</Link><Link to="/wallet" onClick={() => setProfileMenuOpen(false)}><AccountBalanceWalletOutlinedIcon />Wallet</Link><Link to="/settings" onClick={() => setProfileMenuOpen(false)}><SettingsOutlinedIcon />Settings</Link><Link to="/app/help-center" onClick={() => setProfileMenuOpen(false)}><HelpOutlineOutlinedIcon />Help Center</Link><button type="button" onClick={() => void toggleTheme()}>{themeIcon}Theme</button><button type="button" className="profile-menu-logout" onClick={() => { setProfileMenuOpen(false); setShowSignOut(true); }}><LogoutIcon />Logout</button></div> : null}
            <button type="button" className="private-sidebar-profile" onClick={() => setProfileMenuOpen((open) => !open)} aria-expanded={profileMenuOpen} title={sidebarCollapsed ? (user?.displayName || user?.username) : undefined}>
              <span className="private-profile-avatar">{user?.avatar ? <img src={user.avatar} alt="" /> : (user?.displayName || user?.username || "U").slice(0, 1).toUpperCase()}</span><span className="private-profile-copy"><strong>{user?.displayName || user?.username}</strong><small>{user?.role || "buyer"} account</small></span><KeyboardArrowUpIcon className="private-profile-chevron" />
            </button>
          </div>
        </aside>
        {mobileSidebarOpen ? <button className="private-overlay" onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu" /> : null}
        <div className="private-content">{children}</div>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile private navigation">
        <NavLink to="/dashboard"><DashboardOutlinedIcon /><span>Home</span></NavLink>
        <NavLink to="/app/services"><AppsOutlinedIcon /><span>Services</span></NavLink>
        <NavLink to="/search"><SearchOutlinedIcon /><span>Search</span></NavLink>
        <NavLink to="/messages"><ChatOutlinedIcon /><span>Messages</span></NavLink>
        <NavLink to="/settings"><PersonOutlineIcon /><span>You</span></NavLink>
      </nav>
      <ConfirmSignOutModal open={showSignOut} busy={isLoading} onCancel={() => setShowSignOut(false)} onConfirm={() => void logout()} />
    </div>
  );
};

export default PrivateLayout;
