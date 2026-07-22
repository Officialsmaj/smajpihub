import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import "./StreamPage.css";
import StreamHeader from "./stream/StreamHeader";
import { getStreamCatalog, searchStreamCatalog, type StreamCatalogTitle } from "../lib/streamCatalog";
import { getPublishedCreatorVideos, type CreatorVideo } from "../lib/streamCreator";

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

const onDemand = streams.filter((item) => !item.live);

const fallbackMovieRows = [
  { title: "Trending now", id: "movies", items: onDemand },
  { title: "SMAJ Original movies", id: "originals", items: [...onDemand].reverse() },
  { title: "Series worth watching", id: "series", items: [...onDemand.slice(2), ...onDemand.slice(0, 2)] },
];

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
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [playing, setPlaying] = useState<StreamItem | null>(null);
  const [catalog, setCatalog] = useState<Record<"trending" | "movies" | "series", StreamCatalogTitle[]>>({ trending: [], movies: [], series: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [rankingTab, setRankingTab] = useState("Popular");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [creatorVideos, setCreatorVideos] = useState<Array<Pick<CreatorVideo, "_id" | "title" | "thumbnailUrl" | "youtubeVideoId" | "contentSource"> & { creatorName?: string; category?: string }>>([]);
  const [anime, setAnime] = useState<StreamCatalogTitle[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([getStreamCatalog("trending"), getStreamCatalog("movies"), getStreamCatalog("series")])
      .then(([trending, movies, series]) => {
        if (!active) return;
        setCatalog({ trending: trending.results, movies: movies.results, series: series.results });
        setCatalogError(false);
      })
      .catch(() => active && setCatalogError(true))
      .finally(() => active && setCatalogLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => { void searchStreamCatalog("Anime").then((data) => setAnime(data.results)).catch(() => setAnime([])); void getPublishedCreatorVideos().then(setCreatorVideos).catch(() => setCreatorVideos([])); }, []);

  const featuredTitles = catalog.trending.filter((item) => item.backdropUrl).slice(0, 6);
  useEffect(() => { if (featuredTitles.length < 2) return; const timer = window.setInterval(() => setFeatureIndex((index) => (index + 1) % featuredTitles.length), 7000); return () => window.clearInterval(timer); }, [featuredTitles.length]);

  const featured = featuredTitles[featureIndex] ?? catalog.movies.find((item) => item.backdropUrl);
  const rankedSeries = useMemo(() => {
    const base = rankingTab === "Anime" && anime.length ? anime : [...catalog.series];
    if (rankingTab === "Top 100") return base.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (rankingTab === "New") return base.sort((a, b) => String(b.releaseDate || "").localeCompare(String(a.releaseDate || "")));
    if (rankingTab === "Returning") return base.reverse();
    return base;
  }, [anime, catalog.series, rankingTab]);

  const toggleSaved = (id: number) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  const experience = (
    <>
      <main className="stream-page">
        <StreamHeader query={query} onQueryChange={setQuery} />

        <section className="stream-hero compact" id="discover" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={(event) => { if (touchStart === null || featuredTitles.length < 2) return; const delta = (event.changedTouches[0]?.clientX || 0) - touchStart; if (Math.abs(delta) > 45) setFeatureIndex((index) => (index + (delta < 0 ? 1 : featuredTitles.length - 1)) % featuredTitles.length); setTouchStart(null); }} style={featured?.backdropUrl ? { backgroundImage: `linear-gradient(90deg, rgba(8,5,12,.94) 0%, rgba(8,5,12,.68) 50%, rgba(8,5,12,.18) 100%), url(${featured.backdropUrl})` } : undefined}>
          <div className="stream-hero-content">
            <span className="stream-eyebrow">TRENDING TODAY · {featured?.mediaType === "tv" ? "SERIES" : "MOVIE"}</span>
            <h1>{featured?.title ?? "The Last Horizon."}</h1>
            <p>{featured?.overview || "Discover movies, series, creator stories and live entertainment in one place."}</p>
            <div className="stream-hero-actions">
              {featured ? <Link className="stream-primary-action" to={`/app/services/stream/${featured.mediaType === "tv" ? "series" : "title"}/${featured.id}`}><PlayArrowRoundedIcon /> View details</Link> : <button type="button" onClick={() => setPlaying(streams[5])}><PlayArrowRoundedIcon /> Play preview</button>}
              <a href="/app/services/stream/my-list"><AddRoundedIcon /> My list</a>
            </div>
            <div className="stream-hero-meta"><span><b>{featured?.rating ? `${Math.round(featured.rating * 10)}% rating` : "Featured"}</b></span><span>{featured?.releaseDate?.slice(0, 4) || "New"}</span><span>{featured?.mediaType === "tv" ? "Series" : "Movie"}</span><span>TMDB</span></div>
          </div>
          <div className="stream-hero-dots" aria-label="Featured titles">{featuredTitles.map((item, index) => <button key={item.id} type="button" className={index === featureIndex ? "active" : ""} onClick={() => setFeatureIndex(index)} aria-label={`Show ${item.title}`} />)}</div>
        </section>

        <section className="stream-rankings"><div className="stream-row-heading"><h2>Series Rankings</h2><Link to="/app/services/stream/series">See all →</Link></div><div className="stream-ranking-tabs">{["Popular","Top 100","New","Returning","Anime"].map((tab) => <button type="button" className={rankingTab === tab ? "active" : ""} onClick={() => setRankingTab(tab)} key={tab}>{tab}</button>)}</div><div className="stream-ranking-rail">{rankedSeries.slice(0, 10).map((item, index) => <Link to={`/app/services/stream/${item.mediaType === "tv" ? "series" : "title"}/${item.id}`} key={`${item.mediaType}-${item.id}`}><b>{index + 1}</b><img loading="lazy" src={item.posterUrl || ""} alt=""/><span>{item.title}</span><small>{item.rating ? `★ ${item.rating}` : item.releaseDate?.slice(0,4) || "New"}</small></Link>)}</div></section>

        <section className="stream-movie-catalog" aria-label="Movie and series catalogue">
          {catalogLoading ? <div className="stream-catalog-loading" aria-label="Loading entertainment"><i/><i/><i/><i/></div> : null}
          {!catalogLoading && catalogError ? <p className="stream-catalog-notice">Live catalogue is unavailable. Showing SMAJ previews.</p> : null}
          {(catalog.trending.length ? [
            { title: "Trending Movies", id: "trending", items: catalog.trending.filter((item) => item.mediaType === "movie") },
            { title: "Popular movies", id: "movies", items: catalog.movies },
            { title: "Popular series", id: "series", items: catalog.series },
            { title: "New Releases", id: "new", items: [...catalog.movies].sort((a,b) => String(b.releaseDate || "").localeCompare(String(a.releaseDate || ""))) },
            { title: "Top Rated", id: "top-rated", items: [...catalog.movies, ...catalog.series].sort((a,b) => (b.rating || 0) - (a.rating || 0)) },
            { title: "Anime", id: "anime", items: anime },
          ] : fallbackMovieRows).map((row) => (
            <section className="stream-movie-row" id={row.id} key={row.title}>
              <div className="stream-row-heading"><h2>{row.title}</h2><a href={row.id === "series" ? "/app/services/stream/series" : "/app/services/stream/movies"}>Explore all →</a></div>
              <div className="stream-rail">
                {row.items.slice(0, 14).map((item, index) => {
                  const tmdbItem = "mediaType" in item;
                  const detailUrl = tmdbItem ? `/app/services/stream/${item.mediaType === "tv" ? "series" : "title"}/${item.id}` : null;
                  const posterUrl = tmdbItem ? item.posterUrl : null;
                  return <article className={`stream-movie-tile ${tmdbItem ? "has-poster" : item.tone}`} key={`${row.id}-${item.id}`}>
                    {detailUrl ? <Link to={detailUrl} aria-label={`View ${item.title}`}>
                      {posterUrl ? <img loading="lazy" src={posterUrl} alt="" /> : null}
                      <span className="stream-movie-rank">{index + 1}</span><span className="stream-movie-play"><PlayArrowRoundedIcon /></span>
                    </Link> : <button type="button" onClick={() => setPlaying(item as StreamItem)} aria-label={`Play ${item.title}`}>
                      <span className="stream-movie-rank">{index + 1}</span>
                      <span className="stream-movie-logo">{(item as StreamItem).initials}</span>
                      <span className="stream-movie-play"><PlayArrowRoundedIcon /></span>
                    </button>}
                    <div><h3>{item.title}</h3><p>{tmdbItem ? `${item.mediaType === "tv" ? "Series" : "Movie"} · ${item.rating ? `★ ${item.rating}` : item.releaseDate?.slice(0, 4) || "New"}` : index % 2 ? "Series · 8 episodes" : "Movie · SMAJ Original"}</p></div>
                  </article>;
                })}
              </div>
            </section>
          ))}
        </section>

        {creatorVideos.length ? <section className="stream-creators-row"><div className="stream-row-heading"><h2>SMAJ Creators</h2><Link to="/app/services/stream/studio">Creator Studio →</Link></div><div>{creatorVideos.map((video) => <Link to={video.youtubeVideoId ? `/app/services/stream/watch/yt-${video.youtubeVideoId}` : "/app/services/stream"} key={video._id}><img loading="lazy" src={video.thumbnailUrl || ""} alt=""/><b>{video.title}</b><small>{video.creatorName || "SMAJ Creator"} · {video.category || "Video"}</small></Link>)}</div></section> : null}

        <section className="stream-content stream-live-section" id="live">
          <div className="stream-section-head"><div><span className="stream-kicker"><LiveTvRoundedIcon /> ON AIR</span><h2>Live right now</h2></div><Link to="/app/services/stream/live">View all live →</Link></div>
          <div className="stream-featured-grid">
            {streams.slice(0, 3).map((item) => <StreamCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} onPlay={() => setPlaying(item)} />)}
          </div>
        </section>


        <footer className="stream-footer"><a className="stream-brand" href="#discover"><span><PlayArrowRoundedIcon /></span><strong>SMAJ</strong> Stream</a><p>Watch different. Create freely.</p><div><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/contact">Help</a></div></footer>
      </main>

      {playing ? <div className="stream-player-overlay" role="dialog" aria-modal="true" aria-label={`Playing ${playing.title}`} onClick={() => setPlaying(null)}><div className={`stream-player ${playing.tone}`} onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setPlaying(null)} aria-label="Close player"><CloseRoundedIcon /></button><div className="stream-player-mark"><PlayArrowRoundedIcon /></div><span>{playing.live ? "LIVE · " : "NOW PLAYING · "}{playing.viewers}</span><h2>{playing.title}</h2><p>{playing.creator}</p><aside><FavoriteBorderRoundedIcon /> This interactive preview is ready for video API integration.</aside></div></div> : null}
    </>
  );

  return embedded ? experience : <AppLayout showFooter={false}>{experience}</AppLayout>;
};

export default StreamPage;
