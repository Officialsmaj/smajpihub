import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import "./StreamPage.css";
import StreamHeader from "./stream/StreamHeader";
import { getStreamCatalog, getStreamCategory, getStreamDownloads, saveStreamDownload, searchStreamCatalog, type StreamCatalogTitle } from "../lib/streamCatalog";
import { getStreamCreators, type StreamCreatorDirectoryItem } from "../lib/streamChannel";

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

type StreamPageProps = {
  embedded?: boolean;
  categorySlug?: string;
};

const categoryLabels: Record<string, string> = { trending: "Trending", movies: "Movies", series: "Series", "tv-channels": "TV Shows", hollywood: "Hollywood", bollywood: "Bollywood", nollywood: "Nollywood", kannywood: "Kannywood", anime: "Anime", "k-drama": "K-Drama", "chinese-drama": "Chinese Drama", "african-movies": "African Movies", documentaries: "Documentaries", kids: "Kids & Family", action: "Action", comedy: "Comedy", romance: "Romance", horror: "Horror", sports: "Sports", wwe: "WWE / Wrestling" };

const catalogKey = (item: StreamCatalogTitle) => `${item.mediaType}-${item.id}`;
const uniqueCatalogTitles = (items: StreamCatalogTitle[], excluded = new Set<string>()) => {
  const identities = new Set(excluded);
  const posters = new Set<string>();
  return items.filter((item) => {
    const identity = catalogKey(item);
    if (!item.posterUrl || identities.has(identity) || posters.has(item.posterUrl)) return false;
    identities.add(identity);
    posters.add(item.posterUrl);
    return true;
  });
};

const StreamPage = ({ categorySlug }: StreamPageProps) => {
  const params = useParams();
  const activeSlug = categorySlug || params.slug || "trending";
  const categoryLabel = categoryLabels[activeSlug] || activeSlug.split("-").map(word => word[0]?.toUpperCase() + word.slice(1)).join(" ");
  const categoryMode = activeSlug !== "trending";
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<StreamItem | null>(null);
  const [catalog, setCatalog] = useState<Record<"trending" | "movies" | "series", StreamCatalogTitle[]>>({ trending: [], movies: [], series: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [rankingTab, setRankingTab] = useState("Popular");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [creators, setCreators] = useState<StreamCreatorDirectoryItem[]>([]);
  const [anime, setAnime] = useState<StreamCatalogTitle[]>([]);
  const [downloadingId, setDownloadingId] = useState("");
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(() => new Set());
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => { setFeatureIndex(0); setRankingTab("Popular"); }, [activeSlug]);

  useEffect(() => {
    let active = true;
    setCatalog({ trending: [], movies: [], series: [] });
    setCatalogError(false);
    setCatalogLoading(true);
    const requests = activeSlug === "trending"
      ? [getStreamCatalog("trending"), getStreamCatalog("movies"), getStreamCatalog("series")]
      : activeSlug === "movies" || activeSlug === "series"
        ? [getStreamCatalog(activeSlug), getStreamCatalog(activeSlug, 1, "primary_release_date.desc"), getStreamCatalog(activeSlug, 1, "vote_average.desc")]
        : [getStreamCategory(activeSlug), getStreamCategory(activeSlug, 1, "primary_release_date.desc"), getStreamCategory(activeSlug, 1, "vote_average.desc")];
    Promise.all(requests)
      .then(([trending, movies, series]) => {
        if (!active) return;
        setCatalog({ trending: trending.results, movies: movies.results, series: series.results });
        setCatalogError(false);
      })
      .catch(() => active && setCatalogError(true))
      .finally(() => active && setCatalogLoading(false));
    return () => { active = false; };
  }, [activeSlug]);

  useEffect(() => { void searchStreamCatalog("Anime").then((data) => setAnime(data.results)).catch(() => setAnime([])); void getStreamCreators().then(setCreators).catch(() => setCreators([])); }, []);
  useEffect(() => {
    void getStreamDownloads()
      .then((items) => setDownloadedIds(new Set(items.map(catalogKey))))
      .catch(() => undefined);
  }, []);

  const featuredTitles = useMemo(() => {
    const identities = new Set<string>();
    const backdrops = new Set<string>();
    return catalog.trending.filter((item) => {
      const identity = catalogKey(item);
      if (!item.backdropUrl || identities.has(identity) || backdrops.has(item.backdropUrl)) return false;
      identities.add(identity);
      backdrops.add(item.backdropUrl);
      return true;
    }).slice(0, 6);
  }, [catalog.trending]);
  useEffect(() => { if (featuredTitles.length < 2) return; const timer = window.setInterval(() => setFeatureIndex((index) => (index + 1) % featuredTitles.length), 7000); return () => window.clearInterval(timer); }, [featuredTitles.length]);

  const featured = featuredTitles[featureIndex] ?? catalog.movies.find((item) => item.backdropUrl);
  const downloadFeatured = async () => {
    if (!featured || downloadedIds.has(catalogKey(featured))) return;
    const key = catalogKey(featured);
    setDownloadingId(key);
    setDownloadError("");
    try {
      await saveStreamDownload(featured);
      setDownloadedIds((current) => new Set(current).add(key));
    } catch {
      setDownloadError("Download could not be saved. Please try again.");
    } finally {
      setDownloadingId("");
    }
  };
  const rankedSeries = useMemo(() => {
    const base = rankingTab === "Anime" && anime.length ? anime : [...(categoryMode ? catalog.trending : catalog.series)];
    if (rankingTab === "Top 100") return base.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (rankingTab === "New") return base.sort((a, b) => String(b.releaseDate || "").localeCompare(String(a.releaseDate || "")));
    if (rankingTab === "Returning") return base.reverse();
    return base;
  }, [anime, catalog.series, catalog.trending, categoryMode, rankingTab]);

  const catalogRows = useMemo(() => {
    if (!catalog.trending.length) return categoryMode ? [] : fallbackMovieRows;
    const definitions = categoryMode ? [
      { title: `Popular ${categoryLabel}`, id: "popular", items: catalog.trending },
      { title: `New ${categoryLabel} Releases`, id: "new", items: catalog.movies },
      { title: `Top Rated ${categoryLabel}`, id: "top-rated", items: catalog.series },
    ] : [
      { title: "Trending Movies", id: "trending", items: catalog.trending.filter((item) => item.mediaType === "movie") },
      { title: "Popular movies", id: "movies", items: catalog.movies },
      { title: "Popular series", id: "series", items: catalog.series },
      { title: "New Releases", id: "new", items: [...catalog.movies].sort((a,b) => String(b.releaseDate || "").localeCompare(String(a.releaseDate || ""))) },
      { title: "Top Rated", id: "top-rated", items: [...catalog.movies, ...catalog.series].sort((a,b) => (b.rating || 0) - (a.rating || 0)) },
      { title: "Anime", id: "anime", items: anime },
    ];
    const heroIds = new Set(featuredTitles.map(catalogKey));
    let previousRowIds = new Set<string>();
    return definitions.map((row) => {
      const items = uniqueCatalogTitles(row.items, new Set([...heroIds, ...previousRowIds])).slice(0, 20);
      previousRowIds = new Set(items.map(catalogKey));
      return { ...row, items };
    }).filter((row) => row.items.length);
  }, [anime, catalog.movies, catalog.series, catalog.trending, categoryLabel, categoryMode, featuredTitles]);

  const experience = (
    <>
      <main className="stream-page">
        <StreamHeader query={query} onQueryChange={setQuery} />

        <section className="stream-hero compact" id="discover" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={(event) => { if (touchStart === null || featuredTitles.length < 2) return; const delta = (event.changedTouches[0]?.clientX || 0) - touchStart; if (Math.abs(delta) > 45) setFeatureIndex((index) => (index + (delta < 0 ? 1 : featuredTitles.length - 1)) % featuredTitles.length); setTouchStart(null); }} style={featured?.backdropUrl ? { backgroundImage: `url(${featured.backdropUrl})` } : undefined}>
          <div className="stream-hero-content">
            <span className="stream-eyebrow">{categoryLabel.toUpperCase()} FEATURED · {featured?.mediaType === "tv" ? "SERIES" : "MOVIE"}</span>
            <h1>{featured?.title ?? (catalogLoading ? `Loading ${categoryLabel}…` : `${categoryLabel} is unavailable`)}</h1>
            <p>{featured?.overview || (catalogLoading ? "Finding the best titles for this category." : "We could not load this category right now. Please try again shortly.")}</p>
            <div className="stream-hero-actions">
              {featured ? <Link className="stream-primary-action" to={`/app/services/stream/${featured.mediaType === "tv" ? "series" : "title"}/${featured.id}`}><PlayArrowRoundedIcon /> View details</Link> : null}
              {featured ? <button type="button" disabled={downloadingId === catalogKey(featured) || downloadedIds.has(catalogKey(featured))} onClick={() => void downloadFeatured()}><DownloadRoundedIcon /> {downloadingId === catalogKey(featured) ? "Downloading…" : downloadedIds.has(catalogKey(featured)) ? "Downloaded" : "Download"}</button> : null}
            </div>
            {downloadError ? <small className="stream-download-error" role="alert">{downloadError}</small> : null}
            <div className="stream-hero-meta"><span><b>{featured?.rating ? `${Math.round(featured.rating * 10)}% rating` : "Featured"}</b></span><span>{featured?.releaseDate?.slice(0, 4) || "New"}</span><span>{featured?.mediaType === "tv" ? "Series" : "Movie"}</span><span>TMDB</span></div>
          </div>
          <div className="stream-hero-dots" aria-label="Featured titles">{featuredTitles.map((item, index) => <button key={item.id} type="button" className={index === featureIndex ? "active" : ""} onClick={() => setFeatureIndex(index)} aria-label={`Show ${item.title}`} />)}</div>
        </section>

        <section className="stream-rankings"><div className="stream-row-heading"><h2>{categoryMode ? `${categoryLabel} Rankings` : "Series Rankings"}</h2><Link to={categoryMode ? `/app/services/stream/category/${activeSlug}` : "/app/services/stream/series"}>See all →</Link></div><div className="stream-ranking-tabs">{(categoryMode ? ["Popular","New","Top 100","Returning"] : ["Popular","Top 100","New","Returning","Anime"]).map((tab) => <button type="button" className={rankingTab === tab ? "active" : ""} onClick={() => setRankingTab(tab)} key={tab}>{tab}</button>)}</div><div className="stream-ranking-rail">{rankedSeries.slice(0, 10).map((item, index) => <Link to={`/app/services/stream/${item.mediaType === "tv" ? "series" : "title"}/${item.id}`} key={`${item.mediaType}-${item.id}`}><b>{index + 1}</b><img loading="lazy" src={item.posterUrl || ""} alt=""/><span>{item.title}</span><small>{item.rating ? `★ ${item.rating}` : item.releaseDate?.slice(0,4) || "New"}</small></Link>)}</div></section>

        <section className="stream-movie-catalog" aria-label="Movie and series catalogue">
          {catalogLoading ? <div className="stream-catalog-loading" aria-label="Loading entertainment"><i/><i/><i/><i/></div> : null}
          {!catalogLoading && catalogError ? <p className="stream-catalog-notice">Live catalogue is unavailable. Showing SMAJ previews.</p> : null}
          {catalogRows.map((row) => (
            <section className="stream-movie-row" id={row.id} key={row.title}>
              <div className="stream-row-heading"><h2>{row.title}</h2><a href={row.id === "series" ? "/app/services/stream/series" : "/app/services/stream/movies"}>Explore all →</a></div>
              <div className="stream-rail">
                {row.items.slice(0, 20).map((item, index) => {
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

        {creators.length ? <section className="stream-creators-row"><div className="stream-row-heading"><h2>SMAJ Creators</h2><Link to="/app/services/stream/creators">See all →</Link></div><div>{creators.slice(0, 10).map((creator) => <Link to={`/app/services/stream/channel/${creator.channel.handle}`} key={creator.creatorId}><img loading="lazy" src={creator.channel.avatarUrl || creator.latestVideos[0]?.thumbnailUrl || ""} alt=""/><b>{creator.channel.name}</b><small>@{creator.channel.handle} · {creator.stats.videos} videos</small></Link>)}</div></section> : null}

        <footer className="stream-footer"><a className="stream-brand" href="#discover"><span><PlayArrowRoundedIcon /></span><strong>SMAJ</strong> Stream</a><p>Watch different. Create freely.</p><div><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/contact">Help</a></div></footer>
      </main>

      {playing ? <div className="stream-player-overlay" role="dialog" aria-modal="true" aria-label={`Playing ${playing.title}`} onClick={() => setPlaying(null)}><div className={`stream-player ${playing.tone}`} onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setPlaying(null)} aria-label="Close player"><CloseRoundedIcon /></button><div className="stream-player-mark"><PlayArrowRoundedIcon /></div><span>{playing.live ? "LIVE · " : "NOW PLAYING · "}{playing.viewers}</span><h2>{playing.title}</h2><p>{playing.creator}</p><aside><FavoriteBorderRoundedIcon /> This interactive preview is ready for video API integration.</aside></div></div> : null}
    </>
  );

  return experience;
};

export default StreamPage;
