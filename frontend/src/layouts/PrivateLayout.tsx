import type { ReactNode } from "react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthContext } from "../contexts/AuthContext";
import logoImage from "/logo.png";

type PrivateLayoutProps = { children: ReactNode };

const links = [
  { to: "/app/dashboard", label: "Dashboard", icon: <DashboardOutlinedIcon /> },
  { to: "/app/store", label: "Store", icon: <StorefrontOutlinedIcon /> },
  { to: "/app/add-product", label: "Add Product", icon: <AddBoxOutlinedIcon /> },
  { to: "/app/orders", label: "Orders", icon: <ReceiptLongOutlinedIcon /> },
  { to: "/app/profile", label: "Profile", icon: <PersonOutlineIcon /> },
  { to: "/app/settings", label: "Settings", icon: <SettingsOutlinedIcon /> },
];

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const { signOut, isLoading, user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate("/home");
  };

  return (
    <div className="private-shell">
      <header className="private-header">
        <Link to="/app/dashboard" className="private-brand">
          <img src={logoImage} alt="SMAJ PI HUB" />
          <span>SMAJ PI HUB</span>
        </Link>
        <div className="private-user-pill">
          <span className="private-wallet-dot" />
          <span>@{user?.piUsername || user?.username}</span>
        </div>
        <button className="private-menu-toggle" type="button" onClick={() => setSidebarOpen((open) => !open)}>
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      <div className="private-body">
        <aside className={`private-sidebar ${sidebarOpen ? "private-sidebar-open" : ""}`}>
          <div className="private-sidebar-user">
            <span>{(user?.displayName || user?.username || "U").slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{user?.displayName || user?.username}</strong>
              <small>{user?.role || "buyer"} account</small>
            </div>
          </div>
          <nav aria-label="Private navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setSidebarOpen(false)}>
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button type="button" className="private-sidebar-logout" onClick={() => void logout()} disabled={isLoading}>
            <LogoutIcon />
            Logout
          </button>
        </aside>
        {sidebarOpen ? <button className="private-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close menu" /> : null}
        <div className="private-content">{children}</div>
      </div>
    </div>
  );
};

export default PrivateLayout;
