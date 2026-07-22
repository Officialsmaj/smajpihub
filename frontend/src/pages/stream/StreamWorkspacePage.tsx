import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import ClosedCaptionRoundedIcon from "@mui/icons-material/ClosedCaptionRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import "./StreamWorkspacePage.css";
import StreamHeader from "./StreamHeader";
import CreatorUploadForm from "./CreatorUploadForm";
import CreatorContentList from "./CreatorContentList";
import { getStreamCatalog, getStreamTitle, getStreamWatchProviders, searchStreamCatalog, type StreamCatalogTitle, type StreamWatchProvider, type StreamWatchRegion } from "../../lib/streamCatalog";

export type StreamPageKind =
  | "movies" | "series" | "live" | "search" | "my-list" | "history" | "subscriptions"
  | "movie-detail" | "series-detail" | "player" | "live-player" | "profile" | "notifications"
  | "plans" | "parental" | "studio" | "upload" | "create-live" | "content" | "analytics"
  | "channel" | "earnings" | "admin" | "moderation" | "reports" | "creators" | "catalog-admin"
  | "admin-analytics" | "stream-settings";

type Title = { id: string; name: string; meta: string; tone: string; progress?: number; posterUrl?: string | null; mediaType?: "movie" | "tv"; overview?: string };

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
  "my-list": ["My List", "Everything you saved, ready when you are."],
  history: ["Watch history", "Resume watching or revisit your recent entertainment."],
  subscriptions: ["Subscriptions", "New releases from creators and channels you follow."],
  profile: ["Stream profile", "Your viewing identity and playback preferences."],
  notifications: ["Notifications", "Live alerts, new episodes and creator updates."],
  plans: ["Plans & payments", "Choose how you watch and support creators with Pi."],
  parental: ["Parental controls", "Create a safe entertainment experience for every profile."],
};

const Tile = ({ title, compact = false }: { title: Title; compact?: boolean }) => (
  <Link className={`sw-title-card ${title.tone} ${compact ? "compact" : ""}`} to={`/app/services/stream/${title.mediaType === "tv" ? "series" : "title"}/${title.id}`}>
    <div style={title.posterUrl ? { backgroundImage: `linear-gradient(0deg,rgba(14,7,20,.45),transparent),url(${title.posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><span className="sw-card-logo">{title.posterUrl ? "" : title.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span><span className="sw-card-play"><PlayArrowRoundedIcon /></span>{title.progress ? <i style={{ width: `${title.progress}%` }} /> : null}</div>
    <h3>{title.name}</h3><p>{title.meta}</p>
  </Link>
);

const Catalogue = ({ kind }: { kind: StreamPageKind }) => {
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("Popular");
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [remoteTitles, setRemoteTitles] = useState<Title[] | null>(null);
  const [catalogState, setCatalogState] = useState<"loading" | "ready" | "fallback">(() => ["movies", "series", "search"].includes(kind) ? "loading" : "fallback");
  const [heading, description] = pageMeta[kind] ?? ["Browse", "Entertainment selected for you."];
  useEffect(() => {
    if (!["movies", "series", "search"].includes(kind)) return;
    const timer = window.setTimeout(() => {
      const request = kind === "search" ? searchStreamCatalog(query) : getStreamCatalog(kind as "movies" | "series");
      void request.then((data) => {
        setRemoteTitles(data.results.map((item: StreamCatalogTitle, index) => ({ id: item.id, name: item.title, meta: `${item.mediaType === "tv" ? "Series" : "Movie"}${item.releaseDate ? ` · ${item.releaseDate.slice(0, 4)}` : ""}${item.rating ? ` · ★ ${item.rating}` : ""}`, tone: ["purple","amber","green","blue","coral","indigo","rose","teal"][index % 8] || "purple", posterUrl: item.posterUrl, mediaType: item.mediaType, overview: item.overview })));
        setCatalogState("ready");
      }).catch(() => { setRemoteTitles(null); setCatalogState("fallback"); });
    }, kind === "search" ? 350 : 0);
    return () => window.clearTimeout(timer);
  }, [kind, query]);
  const localList = kind === "history" ? titles.filter((item) => item.progress) : kind === "my-list" ? titles.slice(1, 7) : titles;
  const list = remoteTitles ?? localList;
  const filtered = list.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  return <>
    <header className="sw-page-head"><span>EXPLORE SMAJ STREAM</span><h1>{heading}</h1><p>{description}</p></header>
    {kind === "search" ? <label className="sw-big-search"><SearchRoundedIcon /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies, series, live events and creators" /></label> : null}
    <div className="sw-toolbar"><div>{["All", "Action", "Drama", "Comedy", "Documentary", "Family"].map((item) => <button className={genre === item ? "active" : ""} onClick={() => setGenre(item)} type="button" key={item}>{item}</button>)}</div><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort titles"><option>Popular</option><option>Newest</option><option>A–Z</option></select></div>
    {catalogState === "loading" ? <div className="sw-catalog-status">Loading the entertainment catalogue…</div> : null}
    {catalogState === "fallback" && ["movies","series","search"].includes(kind) ? <div className="sw-catalog-status warning">Demo catalogue shown. Add TMDB_ACCESS_TOKEN on the backend to load live TMDB data.</div> : null}
    <div className="sw-title-grid">{filtered.map((item) => <Tile title={item} key={`${item.mediaType || "local"}-${item.id}`} />)}</div>
    <p className="sw-attribution"><a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">TMDB</a> · This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </>;
};

const Detail = ({ series = false }: { series?: boolean }) => {
  const { id } = useParams();
  const type = series ? "tv" : "movie";
  const [detail, setDetail] = useState<(StreamCatalogTitle & { genres: Array<{ id: number; name: string }>; runtime: number | null; raw: TmdbDetailRaw }) | null>(null);
  const [providers, setProviders] = useState<Record<string, StreamWatchRegion>>({});
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [showTrailer, setShowTrailer] = useState(false);
  const [saved, setSaved] = useState(() => Boolean(id && window.localStorage.getItem("smaj_stream_my_list")?.split(",").includes(id)));
  useEffect(() => {
    if (!id) return;
    setState("loading");
    void Promise.all([getStreamTitle(type, id), getStreamWatchProviders(type, id).catch(() => ({}))])
      .then(([titleData, providerData]) => { setDetail(titleData as typeof detail); setProviders(providerData); setState("ready"); })
      .catch(() => setState("error"));
  }, [id, type]);
  if (state === "loading") return <div className="sw-detail-loading"><i/><i/><i/></div>;
  if (state === "error" || !detail) return <section className="sw-detail-error"><h1>We could not load this title</h1><p>Check the TMDB backend configuration and try again.</p><Link to={series ? "/app/services/stream/series" : "/app/services/stream/movies"}>Back to catalogue</Link></section>;
  const raw = detail.raw;
  const trailer = raw.videos?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) ?? raw.videos?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer");
  const recommendations: Title[] = (raw.recommendations?.results || []).slice(0, 6).map((item, index) => ({ id: String(item.id), name: item.title || item.name || "Untitled", meta: `${item.media_type === "tv" || series ? "Series" : "Movie"}${item.vote_average ? ` · ★ ${item.vote_average.toFixed(1)}` : ""}`, tone: ["purple","amber","green","blue","coral","indigo"][index], posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null, mediaType: item.media_type || (series ? "tv" : "movie") }));
  const regionCode = providers.US ? "US" : Object.keys(providers)[0];
  const region = regionCode ? providers[regionCode] : undefined;
  const providerList = uniqueProviders([...(region?.flatrate || []), ...(region?.free || []), ...(region?.ads || []), ...(region?.rent || []), ...(region?.buy || [])]);
  const toggleSaved = () => {
    if (!id) return;
    const current = new Set((window.localStorage.getItem("smaj_stream_my_list") || "").split(",").filter(Boolean));
    saved ? current.delete(id) : current.add(id);
    window.localStorage.setItem("smaj_stream_my_list", [...current].join(","));
    setSaved(!saved);
  };
  return <>
    <section className="sw-detail-hero tmdb" style={detail.backdropUrl ? { backgroundImage: `url(${detail.backdropUrl})` } : undefined}><div><span>TMDB · {series ? "SERIES" : "FEATURE FILM"}</span><h1>{detail.title}</h1><p className="sw-match">{detail.rating ? `★ ${detail.rating}` : "New"} · {detail.releaseDate?.slice(0,4) || "Coming soon"}{detail.runtime ? ` · ${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : ""}</p><div className="sw-detail-genres">{detail.genres.map((genre) => <b key={genre.id}>{genre.name}</b>)}</div><p>{detail.overview || "No overview is available for this title yet."}</p><div>{trailer ? <button type="button" className="primary" onClick={() => setShowTrailer(true)}><PlayArrowRoundedIcon /> Watch trailer</button> : null}<button type="button" onClick={toggleSaved}><BookmarkRoundedIcon /> {saved ? "Saved" : "My List"}</button></div></div></section>
    {showTrailer && trailer ? <div className="sw-trailer" role="dialog" aria-modal="true" aria-label={`${detail.title} trailer`}><button type="button" onClick={() => setShowTrailer(false)}>Close ×</button><iframe src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1`} title={`${detail.title} trailer`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div> : null}
    <section className="sw-detail-info"><div><h2>Cast</h2><div className="sw-cast">{(raw.credits?.cast || []).slice(0, 8).map((person) => <article key={person.id}>{person.profile_path ? <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt="" /> : <span>{person.name.slice(0,1)}</span>}<b>{person.name}</b><small>{person.character}</small></article>)}</div></div><aside><h2>Where to watch</h2>{providerList.length ? <><div className="sw-providers">{providerList.slice(0, 8).map((provider) => <span key={provider.provider_id}>{provider.logo_path ? <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt="" /> : null}<b>{provider.provider_name}</b></span>)}</div>{region?.link ? <a href={region.link} target="_blank" rel="noreferrer">View legal options</a> : null}<small>Availability for {regionCode}. Provider data by JustWatch via TMDB.</small></> : <p>No provider information is currently available in your selected region.</p>}</aside></section>
    {series && raw.seasons?.length ? <section className="sw-seasons"><h2>Seasons</h2><div>{raw.seasons.filter((season) => season.season_number > 0).map((season) => <article key={season.id}>{season.poster_path ? <img src={`https://image.tmdb.org/t/p/w185${season.poster_path}`} alt="" /> : null}<div><h3>{season.name}</h3><p>{season.episode_count} episodes</p><small>{season.air_date?.slice(0,4) || "Release date unavailable"}</small></div></article>)}</div></section> : null}
    <section className="sw-related"><h2>More like this</h2><div>{(recommendations.length ? recommendations : titles.slice(1,5)).map((item) => <Tile compact title={item} key={`${item.mediaType}-${item.id}`} />)}</div></section>
    <p className="sw-attribution"><a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">TMDB</a> · This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </>;
};

type TmdbDetailRaw = { videos?: { results?: Array<{ key: string; site: string; type: string; official?: boolean }> }; credits?: { cast?: Array<{ id: number; name: string; character: string; profile_path: string | null }> }; recommendations?: { results?: Array<{ id: number; title?: string; name?: string; media_type?: "movie" | "tv"; poster_path?: string | null; vote_average?: number }> }; seasons?: Array<{ id: number; name: string; season_number: number; episode_count: number; poster_path: string | null; air_date?: string }> };
const uniqueProviders = (items: StreamWatchProvider[]) => [...new Map(items.map((item) => [item.provider_id, item])).values()];

const Player = ({ live = false }: { live?: boolean }) => {
  const { id } = useParams(); const title = titles.find((item) => item.id === id) ?? titles[0];
  return <section className="sw-watch"><div className={`sw-video-stage ${title.tone}`}><span className="sw-now">{live ? "● LIVE" : "NOW PLAYING"}</span><button type="button" className="sw-center-play"><PlayArrowRoundedIcon /></button><div className="sw-controls"><PlayArrowRoundedIcon /><span>00:18</span><i><b /></i><VolumeUpRoundedIcon /><ClosedCaptionRoundedIcon /><FullscreenRoundedIcon /></div></div><div className="sw-watch-info"><div><h1>{title.name}</h1><p>{live ? "18.4K watching now" : "SMAJ Original · 2026"}</p></div><button type="button"><BookmarkRoundedIcon /> Save</button></div>{live ? <aside className="sw-live-chat"><header>Live chat <span>18.4K</span></header>{["This is incredible! 🔥", "Watching from Lagos", "Supporting with π 5", "What a moment!"].map((message, index) => <p key={message}><b>{["Maya", "Joel", "Amara", "Sam"][index]}</b>{message}</p>)}<label><input placeholder="Join the conversation"/><button type="button">Send</button></label></aside> : null}</section>;
};

const AccountPage = ({ kind }: { kind: StreamPageKind }) => {
  const [heading, description] = pageMeta[kind] ?? ["Account", "Manage your Stream experience."];
  return <><header className="sw-page-head"><span>YOUR ACCOUNT</span><h1>{heading}</h1><p>{description}</p></header><section className="sw-settings-card">
    {kind === "plans" ? <div className="sw-plans">{[["Free","π 0","Standard video and creator channels"],["Plus","π 8","HD, downloads and no advertising"],["Family","π 14","4K and up to five profiles"]].map(([name,price,text], index) => <article className={index === 1 ? "featured" : ""} key={name}><span>{index === 1 ? "POPULAR" : "PLAN"}</span><h2>{name}</h2><strong>{price}<small>/month</small></strong><p>{text}</p><button type="button">Choose {name}</button></article>)}</div> :
    kind === "notifications" ? ["A new episode of City of Lights is available", "Champions Live starts in 30 minutes", "Maya Live published a new session"].map((text, i) => <div className="sw-notice" key={text}><NotificationsRoundedIcon /><div><b>{text}</b><p>{i + 1} hour ago</p></div><i /></div>) :
    [["Autoplay next episode", "Start the next episode automatically"],["Data saver", "Use less mobile data while streaming"],["Mature content PIN", "Require a PIN for content rated 16+"],["Email notifications", "Receive weekly entertainment highlights"]].map(([label,text], i) => <label className="sw-setting" key={label}><span><b>{label}</b><small>{text}</small></span><input type="checkbox" defaultChecked={i < 2}/><i /></label>)}
  </section></>;
};

const studioNav = [
  ["Overview","studio"],["Upload","studio/upload"],["Go live","studio/live"],["Content","studio/content"],
  ["Analytics","studio/analytics"],["Channel","studio/channel"],["Earnings","studio/earnings"],
];

const Studio = ({ kind }: { kind: StreamPageKind }) => {
  const title = ({ studio:"Creator overview",upload:"Upload video","create-live":"Create live stream",content:"Content manager",analytics:"Video analytics",channel:"Your channel",earnings:"Creator earnings" } as Partial<Record<StreamPageKind,string>>)[kind] ?? "Creator Studio";
  return <div className="sw-management"><aside><b>CREATOR STUDIO</b>{studioNav.map(([label,path]) => <Link key={path} to={`/app/services/stream/${path}`}>{label}</Link>)}</aside><section><header className="sw-manage-head"><div><span>CREATOR FIRST</span><h1>{title}</h1></div>{kind === "studio" ? <Link to="/app/services/stream/studio/upload"><AddRoundedIcon /> New video</Link> : null}</header>
    {kind === "studio" ? <><div className="sw-metrics">{[["Total views","248K","+18%"],["Watch time","18.2K h","+12%"],["Followers","32,840","+824"],["Pi earnings","π 4,284","+21%"]].map(([label,value,change]) => <article key={label}><small>{label}</small><strong>{value}</strong><span>{change}</span></article>)}</div><div className="sw-panel"><h2>Channel performance</h2><div className="sw-chart">{[25,48,34,62,55,78,72,91,68,88,95,84].map((height,i) => <i key={i} style={{height:`${height}%`}} />)}</div></div></> : null}
    {kind === "upload" ? <CreatorUploadForm /> : null}
    {kind === "create-live" ? <form className="sw-form"><div className="sw-live-setup"><VideoCallRoundedIcon /><h2>Set up your live stream</h2><p>Schedule an event or go live when you are ready.</p></div><label>Stream title<input placeholder="What are you streaming?" /></label><div><label>Start<select><option>Go live now</option><option>Schedule for later</option></select></label><label>Chat<select><option>Enabled</option><option>Followers only</option><option>Disabled</option></select></label></div><button type="button">Create stream</button></form> : null}
    {kind === "content" ? <CreatorContentList /> : null}
    {kind === "analytics" ? <><div className="sw-metrics">{[["Views","248,392","+18%"],["Watch time","18,204 h","+12%"],["Average view","8m 42s","+4%"],["Retention","64%","+7%"]].map(([a,b,c])=><article key={a}><small>{a}</small><strong>{b}</strong><span>{c}</span></article>)}</div><div className="sw-panel"><h2>Audience retention</h2><div className="sw-line-chart"><i /></div></div></> : null}
    {kind === "channel" ? <div className="sw-channel"><div className="sw-channel-banner"><span>SS</span></div><h2>SMAJ Studio</h2><p>Original movies, series and stories created for the SMAJ community.</p><button type="button">Edit channel</button></div> : null}
    {kind === "earnings" ? <><div className="sw-balance"><span><PaymentsRoundedIcon /></span><div><small>Available balance</small><strong>π 4,284.50</strong><p>Tips, memberships and watch rewards</p></div><button type="button">Transfer to wallet</button></div><div className="sw-table"><header><b>Source</b><b>Type</b><b>Amount</b><b>Date</b></header>{["Maya P.","Creator Plus","Joel K.","Watch rewards"].map((name,i)=><div key={name}><b>{name}</b><span>{i%2?"Membership":"Support"}</span><strong>π {i%2?"8.00":"25.00"}</strong><span>Jul {18-i}, 2026</span></div>)}</div></> : null}
  </section></div>;
};

const adminNav = [["Dashboard",""],["Moderation","moderation"],["Reports","reports"],["Creators","creators"],["Catalogue","catalog"],["Analytics","analytics"],["Settings","settings"]];
const Admin = ({ kind }: { kind: StreamPageKind }) => {
  const title = ({admin:"Stream overview",moderation:"Content moderation",reports:"Reports & appeals",creators:"Creator management","catalog-admin":"Catalogue management","admin-analytics":"Platform analytics","stream-settings":"Stream configuration"} as Partial<Record<StreamPageKind,string>>)[kind] ?? "Stream Admin";
  const rows = kind === "creators" ? ["SMAJ Studio","Maya Live","Sport Central","Nia Wellness"] : kind === "catalog-admin" ? titles.slice(0,5).map(i=>i.name) : ["After the Rain · Episode 4","Championship watch party","User comment #1842","Frequency trailer"];
  return <div className="sw-management admin"><aside><b>STREAM ADMIN</b>{adminNav.map(([label,path])=><Link key={label} to={`/admin/stream${path?`/${path}`:""}`}>{label}</Link>)}</aside><section><header className="sw-manage-head"><div><span>PLATFORM CONTROL</span><h1>{title}</h1></div><button type="button"><SettingsRoundedIcon /> Actions</button></header>
  {kind === "admin" || kind === "admin-analytics" ? <><div className="sw-metrics">{[["Active viewers","18,492","+24%"],["Streaming now","38","+8"],["Creators","1,284","+42"],["Revenue","π 28.4K","+16%"]].map(([a,b,c])=><article key={a}><small>{a}</small><strong>{b}</strong><span>{c}</span></article>)}</div><div className="sw-panel"><h2>Platform activity</h2><div className="sw-chart">{[38,45,42,61,54,70,88,74,93,82,96,90].map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div></div></> : null}
  {kind !== "admin" && kind !== "admin-analytics" && kind !== "stream-settings" ? <div className="sw-admin-list">{rows.map((row,i)=><article key={row}><span>{kind === "creators" ? <PeopleAltRoundedIcon /> : kind === "catalog-admin" ? <PlayArrowRoundedIcon /> : <ShieldRoundedIcon />}</span><div><b>{row}</b><p>{kind === "creators" ? `${12+i*4}K followers · Verified` : "Submitted for review · Community report"}</p></div><em>{i===0?"Priority":"Pending"}</em><button type="button">Review</button></article>)}</div> : null}
  {kind === "stream-settings" ? <div className="sw-settings-card">{[["Uploads enabled","Allow verified creators to publish"],["Live streaming","Enable creator live events"],["Pi support","Accept direct creator support"],["Automatic moderation","Scan new uploads before publishing"]].map(([a,b])=><label className="sw-setting" key={a}><span><b>{a}</b><small>{b}</small></span><input type="checkbox" defaultChecked/><i/></label>)}</div> : null}
  </section></div>;
};

const StreamWorkspacePage = ({ kind }: { kind: StreamPageKind }) => {
  const managementKinds: StreamPageKind[] = ["studio","upload","create-live","content","analytics","channel","earnings"];
  const adminKinds: StreamPageKind[] = ["admin","moderation","reports","creators","catalog-admin","admin-analytics","stream-settings"];
  const content = (() => {
    if (managementKinds.includes(kind)) return <Studio kind={kind}/>;
    if (adminKinds.includes(kind)) return <Admin kind={kind}/>;
    if (kind === "movie-detail") return <Detail/>;
    if (kind === "series-detail") return <Detail series/>;
    if (kind === "player") return <Player/>;
    if (kind === "live-player") return <Player live/>;
    if (["profile","notifications","plans","parental"].includes(kind)) return <AccountPage kind={kind}/>;
    return <Catalogue kind={kind}/>;
  })();
  return <main className="sw-page">{!managementKinds.includes(kind) && !adminKinds.includes(kind) ? <StreamHeader/> : null}<div className="sw-page-content">{content}</div></main>;
};

export default StreamWorkspacePage;
