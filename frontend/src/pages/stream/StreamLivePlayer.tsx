import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Link } from "react-router-dom";
import { getLivePlayback } from "../../lib/streamLive";

type LivePlayback = Awaited<ReturnType<typeof getLivePlayback>>;

const StreamLivePlayer = ({ id }: { id: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState<LivePlayback | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  useEffect(() => { void getLivePlayback(id).then(data => { setLive(data); setState("ready"); }).catch(error => { setMessage(error?.response?.data?.message || "This broadcast is not live yet."); setState("error"); }); }, [id]);
  useEffect(() => { const element = videoRef.current; if (!element || !live?.playbackUrl) return; let hls: Hls | null = null; if (element.canPlayType("application/vnd.apple.mpegurl")) element.src = live.playbackUrl; else if (Hls.isSupported()) { hls = new Hls({ lowLatencyMode: true, liveSyncDurationCount: 3 }); hls.loadSource(live.playbackUrl); hls.attachMedia(element); } else { setMessage("This browser cannot play the live stream."); setState("error"); } return () => hls?.destroy(); }, [live]);
  if (state === "loading") return <section className="sw-player-state"><i/><h1>Connecting to live stream…</h1><p>Checking broadcast status and permissions.</p></section>;
  if (state === "error" || !live) return <section className="sw-player-state error"><h1>Stream offline</h1><p>{message}</p><Link to="/app/services/stream/live">Back to Live</Link></section>;
  return <section className="sw-watch real"><div className="sw-real-player"><video ref={videoRef} controls autoPlay playsInline poster={live.thumbnailUrl || undefined}/><span className="sw-live-badge-player">● LIVE</span></div><div className="sw-watch-info"><div><h1>{live.title}</h1><p>{live.creatorName} · Live on SMAJ Stream</p></div></div></section>;
};

export default StreamLivePlayer;
