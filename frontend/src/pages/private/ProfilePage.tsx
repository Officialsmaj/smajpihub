import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { useAuthContext } from "../../contexts/AuthContext";
import TrustBadge from "../../components/TrustBadge";
import { axiosClient } from "../../lib/axiosClient";

const languages = ["English", "French", "Spanish", "Portuguese", "Arabic"];

const readImage = (file: File, onLoad: (value: string) => void, onError: (message: string) => void) => {
  if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
    onError("Choose an image up to 2 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => onLoad(String(reader.result || ""));
  reader.onerror = () => onError("Could not read that image.");
  reader.readAsDataURL(file);
};

const ProfilePage = () => {
  const { user, updateProfile } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ totalProducts: 0, successfulOrders: 0 });
  const [form, setForm] = useState({
    displayName: "",
    country: "",
    contactPhone: "",
    avatar: "",
    coverImage: "",
    bio: "",
    language: "English",
    sellerActive: false,
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.displayName || user.username || "",
      country: user.country || "",
      contactPhone: user.contactPhone || "",
      avatar: user.avatar || "",
      coverImage: user.coverImage || "",
      bio: user.bio || "",
      language: user.language || user.settings?.language || "English",
      sellerActive: Boolean(user.sellerActive || user.role === "seller"),
    });
  }, [user]);

  useEffect(() => {
    axiosClient.get("/user/stats").then(({ data }) => setStats(data.stats)).catch(() => undefined);
  }, []);

  const name = form.displayName || user?.displayName || user?.username || "Pi User";
  const username = user?.piUsername || user?.username || "pi-user";
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available";
  const sellerActive = Boolean(form.sellerActive || user?.sellerActive || user?.role === "seller");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      await updateProfile({
        ...form,
        role: user?.role === "admin" ? "admin" : form.sellerActive ? "seller" : "buyer",
      });
      setMessage("Profile saved.");
      setEditing(false);
    } catch {
      setMessage("Could not save profile.");
    }
  };

  const toggleSeller = async () => {
    const next = !sellerActive;
    const nextForm = { ...form, sellerActive: next };
    setForm(nextForm);
    await updateProfile({ ...nextForm, role: next ? "seller" : "buyer" });
    setMessage(next ? "Seller tools activated." : "Seller tools deactivated.");
  };

  return (
    <main className="private-page real-profile-page">
      <section className="real-profile-hero">
        <div className="real-profile-cover" style={form.coverImage ? { backgroundImage: `url(${form.coverImage})` } : undefined}>
          <button type="button" onClick={() => setEditing(true)}>
            <EditOutlinedIcon /> Edit
          </button>
        </div>
        <div className="real-profile-identity">
          <div className="real-profile-avatar">
            {form.avatar ? <img src={form.avatar} alt="Profile" /> : name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="private-kicker">SMAJ PI HUB PROFILE</p>
            <h1>{name}</h1>
            <span>@{username}</span>
            <div className="real-profile-badges">
              <TrustBadge level={user?.verificationLevel} />
              <b>{sellerActive ? "Seller enabled" : "Buyer account"}</b>
            </div>
          </div>
          <div className="real-profile-actions">
            <button className="private-primary-button" type="button" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
            {sellerActive ? <Link className="private-secondary-button" to="/seller">Seller Dashboard</Link> : null}
          </div>
        </div>
      </section>

      {message ? <div className={`private-alert ${message.includes("Could") ? "error" : "success"}`}>{message}</div> : null}

      {!editing ? (
        <>
          <section className="real-profile-stats">
            <article><Inventory2OutlinedIcon /><span>Products</span><strong>{stats.totalProducts}</strong></article>
            <article><StorefrontOutlinedIcon /><span>Successful Orders</span><strong>{stats.successfulOrders}</strong></article>
            <article><VerifiedUserOutlinedIcon /><span>Verification</span><strong>{user?.verificationLevel || "basic"}</strong></article>
          </section>

          <section className="real-profile-grid">
            <article className="real-profile-card real-profile-about">
              <div className="real-profile-card-head">
                <AccountCircleOutlinedIcon />
                <h2>About</h2>
              </div>
              <p>{user?.bio || "Add a short bio so buyers, sellers, and partners understand who you are on SMAJ PI HUB."}</p>
            </article>

            <article className="real-profile-card">
              <div className="real-profile-card-head">
                <BadgeOutlinedIcon />
                <h2>Account Details</h2>
              </div>
              <dl>
                <div><dt>Pi Username</dt><dd>@{username}</dd></div>
                <div><dt>Joined</dt><dd>{joined}</dd></div>
                <div><dt>Country</dt><dd>{user?.country || "Not set"}</dd></div>
                <div><dt>Contact</dt><dd>{user?.contactPhone || "Not set"}</dd></div>
              </dl>
            </article>

            <article className="real-profile-card">
              <div className="real-profile-card-head">
                <StorefrontOutlinedIcon />
                <h2>Seller Profile</h2>
              </div>
              <p>{sellerActive ? "Seller tools are active. Your listings can be reviewed and approved for SMAJ Store." : "Use one verified Pi identity to activate seller tools when you are ready to list products."}</p>
              <div className="form-actions">
                <button className="private-secondary-button" type="button" onClick={() => void toggleSeller()}>
                  {sellerActive ? "Deactivate Seller Tools" : "Activate Seller Tools"}
                </button>
                {sellerActive ? <Link className="private-primary-button" to="/add-product">Add Product</Link> : null}
              </div>
            </article>

            <article className="real-profile-card">
              <div className="real-profile-card-head">
                <LanguageOutlinedIcon />
                <h2>Preferences</h2>
              </div>
              <dl>
                <div><dt>Language</dt><dd>{form.language}</dd></div>
                <div><dt>Account Status</dt><dd>Active</dd></div>
                <div><dt>Public Preview</dt><dd>{sellerActive ? <Link to={`/seller/${user?.uid}`}>View seller profile</Link> : "Available after seller activation"}</dd></div>
              </dl>
            </article>
          </section>
        </>
      ) : (
        <form className="private-form real-profile-form" onSubmit={submit}>
          <section>
            <h2>Profile Media</h2>
            <div className="private-form-row">
              <label>Profile picture<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) readImage(file, (avatar) => setForm({ ...form, avatar }), setMessage); }} /></label>
              <label>Cover image<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) readImage(file, (coverImage) => setForm({ ...form, coverImage }), setMessage); }} /></label>
            </div>
          </section>

          <section>
            <h2>Personal Information</h2>
            <label>Display name<input required maxLength={80} value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label>
            <label>Pi username<input value={`@${username}`} disabled /><small>Pi username is managed by Pi authentication.</small></label>
            <label>Bio / About<textarea maxLength={500} rows={4} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
            <div className="private-form-row">
              <label>Country<input maxLength={80} value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></label>
              <label>Language<select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })}>{languages.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <label>Phone / WhatsApp<input maxLength={40} value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} /></label>
          </section>

          <label className="setting-line">
            <span><strong>Seller profile</strong><small>Unlock seller tools under this same verified Pi account.</small></span>
            <input type="checkbox" checked={form.sellerActive} onChange={(event) => setForm({ ...form, sellerActive: event.target.checked })} />
          </label>

          <div className="form-actions">
            <button className="private-primary-button">Save Changes</button>
            <button type="button" className="private-secondary-button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </main>
  );
};

export default ProfilePage;
