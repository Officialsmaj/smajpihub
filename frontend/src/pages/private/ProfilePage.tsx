import { useEffect, useState, type FormEvent } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import TrustBadge from "../../components/TrustBadge";
import { axiosClient } from "../../lib/axiosClient";

const ProfilePage = () => {
  const { user, updateProfile } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || "");
  const [country, setCountry] = useState(user?.country || "");
  const [contactPhone, setContactPhone] = useState(user?.contactPhone || "");
  const [role, setRole] = useState<"buyer" | "seller" | "admin">(user?.role || "buyer");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ totalProducts: 0, successfulOrders: 0 });
  useEffect(() => { axiosClient.get("/user/stats").then(({ data }) => setStats(data.stats)).catch(() => undefined); }, []);
  const requestVerification = async () => { await axiosClient.post("/user/verification-request"); setMessage("Trusted Seller request sent to the admin team."); };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateProfile({ displayName, country, contactPhone, role, avatar });
      setMessage("Profile saved.");
      setEditing(false);
    } catch {
      setMessage("Could not save profile.");
    }
  };

  return (
    <main className="private-page">
      <section className="private-page-head">
        <div><p className="private-kicker">ACCOUNT</p><h1>Profile</h1><p>Your public SMAJ identity and marketplace role.</p></div>
        {!editing ? <button className="private-primary-button" onClick={() => setEditing(true)}>Edit Profile</button> : null}
      </section>
      {!editing ? (
        <section className="profile-card">
          <div className="profile-avatar">{user?.avatar ? <img src={user.avatar} alt="Profile" /> : (user?.displayName || user?.username || "U").slice(0, 1).toUpperCase()}</div>
          <TrustBadge level={user?.verificationLevel} />
          <div className="profile-details">
            <div><span>Pi username</span><strong>@{user?.piUsername || user?.username}</strong></div>
            <div><span>Display name</span><strong>{user?.displayName || "Not set"}</strong></div>
            <div><span>Country</span><strong>{user?.country || "Not set"}</strong></div>
            <div><span>Role</span><strong className="capitalize">{user?.role || "buyer"}</strong></div>
            <div><span>Joined</span><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}</strong></div>
            <div><span>Phone / WhatsApp</span><strong>{user?.contactPhone || "Not set"}</strong></div>
            <div><span>Total products</span><strong>{stats.totalProducts}</strong></div>
            <div><span>Successful orders</span><strong>{stats.successfulOrders}</strong></div>
          </div>
          {user?.role === "seller" && user.verificationLevel !== "trusted_seller" ? <button className="private-secondary-button" disabled={user.verificationRequested} onClick={() => void requestVerification()}>{user.verificationRequested ? "Verification requested" : "Request Trusted Seller"}</button> : null}
        </section>
      ) : (
        <form className="private-form" onSubmit={(event) => void submit(event)}>
          <div className="profile-readonly"><span>Pi username</span><strong>@{user?.piUsername || user?.username}</strong></div>
          <label>Profile picture<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file || file.size > 2 * 1024 * 1024) return setMessage("Choose an image up to 2 MB."); const reader = new FileReader(); reader.onload = () => setAvatar(String(reader.result || "")); reader.readAsDataURL(file); }} /></label>
          {avatar ? <div className="profile-avatar profile-avatar-preview"><img src={avatar} alt="Profile preview" /></div> : null}
          <label>Display name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
          <label>Country<input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Your country" /></label>
          <label>Phone / WhatsApp<input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="Phone or WhatsApp number" /></label>
          <label>Account role<select value={role} disabled={role === "admin"} onChange={(event) => setRole(event.target.value as "buyer" | "seller")}><option value="buyer">Buyer</option><option value="seller">Seller</option>{role === "admin" ? <option value="admin">Admin</option> : null}</select></label>
          {message ? <div className="private-alert">{message}</div> : null}
          <div className="form-actions"><button className="private-primary-button">Save Changes</button><button type="button" className="private-secondary-button" onClick={() => setEditing(false)}>Cancel</button></div>
        </form>
      )}
      {!editing && message ? <div className="private-alert success">{message}</div> : null}
    </main>
  );
};

export default ProfilePage;
