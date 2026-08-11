import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { getPublishedLiveInputs, publishedLivePlaybackPath, type PublishedLiveInput } from "../../lib/streamLive";

const StreamLiveNowPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PublishedLiveInput[] | null>(null);

  useEffect(() => {
    let active = true;
    void getPublishedLiveInputs().then(data => active && setItems(data.filter(item => item.processingStatus === "live"))).catch(() => active && setItems([]));
    return () => { active = false; };
  }, []);

  return (
    <section className="sw-live-now-page">
      <header>
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowBackRoundedIcon /></button>
        <h1>What's On Now</h1>
        <i aria-hidden="true" />
      </header>
      {items === null ? <div className="sw-live-now-loading"><i/><i/><i/><i/></div> : items.length ? (
        <div className="sw-live-now-grid">
          {items.map(item => <Link to={publishedLivePlaybackPath(item)} key={item.liveInputUid}>
            <div style={item.thumbnailUrl ? { backgroundImage: `url(${item.thumbnailUrl})` } : undefined}>
              {!item.thumbnailUrl ? <PlayArrowRoundedIcon /> : null}
              <b>LIVE</b><span><i /></span>
            </div>
            <h2>{item.title}</h2>
            <p>{item.creatorName || "SMAJ Live"} · Live now</p>
          </Link>)}
        </div>
      ) : <div className="sw-live-now-empty"><h2>No channels are live right now</h2><p>Official YouTube and approved SMAJ broadcasts will appear here automatically.</p></div>}
    </section>
  );
};

export default StreamLiveNowPage;
