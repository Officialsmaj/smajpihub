import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useAuthContext } from "../contexts/AuthContext";
import logoImage from "/logo.png";
import ConfirmSignOutModal from "../components/ConfirmSignOutModal";

const SIDEBAR_STORAGE_KEY = "smaj_private_sidebar_collapsed";
const links = [
  ["/admin", "Dashboard", <DashboardOutlinedIcon />],
  ["/admin/users", "Users", <PeopleOutlineIcon />],
  ["/admin/products", "Products", <Inventory2OutlinedIcon />],
  ["/admin/orders", "Orders", <ReceiptLongOutlinedIcon />],
  ["/admin/reports", "Reports", <ReportProblemOutlinedIcon />],
  ["/admin/settings", "Settings", <SettingsOutlinedIcon />],
] as const;

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuthContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [showSignOut, setShowSignOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.privateTheme = user?.settings?.theme || "light";
  }, [user?.settings?.theme]);

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

  return (
    <div className="private-shell admin-shell">
      <header className="private-header">
        <Link to="/admin" className="private-brand"><img src={logoImage} alt="" /><span>SMAJ ADMIN</span></Link>
        <div className="private-user-pill">Administrator · @{user.piUsername || user.username}</div>
        <button className="private-menu-toggle" onClick={() => setMobileSidebarOpen((open) => !open)} aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}>
          {mobileSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>
      <div className={`private-body ${sidebarCollapsed ? "private-body-collapsed" : ""}`}>
        <aside className={`private-sidebar ${sidebarCollapsed ? "private-sidebar-collapsed" : ""} ${mobileSidebarOpen ? "private-sidebar-open" : ""}`}>
          <div className="private-sidebar-top">
            <Link to="/admin" className="private-sidebar-brand" title="SMAJ ADMIN"><img src={logoImage} alt="SMAJ ADMIN" /><span>SMAJ ADMIN</span></Link>
            <button className="private-sidebar-toggle" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {sidebarCollapsed ? <KeyboardDoubleArrowRightIcon /> : <KeyboardDoubleArrowLeftIcon />}
            </button>
          </div>
          <div className="private-sidebar-user"><span>A</span><div><strong>{user.displayName}</strong><small>Admin account</small></div></div>
          <nav>
            {links.map(([to, label, icon]) => (
              <NavLink key={to} to={to} end={to === "/admin"} onClick={() => setMobileSidebarOpen(false)} title={sidebarCollapsed ? label : undefined} aria-label={label}>
                {icon}<span className="private-nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>
          <button className="private-sidebar-logout" onClick={() => setShowSignOut(true)} title={sidebarCollapsed ? "Logout" : undefined} aria-label="Logout"><LogoutIcon /><span className="private-nav-label">Logout</span></button>
        </aside>
        {mobileSidebarOpen ? <button className="private-overlay" onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu" /> : null}
        <div className="private-content">{children}</div>
      </div>
      <ConfirmSignOutModal open={showSignOut} onCancel={() => setShowSignOut(false)} onConfirm={() => void logout()} />
    </div>
  );
};

export default AdminLayout;
