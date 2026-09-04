import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PhoneAndroidOutlinedIcon from "@mui/icons-material/PhoneAndroidOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import { axiosClient } from "../../lib/axiosClient";
import "./DeviceSessionsPage.css";

type DeviceSession = {
  id: string;
  name: string;
  platform: string;
  browser: string;
  operatingSystem: string;
  osVersion?: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  notificationsEnabled: boolean;
  current: boolean;
};

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "Unknown";

const DeviceSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get<{ sessions: DeviceSession[] }>("/user/sessions");
      setSessions(data.sessions || []);
    } catch {
      setMessage("Your devices could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const remove = async (session: DeviceSession) => {
    if (session.current || !window.confirm(`Sign out ${session.name}?`)) return;
    setBusyId(session.id);
    setMessage("");
    try {
      await axiosClient.delete(`/user/sessions/${session.id}`);
      setSessions((current) => current.filter((item) => item.id !== session.id));
      setMessage(`${session.name} was signed out.`);
    } catch {
      setMessage("That device could not be removed. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  const removeOthers = async () => {
    if (!window.confirm("Sign out every other device connected to your SMAJ account?")) return;
    setBusyId("others");
    setMessage("");
    try {
      await axiosClient.post("/user/sessions/revoke-others");
      setSessions((current) => current.filter((item) => item.current));
      setMessage("All other devices were signed out.");
    } catch {
      setMessage("Other devices could not be signed out. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="private-page device-sessions-page">
      <header className="device-sessions-nav">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowBackRoundedIcon /></button>
        <div><span>Security</span><strong>Devices & Sessions</strong></div>
      </header>

      <section className="device-sessions-hero">
        <p className="private-kicker">ACCOUNT SECURITY</p>
        <h1>Where you’re signed in</h1>
        <p>Review your active devices and sign out any device you no longer recognize or use.</p>
      </section>

      <section className="device-security-note">
        <DevicesOutlinedIcon />
        <div><strong>Your account, under your control</strong><span>Locations are approximate. SMAJ never displays your IP address, Pi token, session cookie, or notification token.</span></div>
      </section>

      <div className="device-session-toolbar">
        <div><strong>{sessions.length}</strong><span> active {sessions.length === 1 ? "device" : "devices"}</span></div>
        {sessions.some((item) => !item.current) ? <button type="button" className="private-secondary-button danger" disabled={busyId === "others"} onClick={() => void removeOthers()}>{busyId === "others" ? "Signing out..." : "Sign out all other devices"}</button> : null}
      </div>

      {message ? <div className="private-alert success" role="status">{message}</div> : null}
      {loading ? <div className="device-session-empty">Loading your devices…</div> : null}
      {!loading && sessions.length === 0 ? <div className="device-session-empty"><DevicesOutlinedIcon /><h2>No active sessions found</h2><p>Sign in again to register this device.</p></div> : null}

      <section className="device-session-list" aria-label="Active devices">
        {sessions.map((session) => (
          <article className={`device-session-card${session.current ? " current" : ""}`} key={session.id}>
            <div className="device-session-icon">{session.platform === "android" ? <PhoneAndroidOutlinedIcon /> : <LanguageOutlinedIcon />}</div>
            <div className="device-session-main">
              <div className="device-session-title"><h2>{session.name}</h2>{session.current ? <span>THIS DEVICE</span> : null}</div>
              <p>{session.platform === "android" ? "SMAJ PI HUB Android" : session.browser} · {session.operatingSystem}{session.osVersion ? ` ${session.osVersion}` : ""}</p>
              <div className="device-session-facts">
                <span><LocationOnOutlinedIcon />{session.location}</span>
                <span>Last active: {formatDate(session.lastActiveAt)}</span>
                <span>Signed in: {formatDate(session.createdAt)}</span>
                {session.platform === "android" ? <span><NotificationsActiveOutlinedIcon />Notifications: {session.notificationsEnabled ? "On" : "Off"}</span> : null}
              </div>
            </div>
            {!session.current ? <button type="button" className="device-remove-button" disabled={busyId === session.id} onClick={() => void remove(session)}>{busyId === session.id ? "Removing..." : "Remove device"}</button> : <span className="device-current-safe">Protected current session</span>}
          </article>
        ))}
      </section>
    </main>
  );
};

export default DeviceSessionsPage;