import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import ConfirmSignOutModal from "../../components/ConfirmSignOutModal";

const SettingsPage = () => {
  const { user, updateSettings, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "light">(user?.settings?.theme || "light");
  const [language, setLanguage] = useState(user?.settings?.language || "English");
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? true);
  const [message, setMessage] = useState("");
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.privateTheme = theme;
  }, [theme]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateSettings({ theme, language, notifications });
      setMessage("Settings saved.");
    } catch {
      setMessage("Could not save settings.");
    }
  };

  const logout = async () => { await signOut(); navigate("/home"); };

  return (
    <main className="private-page">
      <section className="private-page-head"><div><p className="private-kicker">ACCOUNT</p><h1>Settings</h1><p>Choose how your SMAJ workspace behaves.</p></div></section>
      <form className="private-form settings-card" onSubmit={(event) => void save(event)}>
        <label>Theme<select value={theme} onChange={(event) => setTheme(event.target.value as "dark" | "light")}><option value="dark">Dark</option><option value="light">Light</option></select></label>
        <label>Language<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>English</option><option>French</option><option>Spanish</option><option>Portuguese</option><option>Arabic</option></select></label>
        <label className="setting-line"><span><strong>Notifications</strong><small>Receive marketplace and order updates.</small></span><input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} /></label>
        {message ? <div className="private-alert">{message}</div> : null}
        <button className="private-primary-button">Save Settings</button>
      </form>
      <section className="danger-card"><div><h2>Sign out</h2><p>End this session on the current device.</p></div><button className="private-secondary-button danger" onClick={() => setShowSignOut(true)}>Logout</button></section>
      <ConfirmSignOutModal open={showSignOut} onCancel={() => setShowSignOut(false)} onConfirm={() => void logout()} />
    </main>
  );
};

export default SettingsPage;
