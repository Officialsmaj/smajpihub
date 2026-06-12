import { useState, type ReactNode } from "react";
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
import { useAuthContext } from "../contexts/AuthContext";
import logoImage from "/logo.png";

const links = [
  ["/admin", "Dashboard", <DashboardOutlinedIcon />], ["/admin/users", "Users", <PeopleOutlineIcon />],
  ["/admin/products", "Products", <Inventory2OutlinedIcon />], ["/admin/orders", "Orders", <ReceiptLongOutlinedIcon />],
  ["/admin/reports", "Reports", <ReportProblemOutlinedIcon />], ["/admin/settings", "Settings", <SettingsOutlinedIcon />],
] as const;

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuthContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  const logout = async () => { await signOut(); navigate("/home"); };
  return <div className="private-shell admin-shell"><header className="private-header"><Link to="/admin" className="private-brand"><img src={logoImage} alt="" /><span>SMAJ ADMIN</span></Link><div className="private-user-pill">Administrator · @{user.piUsername || user.username}</div><button className="private-menu-toggle" onClick={() => setOpen(!open)}>{open ? <CloseIcon /> : <MenuIcon />}</button></header>
    <div className="private-body"><aside className={`private-sidebar ${open ? "private-sidebar-open" : ""}`}><div className="private-sidebar-user"><span>A</span><div><strong>{user.displayName}</strong><small>Admin account</small></div></div><nav>{links.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === "/admin"} onClick={() => setOpen(false)}>{icon}{label}</NavLink>)}</nav><button className="private-sidebar-logout" onClick={() => void logout()}><LogoutIcon />Logout</button></aside>{open ? <button className="private-overlay" onClick={() => setOpen(false)} /> : null}<div className="private-content">{children}</div></div>
  </div>;
};

export default AdminLayout;
