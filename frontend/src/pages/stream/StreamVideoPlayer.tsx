import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Link } from "react-router-dom";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import { getStreamPlayback, getStreamProgress, saveStreamProgress, type StreamPlaybackVideo } from "../../lib/streamPlayback";

const StreamVideoPlayer = ({ id }: { id: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedRef = useRef(0);
  const [video, setVideo] = useState<StreamPlaybackVideo | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setState("loading");
    void Promise.all([getStreamPlayback(id), getStreamProgress(id).catch(() => null)])
      .then(([playback, progress]) => {
        setVideo(playback);
        lastSavedRef.current = progress?.position || 0;
        setState("ready");
      })
      .catch(error => {
        setMessage(error?.response?.data?.message || "This title is not available for playback.");
        setState("error");
      });
  }, [id]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !video?.playbackUrl || video.sourceType !== "hls") return;
    let hls: Hls | null = null;
    const resume = () => { if (lastSavedRef.current > 0 && lastSavedRef.current < element.duration - 15) element.currentTime = lastSavedRef.current; };
    element.addEventListener("loadedmetadata", resume, { once: true });
    if (element.canPlayType("application/vnd.apple.mpegurl")) element.src = video.playbackUrl;
    else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(video.playbackUrl);
      hls.attachMedia(element);
      hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) setMessage("Playback was interrupted. Check your connection and retry."); });
    } else setMessage("This browser cannot play HLS video.");
    return () => { element.removeEventListener("loadedmetadata", resume); hls?.destroy(); };
  }, [video]);

  const persist = (completed = false) => {
    const element = videoRef.current;
    if (!video || !element || !Number.isFinite(element.duration)) return;
    const position = element.currentTime;
    if (!completed && Math.abs(position - lastSavedRef.current) < 10) return;
    lastSavedRef.current = position;
    void saveStreamProgress(id, { title: video.title, thumbnailUrl: video.thumbnailUrl || null, position, duration: element.duration, completed }).catch(() => undefined);
  };

  if (state === "loading") return <section className="sw-player-state"><i /><h1>Preparing your video…</h1><p>Checking playback rights and loading the stream.</p></section>;
  if (state === "error" || !video) return <section className="sw-player-state error"><h1>Video unavailable</h1><p>{message}</p><Link to="/app/services/stream">Browse available entertainment</Link></section>;
  if (video.sourceType === "youtube" && video.youtubeVideoId) return <section className="sw-watch real"><div className="sw-youtube-player"><iframe src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?rel=0`} title={video.title} allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div><div className="sw-watch-info"><div><h1>{video.title}</h1><p>{video.creatorName || "SMAJ Creator"} · Played through YouTube</p></div></div></section>;

  return <section className="sw-watch real"><div className="sw-real-player"><video ref={videoRef} controls playsInline preload="metadata" poster={video.thumbnailUrl || undefined} onTimeUpdate={() => persist()} onPause={() => persist()} onEnded={() => persist(true)} /><span className="sw-licensed-badge">AUTHORIZED STREAM</span>{message ? <p className="sw-player-warning">{message}</p> : null}</div><div className="sw-watch-info"><div><h1>{video.title}</h1><p>{video.creatorName || "SMAJ Stream"} · Progress saves automatically</p></div><button type="button"><BookmarkRoundedIcon /> Save</button></div>{video.description ? <p className="sw-watch-description">{video.description}</p> : null}</section>;
};

export default StreamVideoPlayer;
