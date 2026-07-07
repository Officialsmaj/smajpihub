import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ConfirmSignOutModal from "../../components/ConfirmSignOutModal";
import { WELCOME_REPLAY_EVENT } from "../../components/WelcomeTour";
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
const socialLinks = [
  ["X", "https://x.com/smajpihub", XIcon],
  ["Telegram", "https://t.me/smajpihub", TelegramIcon],
  ["Instagram", "https://instagram.com/smajpihub", InstagramIcon],
  ["YouTube", "https://youtube.com/@smajpihub", YouTubeIcon],
  ["TikTok", "https://www.tiktok.com/@smajpihub", MusicNoteOutlinedIcon],
] as const;

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
  const saved = useMemo(() => readSavedSettings(), []);
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
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [requestingVerification, setRequestingVerification] = useState(false);

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
      setMessage("Settings could not be saved. Please try again.");
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

  const requestVerification = async () => {
    setMessage("");
    setRequestingVerification(true);
    try {
      await axiosClient.post("/user/verification-request", { level: "verified" });
      setVerificationRequested(true);
      setMessage("Verification request submitted. Team will review your account.");
    } catch {
      setMessage("Verification request could not be submitted. Please try again.");
    } finally {
      setRequestingVerification(false);
    }
  };

  const logout = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  const replayWelcomeTour = () => {
    window.dispatchEvent(new Event(WELCOME_REPLAY_EVENT));
  };

  const verificationStatus = user?.verificationStatus === "approved" ? user?.verificationLevel === "trusted_seller" ? "Trusted seller" : "Verified" : user?.verificationStatus === "pending" ? "Pending team review" : user?.verificationStatus === "rejected" ? "Rejected" : "Basic";
  const hasRequestedVerification = verificationRequested || Boolean(user?.verificationRequested);
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
          <h2>Identity & Access</h2>
          <div className="settings-info-row"><span>Account name</span><strong>{form.fullName || user?.displayName || user?.username || "Pi user"}</strong></div>
          <div className="settings-info-row"><span>Pi username</span><strong>{piAccount}</strong></div>
          <div className="settings-info-row"><span>Wallet access</span><strong>{user?.wallet_address ? "Connected" : "Requested at Pi login"}</strong></div>
          <p>Profile name, country, image, banner, and bio are managed from the Profile page so your public marketplace identity stays consistent.</p>
        </section>

        <section>
          <h2>Account Settings</h2>
          <label>Account type<select value={form.accountType} onChange={(event) => setField("accountType", event.target.value as SavedSettings["accountType"])}><option>Buyer</option><option>Seller</option><option>Both</option></select></label>
          <div className="settings-info-row"><span>Verification status</span><strong>{verificationStatus}</strong></div>
          <div className="settings-info-row"><span>Connected Pi account</span><strong>{piAccount}</strong></div>
          <div className="settings-action-row">
            {user?.verificationStatus !== "approved" && user?.verificationStatus !== "pending" ? <button type="button" className="private-secondary-button" disabled={requestingVerification || hasRequestedVerification} onClick={() => void requestVerification()}>{hasRequestedVerification ? "Verification requested" : requestingVerification ? "Requesting..." : "Request Verified"}</button> : null}
            <button type="button" className="private-secondary-button" onClick={replayWelcomeTour}>Replay welcome tour</button>
            <button type="button" className="private-secondary-button danger" onClick={() => setShowSignOut(true)}>Logout</button>
          </div>
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

        <section>
          <h2>Official Social Links</h2>
          <p>Use only official SMAJ PI HUB social channels for announcements, support updates, and ecosystem news.</p>
          <div className="settings-social-row">
            {socialLinks.map(([label, href, Icon]) => (
              <a href={href} key={label} aria-label={label} target="_blank" rel="noreferrer">
                <Icon fontSize="small" />
              </a>
            ))}
          </div>
        </section>

        {message ? <div className="private-alert success">{message}</div> : null}
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
