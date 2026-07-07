import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useAuthContext } from "../contexts/AuthContext";
import logoImage from "/logo.png";
import ConfirmSignOutModal from "../components/ConfirmSignOutModal";

const SIDEBAR_STORAGE_KEY = "smaj_private_sidebar_collapsed";
const links = [
  ["/admin", "Dashboard", <DashboardOutlinedIcon />],
  ["/admin/users", "Users", <PeopleOutlineIcon />],
  ["/admin/onboarding", "Onboarding", <AssignmentTurnedInOutlinedIcon />],
  ["/admin/products", "Products", <Inventory2OutlinedIcon />],
  ["/admin/orders", "Orders", <ReceiptLongOutlinedIcon />],
  ["/admin/reports", "Reports", <ReportProblemOutlinedIcon />],
  ["/admin/settings", "Settings", <SettingsOutlinedIcon />],
] as const;

const adminSearchItems = [
  ...links.map(([to, label, icon]) => ({ to, label, icon, keywords: [label, "admin"] })),
  { to: "/store", label: "SMAJ Store", icon: <Inventory2OutlinedIcon />, keywords: ["store", "shop", "products", "marketplace", "commerce"] },
  { to: "/seller", label: "Seller Dashboard", icon: <Inventory2OutlinedIcon />, keywords: ["seller", "vendor", "listings", "products"] },
  { to: "/add-product", label: "Add Product", icon: <Inventory2OutlinedIcon />, keywords: ["add", "new product", "listing"] },
  { to: "/orders", label: "User Orders", icon: <ReceiptLongOutlinedIcon />, keywords: ["orders", "buyer", "seller orders"] },
  { to: "/messages", label: "Messages", icon: <ReportProblemOutlinedIcon />, keywords: ["messages", "chat", "inbox"] },
  { to: "/notifications", label: "Notifications", icon: <ReportProblemOutlinedIcon />, keywords: ["notifications", "alerts"] },
  { to: "/profile", label: "Profile", icon: <PeopleOutlineIcon />, keywords: ["profile", "account", "user"] },
  { to: "/settings", label: "User Settings", icon: <SettingsOutlinedIcon />, keywords: ["settings", "verification", "privacy"] },
  { to: "/help", label: "Help Center", icon: <ReportProblemOutlinedIcon />, keywords: ["help", "support", "faq"] },
  { to: "/privacy", label: "Privacy Policy", icon: <SettingsOutlinedIcon />, keywords: ["privacy", "legal"] },
  { to: "/terms", label: "Terms", icon: <SettingsOutlinedIcon />, keywords: ["terms", "legal"] },
  { to: "/seller-agreement", label: "Seller Agreement", icon: <SettingsOutlinedIcon />, keywords: ["seller agreement", "legal"] },
] as const;

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuthContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [showSignOut, setShowSignOut] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const navigate = useNavigate();
  const adminName = user?.displayName || user?.username || user?.piUsername || "Admin";
  const adminInitial = adminName.slice(0, 1).toUpperCase();

  useEffect(() => {
    document.documentElement.dataset.privateTheme = user?.settings?.theme || "light";
  }, [user?.settings?.theme]);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileSidebarOpen]);

  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;

  const logout = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const searchResults = useMemo(() => {
    const query = adminSearch.trim().toLowerCase();
    if (!query) return [];
    return adminSearchItems
      .filter((item) => [item.label, item.to, ...item.keywords].some((value) => value.toLowerCase().includes(query) || query.includes(value.toLowerCase())))
      .slice(0, 8);
  }, [adminSearch]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const target = searchResults[0]?.to || "/admin";
    setAdminSearch("");
    setMobileSidebarOpen(false);
    navigate(target);
  };

  return (
    <div className="private-shell admin-shell">
      <header className="private-header">
        <button className="private-menu-toggle admin-mobile-menu-toggle" type="button" onClick={() => setMobileSidebarOpen((open) => !open)} aria-label={mobileSidebarOpen ? "Close admin menu" : "Open admin menu"}>
          {mobileSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <Link to="/admin" className="private-brand"><img src={logoImage} alt="" /><span>SMAJ ADMIN</span></Link>
        <form className="admin-header-search" onSubmit={submitSearch}>
          <SearchOutlinedIcon />
          <input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search admin..." aria-label="Search admin pages" />
          {adminSearch.trim() ? (
            <div className="admin-search-results">
              {searchResults.length ? searchResults.map((item) => (
                <button type="button" key={item.to} onClick={() => { setAdminSearch(""); setMobileSidebarOpen(false); navigate(item.to); }}>
                  {item.icon}<span>{item.label}</span>
                </button>
              )) : <button type="submit">Open Admin Dashboard</button>}
            </div>
          ) : null}
        </form>
        <div className="private-user-pill">Administrator · @{user.piUsername || user.username}</div>
      </header>
      <div className={`private-body ${sidebarCollapsed ? "private-body-collapsed" : ""}`}>
        <aside className={`private-sidebar ${sidebarCollapsed ? "private-sidebar-collapsed" : ""} ${mobileSidebarOpen ? "private-sidebar-open" : ""}`}>
          <div className="private-sidebar-top">
            <Link to="/admin" className="private-sidebar-brand" title="SMAJ ADMIN" aria-label="SMAJ Admin dashboard"><img src={logoImage} alt="" /></Link>
            <button className="private-sidebar-toggle" type="button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {sidebarCollapsed ? <KeyboardDoubleArrowRightIcon /> : <KeyboardDoubleArrowLeftIcon />}
            </button>
          </div>
          <div className="private-sidebar-user">
            <span className="admin-sidebar-avatar">{user.avatar ? <img src={user.avatar} alt="" /> : adminInitial}</span>
            <div><strong>{adminName}</strong><small>Admin account</small></div>
          </div>
          <nav>
            {links.map(([to, label, icon]) => (
              <NavLink key={to} to={to} end={to === "/admin"} onClick={() => setMobileSidebarOpen(false)} title={sidebarCollapsed ? label : undefined} aria-label={label}>
                {icon}<span className="private-nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>
          <button className="private-sidebar-logout" type="button" onClick={() => setShowSignOut(true)} title={sidebarCollapsed ? "Logout" : undefined} aria-label="Logout"><LogoutIcon /><span className="private-nav-label">Logout</span></button>
        </aside>
        {mobileSidebarOpen ? <button className="private-overlay" onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu" /> : null}
        <div className="private-content">{children}</div>
      </div>
      <ConfirmSignOutModal open={showSignOut} onCancel={() => setShowSignOut(false)} onConfirm={() => void logout()} />
    </div>
  );
};

export default AdminLayout;
