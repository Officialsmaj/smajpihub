import { useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import "./StreamPage.css";

type StreamItem = {
  id: number;
  title: string;
  creator: string;
  category: string;
  viewers: string;
  live?: boolean;
  duration?: string;
  tone: string;
  initials: string;
};

const streams: StreamItem[] = [
  { id: 1, title: "Building the future with Pi", creator: "SMAJ Studio", category: "Technology", viewers: "12.8K", live: true, tone: "violet", initials: "SS" },
  { id: 2, title: "Afrobeats sunset session", creator: "Maya Live", category: "Music", viewers: "8.2K", live: true, tone: "sunset", initials: "ML" },
  { id: 3, title: "Championship watch party", creator: "Sport Central", category: "Sports", viewers: "6.7K", live: true, tone: "pitch", initials: "SC" },
  { id: 4, title: "Street food across Lagos", creator: "Taste Journey", category: "Lifestyle", viewers: "142K views", duration: "18:24", tone: "food", initials: "TJ" },
  { id: 5, title: "The creator economy, explained", creator: "Build Better", category: "Learning", viewers: "89K views", duration: "12:08", tone: "blue", initials: "BB" },
  { id: 6, title: "Indie films you should know", creator: "Frame by Frame", category: "Film", viewers: "51K views", duration: "24:31", tone: "cinema", initials: "FF" },
  { id: 7, title: "Morning movement & balance", creator: "Nia Wellness", category: "Wellness", viewers: "34K views", duration: "16:42", tone: "mint", initials: "NW" },
  { id: 8, title: "Designing products people love", creator: "Made Simple", category: "Technology", viewers: "76K views", duration: "20:15", tone: "coral", initials: "MS" },
];

const categories = ["All", "Live", "Music", "Sports", "Technology", "Lifestyle", "Learning", "Film", "Wellness"];

const StreamCard = ({ item, saved, onSave, onPlay }: { item: StreamItem; saved: boolean; onSave: () => void; onPlay: () => void }) => (
  <article className="stream-card">
    <button className={`stream-thumb ${item.tone}`} type="button" onClick={onPlay} aria-label={`Play ${item.title}`}>
      <span className="stream-thumb-shape" />
      <span className="stream-play"><PlayArrowRoundedIcon /></span>
      {item.live ? <span className="stream-live-badge">LIVE</span> : <span className="stream-duration">{item.duration}</span>}
      <span className="stream-viewers"><VisibilityOutlinedIcon /> {item.viewers}</span>
    </button>
    <div className="stream-card-body">
      <span className="stream-avatar">{item.initials}</span>
      <div>
        <h3>{item.title}</h3>
        <p>{item.creator} <VerifiedRoundedIcon /></p>
        <small>{item.category}</small>
      </div>
      <button className="stream-save" type="button" onClick={onSave} aria-label={saved ? "Remove from saved" : "Save video"}>
        {saved ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
      </button>
    </div>
  </article>
);

type StreamPageProps = {
  embedded?: boolean;
};

const StreamPage = ({ embedded = false }: StreamPageProps) => {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [playing, setPlaying] = useState<StreamItem | null>(null);

  const visible = useMemo(() => streams.filter((item) => {
    const categoryMatch = category === "All" || (category === "Live" ? item.live : item.category === category);
    const text = `${item.title} ${item.creator} ${item.category}`.toLowerCase();
    return categoryMatch && text.includes(query.trim().toLowerCase());
  }), [category, query]);

  const toggleSaved = (id: number) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  const experience = (
    <>
      <main className="stream-page">
        <header className="stream-topbar">
          <a className="stream-brand" href="#discover"><span><PlayArrowRoundedIcon /></span><strong>SMAJ</strong> Stream</a>
          <nav aria-label="Stream navigation"><a href="#discover">Discover</a><a href="#live">Live</a><a href="#categories">Categories</a><a href="#studio">For creators</a></nav>
          <label className="stream-search"><SearchRoundedIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shows, creators, topics" /></label>
          <a href="#studio" className="stream-create"><VideoCallRoundedIcon /> Create</a>
        </header>

        <section className="stream-hero" id="discover">
          <div className="stream-hero-content">
            <span className="stream-eyebrow"><i /> LIVE NOW · SMAJ ORIGINAL</span>
            <h1>Stories worth<br /><em>staying for.</em></h1>
            <p>Watch creators, culture and communities come alive. Stream freely, support directly, and belong to something bigger.</p>
            <div className="stream-hero-actions">
              <button type="button" onClick={() => setPlaying(streams[0])}><PlayArrowRoundedIcon /> Watch live</button>
              <a href="#studio"><AddRoundedIcon /> Start creating</a>
            </div>
            <div className="stream-hero-meta"><span><b>12.8K</b> watching</span><span>Technology</span><span>Live in 1080p</span></div>
          </div>
          <div className="stream-hero-art" aria-hidden="true"><div className="stream-orbit orbit-one" /><div className="stream-orbit orbit-two" /><div className="stream-hero-screen"><span>S</span><i><PlayArrowRoundedIcon /></i></div><div className="stream-chat-bubble one"><b>AMAZING!</b><span>🔥 2.4K</span></div><div className="stream-chat-bubble two"><b>Supporting with Pi</b><span>π 25</span></div></div>
        </section>

        <section className="stream-content" id="live">
          <div className="stream-section-head"><div><span className="stream-kicker"><LiveTvRoundedIcon /> ON AIR</span><h2>Live right now</h2></div><button type="button" onClick={() => setCategory("Live")}>View all live →</button></div>
          <div className="stream-featured-grid">
            {streams.slice(0, 3).map((item) => <StreamCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} onPlay={() => setPlaying(item)} />)}
          </div>
        </section>

        <section className="stream-content" id="categories">
          <div className="stream-section-head"><div><span className="stream-kicker"><AutoAwesomeRoundedIcon /> FOR YOU</span><h2>Find your next favorite</h2></div></div>
          <div className="stream-filters" role="list" aria-label="Video categories">{categories.map((item) => <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          {visible.length ? <div className="stream-catalog-grid">{visible.map((item) => <StreamCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} onPlay={() => setPlaying(item)} />)}</div> : <div className="stream-empty"><SearchRoundedIcon /><h3>Nothing found yet</h3><p>Try another search or category.</p></div>}
        </section>

        <section className="stream-creator" id="studio">
          <div><span className="stream-kicker">CREATOR FIRST</span><h2>Your audience.<br />Your rules. <em>Your value.</em></h2><p>Go live, publish your work and build a community that moves with you. Keep more of what you earn with direct Pi support.</p><a href="/onboarding">Open Creator Studio <span>→</span></a></div>
          <div className="stream-dashboard-card"><header><span><i /> Live</span><small>Creator Studio</small></header><div className="stream-dashboard-preview"><PlayArrowRoundedIcon /><b>3,842</b><span>watching now</span></div><footer><div><small>Today’s support</small><strong>π 1,284.50</strong></div><div className="stream-bars"><i /><i /><i /><i /><i /><i /></div></footer></div>
        </section>

        <footer className="stream-footer"><a className="stream-brand" href="#discover"><span><PlayArrowRoundedIcon /></span><strong>SMAJ</strong> Stream</a><p>Watch different. Create freely.</p><div><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/contact">Help</a></div></footer>
      </main>

      {playing ? <div className="stream-player-overlay" role="dialog" aria-modal="true" aria-label={`Playing ${playing.title}`} onClick={() => setPlaying(null)}><div className={`stream-player ${playing.tone}`} onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setPlaying(null)} aria-label="Close player"><CloseRoundedIcon /></button><div className="stream-player-mark"><PlayArrowRoundedIcon /></div><span>{playing.live ? "LIVE · " : "NOW PLAYING · "}{playing.viewers}</span><h2>{playing.title}</h2><p>{playing.creator}</p><aside><FavoriteBorderRoundedIcon /> This interactive preview is ready for video API integration.</aside></div></div> : null}
    </>
  );

  return embedded ? experience : <AppLayout showFooter={false}>{experience}</AppLayout>;
};

export default StreamPage;
