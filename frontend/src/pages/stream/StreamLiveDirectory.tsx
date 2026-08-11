import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { getPublishedLiveInputs, type PublishedLiveInput } from "../../lib/streamLive";

const StreamLiveDirectory = () => {
  const [items, setItems] = useState<PublishedLiveInput[] | null>(null);
  useEffect(() => { void getPublishedLiveInputs().then(setItems).catch(() => setItems([])); }, []);
  if (!items) return <div className="sw-catalog-status">Loading live broadcasts...</div>;
  return <><header className="sw-page-head"><span><LiveTvRoundedIcon /> ON AIR</span><h1>Live on SMAJ</h1><p>Approved creator broadcasts and official embeddable YouTube channels.</p></header>{items.length ? <section className="sw-live-directory">{items.map(item => <Link to={item.contentSource === "youtube" && item.youtubeVideoId ? `/app/services/stream/watch/yt-${item.youtubeVideoId}` : `/app/services/stream/live/${item.liveInputUid}`} key={item.liveInputUid}><div style={item.thumbnailUrl ? { backgroundImage: `url(${item.thumbnailUrl})` } : undefined}><PlayArrowRoundedIcon /><b className={item.processingStatus === "live" ? "live" : "idle"}>{item.processingStatus === "live" ? "LIVE" : "OFFLINE"}</b></div><h2>{item.title}</h2><p>{item.creatorName || "SMAJ Creator"}</p></Link>)}</section> : <div className="sw-catalog-status">No approved live channels are available yet.</div>}</>;
};
export default StreamLiveDirectory;
