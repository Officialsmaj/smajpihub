import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { getPublishedLiveInputs, type CreatorLiveInput } from "../../lib/streamLive";

type PublicLive = Pick<CreatorLiveInput, "liveInputUid" | "title" | "processingStatus" | "chatMode"> & { creatorName?: string; thumbnailUrl?: string | null };
const StreamLiveDirectory = () => {
  const [items, setItems] = useState<PublicLive[] | null>(null);
  useEffect(() => { void getPublishedLiveInputs().then(setItems).catch(() => setItems([])); }, []);
  if (!items) return <div className="sw-catalog-status">Loading live broadcasts…</div>;
  return <><header className="sw-page-head"><span><LiveTvRoundedIcon /> ON AIR</span><h1>Live on SMAJ</h1><p>Approved creator broadcasts and scheduled live channels.</p></header>{items.length ? <section className="sw-live-directory">{items.map(item => <Link to={`/app/services/stream/live/${item.liveInputUid}`} key={item.liveInputUid}><div style={item.thumbnailUrl ? { backgroundImage: `url(${item.thumbnailUrl})` } : undefined}><PlayArrowRoundedIcon /><b className={item.processingStatus === "live" ? "live" : "idle"}>{item.processingStatus === "live" ? "● LIVE" : "OFFLINE"}</b></div><h2>{item.title}</h2><p>{item.creatorName || "SMAJ Creator"}</p></Link>)}</section> : <div className="sw-catalog-status">No approved live channels are available yet.</div>}</>;
};
export default StreamLiveDirectory;
