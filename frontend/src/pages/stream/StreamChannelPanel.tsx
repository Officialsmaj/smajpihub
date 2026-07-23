import { useEffect, useState, type FormEvent } from "react";
import { getStreamProfile, saveStreamProfile, type StreamProfile } from "../../lib/streamProfile";

const StreamChannelPanel = () => {
  const [profile, setProfile] = useState<StreamProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getStreamProfile().then(({ profile: next }) => { setProfile(next); setStatus("ready"); }).catch(() => { setStatus("error"); setMessage("Your channel could not be loaded."); });
  }, []);

  const change = <K extends keyof StreamProfile>(key: K, value: StreamProfile[K]) => setProfile(current => current ? { ...current, [key]: value } : current);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    try {
      setStatus("saving"); setMessage("");
      const result = await saveStreamProfile(profile);
      setProfile(result.profile); setStatus("ready"); setMessage("Channel saved and synchronized.");
    } catch (error) {
      setStatus("error");
      setMessage((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Channel could not be saved.");
    }
  };

  if (!profile) return <div className="sw-catalog-status">{status === "loading" ? "Loading your channel…" : message}</div>;
  const initials = (profile.channelName || profile.displayName || "SC").split(/\s+/).map(word => word[0]).join("").slice(0, 2).toUpperCase();
  return <form className="sw-channel-editor" onSubmit={submit}>
    <div className="sw-channel-banner" style={profile.channelBannerUrl ? { backgroundImage: `url(${profile.channelBannerUrl})` } : undefined}><span>{initials}</span></div>
    <div className="sw-channel-identity"><div className="sw-channel-avatar">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : initials}</div><div><h2>{profile.channelName || "My channel"}</h2><p>@{profile.channelHandle || "channel"}</p></div></div>
    <div className="sw-channel-fields">
      <label>Channel name<input required minLength={2} maxLength={80} value={profile.channelName} onChange={event => change("channelName", event.target.value)} /></label>
      <label>Channel handle<div className="sw-handle-input"><span>@</span><input required maxLength={40} value={profile.channelHandle} onChange={event => change("channelHandle", event.target.value.replace(/[^a-zA-Z0-9_.-]/g, ""))} /></div></label>
      <label className="wide">Description<textarea maxLength={500} rows={4} value={profile.channelDescription} onChange={event => change("channelDescription", event.target.value)} /></label>
      <label className="wide">Banner HTTPS URL<input type="url" placeholder="https://…" value={profile.channelBannerUrl} onChange={event => change("channelBannerUrl", event.target.value)} /></label>
    </div>
    {message ? <p className={`sw-profile-message ${status === "error" ? "error" : "success"}`}>{message}</p> : null}
    <button className="sw-profile-save" type="submit" disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Save channel"}</button>
  </form>;
};

export default StreamChannelPanel;
