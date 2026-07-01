import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
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
import { uploadImage } from "../../lib/uploadImage";

const countryCodes = ["AE","US","GB","NG","IN","CN","ID","VN","PH","PK","BD","BR","TR","RU","KR","JP","DE","FR","IT","ES","NL","CA","AU","SA","ZA","EG","MA","KE","GH","CM","CI","SN","TZ","UG","ET","RW","DZ","TN","LY","SD","SS","AO","BJ","BW","BF","BI","CV","CF","TD","KM","CG","CD","DJ","GQ","ER","SZ","GA","GM","GN","GW","LS","LR","MG","MW","ML","MR","MU","MZ","NA","NE","SC","SL","SO","TG","ZM","ZW","AF","AL","AD","AR","AM","AT","AZ","BS","BH","BB","BY","BE","BZ","BT","BO","BA","BN","BG","KH","CL","CO","CR","HR","CY","CZ","DK","DO","EC","SV","EE","FJ","FI","GE","GR","GT","GY","HN","HK","HU","IS","IE","IL","JM","JO","KZ","KW","KG","LA","LV","LB","LI","LT","LU","MO","MY","MV","MT","MX","MD","MC","MN","ME","MM","NP","NZ","NI","MK","NO","OM","PA","PY","PE","PL","PT","QA","RO","RS","SG","SK","SI","LK","SE","CH","TW","TJ","TH","UA","UY","UZ","VA","VE"] as const;
const priorityCountries = new Set(["AE","US","GB","NG","IN","ID","VN","PH","PK","BD","BR","TR"]);
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = countryCodes.map((code) => ({
  code,
  name: countryNames.of(code) || code,
  flag: code.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0))),
})).sort((a, b) => Number(priorityCountries.has(b.code)) - Number(priorityCountries.has(a.code)) || a.name.localeCompare(b.name));

const languages = [
  { name: "English", native: "United Kingdom", flag: "🇬🇧" },
  { name: "Arabic", native: "العربية", flag: "🇦🇪" },
  { name: "French", native: "Français", flag: "🇫🇷" },
  { name: "Spanish", native: "Español", flag: "🇪🇸" },
  { name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { name: "Urdu", native: "اردو", flag: "🇵🇰" },
  { name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  { name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { name: "Filipino", native: "Filipino", flag: "🇵🇭" },
  { name: "Chinese", native: "中国人", flag: "🇨🇳" },
  { name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { name: "Korean", native: "한국어", flag: "🇰🇷" },
  { name: "German", native: "Deutsch", flag: "🇩🇪" },
  { name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { name: "Russian", native: "Русский", flag: "🇷🇺" },
  { name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { name: "Swahili", native: "Kiswahili", flag: "🇰🇪" },
  { name: "Hausa", native: "Hausa", flag: "🇳🇬" },
  { name: "Yoruba", native: "Yorùbá", flag: "🇳🇬" },
  { name: "Igbo", native: "Igbo", flag: "🇳🇬" },
  { name: "Amharic", native: "አማርኛ", flag: "🇪🇹" },
] as const;
type BackendErrorBody = { message?: string; error?: string };
type CropTarget = "avatar" | "cover";
type CropState = { target: CropTarget; source: string };

const cropConfig = {
  avatar: { width: 512, height: 512, label: "Profile picture" },
  cover: { width: 1640, height: 624, label: "Profile banner" },
} as const;

const readImageFile = (file: File, onLoad: (value: string) => void, onError: (message: string) => void) => {
  if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
    onError("Choose an image up to 4 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => onLoad(String(reader.result || ""));
  reader.onerror = () => onError("Could not read that image.");
  reader.readAsDataURL(file);
};

const cropImage = (source: string, target: CropTarget) => new Promise<string>((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const { width, height } = cropConfig[target];
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not available"));
    const aspect = width / height;
    let cropWidth = image.naturalWidth;
    let cropHeight = cropWidth / aspect;
    if (cropHeight > image.naturalHeight) {
      cropHeight = image.naturalHeight;
      cropWidth = cropHeight * aspect;
    }
    const sx = Math.max(0, (image.naturalWidth - cropWidth) / 2);
    const sy = Math.max(0, (image.naturalHeight - cropHeight) / 2);
    ctx.drawImage(image, sx, sy, cropWidth, cropHeight, 0, 0, width, height);
    resolve(canvas.toDataURL("image/jpeg", 0.9));
  };
  image.onerror = reject;
  image.src = source;
});

const ProfilePage = () => {
  const { user, updateProfile } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ totalProducts: 0, successfulOrders: 0 });
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [crop, setCrop] = useState<CropState | null>(null);
  const [saving, setSaving] = useState(false);
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
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

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    return countries.filter((country) => !query || country.name.toLowerCase().includes(query) || country.code.toLowerCase().includes(query)).slice(0, 220);
  }, [countrySearch]);
  const filteredLanguages = useMemo(() => {
    const query = languageSearch.trim().toLowerCase();
    return languages.filter((language) => !query || language.name.toLowerCase().includes(query) || language.native.toLowerCase().includes(query));
  }, [languageSearch]);

  const name = form.displayName || user?.displayName || user?.username || "Pi User";
  const username = user?.piUsername || user?.username || "pi-user";
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available";
  const sellerActive = Boolean(form.sellerActive || user?.sellerActive || user?.role === "seller");
  const selectedCountry = countries.find((country) => country.name === form.country);
  const selectedLanguage = languages.find((language) => language.name === form.language) || languages[0];

  const beginCrop = (target: CropTarget, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    readImageFile(file, (source) => {
      setEditing(true);
      setCrop({ target, source });
    }, setMessage);
  };

  const applyCrop = async () => {
    if (!crop) return;
    try {
      const cropped = await cropImage(crop.source, crop.target);
      setForm((current) => crop.target === "avatar" ? { ...current, avatar: cropped } : { ...current, coverImage: cropped });
      setCrop(null);
      setMessage(`${cropConfig[crop.target].label} ready. Save changes to update your profile.`);
    } catch {
      setMessage("Could not crop image. Please try another file.");
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (form.bio.trim().length < 30) {
      setMessage("Bio/About is required. Please write at least 30 characters.");
      return;
    }
    if (!form.country.trim()) {
      setMessage("Country is required. Choose your country from the list.");
      return;
    }
    try {
      setSaving(true);
      const [avatar, coverImage] = await Promise.all([
        uploadImage(form.avatar, "profile-avatar"),
        uploadImage(form.coverImage, "profile-banner"),
      ]);
      await updateProfile({
        ...form,
        avatar,
        coverImage,
        bio: form.bio.trim(),
        role: user?.role === "admin" ? "admin" : form.sellerActive ? "seller" : "buyer",
      });
      setForm((current) => ({ ...current, avatar, coverImage }));
      setMessage("Profile saved successfully.");
      setEditing(false);
    } catch (err: unknown) {
      setMessage(isAxiosError<BackendErrorBody>(err) ? err.response?.data?.message || "Could not save profile. Please sign in again and check required details." : "Could not save profile. Check image size and required details.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSeller = async () => {
    const next = !sellerActive;
    const nextForm = { ...form, sellerActive: next };
    setForm(nextForm);
    setMessage("");
    try {
      await updateProfile({ ...nextForm, role: next ? "seller" : "buyer" });
      setMessage(next ? "Seller tools activated." : "Seller tools deactivated.");
    } catch (err: unknown) {
      setForm(form);
      setMessage(isAxiosError<BackendErrorBody>(err) ? err.response?.data?.message || "Could not update seller tools. Please sign in again." : "Could not update seller tools. Please try again.");
    }
  };

  const requestVerification = async () => {
    setMessage("");
    setRequestingVerification(true);
    try {
      await axiosClient.post("/user/verification-request");
      setVerificationRequested(true);
      setMessage("Trusted seller verification requested. Admin will review your account.");
    } catch {
      setMessage("Could not request trusted seller verification. Activate seller tools first.");
    } finally {
      setRequestingVerification(false);
    }
  };

  const hasRequestedVerification = verificationRequested || Boolean(user?.verificationRequested);

  return (
    <main className="private-page real-profile-page">
      <input id="profileAvatarUpload" ref={avatarInputRef} hidden type="file" accept="image/*" onChange={(event) => beginCrop("avatar", event)} />
      <input id="profileCoverUpload" ref={coverInputRef} hidden type="file" accept="image/*" onChange={(event) => beginCrop("cover", event)} />

      <section className="real-profile-hero">
        <label className="real-profile-cover" htmlFor="profileCoverUpload" style={form.coverImage ? { backgroundImage: `url(${form.coverImage})` } : undefined} aria-label="Edit profile banner">
          <span role="button" tabIndex={0}>
            <EditOutlinedIcon /> Edit Banner
          </span>
        </label>
        <div className="real-profile-identity">
          <button className="real-profile-avatar" type="button" onClick={() => avatarInputRef.current?.click()} aria-label="Upload profile picture">
            {form.avatar ? <img src={form.avatar} alt="Profile" /> : name.slice(0, 1).toUpperCase()}
            <span><EditOutlinedIcon /></span>
          </button>
          <div>
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

      {message ? <div className={`private-alert floating-alert ${message.includes("Could") || message.includes("required") || message.includes("sign in") ? "error" : "success"}`}>{message}</div> : null}

      {!editing ? (
        <>
          <section className="real-profile-stats">
            <article><Inventory2OutlinedIcon /><span>Products</span><strong>{stats.totalProducts}</strong></article>
            <article><StorefrontOutlinedIcon /><span>Successful Orders</span><strong>{stats.successfulOrders}</strong></article>
            <article><VerifiedUserOutlinedIcon /><span>Verification</span><strong>{user?.verificationLevel || "basic"}</strong></article>
          </section>

          <section className="real-profile-grid">
            <article className="real-profile-card real-profile-about">
              <div className="real-profile-card-head"><AccountCircleOutlinedIcon /><h2>About</h2></div>
              <p>{user?.bio || "Add a short bio so buyers, sellers, and partners understand who you are on SMAJ PI HUB."}</p>
            </article>

            <article className="real-profile-card">
              <div className="real-profile-card-head"><BadgeOutlinedIcon /><h2>Account Details</h2></div>
              <dl>
                <div><dt>Pi Username</dt><dd>@{username}</dd></div>
                <div><dt>Joined</dt><dd>{joined}</dd></div>
                <div><dt>Country</dt><dd>{selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : user?.country || "Not set"}</dd></div>
                <div><dt>Contact</dt><dd>{user?.contactPhone || "Not set"}</dd></div>
              </dl>
            </article>

            <article className="real-profile-card">
              <div className="real-profile-card-head"><StorefrontOutlinedIcon /><h2>Seller Profile</h2></div>
              <p>{sellerActive ? "Seller tools are active. Your listings can be reviewed and approved for SMAJ Store." : "Use one verified Pi identity to activate seller tools when you are ready to list products."}</p>
              <div className="form-actions">
                <button className="private-secondary-button" type="button" onClick={() => void toggleSeller()}>{sellerActive ? "Deactivate Seller Tools" : "Activate Seller Tools"}</button>
                {sellerActive ? <Link className="private-primary-button" to="/add-product">Add Product</Link> : null}
                {sellerActive && user?.verificationLevel !== "trusted_seller" ? <button className="private-secondary-button" type="button" disabled={requestingVerification || hasRequestedVerification} onClick={() => void requestVerification()}>{hasRequestedVerification ? "Verification Requested" : requestingVerification ? "Requesting..." : "Request Trusted Seller"}</button> : null}
              </div>
            </article>

            <article className="real-profile-card">
              <div className="real-profile-card-head"><LanguageOutlinedIcon /><h2>Preferences</h2></div>
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
            <div className="profile-media-actions">
              <button type="button" className="private-secondary-button" onClick={() => avatarInputRef.current?.click()}>Upload profile picture</button>
              <button type="button" className="private-secondary-button" onClick={() => coverInputRef.current?.click()}>Upload banner image</button>
            </div>
          </section>

          <section>
            <h2>Personal Information</h2>
            <label>Display name<input required maxLength={80} value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label>
            <label>Pi username<input value={`@${username}`} disabled /><small>Pi username is managed by Pi authentication.</small></label>
            <label>Bio / About<textarea required minLength={30} maxLength={500} rows={4} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Tell buyers and sellers who you are, what you do, and how you use SMAJ PI HUB." /><small className="form-help">{form.bio.length}/500 characters. Minimum 30 required.</small></label>
            <div className="private-form-row">
              <label className="country-picker-label">Country
                <button type="button" className="country-picker-trigger" onClick={() => setCountryOpen((open) => !open)}>
                  <span>{selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : form.country || "Choose country"}</span>
                </button>
                {countryOpen ? (
                  <div className="country-picker-panel">
                    <input autoFocus value={countrySearch} onChange={(event) => setCountrySearch(event.target.value)} placeholder="Search country or scroll..." />
                    <div>
                      {filteredCountries.map((country) => (
                        <button type="button" key={country.code} onClick={() => { setForm({ ...form, country: country.name }); setCountrySearch(""); setCountryOpen(false); }}>
                          <span>{country.flag}</span>
                          <strong>{country.name}</strong>
                          {priorityCountries.has(country.code) ? <small>High Pi community</small> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </label>
              <label className="language-picker-label">Language
                <button type="button" className="language-picker-trigger" onClick={() => setLanguageOpen((open) => !open)}>
                  <span>{selectedLanguage.flag}</span>
                  <strong>{selectedLanguage.name}</strong>
                  <small>{selectedLanguage.native}</small>
                </button>
                {languageOpen ? (
                  <div className="language-picker-panel">
                    <input autoFocus value={languageSearch} onChange={(event) => setLanguageSearch(event.target.value)} placeholder="Search language..." />
                    <div>
                      {filteredLanguages.map((language) => (
                        <button type="button" key={language.name} className={language.name === form.language ? "active" : ""} onClick={() => { setForm({ ...form, language: language.name }); setLanguageSearch(""); setLanguageOpen(false); }}>
                          <span>{language.flag}</span>
                          <strong>{language.name}</strong>
                          <small>{language.native}</small>
                          {language.name === form.language ? <b>✓</b> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </label>
            </div>
            <label>Phone / WhatsApp<input maxLength={40} value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} placeholder="+971 50 123 4567" /></label>
          </section>

          <label className="setting-line"><span><strong>Seller profile</strong><small>Unlock seller tools under this same verified Pi account.</small></span><input type="checkbox" checked={form.sellerActive} onChange={(event) => setForm({ ...form, sellerActive: event.target.checked })} /></label>

          <div className="form-actions">
            <button className="private-primary-button" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            <button type="button" className="private-secondary-button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}

      {crop ? (
        <div className="crop-modal-backdrop">
          <section className="crop-modal">
            <h2>Crop {cropConfig[crop.target].label}</h2>
            <div className={`crop-preview crop-preview-${crop.target}`}>
              <img src={crop.source} alt="" />
            </div>
            <p>{crop.target === "cover" ? "Your banner will be centered and saved at 1640 x 624." : "Your profile picture will be centered and saved as a square image."}</p>
            <div className="form-actions">
              <button type="button" className="private-primary-button" onClick={() => void applyCrop()}>Use Image</button>
              <button type="button" className="private-secondary-button" onClick={() => (crop.target === "cover" ? coverInputRef.current : avatarInputRef.current)?.click()}>Choose Another</button>
              <button type="button" className="private-secondary-button" onClick={() => setCrop(null)}>Cancel</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
};

export default ProfilePage;
