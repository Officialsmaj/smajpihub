import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
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
  "/app/ai-assistant": "AI Assistant",
  "/app/help-center": "Help Center",
  "/app/wallet": "Wallet",
};

const links = [
  { to: "/dashboard", label: "Home", icon: <DashboardOutlinedIcon /> },
  { to: "/app/services", label: "Services", icon: <AppsOutlinedIcon /> },
  { to: "/store", label: "Marketplace", icon: <StorefrontOutlinedIcon /> },
  { to: "/messages", label: "Messages", icon: <ChatOutlinedIcon /> },
  { to: "/notifications", label: "Notifications", icon: <NotificationsNoneOutlinedIcon /> },
  { to: "/app/ai-assistant", label: "AI Assistant", icon: <SmartToyOutlinedIcon /> },
];

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const { signOut, isLoading, user, updateSettings } = useAuthContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = location.pathname.startsWith("/product/") ? "Product Details"
    : location.pathname.startsWith("/edit-product/") ? "Edit Product"
      : pageTitles[location.pathname] || "SMAJ PI HUB";

  useEffect(() => {
    document.documentElement.dataset.privateTheme = user?.settings?.theme || "light";
  }, [user?.settings?.theme]);

  useEffect(() => { axiosClient.get("/notifications").then(({ data }) => setUnreadCount(data.unreadCount || 0)).catch(() => undefined); }, [location.pathname]);

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
    const theme = settings.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.privateTheme = theme;
    await updateSettings({ ...settings, theme });
  };

  return (
    <div className="private-shell">
      <header className="private-header">
        <button className="private-menu-toggle" type="button" onClick={() => setMobileSidebarOpen((open) => !open)} aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}>
          {mobileSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <div className="private-header-title"><span>Workspace</span><strong>{pageTitle}</strong></div>
        <div className="private-header-actions">
          <Link className="private-header-icon" to="/search" aria-label="Search" title="Search"><SearchOutlinedIcon /></Link>
          <Link className="private-header-icon notification-icon" to="/notifications" aria-label="Notifications" title="Notifications"><NotificationsNoneOutlinedIcon />{unreadCount ? <span>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}</Link>
          <button className="private-header-icon" type="button" onClick={() => void toggleTheme()} aria-label="Toggle theme" title="Toggle light or dark mode">
            {user?.settings?.theme === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </button>
          <div className="private-user-pill">
            <span className="private-wallet-dot" />
            <span>@{user?.piUsername || user?.username}</span>
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
            {profileMenuOpen ? <div className="private-profile-menu"><Link to="/profile" onClick={() => setProfileMenuOpen(false)}><PersonOutlineIcon />Profile</Link><Link to="/wallet" onClick={() => setProfileMenuOpen(false)}><AccountBalanceWalletOutlinedIcon />Wallet</Link><Link to="/settings" onClick={() => setProfileMenuOpen(false)}><SettingsOutlinedIcon />Settings</Link><Link to="/app/help-center" onClick={() => setProfileMenuOpen(false)}><HelpOutlineOutlinedIcon />Help Center</Link><button type="button" onClick={() => void toggleTheme()}>{user?.settings?.theme === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}Theme</button><button type="button" className="profile-menu-logout" onClick={() => { setProfileMenuOpen(false); setShowSignOut(true); }}><LogoutIcon />Logout</button></div> : null}
            <button type="button" className="private-sidebar-profile" onClick={() => setProfileMenuOpen((open) => !open)} aria-expanded={profileMenuOpen} title={sidebarCollapsed ? (user?.displayName || user?.username) : undefined}>
              <span className="private-profile-avatar">{user?.avatar ? <img src={user.avatar} alt="" /> : (user?.displayName || user?.username || "U").slice(0, 1).toUpperCase()}</span><span className="private-profile-copy"><strong>{user?.displayName || user?.username}</strong><small>{user?.role || "buyer"} account</small></span><KeyboardArrowUpIcon className="private-profile-chevron" />
            </button>
          </div>
        </aside>
        {mobileSidebarOpen ? <button className="private-overlay" onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu" /> : null}
        <div className="private-content">{children}</div>
      </div>
      <ConfirmSignOutModal open={showSignOut} busy={isLoading} onCancel={() => setShowSignOut(false)} onConfirm={() => void logout()} />
    </div>
  );
};

export default PrivateLayout;
