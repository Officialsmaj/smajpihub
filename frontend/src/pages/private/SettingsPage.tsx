import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmSignOutModal from "../../components/ConfirmSignOutModal";
import { useAuthContext } from "../../contexts/AuthContext";
import { axiosClient } from "../../lib/axiosClient";

const languages = ["English", "French", "Spanish", "Portuguese", "Arabic"];

const SettingsPage = () => {
  const { user, updateSettings, updateProfile, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">(
    () => (window.localStorage.getItem("smaj_private_theme_mode") as "light" | "dark" | "system") || user?.settings?.theme || "light",
  );
  const [language, setLanguage] = useState(user?.settings?.language || "English");
  const [country, setCountry] = useState(user?.country || "");
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? true);
  const [message, setMessage] = useState("");
  const [showSignOut, setShowSignOut] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = appearance === "system" ? (media.matches ? "dark" : "light") : appearance;
      document.documentElement.dataset.privateTheme = resolved;
    };
    apply();
    window.localStorage.setItem("smaj_private_theme_mode", appearance);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [appearance]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      const resolved = appearance === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : appearance;
      await Promise.all([
        updateSettings({ theme: resolved, language, notifications }),
        updateProfile({
          displayName: user?.displayName || user?.username || "Pi user",
          country,
          contactPhone: user?.contactPhone || "",
          role: user?.role || "buyer",
          avatar: user?.avatar,
          coverImage: user?.coverImage,
          bio: user?.bio,
          language,
          sellerActive: user?.sellerActive,
        }),
      ]);
      setMessage("Settings saved.");
    } catch {
      setMessage("Could not save settings.");
    }
  };

  const requestDeletion = async () => {
    await axiosClient.post("/support", {
      source: "account",
      topic: "Account deletion request",
      name: user?.displayName || user?.username || "Pi user",
      message: "User requested account deletion review from Settings.",
    });
    setDeleteRequested(false);
    setMessage("Account deletion request submitted for support review.");
  };

  const logout = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  return (
    <main className="private-page settings-page">
      <section className="private-page-head">
        <div>
          <p className="private-kicker">ACCOUNT</p>
          <h1>Settings</h1>
          <p>Manage real account preferences saved to your SMAJ PI HUB profile.</p>
        </div>
      </section>

      <form className="settings-sections" onSubmit={(event) => void save(event)}>
        <section>
          <h2>Account Preferences</h2>
          <p>Language, region, and notifications are saved to your account.</p>
          <div className="private-form-row">
            <label>Language<select value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Country / region<input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Country or region" /></label>
          </div>
          <label className="setting-line">
            <span><strong>Notifications</strong><small>Receive account, order, payment, message, and security notifications.</small></span>
            <input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} />
          </label>
        </section>

        <section>
          <h2>Appearance</h2>
          <p>Choose how the private app appears on this device.</p>
          <div className="appearance-options">
            {(["light", "dark", "system"] as const).map((mode) => (
              <button type="button" className={appearance === mode ? "active" : ""} key={mode} onClick={() => setAppearance(mode)}>
                {mode}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2>Security</h2>
          <div className="settings-info-row"><span>Login method</span><strong>Pi Browser authentication</strong></div>
          <div className="settings-info-row"><span>Active session</span><strong>Current device</strong></div>
          <div className="settings-info-row"><span>Wallet keys</span><strong>Never stored by SMAJ PI HUB</strong></div>
        </section>

        <section>
          <h2>Account Actions</h2>
          <div className="settings-info-row"><span>Payment method</span><button type="button" className="private-secondary-button" onClick={() => navigate("/payment-method")}>Open</button></div>
          <div className="settings-info-row"><span>Wallet page</span><button type="button" className="private-secondary-button" onClick={() => navigate("/wallet")}>Open</button></div>
          <div className="settings-info-row"><span>Account deletion</span><button type="button" className="private-secondary-button danger" onClick={() => setDeleteRequested(true)}>Request review</button></div>
        </section>

        {message ? <div className={`private-alert ${message.includes("Could") ? "error" : "success"}`}>{message}</div> : null}
        <button className="private-primary-button">Save Settings</button>
      </form>

      <section className="danger-card">
        <div>
          <h2>Logout</h2>
          <p>End this session on the current device.</p>
        </div>
        <button className="private-secondary-button danger" onClick={() => setShowSignOut(true)}>Logout</button>
      </section>

      <ConfirmSignOutModal open={showSignOut} onCancel={() => setShowSignOut(false)} onConfirm={() => void logout()} />
      {deleteRequested ? (
        <div className="confirm-modal-backdrop">
          <section className="confirm-modal">
            <h2>Request account deletion?</h2>
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
