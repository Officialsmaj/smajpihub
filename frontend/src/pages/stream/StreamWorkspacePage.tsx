import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CastConnectedRoundedIcon from "@mui/icons-material/CastConnectedRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import "./StreamWorkspacePage.css";
import StreamHeader from "./StreamHeader";
import CreatorUploadForm from "./CreatorUploadForm";
import CreatorContentList from "./CreatorContentList";
import StreamVideoPlayer from "./StreamVideoPlayer";
import StreamWatchHistory from "./StreamWatchHistory";
import StreamSubscriptions from "./StreamSubscriptions";
import StreamModerationPanel from "./StreamModerationPanel";
import StreamLiveSetup from "./StreamLiveSetup";
import StreamLivePlayer from "./StreamLivePlayer";
import StreamLiveDirectory from "./StreamLiveDirectory";
import StreamLiveNowPage from "./StreamLiveNowPage";
import StreamChannelPanel from "./StreamChannelPanel";
import StreamPublicChannel from "./StreamPublicChannel";
import StreamCreatorOverview from "./StreamCreatorOverview";
import StreamCreatorsDirectory from "./StreamCreatorsDirectory";
import { getStreamCreators, type StreamCreatorDirectoryItem } from "../../lib/streamChannel";
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
import { streamCategories } from "../../lib/streamCategories";
import {
  getStreamCatalog,
  getStreamCategory,
  getStreamDownloadStatus,
  getStreamDownloads,
  getStreamMyList,
  getStreamMyListStatus,
  getStreamTitle,
  removeStreamDownload,
  removeStreamTitle,
  saveStreamDownload,
  saveStreamTitle,
  searchStreamCatalog,
  type StreamCatalogTitle,
} from "../../lib/streamCatalog";
import { getStreamProfile, saveStreamProfile, type StreamProfile } from "../../lib/streamProfile";
import {
  getStreamSubscription,
  startStreamSubscriptionCheckout,
  type StreamPlan,
  type StreamPlanId,
  type StreamSubscription,
} from "../../lib/streamSubscription";

export type StreamPageKind =
  | "movies"
  | "series"
  | "live"
  | "live-now"
  | "categories"
  | "search"
  | "category"
  | "my-list"
  | "downloads"
  | "history"
  | "subscriptions"
  | "creator-directory"
  | "movie-detail"
  | "series-detail"
  | "player"
  | "live-player"
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
  { id: "last-horizon", name: "The Last Horizon", meta: "Movie  -  2h 08m", tone: "purple", progress: 64 },
  { id: "city-lights", name: "City of Lights", meta: "Series  -  8 episodes", tone: "amber", progress: 31 },
  { id: "wild-roads", name: "Wild Roads", meta: "Documentary  -  1h 32m", tone: "green" },
  { id: "frequency", name: "Frequency", meta: "Movie  -  1h 54m", tone: "blue" },
  { id: "after-rain", name: "After the Rain", meta: "Series  -  2 seasons", tone: "coral" },
  { id: "deep-space", name: "Deep Space", meta: "Movie  -  2h 21m", tone: "indigo" },
  { id: "home-table", name: "The Home Table", meta: "Lifestyle  -  12 episodes", tone: "rose" },
  { id: "champions", name: "Champions Live", meta: "Live  -  Starts 20:00", tone: "teal" },
];

const pageMeta: Partial<Record<StreamPageKind, [string, string]>> = {
  movies: ["Movies", "Blockbusters, originals and stories from around the world."],
  series: ["Series", "Binge-worthy stories and new episodes every week."],
  live: ["Live", "Events, creators, music and sport happening right now."],
  "my-list": ["My List", "Titles you saved so you can find them again quickly."],
  downloads: ["Downloads", "Everything you downloaded, ready when you are."],
  history: ["Watch history", "Resume watching or revisit your recent entertainment."],
  subscriptions: ["Subscriptions", "New releases from creators and channels you follow."],
  "creator-directory": ["Creators", "Channels publishing approved videos and live broadcasts."],
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

const CategoryDirectory = () => (
  <section className="sw-category-directory">
    <header>
      <h1>Explore Categories</h1>
      <p>Choose a genre to see all available movies and series.</p>
    </header>
    <div>
      {streamCategories.map((category) => (
        <Link className={category.tone} to={`/app/services/stream/category/${category.slug}`} key={category.slug}>
          {category.label}
        </Link>
      ))}
    </div>
  </section>
);

type StreamSearchSettings = {
  movies: boolean;
  series: boolean;
  postersOnly: boolean;
  creators: boolean;
};

const defaultSearchSettings: StreamSearchSettings = { movies: true, series: true, postersOnly: true, creators: true };
const streamSearchPrompts = ["Search Superman", "Search Spider-Man", "Search Moana", "Search movies and series", "Search people and creators"];

const StreamSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [titles, setTitles] = useState<StreamCatalogTitle[]>([]);
  const [channels, setChannels] = useState<StreamCreatorDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [settings, setSettings] = useState<StreamSearchSettings>(() => {
    try {
      return { ...defaultSearchSettings, ...JSON.parse(window.localStorage.getItem("smaj_stream_search_settings") || "{}") };
    } catch {
      return defaultSearchSettings;
    }
  });

  useEffect(() => {
    window.localStorage.setItem("smaj_stream_search_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (query) return;
    const timer = window.setInterval(() => setPromptIndex(index => (index + 1) % streamSearchPrompts.length), 3000);
    return () => window.clearInterval(timer);
  }, [query]);

  useEffect(() => {
    if (!settingsOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSettingsOpen(false);
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [settingsOpen]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      const term = query.trim();
      const request = term ? searchStreamCatalog(term) : getStreamCatalog("trending");
      void request
        .then(data => active && setTitles(data.results))
        .catch(() => active && setTitles([]))
        .finally(() => active && setLoading(false));
      if (term && settings.creators) {
        void getStreamCreators()
          .then(items => {
            if (!active) return;
            const needle = term.toLowerCase();
            setChannels(items.filter(item => [item.channel.name, item.channel.handle, item.channel.description].join(" ").toLowerCase().includes(needle)).slice(0, 6));
          })
          .catch(() => active && setChannels([]));
      } else setChannels([]);
    }, query.trim() ? 300 : 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, settings.creators]);

  const visibleTitles = titles.filter(item => {
    if (item.mediaType === "movie" && !settings.movies) return false;
    if (item.mediaType === "tv" && !settings.series) return false;
    return !settings.postersOnly || Boolean(item.posterUrl);
  });
  const updateSetting = (key: keyof StreamSearchSettings) =>
    setSettings(current => ({ ...current, [key]: !current[key] }));

  return (
    <section className="sw-search-screen">
      <header className="sw-search-screen-head">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowBackRoundedIcon /></button>
        <h1>Search</h1>
        <i aria-hidden="true" />
      </header>
      <div className="sw-search-field">
        <SearchRoundedIcon />
        <input autoFocus type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="" aria-label="Search titles and creators" />
        {!query ? <span className="sw-search-rotating-prompt" key={promptIndex}>{streamSearchPrompts[promptIndex]}</span> : null}
        {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><CloseRoundedIcon /></button> : null}
        <button className="filter" type="button" onClick={() => setSettingsOpen(true)} aria-label="Open search settings"><TuneRoundedIcon /></button>
      </div>

      {settings.creators && channels.length ? (
        <section className="sw-search-channel-results">
          <h2>People & Channels</h2>
          <div>{channels.map(channel => <Link to={`/app/services/stream/channel/${channel.channel.handle}`} key={channel.creatorId}>{channel.channel.avatarUrl ? <img src={channel.channel.avatarUrl} alt="" /> : <span>{channel.channel.name.slice(0, 1)}</span>}<b>{channel.channel.name}</b><small>@{channel.channel.handle}</small></Link>)}</div>
        </section>
      ) : null}

      <section className="sw-search-title-results">
        <h2>{query.trim() ? "Search Results" : "Popular Searches"}</h2>
        {loading ? <div className="sw-search-loading"><i /><i /><i /><i /><i /><i /></div> : (
          <div className="sw-search-poster-grid">
            {visibleTitles.map(item => <Link to={`/app/services/stream/${item.mediaType === "tv" ? "series" : "title"}/${item.id}`} key={`${item.mediaType}-${item.id}`}><span>{item.posterUrl ? <img src={item.posterUrl} alt="" /> : <b>{item.title.slice(0, 2)}</b>}</span><strong>{item.title}</strong><small>{item.releaseDate?.slice(0, 4) || (item.mediaType === "tv" ? "Series" : "Movie")}</small></Link>)}
          </div>
        )}
        {!loading && !visibleTitles.length ? <p className="sw-search-empty">No titles match these search settings.</p> : null}
      </section>

      {settingsOpen ? <div className="sw-search-settings-layer" role="presentation" onMouseDown={event => event.target === event.currentTarget && setSettingsOpen(false)}><section className="sw-search-settings-sheet" role="dialog" aria-modal="true" aria-labelledby="search-settings-title"><i /><header><h2 id="search-settings-title">Search Settings</h2><button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close search settings"><CloseRoundedIcon /></button></header><h3>Search on SMAJ</h3>{([['movies','Movies'],['series','TV Series'],['postersOnly','Titles with Posters'],['creators','People & Creator Channels']] as Array<[keyof StreamSearchSettings,string]>).map(([key,label]) => <label key={key}><span>{label}</span><input type="checkbox" checked={settings[key]} onChange={() => updateSetting(key)} /></label>)}</section></div> : null}
    </section>
  );
};

const Catalogue = ({ kind }: { kind: StreamPageKind }) => {
  const { slug = "" } = useParams();
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("Popular");
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [remoteTitles, setRemoteTitles] = useState<Title[] | null>(null);
  const [remoteCatalog, setRemoteCatalog] = useState<StreamCatalogTitle[]>([]);
  const [channelResults, setChannelResults] = useState<StreamCreatorDirectoryItem[]>([]);
  const [catalogState, setCatalogState] = useState<"loading" | "ready" | "fallback">(() =>
    ["movies", "series", "search", "category", "my-list", "downloads"].includes(kind) ? "loading" : "fallback"
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
            query.trim() ? `Results for "${query.trim()}"` : "Search",
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
    if (!node || kind === "my-list" || kind === "downloads") return;
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
    if (!["movies", "series", "search", "category", "my-list", "downloads"].includes(kind)) return;
    const timer = window.setTimeout(
      () => {
        if (kind === "my-list" || kind === "downloads") {
          void (kind === "downloads" ? getStreamDownloads() : getStreamMyList())
            .then(items => {
              setRemoteTitles(
                items.map((item, index) => ({
                  id: item.id,
                  name: item.title,
                  meta: `${item.mediaType === "tv" ? "Series" : "Movie"}${item.releaseDate ? ` - ${item.releaseDate.slice(0, 4)}` : ""}${item.rating ? ` - Rating ${item.rating}` : ""}`,
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
          sort === "Newest" ? "primary_release_date.desc" : sort === "A-Z" ? "original_title.asc" : "popularity.desc";
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
                  meta: `${item.mediaType === "tv" ? "Series" : "Movie"}${item.releaseDate ? ` - ${item.releaseDate.slice(0, 4)}` : ""}${item.rating ? ` - Rating ${item.rating}` : ""}`,
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
                meta: `${item.mediaType === "tv" ? "Series" : "Movie"} - ${item.releaseDate?.slice(0, 4) || "New"}${item.rating ? ` - Rating ${item.rating}` : ""}`,
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
  useEffect(() => {
    if (kind !== "search" || !query.trim()) {
      setChannelResults([]);
      return;
    }
    void getStreamCreators()
      .then(creators => {
        const needle = query.trim().toLowerCase();
        setChannelResults(
          creators
            .filter(creator =>
              [creator.channel.name, creator.channel.handle, creator.channel.description].join(" ").toLowerCase().includes(needle)
            )
            .slice(0, 6)
        );
      })
      .catch(() => setChannelResults([]));
  }, [kind, query]);
  const localList = kind === "history" ? titles.filter(item => item.progress) : kind === "my-list" || kind === "downloads" ? [] : titles;
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
            <option>A-Z</option>
          </select>
        </div>
      ) : null}
      {catalogState === "loading" ? (
        <div className="sw-catalog-status">Loading the entertainment catalogue...</div>
      ) : null}
      {catalogState === "fallback" && ["movies", "series", "search", "category"].includes(kind) ? (
        <div className="sw-catalog-status warning">
          This catalogue is unavailable. Check the TMDB backend configuration and retry.
        </div>
      ) : null}
      {catalogState === "fallback" && (kind === "my-list" || kind === "downloads") ? (
        <div className="sw-catalog-status warning">
          {kind === "downloads" ? "Downloads" : "My List"} could not synchronize. Please sign in again or retry shortly.
        </div>
      ) : null}
      {catalogState === "ready" && (kind === "my-list" || kind === "downloads") && !filtered.length ? (
        <div className="sw-list-empty">
          <BookmarkRoundedIcon />
          <h2>{kind === "downloads" ? "No downloads yet" : "Your list is empty"}</h2>
          <p>
            {kind === "downloads"
              ? "Downloads are saved to your account. Offline file storage is coming later."
              : "Save a movie or series to My List and it will appear here on every signed-in device."}
          </p>
          <Link to="/app/services/stream/movies">Explore movies</Link>
        </div>
      ) : null}
      {kind === "search" && channelResults.length ? (
        <section className="sw-search-channels">
          <header>
            <h2>Channels</h2>
            <Link to="/app/services/stream/creators">See all</Link>
          </header>
          <div>
            {channelResults.map(creator => (
              <Link to={`/app/services/stream/channel/${creator.channel.handle}`} key={creator.creatorId}>
                <span>
                  {creator.channel.avatarUrl ? <img src={creator.channel.avatarUrl} alt="" /> : creator.channel.name.slice(0, 2).toUpperCase()}
                </span>
                <strong>{creator.channel.name}</strong>
                <small>@{creator.channel.handle}</small>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <div className="sw-title-grid">
        {filtered.map(item => (
          <Tile title={item} key={`${item.mediaType || "local"}-${item.id}`} />
        ))}
      </div>
      {catalogState === "ready" && kind !== "my-list" && kind !== "downloads" ? (
        <div className="sw-load-more" ref={loadMoreRef}>
          {page < totalPages ? (
            <button type="button" disabled={loadingMore} onClick={() => setPage(value => value + 1)}>
              {loadingMore ? "Loading more..." : "Load more titles"}
            </button>
          ) : (
            <span>You reached the end of this catalogue.</span>
          )}
          <small>{remoteTitles?.length || 0} titles loaded</small>
        </div>
      ) : null}
    </>
  );
};

const Detail = ({ series = false }: { series?: boolean }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const type = series ? "tv" : "movie";
  const [detail, setDetail] = useState<
    | (StreamCatalogTitle & { genres: Array<{ id: number; name: string }>; runtime: number | null; raw: TmdbDetailRaw })
    | null
  >(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [playbackId, setPlaybackId] = useState("");
  const [ambientColor, setAmbientColor] = useState("rgb(24 16 27)");
  useEffect(() => {
    if (!id) return;
    setState("loading");
    void Promise.all([
      getStreamTitle(type, id),
      getStreamMyListStatus(type, id).catch(() => false),
      getStreamDownloadStatus(type, id).catch(() => false),
      getTitleAvailability(type, id).catch((): { available: boolean; playbackId?: string } => ({ available: false })),
    ])
      .then(([titleData, savedStatus, downloadStatus, availability]) => {
        setDetail(titleData as typeof detail);
        setSaved(savedStatus);
        setDownloaded(downloadStatus);
        setPlaybackId(availability.available ? availability.playbackId || "" : "");
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [id, type]);
  useEffect(() => {
    if (!detail?.backdropUrl) return;
    let active = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 24;
        canvas.height = 24;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let red = 0, green = 0, blue = 0, weight = 0;
        for (let index = 0; index < pixels.length; index += 16) {
          const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2], alpha = pixels[index + 3];
          if (alpha < 180 || (r > 238 && g > 238 && b > 238) || (r < 12 && g < 12 && b < 12)) continue;
          const saturation = Math.max(r, g, b) - Math.min(r, g, b);
          const pixelWeight = 1 + saturation / 90;
          red += r * pixelWeight; green += g * pixelWeight; blue += b * pixelWeight; weight += pixelWeight;
        }
        if (active && weight) {
          const tone = [red, green, blue].map(value => Math.max(18, Math.min(125, Math.round(value / weight * .58))));
          setAmbientColor(`rgb(${tone[0]} ${tone[1]} ${tone[2]})`);
        }
      } catch { /* Cross-origin image restrictions fall back to the cinema color. */ }
    };
    image.src = detail.backdropUrl;
    return () => { active = false; };
  }, [detail?.backdropUrl]);
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
    meta: `${item.media_type === "tv" || series ? "Series" : "Movie"}${item.vote_average ? ` - Rating ${item.vote_average.toFixed(1)}` : ""}`,
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
  const toggleDownloaded = async () => {
    if (!id) return;
    setDownloading(true);
    try {
      if (downloaded) await removeStreamDownload(type, id);
      else await saveStreamDownload(detail);
      setDownloaded(!downloaded);
    } finally {
      setDownloading(false);
    }
  };
  return (
    <>
      <section
        className="sw-detail-hero tmdb"
        style={{ backgroundImage: detail.backdropUrl ? `url(${detail.backdropUrl})` : undefined, "--sw-detail-ambient": ambientColor } as CSSProperties}
      >
        <button className="sw-detail-back" type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowBackRoundedIcon />
        </button>
        <button
          className="sw-detail-cast"
          type="button"
          onClick={() => playbackId && navigate(`/app/services/stream/watch/${playbackId}`)}
          aria-label={playbackId ? "Open player to cast" : "Casting is available when this title can be played"}
          aria-disabled={!playbackId}
        >
          <CastConnectedRoundedIcon />
        </button>
        <div className="sw-detail-hero-layout">
          {detail.posterUrl ? (
            <img className="sw-detail-poster" src={detail.posterUrl} alt={`${detail.title} poster`} />
          ) : null}
          <div className="sw-detail-copy">
            <h1>{detail.title}</h1>
            {raw.tagline ? <p className="sw-detail-tagline">{raw.tagline}</p> : null}
            <p className="sw-match">
              {detail.rating ? `Rating ${detail.rating}` : "New"} - {detail.releaseDate?.slice(0, 4) || "Coming soon"}
              {detail.runtime ? ` - ${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : ""}
            </p>
            <div className="sw-detail-genres">
              {detail.genres.map(genre => (
                <b key={genre.id}>{genre.name}</b>
              ))}
            </div>
            <div className={`sw-detail-actions ${playbackId ? "has-playback" : ""}`}>
              {playbackId ? (
                <Link className="primary" to={`/app/services/stream/watch/${playbackId}`}>
                  <PlayArrowRoundedIcon /> Play {series ? "series" : "movie"}
                </Link>
              ) : null}
              <button className="sw-detail-list-action" type="button" disabled={saving} onClick={() => void toggleSaved()}>
                <BookmarkRoundedIcon /> {saving ? "Saving..." : saved ? "In My List" : "Add to List"}
              </button>
              <button className="sw-detail-download-action" type="button" disabled={downloading} onClick={() => void toggleDownloaded()}>
                <DownloadRoundedIcon /> {downloading ? "Downloading..." : downloaded ? "Downloaded" : "Download"}
              </button>
            </div>
            {!playbackId ? (
              <small className="sw-detail-watch-note unavailable">Not available yet on SMAJ Stream.</small>
            ) : null}
            <div className="sw-detail-description">
              <p>{detail.overview || "No overview is available for this title yet."}</p>
              {creators.length ? (
                <p className="sw-detail-credits">
                  <b>{series ? "Created by" : "Directed by"}</b> {creators.map(person => person.name).join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <section
        className="sw-detail-info"
        style={{ "--sw-detail-art": detail.backdropUrl ? `url(${detail.backdropUrl})` : undefined, "--sw-detail-ambient": ambientColor } as CSSProperties}
      >
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
              <dd>{raw.original_language?.toUpperCase() || "-"}</dd>
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
  const navigate = useNavigate();
  return <div className="sw-fullscreen-player-shell"><button className="sw-player-close" type="button" onClick={() => navigate(-1)} aria-label="Close player"><CloseRoundedIcon /></button>{live ? <StreamLivePlayer id={id || ""} /> : <StreamVideoPlayer id={id || ""} />}</div>;
};

const AccountPage = ({ kind }: { kind: StreamPageKind }) => {
  if (kind === "notifications") return <Navigate to="/notifications" replace />;
  if (kind === "parental") return <StreamParentalControls />;
  if (kind === "plans") return <StreamPlansPanel />;
  const [heading, description] = pageMeta[kind] ?? ["Account", "Manage your Stream experience."];
  return (
    <>
      <header className="sw-page-head">
        <span>YOUR ACCOUNT</span>
        <h1>{heading}</h1>
        <p>{description}</p>
      </header>
      <section className="sw-settings-card">
        <div className="sw-catalog-status">This Stream account page is not available.</div>
      </section>
    </>
  );
};

const StreamPlansPanel = () => {
  const [plans, setPlans] = useState<StreamPlan[]>([]);
  const [subscription, setSubscription] = useState<StreamSubscription | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [busyPlan, setBusyPlan] = useState<StreamPlanId | "">("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getStreamSubscription()
      .then(data => {
        setPlans(data.plans);
        setSubscription(data.subscription);
        setState("ready");
      })
      .catch(() => {
        setState("error");
        setMessage("Stream plans could not be loaded.");
      });
  }, []);

  const choosePlan = async (plan: StreamPlanId) => {
    try {
      setState("saving");
      setBusyPlan(plan);
      setMessage("");
      const result = await startStreamSubscriptionCheckout(plan);
      setSubscription(result.subscription);
      setMessage(result.message);
      setState("ready");
    } catch (error) {
      setState("error");
      setMessage(
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          "Stream subscription could not be updated."
      );
    } finally {
      setBusyPlan("");
    }
  };

  return (
    <>
      <header className="sw-page-head">
        <span>YOUR ACCOUNT</span>
        <h1>Plans & payments</h1>
        <p>Choose a 30-day Stream pass and see the active price in USD and Pi.</p>
      </header>
      {state === "loading" ? <div className="sw-catalog-status">Loading Stream plans...</div> : null}
      {plans.length ? (
        <section className="sw-settings-card">
          {subscription ? (
            <div className="sw-plan-current">
              <span>Current plan</span>
              <strong>{plans.find(plan => plan.id === subscription.plan)?.name || subscription.plan}</strong>
              <small>
                {subscription.status}
                {subscription.expiresAt ? ` until ${new Date(subscription.expiresAt).toLocaleDateString()}` : ""}
              </small>
            </div>
          ) : null}
          <div className="sw-plans">
            {plans.map((plan, index) => {
              const current = subscription?.plan === plan.id && subscription.status === "active";
              return (
                <article className={index === 1 ? "featured" : ""} key={plan.id}>
                  <span>{current ? "CURRENT" : index === 1 ? "POPULAR" : "PLAN"}</span>
                  <h2>{plan.name}</h2>
                  <strong>
                    {formatServicePrice(plan.priceUsd)}
                    <small>/30 days</small>
                  </strong>
                  <p>{plan.features.join("  -  ")}</p>
                  <small>{formatPiRate()}</small>
                  <button type="button" disabled={current || state === "saving"} onClick={() => void choosePlan(plan.id)}>
                    {busyPlan === plan.id ? "Activating..." : current ? "Current plan" : plan.priceUsd > 0 ? `Subscribe ${plan.name}` : "Choose Free"}
                  </button>
                </article>
              );
            })}
          </div>
          {message ? <p className={`sw-profile-message ${state === "error" ? "error" : ""}`}>{message}</p> : null}
        </section>
      ) : state === "error" ? (
        <div className="sw-catalog-status warning">{message}</div>
      ) : null}
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
        {status === "loading" ? <div className="sw-catalog-status">Loading Stream operations...</div> : null}
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
                    {creator.videos} uploads  -  {creator.approved} approved  -  {creator.live} live
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
              {saving ? "Saving..." : "Save settings"}
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
    if (kind === "creator-directory") return <StreamCreatorsDirectory />;
    if (kind === "public-channel") return <StreamPublicChannel />;
    if (kind === "live") return <StreamLiveDirectory />;
    if (kind === "live-now") return <StreamLiveNowPage />;
    if (kind === "categories") return <CategoryDirectory />;
    if (kind === "search") return <StreamSearchPage />;
    if (["notifications", "plans", "parental"].includes(kind)) return <AccountPage kind={kind} />;
    return <Catalogue kind={kind} />;
  })();
  return (
    <main className={`sw-page ${["movie-detail", "series-detail"].includes(kind) ? "sw-detail-page" : ""} ${kind === "search" ? "sw-search-page" : ""} ${["player", "live-player"].includes(kind) ? "sw-player-page" : ""} ${kind === "live-now" ? "sw-live-now-shell" : ""}`}>
      {!managementKinds.includes(kind) && !adminKinds.includes(kind) && !["movie-detail", "series-detail", "search", "player", "live-player", "live-now"].includes(kind) ? <StreamHeader /> : null}
      <div className="sw-page-content">{content}</div>
    </main>
  );
};

export default StreamWorkspacePage;
