import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClosedCaptionRoundedIcon from "@mui/icons-material/ClosedCaptionRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import "./StreamWorkspacePage.css";
import StreamHeader from "./StreamHeader";
import CreatorUploadForm from "./CreatorUploadForm";
import CreatorContentList from "./CreatorContentList";
import StreamProfilePanel from "./StreamProfilePanel";
import StreamVideoPlayer from "./StreamVideoPlayer";
import StreamWatchHistory from "./StreamWatchHistory";
import StreamSubscriptions from "./StreamSubscriptions";
import StreamModerationPanel from "./StreamModerationPanel";
import StreamLiveSetup from "./StreamLiveSetup";
import StreamLivePlayer from "./StreamLivePlayer";
import StreamLiveDirectory from "./StreamLiveDirectory";
import StreamChannelPanel from "./StreamChannelPanel";
import StreamPublicChannel from "./StreamPublicChannel";
import StreamCreatorOverview from "./StreamCreatorOverview";
import {
  getStreamAdminOverview,
  getStreamAdminSettings,
  getTitleAvailability,
  saveStreamAdminSettings,
  type StreamAdminOverview,
  type StreamAdminSettings,
} from "../../lib/streamAdmin";
import { formatServicePrice } from "../../lib/piPricing";
import { formatPiRate } from "../../lib/piPricing";
import {
  getStreamCatalog,
  getStreamCategory,
  getStreamMyList,
  getStreamMyListStatus,
  getStreamTitle,
  removeStreamTitle,
  saveStreamTitle,
  searchStreamCatalog,
  type StreamCatalogTitle,
} from "../../lib/streamCatalog";
import { getStreamProfile, saveStreamProfile, type StreamProfile } from "../../lib/streamProfile";

export type StreamPageKind =
  | "movies"
  | "series"
  | "live"
  | "search"
  | "category"
  | "my-list"
  | "history"
  | "subscriptions"
  | "movie-detail"
  | "series-detail"
  | "player"
  | "live-player"
  | "profile"
  | "notifications"
  | "plans"
  | "parental"
  | "studio"
  | "upload"
  | "create-live"
  | "content"
  | "analytics"
  | "channel"
  | "public-channel"
  | "earnings"
  | "admin"
  | "moderation"
  | "reports"
  | "creators"
  | "catalog-admin"
  | "admin-analytics"
  | "stream-settings";

type Title = {
  id: string;
  name: string;
  meta: string;
  tone: string;
  progress?: number;
  posterUrl?: string | null;
  mediaType?: "movie" | "tv";
  overview?: string;
};

const titles: Title[] = [
  { id: "last-horizon", name: "The Last Horizon", meta: "Movie · 2h 08m", tone: "purple", progress: 64 },
  { id: "city-lights", name: "City of Lights", meta: "Series · 8 episodes", tone: "amber", progress: 31 },
  { id: "wild-roads", name: "Wild Roads", meta: "Documentary · 1h 32m", tone: "green" },
  { id: "frequency", name: "Frequency", meta: "Movie · 1h 54m", tone: "blue" },
  { id: "after-rain", name: "After the Rain", meta: "Series · 2 seasons", tone: "coral" },
  { id: "deep-space", name: "Deep Space", meta: "Movie · 2h 21m", tone: "indigo" },
  { id: "home-table", name: "The Home Table", meta: "Lifestyle · 12 episodes", tone: "rose" },
  { id: "champions", name: "Champions Live", meta: "Live · Starts 20:00", tone: "teal" },
];

const pageMeta: Partial<Record<StreamPageKind, [string, string]>> = {
  movies: ["Movies", "Blockbusters, originals and stories from around the world."],
  series: ["Series", "Binge-worthy stories and new episodes every week."],
  live: ["Live", "Events, creators, music and sport happening right now."],
  "my-list": ["My List", "Titles you saved so you can find them again quickly."],
  history: ["Watch history", "Resume watching or revisit your recent entertainment."],
  subscriptions: ["Subscriptions", "New releases from creators and channels you follow."],
  profile: ["Stream profile", "Your viewing identity and playback preferences."],
  plans: ["Plans & payments", "Choose how you watch and support creators with Pi."],
  parental: ["Parental controls", "Create a safe entertainment experience for every profile."],
};

const Tile = ({ title, compact = false }: { title: Title; compact?: boolean }) => (
  <Link
    className={`sw-title-card ${title.tone} ${compact ? "compact" : ""}`}
    to={`/app/services/stream/${title.mediaType === "tv" ? "series" : "title"}/${title.id}`}
  >
    <div
      className={title.posterUrl ? "" : "poster-missing"}
      style={
        title.posterUrl
          ? {
              backgroundImage: `linear-gradient(0deg,rgba(14,7,20,.45),transparent),url(${title.posterUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <span className="sw-card-logo">
        {title.posterUrl
          ? ""
          : title.name
              .split(" ")
              .map(word => word[0])
              .join("")
              .slice(0, 2)}
      </span>
      <span className="sw-card-play">
        <PlayArrowRoundedIcon />
      </span>
      {title.progress ? <i style={{ width: `${title.progress}%` }} /> : null}
    </div>
    <h3>{title.name}</h3>
    <p>{title.meta}</p>
  </Link>
);

const Catalogue = ({ kind }: { kind: StreamPageKind }) => {
  const { slug = "" } = useParams();
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("Popular");
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [remoteTitles, setRemoteTitles] = useState<Title[] | null>(null);
  const [remoteCatalog, setRemoteCatalog] = useState<StreamCatalogTitle[]>([]);
  const [catalogState, setCatalogState] = useState<"loading" | "ready" | "fallback">(() =>
    ["movies", "series", "search", "category", "my-list"].includes(kind) ? "loading" : "fallback"
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const categoryName = slug
    .split("-")
    .map(part => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
  const categoryFilterLabels: Record<string, string[]> = {
    anime: ["All", "Action", "Drama", "Comedy", "Family"],
    documentaries: ["All", "Documentary"],
    kids: ["All", "Comedy", "Family"],
    action: ["All", "Drama", "Comedy"],
    comedy: ["All", "Action", "Drama", "Family"],
    romance: ["All", "Drama", "Comedy"],
    horror: ["All", "Drama", "Comedy"],
  };
  const filterLabels =
    kind === "category"
      ? categoryFilterLabels[slug] || ["All", "Action", "Drama", "Comedy"]
      : ["All", "Action", "Drama", "Comedy", "Documentary", "Family"];
  const [heading, description] =
    kind === "category"
      ? [categoryName, `Popular, new and top-rated ${categoryName} entertainment.`]
      : kind === "search"
        ? [
            query.trim() ? `Results for “${query.trim()}”` : "Search",
            query.trim()
              ? "Movies and series matching your search."
              : "Search for movies, series and creators from the header.",
          ]
        : (pageMeta[kind] ?? ["Browse", "Entertainment selected for you."]);
  useEffect(() => {
    if (kind === "search") {
      setQuery(searchParams.get("q") || "");
      setPage(1);
    }
  }, [kind, searchParams]);
  useEffect(() => {
    setGenre("All");
    setPage(1);
  }, [slug]);
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || kind === "my-list") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && catalogState === "ready" && !loadingMore && page < totalPages)
          setPage(value => value + 1);
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [catalogState, kind, loadingMore, page, totalPages]);
  useEffect(() => {
    if (!["movies", "series", "search", "category", "my-list"].includes(kind)) return;
    const timer = window.setTimeout(
      () => {
        if (kind === "my-list") {
          void getStreamMyList()
            .then(items => {
              setRemoteTitles(
                items.map((item, index) => ({
                  id: item.id,
                  name: item.title,
                  meta: `${item.mediaType === "tv" ? "Series" : "Movie"}${item.releaseDate ? ` · ${item.releaseDate.slice(0, 4)}` : ""}${item.rating ? ` · ★ ${item.rating}` : ""}`,
                  tone: ["purple", "amber", "green", "blue", "coral", "indigo", "rose", "teal"][index % 8],
                  posterUrl: item.posterUrl,
                  mediaType: item.mediaType,
                  overview: item.overview,
                }))
              );
              setCatalogState("ready");
            })
            .catch(() => {
              setRemoteTitles([]);
              setCatalogState("fallback");
            });
          return;
        }
        if (page > 1) setLoadingMore(true);
        const sortParam =
          sort === "Newest" ? "primary_release_date.desc" : sort === "A–Z" ? "original_title.asc" : "popularity.desc";
        const request =
          kind === "search"
            ? searchStreamCatalog(query, page)
            : kind === "category"
              ? getStreamCategory(slug, page, sortParam)
              : getStreamCatalog(kind as "movies" | "series", page, sortParam);
        void request
          .then(data => {
            if (page === 1)
              setRemoteTitles(
                data.results.map((item: StreamCatalogTitle, index) => ({
                  id: item.id,
                  name: item.title,
                  meta: `${item.mediaType === "tv" ? "Series" : "Movie"}${item.releaseDate ? ` · ${item.releaseDate.slice(0, 4)}` : ""}${item.rating ? ` · ★ ${item.rating}` : ""}`,
                  tone: ["purple", "amber", "green", "blue", "coral", "indigo", "rose", "teal"][index % 8] || "purple",
                  posterUrl: item.posterUrl,
                  mediaType: item.mediaType,
                  overview: item.overview,
                }))
              );
            setCatalogState("ready");
            if (page === 1) setRemoteCatalog(data.results);
            setTotalPages(Math.min(data.total_pages || 1, kind === "search" ? 500 : 100));
            if (page > 1) {
              const next = data.results.map((item: StreamCatalogTitle, index) => ({
                id: item.id,
                name: item.title,
                meta: `${item.mediaType === "tv" ? "Series" : "Movie"} · ${item.releaseDate?.slice(0, 4) || "New"}${item.rating ? ` · ★ ${item.rating}` : ""}`,
                tone: ["purple", "amber", "green", "blue", "coral", "indigo", "rose", "teal"][index % 8] || "purple",
                posterUrl: item.posterUrl,
                mediaType: item.mediaType,
                overview: item.overview,
              }));
              setRemoteTitles(current => [
                ...new Map([...(current || []), ...next].map(item => [`${item.mediaType}-${item.id}`, item])).values(),
              ]);
              setRemoteCatalog(current => [
                ...new Map([...current, ...data.results].map(item => [`${item.mediaType}-${item.id}`, item])).values(),
              ]);
            }
          })
          .catch(() => {
            if (page === 1) {
              setRemoteTitles(null);
              setCatalogState("fallback");
            }
          })
          .finally(() => setLoadingMore(false));
      },
      kind === "search" ? 350 : 0
    );
    return () => window.clearTimeout(timer);
  }, [kind, page, query, slug, sort]);
  const localList = kind === "history" ? titles.filter(item => item.progress) : kind === "my-list" ? [] : titles;
  const list = remoteTitles ?? localList;
  const genreIds: Record<string, number[]> = {
    Action: [28, 10759],
    Drama: [18],
    Comedy: [35],
    Documentary: [99],
    Family: [10751],
  };
  const filtered =
    kind === "search"
      ? list
      : list.filter(
          item =>
            item.name.toLowerCase().includes(query.toLowerCase()) &&
            (genre === "All" ||
              remoteCatalog.find(entry => entry.id === item.id)?.genreIds.some(id => genreIds[genre]?.includes(id)))
        );
  return (
    <>
      <header className="sw-page-head">
        <h1>{heading}</h1>
        <p>{description}</p>
      </header>
      {kind !== "search" ? (
        <div className="sw-toolbar">
          <div>
            {filterLabels.map(item => (
              <button
                className={genre === item ? "active" : ""}
                onClick={() => {
                  setGenre(item);
                  setPage(1);
                }}
                type="button"
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={event => {
              setSort(event.target.value);
              setPage(1);
            }}
            aria-label="Sort titles"
          >
            <option>Popular</option>
            <option>Newest</option>
            <option>A–Z</option>
          </select>
        </div>
      ) : null}
      {catalogState === "loading" ? (
        <div className="sw-catalog-status">Loading the entertainment catalogue…</div>
      ) : null}
      {catalogState === "fallback" && ["movies", "series", "search", "category"].includes(kind) ? (
        <div className="sw-catalog-status warning">
          This catalogue is unavailable. Check the TMDB backend configuration and retry.
        </div>
      ) : null}
      {catalogState === "fallback" && kind === "my-list" ? (
        <div className="sw-catalog-status warning">
          My List could not synchronize. Please sign in again or retry shortly.
        </div>
      ) : null}
      {catalogState === "ready" && kind === "my-list" && !filtered.length ? (
        <div className="sw-list-empty">
          <BookmarkRoundedIcon />
          <h2>Your list is empty</h2>
          <p>Save a movie or series and it will appear here on every signed-in device.</p>
          <Link to="/app/services/stream/movies">Explore movies</Link>
        </div>
      ) : null}
      <div className="sw-title-grid">
        {filtered.map(item => (
          <Tile title={item} key={`${item.mediaType || "local"}-${item.id}`} />
        ))}
      </div>
      {catalogState === "ready" && kind !== "my-list" ? (
        <div className="sw-load-more" ref={loadMoreRef}>
          {page < totalPages ? (
            <button type="button" disabled={loadingMore} onClick={() => setPage(value => value + 1)}>
              {loadingMore ? "Loading more…" : "Load more titles"}
            </button>
          ) : (
            <span>You reached the end of this catalogue.</span>
          )}
          <small>{remoteTitles?.length || 0} titles loaded</small>
        </div>
      ) : null}
      <p className="sw-attribution">
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          TMDB
        </a>{" "}
        · This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </>
  );
};

const Detail = ({ series = false }: { series?: boolean }) => {
  const { id } = useParams();
  const type = series ? "tv" : "movie";
  const [detail, setDetail] = useState<
    | (StreamCatalogTitle & { genres: Array<{ id: number; name: string }>; runtime: number | null; raw: TmdbDetailRaw })
    | null
  >(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playbackId, setPlaybackId] = useState("");
  useEffect(() => {
    if (!id) return;
    setState("loading");
    void Promise.all([
      getStreamTitle(type, id),
      getStreamMyListStatus(type, id).catch(() => false),
      getTitleAvailability(type, id).catch((): { available: boolean; playbackId?: string } => ({ available: false })),
    ])
      .then(([titleData, savedStatus, availability]) => {
        setDetail(titleData as typeof detail);
        setSaved(savedStatus);
        setPlaybackId(availability.available ? availability.playbackId || "" : "");
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [id, type]);
  if (state === "loading")
    return (
      <div className="sw-detail-loading">
        <i />
        <i />
        <i />
      </div>
    );
  if (state === "error" || !detail)
    return (
      <section className="sw-detail-error">
        <h1>We could not load this title</h1>
        <p>Check the TMDB backend configuration and try again.</p>
        <Link to={series ? "/app/services/stream/series" : "/app/services/stream/movies"}>Back to catalogue</Link>
      </section>
    );
  const raw = detail.raw;
  const recommendations: Title[] = (raw.recommendations?.results || []).slice(0, 8).map((item, index) => ({
    id: String(item.id),
    name: item.title || item.name || "Untitled",
    meta: `${item.media_type === "tv" || series ? "Series" : "Movie"}${item.vote_average ? ` · ★ ${item.vote_average.toFixed(1)}` : ""}`,
    tone: ["purple", "amber", "green", "blue", "coral", "indigo", "rose", "teal"][index],
    posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    mediaType: item.media_type || (series ? "tv" : "movie"),
  }));
  const directors = (raw.credits?.crew || []).filter(person => person.job === "Director").slice(0, 3);
  const creators = series ? (raw.created_by || []).slice(0, 3) : directors;
  const toggleSaved = async () => {
    if (!id) return;
    setSaving(true);
    try {
      if (saved) await removeStreamTitle(type, id);
      else await saveStreamTitle(detail);
      setSaved(!saved);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <section
        className="sw-detail-hero tmdb"
        style={detail.backdropUrl ? { backgroundImage: `url(${detail.backdropUrl})` } : undefined}
      >
        <div className="sw-detail-hero-layout">
          {detail.posterUrl ? (
            <img className="sw-detail-poster" src={detail.posterUrl} alt={`${detail.title} poster`} />
          ) : null}
          <div className="sw-detail-copy">
            <span>TMDB · {series ? "SERIES" : "FEATURE FILM"}</span>
            <h1>{detail.title}</h1>
            {raw.tagline ? <p className="sw-detail-tagline">{raw.tagline}</p> : null}
            <p className="sw-match">
              {detail.rating ? `★ ${detail.rating}` : "New"} · {detail.releaseDate?.slice(0, 4) || "Coming soon"}
              {detail.runtime ? ` · ${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : ""}
            </p>
            <div className="sw-detail-genres">
              {detail.genres.map(genre => (
                <b key={genre.id}>{genre.name}</b>
              ))}
            </div>
            <p>{detail.overview || "No overview is available for this title yet."}</p>
            {creators.length ? (
              <p className="sw-detail-credits">
                <b>{series ? "Created by" : "Directed by"}</b> {creators.map(person => person.name).join(", ")}
              </p>
            ) : null}
            <div className="sw-detail-actions">
              {playbackId ? (
                <Link className="primary" to={`/app/services/stream/watch/${playbackId}`}>
                  <PlayArrowRoundedIcon /> Play {series ? "series" : "movie"}
                </Link>
              ) : null}
              <button type="button" disabled={saving} onClick={() => void toggleSaved()}>
                <BookmarkRoundedIcon /> {saving ? "Saving…" : saved ? "Saved" : "My List"}
              </button>
            </div>
            {!playbackId ? (
              <small className="sw-detail-watch-note unavailable">Not available yet on SMAJ Stream.</small>
            ) : null}
          </div>
        </div>
      </section>
      <section className="sw-detail-info">
        <div>
          <h2>Top cast</h2>
          <div className="sw-cast">
            {(raw.credits?.cast || []).slice(0, 8).map(person => (
              <article key={person.id}>
                {person.profile_path ? (
                  <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt="" />
                ) : (
                  <span>{person.name.slice(0, 1)}</span>
                )}
                <b>{person.name}</b>
                <small>{person.character || "Cast"}</small>
              </article>
            ))}
          </div>
        </div>
        <aside>
          <h2>{playbackId ? "Available on SMAJ" : "SMAJ availability"}</h2>
          {playbackId ? (
            <p>This title is published and ready to play on SMAJ Stream.</p>
          ) : (
            <p>This title is not available yet. Save it to My List and check again later.</p>
          )}
          <dl className="sw-title-facts">
            <div>
              <dt>Original language</dt>
              <dd>{raw.original_language?.toUpperCase() || "—"}</dd>
            </div>
            <div>
              <dt>Release</dt>
              <dd>{detail.releaseDate || "To be announced"}</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>
                {detail.rating ? `${detail.rating}/10 (${detail.voteCount.toLocaleString()} votes)` : "Not rated"}
              </dd>
            </div>
            {raw.number_of_seasons ? (
              <div>
                <dt>Seasons</dt>
                <dd>{raw.number_of_seasons}</dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </section>
      {series && raw.seasons?.length ? (
        <section className="sw-seasons">
          <h2>Seasons</h2>
          <div>
            {raw.seasons
              .filter(season => season.season_number > 0)
              .map(season => (
                <article key={season.id}>
                  {season.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w185${season.poster_path}`} alt="" />
                  ) : null}
                  <div>
                    <h3>{season.name}</h3>
                    <p>{season.episode_count} episodes</p>
                    <small>{season.air_date?.slice(0, 4) || "Release date unavailable"}</small>
                  </div>
                </article>
              ))}
          </div>
        </section>
      ) : null}
      <section className="sw-related">
        <h2>More like this</h2>
        <div>
          {(recommendations.length ? recommendations : titles.slice(1, 5)).map(item => (
            <Tile compact title={item} key={`${item.mediaType}-${item.id}`} />
          ))}
        </div>
      </section>
      <p className="sw-attribution">
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          TMDB
        </a>{" "}
        · This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </>
  );
};

type TmdbDetailRaw = {
  tagline?: string;
  status?: string;
  original_language?: string;
  number_of_seasons?: number;
  created_by?: Array<{ id: number; name: string }>;
  credits?: {
    cast?: Array<{ id: number; name: string; character: string; profile_path: string | null }>;
    crew?: Array<{ id: number; name: string; job: string }>;
  };
  recommendations?: {
    results?: Array<{
      id: number;
      title?: string;
      name?: string;
      media_type?: "movie" | "tv";
      poster_path?: string | null;
      vote_average?: number;
    }>;
  };
  seasons?: Array<{
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
    air_date?: string;
  }>;
};
const Player = ({ live = false }: { live?: boolean }) => {
  const { id } = useParams();
  if (live) return <StreamLivePlayer id={id || ""} />;
  if (!live) return <StreamVideoPlayer id={id || ""} />;
  const title = titles.find(item => item.id === id) ?? titles[0];
  const youtubeId = id?.startsWith("yt-") ? id.slice(3) : "";
  if (youtubeId && /^[A-Za-z0-9_-]{11}$/.test(youtubeId))
    return (
      <section className="sw-watch youtube">
        <div className="sw-youtube-player">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
            title="Creator video"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="sw-watch-info">
          <div>
            <h1>Creator video</h1>
            <p>Played through YouTube · Downloads are not provided by SMAJ</p>
          </div>
          <button type="button">
            <BookmarkRoundedIcon /> Save
          </button>
        </div>
      </section>
    );
  return (
    <section className="sw-watch">
      <div className={`sw-video-stage ${title.tone}`}>
        <span className="sw-now">{live ? "● LIVE" : "NOW PLAYING"}</span>
        <button type="button" className="sw-center-play">
          <PlayArrowRoundedIcon />
        </button>
        <div className="sw-controls">
          <PlayArrowRoundedIcon />
          <span>00:18</span>
          <i>
            <b />
          </i>
          <VolumeUpRoundedIcon />
          <ClosedCaptionRoundedIcon />
          <FullscreenRoundedIcon />
        </div>
      </div>
      <div className="sw-watch-info">
        <div>
          <h1>{title.name}</h1>
          <p>{live ? "18.4K watching now" : "SMAJ Original · 2026"}</p>
        </div>
        <button type="button">
          <BookmarkRoundedIcon /> Save
        </button>
      </div>
      {live ? (
        <aside className="sw-live-chat">
          <header>
            Live chat <span>18.4K</span>
          </header>
          {["This is incredible! 🔥", "Watching from Lagos", "Supporting with π 5", "What a moment!"].map(
            (message, index) => (
              <p key={message}>
                <b>{["Maya", "Joel", "Amara", "Sam"][index]}</b>
                {message}
              </p>
            )
          )}
          <label>
            <input placeholder="Join the conversation" />
            <button type="button">Send</button>
          </label>
        </aside>
      ) : null}
    </section>
  );
};

const AccountPage = ({ kind }: { kind: StreamPageKind }) => {
  if (kind === "profile") return <StreamProfilePanel />;
  if (kind === "notifications") return <Navigate to="/notifications" replace />;
  if (kind === "parental") return <StreamParentalControls />;
  const [heading, description] = pageMeta[kind] ?? ["Account", "Manage your Stream experience."];
  return (
    <>
      <header className="sw-page-head">
        <span>YOUR ACCOUNT</span>
        <h1>{heading}</h1>
        <p>{description}</p>
      </header>
      <section className="sw-settings-card">
        {kind === "plans" ? (
          <div className="sw-plans">
            {[
              ["Free", 0, "Standard video and creator channels"],
              ["Plus", 8, "HD streaming, My List sync and no advertising"],
              ["Family", 14, "4K and up to five profiles"],
            ].map(([name, price, text], index) => (
              <article className={index === 1 ? "featured" : ""} key={name}>
                <span>{index === 1 ? "POPULAR" : "PLAN"}</span>
                <h2>{name}</h2>
                <strong>
                  {formatServicePrice(Number(price))}
                  <small>/month</small>
                </strong>
                <p>{text}</p>
                <small>{formatPiRate()}</small>
                <button type="button">Choose {name}</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="sw-catalog-status">This Stream account page is not available.</div>
        )}
      </section>
    </>
  );
};

const StreamParentalControls = () => {
  const [profile, setProfile] = useState<StreamProfile | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getStreamProfile()
      .then(data => {
        setProfile(data.profile);
        setState("ready");
      })
      .catch(() => {
        setState("error");
        setMessage("Parental controls could not be loaded.");
      });
  }, []);

  const change = <K extends keyof StreamProfile>(key: K, value: StreamProfile[K]) =>
    setProfile(current => (current ? { ...current, [key]: value } : current));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    try {
      setState("saving");
      setMessage("");
      const data = await saveStreamProfile(profile);
      setProfile(data.profile);
      setState("ready");
      setMessage("Parental controls saved for this Stream profile.");
    } catch (error) {
      setState("error");
      setMessage(
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          "Parental controls could not be saved."
      );
    }
  };

  if (state === "loading") return <div className="sw-catalog-status">Loading parental controls...</div>;
  if (!profile) return <div className="sw-catalog-status warning">{message}</div>;

  return (
    <form className="sw-parental-controls" onSubmit={event => void submit(event)}>
      <header className="sw-page-head">
        <span>YOUR ACCOUNT</span>
        <h1>Parental controls</h1>
        <p>Set rating, playback and privacy rules for this Stream profile.</p>
      </header>
      <section className="sw-settings-card">
        <label className="sw-setting select">
          <span>
            <b>Maximum maturity rating</b>
            <small>Limit browsing and playback recommendations for this profile.</small>
          </span>
          <select
            value={profile.maturityLevel}
            onChange={event => change("maturityLevel", event.target.value as StreamProfile["maturityLevel"])}
          >
            <option value="kids">Kids</option>
            <option value="13">13+</option>
            <option value="16">16+</option>
            <option value="18">18+</option>
          </select>
        </label>
        {[
          ["autoplay", "Autoplay next episode", "Start the next episode automatically."],
          ["dataSaver", "Data saver", "Use less mobile data while streaming."],
          ["showActivity", "Show viewing activity", "Allow this profile activity to appear in Stream surfaces."],
          ["emailNotifications", "Email entertainment updates", "Receive Stream highlights through the shared notification system."],
        ].map(([key, label, text]) => (
          <label className="sw-setting" key={key}>
            <span>
              <b>{label}</b>
              <small>{text}</small>
            </span>
            <input
              type="checkbox"
              checked={Boolean(profile[key as keyof StreamProfile])}
              onChange={event => change(key as "autoplay", event.target.checked)}
            />
            <i />
          </label>
        ))}
      </section>
      {message ? <p className={`sw-profile-message ${state === "error" ? "error" : ""}`}>{message}</p> : null}
      <button className="sw-profile-save" type="submit" disabled={state === "saving"}>
        {state === "saving" ? "Saving..." : "Save parental controls"}
      </button>
    </form>
  );
};

const studioNav = [
  ["Overview", "studio"],
  ["Upload", "studio/upload"],
  ["Go live", "studio/live"],
  ["Content", "studio/content"],
  ["Analytics", "studio/analytics"],
  ["Channel", "studio/channel"],
  ["Earnings", "studio/earnings"],
];

const Studio = ({ kind }: { kind: StreamPageKind }) => {
  const title =
    (
      {
        studio: "Creator overview",
        upload: "Upload video",
        "create-live": "Create live stream",
        content: "Content manager",
        analytics: "Video analytics",
        channel: "Your channel",
        earnings: "Creator earnings",
      } as Partial<Record<StreamPageKind, string>>
    )[kind] ?? "Creator Studio";
  return (
    <div className="sw-management">
      <aside>
        <b>CREATOR STUDIO</b>
        {studioNav.map(([label, path]) => (
          <Link key={path} to={`/app/services/stream/${path}`}>
            {label}
          </Link>
        ))}
      </aside>
      <section>
        <header className="sw-manage-head">
          <div>
            <span>CREATOR FIRST</span>
            <h1>{title}</h1>
          </div>
          {kind === "studio" ? (
            <Link to="/app/services/stream/studio/upload">
              <AddRoundedIcon /> New video
            </Link>
          ) : null}
        </header>
        {kind === "studio" ? <StreamCreatorOverview mode="overview" /> : null}
        {kind === "upload" ? <CreatorUploadForm /> : null}
        {kind === "create-live" ? <StreamLiveSetup /> : null}
        {kind === "content" ? <CreatorContentList /> : null}
        {kind === "analytics" ? <StreamCreatorOverview mode="analytics" /> : null}
        {kind === "channel" ? <StreamChannelPanel /> : null}
        {kind === "earnings" ? <StreamCreatorOverview mode="earnings" /> : null}
      </section>
    </div>
  );
};

const Admin = ({ kind }: { kind: StreamPageKind }) => {
  const [overview, setOverview] = useState<StreamAdminOverview | null>(null);
  const [settings, setSettings] = useState<StreamAdminSettings | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const data = await getStreamAdminOverview();
      setOverview(data);
      if (kind === "stream-settings") {
        const remoteSettings = await getStreamAdminSettings();
        setSettings(current => current || remoteSettings);
      }
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [kind]);
  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(interval);
  }, [load]);
  const title =
    (
      {
        admin: "Stream overview",
        moderation: "Content moderation",
        reports: "Reports & appeals",
        creators: "Creator management",
        "catalog-admin": "Catalogue management",
        "admin-analytics": "Platform analytics",
        "stream-settings": "Stream configuration",
      } as Partial<Record<StreamPageKind, string>>
    )[kind] ?? "Stream Admin";
  const saveSettings = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setSettings(await saveStreamAdminSettings(settings));
      setMessage("Stream settings saved.");
    } catch {
      setMessage("Stream settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };
  const videos = overview?.recent || [];
  const rows =
    kind === "reports"
      ? videos.filter(video => video.moderationStatus === "rejected" || video.moderationReason)
      : kind === "catalog-admin"
        ? videos
        : [];
  return (
    <div className="sw-admin-unified">
      <section>
        <header className="sw-manage-head">
          <div>
            <span>PLATFORM CONTROL</span>
            <h1>{title}</h1>
            <small>
              {overview
                ? `Live data updated ${new Date(overview.updatedAt).toLocaleTimeString()}`
                : "Loading live Stream data"}
            </small>
          </div>
          <Link to="/admin/stream/moderation">
            <ShieldRoundedIcon /> Moderation queue
          </Link>
        </header>
        {status === "error" ? (
          <div className="sw-catalog-status warning">
            Stream admin data could not load. Check the backend connection and retry.
          </div>
        ) : null}
        {status === "loading" ? <div className="sw-catalog-status">Loading Stream operations…</div> : null}
        {kind === "admin" || kind === "admin-analytics" ? (
          <>
            <div className="sw-metrics">
              {[
                ["Published", overview?.stats.publishedVideos || 0, "Available to viewers"],
                ["Pending review", overview?.stats.pendingVideos || 0, "Needs admin action"],
                ["Creators", overview?.stats.creators || 0, "With uploaded content"],
                ["Live streams", overview?.stats.liveStreams || 0, "Created broadcasts"],
              ].map(([a, b, c]) => (
                <article key={a}>
                  <small>{a}</small>
                  <strong>{b}</strong>
                  <span>{c}</span>
                </article>
              ))}
            </div>
            <div className="sw-panel">
              <h2>Content health</h2>
              <div className="sw-admin-health">
                {[
                  ["Total content", overview?.stats.totalVideos || 0],
                  ["Ready", overview?.stats.readyVideos || 0],
                  ["Approved", overview?.stats.approvedVideos || 0],
                  ["Rejected", overview?.stats.rejectedVideos || 0],
                  ["Catalogue attached", overview?.stats.attachedTitles || 0],
                ].map(([label, value]) => (
                  <Link to="/admin/stream/moderation" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : null}
        {kind === "moderation" ? <StreamModerationPanel /> : null}
        {kind === "creators" ? (
          <div className="sw-admin-list">
            {(overview?.creators || []).map(creator => (
              <article key={creator.id}>
                <span>
                  <PeopleAltRoundedIcon />
                </span>
                <div>
                  <b>{creator.name}</b>
                  <p>
                    {creator.videos} uploads · {creator.approved} approved · {creator.live} live
                  </p>
                </div>
                <Link to="/admin/stream/moderation">View content</Link>
              </article>
            ))}
            {overview && !overview.creators.length ? (
              <div className="sw-catalog-status">No creators have uploaded content yet.</div>
            ) : null}
          </div>
        ) : null}
        {kind === "reports" || kind === "catalog-admin" ? (
          <div className="sw-admin-list">
            {rows.map(video => (
              <article key={video.cloudflareUid}>
                <span>{kind === "catalog-admin" ? <PlayArrowRoundedIcon /> : <ShieldRoundedIcon />}</span>
                <div>
                  <b>{video.title}</b>
                  <p>
                    {kind === "catalog-admin"
                      ? video.catalogAttachment
                        ? `Attached to ${video.catalogAttachment.title || `TMDB #${video.catalogAttachment.tmdbId}`}`
                        : "Not attached to the catalogue"
                      : video.moderationReason || "Moderation record"}
                  </p>
                </div>
                <em>{video.moderationStatus || "pending"}</em>
                <Link to="/admin/stream/moderation">Review</Link>
              </article>
            ))}
            {overview && !rows.length ? (
              <div className="sw-catalog-status">
                {kind === "reports" ? "No rejected or reported Stream content." : "No Stream content is available."}
              </div>
            ) : null}
          </div>
        ) : null}
        {kind === "stream-settings" && settings ? (
          <div className="sw-settings-card">
            {[
              ["uploadsEnabled", "Uploads enabled", "Allow verified creators to publish"],
              ["liveStreamingEnabled", "Live streaming", "Enable creator live events"],
              ["piSupportEnabled", "Pi support", "Accept direct creator support"],
              ["automaticModerationEnabled", "Automatic moderation", "Scan new uploads before publishing"],
            ].map(([key, label, description]) => (
              <label className="sw-setting" key={key}>
                <span>
                  <b>{label}</b>
                  <small>{description}</small>
                </span>
                <input
                  type="checkbox"
                  checked={settings[key as keyof StreamAdminSettings]}
                  onChange={event =>
                    setSettings(current => (current ? { ...current, [key]: event.target.checked } : current))
                  }
                />
                <i />
              </label>
            ))}
            <button className="sw-admin-save" type="button" disabled={saving} onClick={() => void saveSettings()}>
              {saving ? "Saving…" : "Save settings"}
            </button>
            {message ? <p className="sw-profile-message">{message}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
};

const StreamWorkspacePage = ({ kind }: { kind: StreamPageKind }) => {
  const managementKinds: StreamPageKind[] = [
    "studio",
    "upload",
    "create-live",
    "content",
    "analytics",
    "channel",
    "earnings",
  ];
  const adminKinds: StreamPageKind[] = [
    "admin",
    "moderation",
    "reports",
    "creators",
    "catalog-admin",
    "admin-analytics",
    "stream-settings",
  ];
  const content = (() => {
    if (managementKinds.includes(kind)) return <Studio kind={kind} />;
    if (adminKinds.includes(kind)) return <Admin kind={kind} />;
    if (kind === "movie-detail") return <Detail />;
    if (kind === "series-detail") return <Detail series />;
    if (kind === "player") return <Player />;
    if (kind === "live-player") return <Player live />;
    if (kind === "history") return <StreamWatchHistory />;
    if (kind === "subscriptions") return <StreamSubscriptions />;
    if (kind === "public-channel") return <StreamPublicChannel />;
    if (kind === "live") return <StreamLiveDirectory />;
    if (["profile", "notifications", "plans", "parental"].includes(kind)) return <AccountPage kind={kind} />;
    return <Catalogue kind={kind} />;
  })();
  return (
    <main className="sw-page">
      {!managementKinds.includes(kind) && !adminKinds.includes(kind) ? <StreamHeader /> : null}
      <div className="sw-page-content">{content}</div>
    </main>
  );
};

export default StreamWorkspacePage;
