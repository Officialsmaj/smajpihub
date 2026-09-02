import { useEffect, useRef, useState } from "react";
import "./OfflineStatus.css";

type NetworkDetail = { connected?: boolean };

const OfflineStatus = () => {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const wasOffline = useRef(!navigator.onLine);

  useEffect(() => {
    let timer = 0;
    const update = (connected: boolean) => {
      setOnline(connected);
      document.documentElement.classList.toggle("smaj-offline", !connected);
      if (!connected) {
        wasOffline.current = true;
        setShowRestored(false);
        window.clearTimeout(timer);
        return;
      }
      if (wasOffline.current) {
        wasOffline.current = false;
        setShowRestored(true);
        window.dispatchEvent(new CustomEvent("smaj:connection-restored"));
        timer = window.setTimeout(() => setShowRestored(false), 3500);
      }
    };
    const nativeHandler = (event: Event) => update(Boolean((event as CustomEvent<NetworkDetail>).detail?.connected));
    const onlineHandler = () => update(true);
    const offlineHandler = () => update(false);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    window.addEventListener("smaj:native-network", nativeHandler);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
      window.removeEventListener("smaj:native-network", nativeHandler);
    };
  }, []);

  if (online && !showRestored) return null;
  return (
    <div className={`smaj-connectivity-banner ${online ? "is-online" : "is-offline"}`} role="status" aria-live="polite">
      <span className="smaj-connectivity-dot" aria-hidden="true" />
      <strong>{online ? "Back online" : "You're offline"}</strong>
      <span>
        {online ? "Refreshing available content…" : "Saved content remains available. Online actions are paused."}
      </span>
    </div>
  );
};

export default OfflineStatus;
