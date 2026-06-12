import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useAuthContext } from "../contexts/AuthContext";
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
};

const links = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardOutlinedIcon /> },
  { to: "/store", label: "Store", icon: <StorefrontOutlinedIcon /> },
  { to: "/add-product", label: "Add Product", icon: <AddBoxOutlinedIcon /> },
  { to: "/orders", label: "Orders", icon: <ReceiptLongOutlinedIcon /> },
  { to: "/seller", label: "Seller", icon: <SellOutlinedIcon /> },
  { to: "/profile", label: "Profile", icon: <PersonOutlineIcon /> },
  { to: "/settings", label: "Settings", icon: <SettingsOutlinedIcon /> },
];

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const { signOut, isLoading, user, updateSettings } = useAuthContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = location.pathname.startsWith("/product/") ? "Product Details"
    : location.pathname.startsWith("/edit-product/") ? "Edit Product"
      : pageTitles[location.pathname] || "SMAJ PI HUB";

  useEffect(() => {
    document.documentElement.dataset.privateTheme = user?.settings?.theme || "light";
  }, [user?.settings?.theme]);

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const logout = async () => {
    await signOut();
    navigate("/home");
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
          <button className="private-header-icon" type="button" aria-label="Notifications" title="Notifications"><NotificationsNoneOutlinedIcon /></button>
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
            <Link to="/dashboard" className="private-sidebar-brand" title="SMAJ PI HUB">
              <img src={logoImage} alt="SMAJ PI HUB" />
              <span>SMAJ PI HUB</span>
            </Link>
            <button className="private-sidebar-toggle" type="button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {sidebarCollapsed ? <KeyboardDoubleArrowRightIcon /> : <KeyboardDoubleArrowLeftIcon />}
            </button>
          </div>
          <div className="private-sidebar-user">
            <span>{(user?.displayName || user?.username || "U").slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{user?.displayName || user?.username}</strong>
              <small>{user?.role || "buyer"} account</small>
            </div>
          </div>
          <nav aria-label="Private navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setMobileSidebarOpen(false)} title={sidebarCollapsed ? link.label : undefined} aria-label={link.label}>
                {link.icon}
                <span className="private-nav-label">{link.label}</span>
              </NavLink>
            ))}
            {user?.role === "admin" ? <NavLink to="/admin" onClick={() => setMobileSidebarOpen(false)} title={sidebarCollapsed ? "Admin Panel" : undefined} aria-label="Admin Panel"><AdminPanelSettingsOutlinedIcon /><span className="private-nav-label">Admin Panel</span></NavLink> : null}
          </nav>
          <button type="button" className="private-sidebar-logout" onClick={() => void logout()} disabled={isLoading} title={sidebarCollapsed ? "Logout" : undefined} aria-label="Logout">
            <LogoutIcon />
            <span className="private-nav-label">Logout</span>
          </button>
        </aside>
        {mobileSidebarOpen ? <button className="private-overlay" onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu" /> : null}
        <div className="private-content">{children}</div>
      </div>
    </div>
  );
};

export default PrivateLayout;
