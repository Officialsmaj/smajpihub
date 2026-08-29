import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";

const AdminProfilePage = () => {
  const { user } = useAuthContext();
  const name = user?.displayName || user?.username || user?.piUsername || "Administrator";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <main className="private-page admin-profile-page">
      <header className="admin-page-title"><h1>User Profile</h1><p>Home <span>›</span> User Profile</p></header>
      <section className="dashboard-card admin-profile-shell">
        <h2>My Profile</h2>
        <article className="admin-profile-card">
          <div className="admin-profile-identity">
            <span className="admin-profile-photo">{user?.avatar ? <img src={user.avatar} alt="" /> : initial}</span>
            <div><h3>{name}</h3><p>Platform Administrator <i /> SMAJ PI HUB</p></div>
          </div>
          <Link className="admin-profile-edit" to="/admin/settings"><EditOutlinedIcon /> Edit</Link>
          <dl>
            <div><dt>Display Name</dt><dd>{name}</dd></div>
            <div><dt>Pi Username</dt><dd>@{user?.piUsername || user?.username || "admin"}</dd></div>
            <div><dt>Role</dt><dd>Administrator</dd></div>
            <div><dt>Account Status</dt><dd>Active</dd></div>
          </dl>
        </article>
        <article className="admin-profile-card admin-profile-address">
          <div><h3>Admin Access</h3><p>Your SMAJ PI HUB administration profile and access information.</p></div>
          <Link className="admin-profile-edit" to="/admin/settings"><EditOutlinedIcon /> Edit</Link>
          <dl>
            <div><dt>Access Level</dt><dd>Admin</dd></div>
            <div><dt>Authentication</dt><dd>Pi Account</dd></div>
            <div><dt>Workspace</dt><dd>SMAJ PI HUB</dd></div>
            <div><dt>Security</dt><dd>Protected</dd></div>
          </dl>
        </article>
      </section>
    </main>
  );
};

export default AdminProfilePage;
