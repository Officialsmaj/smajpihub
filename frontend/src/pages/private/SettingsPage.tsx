import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmSignOutModal from "../../components/ConfirmSignOutModal";
import { useAuthContext } from "../../contexts/AuthContext";
import { axiosClient } from "../../lib/axiosClient";

type SavedSettings = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  accountType: "Buyer" | "Seller" | "Both";
  theme: "light" | "dark";
  emailNotifications: boolean;
  productNotifications: boolean;
  messageNotifications: boolean;
  publicProfile: boolean;
  allowContact: boolean;
};

const STORAGE_KEY = "smaj_account_settings";

const readSavedSettings = (): Partial<SavedSettings> => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Partial<SavedSettings>) : {};
  } catch {
    return {};
  }
};

const SettingsPage = () => {
  const { user, updateProfile, updateSettings, signOut } = useAuthContext();
  const navigate = useNavigate();
  const saved = useMemo(readSavedSettings, []);
  const [form, setForm] = useState<SavedSettings>({
    fullName: saved.fullName || user?.displayName || user?.username || "",
    username: saved.username || user?.piUsername || user?.username || "",
    email: saved.email || "",
    phone: saved.phone || user?.contactPhone || "",
    location: saved.location || user?.country || "",
    accountType: saved.accountType || (user?.role === "seller" ? "Seller" : "Buyer"),
    theme: saved.theme || (window.localStorage.getItem("smaj_private_theme_mode") === "dark" ? "dark" : "light"),
    emailNotifications: saved.emailNotifications ?? user?.settings?.notifications ?? true,
    productNotifications: saved.productNotifications ?? true,
    messageNotifications: saved.messageNotifications ?? true,
    publicProfile: saved.publicProfile ?? true,
    allowContact: saved.allowContact ?? true,
  });
  const [message, setMessage] = useState("");
  const [showSignOut, setShowSignOut] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.privateTheme = form.theme;
    document.documentElement.dataset.theme = form.theme;
    window.localStorage.setItem("smaj_private_theme_mode", form.theme);
    window.localStorage.setItem("smaj_public_theme", form.theme);
  }, [form.theme]);

  const setField = <Key extends keyof SavedSettings>(key: Key, value: SavedSettings[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    try {
      await Promise.all([
        updateSettings({ theme: form.theme, language: user?.language || user?.settings?.language || "English", notifications: form.emailNotifications }),
        updateProfile({
          displayName: form.fullName || form.username || "Pi user",
          country: form.location,
          contactPhone: form.phone,
          role: form.accountType === "Seller" ? "seller" : user?.role === "admin" ? "admin" : "buyer",
          avatar: user?.avatar,
          coverImage: user?.coverImage,
          bio: user?.bio,
          language: user?.language || user?.settings?.language || "English",
          sellerActive: form.accountType !== "Buyer",
        }),
      ]);
      setMessage("Settings saved.");
    } catch {
      setMessage("Settings saved on this device. Backend profile sync is not available right now.");
    }
  };

  const requestDeletion = async () => {
    await axiosClient.post("/support", {
      source: "account",
      topic: "Account deletion request",
      name: form.fullName || user?.displayName || user?.username || "Pi user",
      email: form.email,
      message: "User requested account deletion review from Settings.",
    });
    setDeleteRequested(false);
    setMessage("Account deletion request submitted for support review.");
  };

  const logout = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  const verificationStatus = user?.verificationLevel === "trusted_seller" ? "Trusted seller" : user?.verificationLevel === "verified" ? "Verified" : "Basic";
  const piAccount = user?.piUsername || user?.username ? `@${user.piUsername || user.username}` : "Not connected";

  return (
    <main className="private-page settings-page">
      <section className="private-page-head">
        <div>
          <p className="private-kicker">ACCOUNT</p>
          <h1>Settings</h1>
          <p>Simple account controls for your SMAJ PI HUB profile, theme, notifications, privacy, and session.</p>
        </div>
      </section>

      <form className="settings-sections" onSubmit={(event) => void saveSettings(event)}>
        <section>
          <h2>Profile Settings</h2>
          <div className="private-form-row">
            <label>Full name<input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} placeholder="Your full name" /></label>
            <label>Username<input value={form.username} onChange={(event) => setField("username", event.target.value)} placeholder="Username" /></label>
          </div>
          <div className="private-form-row">
            <label>Email<input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder="info@smajpihub.com" /></label>
            <label>Phone number<input value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="+971 50 123 4567" /></label>
          </div>
          <label>Location<input value={form.location} onChange={(event) => setField("location", event.target.value)} placeholder="Abu Dhabi, United Arab Emirates" /></label>
        </section>

        <section>
          <h2>Account Settings</h2>
          <label>Account type<select value={form.accountType} onChange={(event) => setField("accountType", event.target.value as SavedSettings["accountType"])}><option>Buyer</option><option>Seller</option><option>Both</option></select></label>
          <div className="settings-info-row"><span>Verification status</span><strong>{verificationStatus}</strong></div>
          <div className="settings-info-row"><span>Connected Pi account</span><strong>{piAccount}</strong></div>
          <button type="button" className="private-secondary-button danger" onClick={() => setShowSignOut(true)}>Logout</button>
        </section>

        <section>
          <h2>Theme Settings</h2>
          <div className="appearance-options">
            {(["light", "dark"] as const).map((theme) => (
              <button type="button" className={form.theme === theme ? "active" : ""} key={theme} onClick={() => setField("theme", theme)}>
                {theme === "light" ? "Light mode" : "Dark mode"}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2>Notification Settings</h2>
          <label className="setting-line"><span><strong>Email notifications</strong><small>Receive important account and support updates.</small></span><input type="checkbox" checked={form.emailNotifications} onChange={(event) => setField("emailNotifications", event.target.checked)} /></label>
          <label className="setting-line"><span><strong>Product/order notifications</strong><small>Get marketplace listing, order, and payment updates.</small></span><input type="checkbox" checked={form.productNotifications} onChange={(event) => setField("productNotifications", event.target.checked)} /></label>
          <label className="setting-line"><span><strong>Message notifications</strong><small>Get alerts for buyer and seller conversations.</small></span><input type="checkbox" checked={form.messageNotifications} onChange={(event) => setField("messageNotifications", event.target.checked)} /></label>
        </section>

        <section>
          <h2>Privacy & Security</h2>
          <label className="setting-line"><span><strong>Show profile publicly</strong><small>Allow marketplace users to see your public seller or buyer profile.</small></span><input type="checkbox" checked={form.publicProfile} onChange={(event) => setField("publicProfile", event.target.checked)} /></label>
          <label className="setting-line"><span><strong>Allow sellers/buyers to contact me</strong><small>Enable safe marketplace contact for service and order activity.</small></span><input type="checkbox" checked={form.allowContact} onChange={(event) => setField("allowContact", event.target.checked)} /></label>
          <button type="button" className="private-secondary-button danger" onClick={() => setDeleteRequested(true)}>Delete account</button>
        </section>

        {message ? <div className={`private-alert ${message.includes("not available") ? "error" : "success"}`}>{message}</div> : null}
        <button className="private-primary-button">Save changes</button>
      </form>

      <ConfirmSignOutModal open={showSignOut} onCancel={() => setShowSignOut(false)} onConfirm={() => void logout()} />
      {deleteRequested ? (
        <div className="confirm-modal-backdrop">
          <section className="confirm-modal">
            <h2>Delete account?</h2>
            <p>The SMAJ support team will review the request before any account action is taken.</p>
            <div className="confirm-modal-actions">
              <button className="modal-cancel-button" onClick={() => setDeleteRequested(false)}>Cancel</button>
              <button className="modal-signout-button" onClick={() => void requestDeletion()}>Submit Request</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
};

export default SettingsPage;
