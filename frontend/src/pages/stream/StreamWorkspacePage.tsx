import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
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
import { getStreamCatalog, searchStreamCatalog, type StreamCatalogTitle } from "../../lib/streamCatalog";

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
  const title = titles.find((item) => item.id === id) ?? titles[0];
  return <>
    <section className={`sw-detail-hero ${title.tone}`}><div><span>SMAJ ORIGINAL · {series ? "SERIES" : "FEATURE FILM"}</span><h1>{title.name}</h1><p className="sw-match">98% Match · 2026 · 16+ · 4K</p><p>A powerful story about courage, community and the choices that shape our future.</p><div><Link to={`/app/services/stream/watch/${title.id}`}><PlayArrowRoundedIcon /> Play</Link><button type="button"><BookmarkRoundedIcon /> My List</button></div></div></section>
    {series ? <section className="sw-episodes"><header><h2>Episodes</h2><select aria-label="Season"><option>Season 1</option><option>Season 2</option></select></header>{[1,2,3,4].map((episode) => <Link to={`/app/services/stream/watch/${title.id}?episode=${episode}`} key={episode}><b>{episode}</b><span className={`sw-episode-art ${title.tone}`}><PlayArrowRoundedIcon /></span><div><h3>Episode {episode}: {episode === 1 ? "The beginning" : "A new direction"}</h3><p>The story continues as new choices change everything.</p></div><small>48m</small></Link>)}</section> : null}
    <section className="sw-related"><h2>More like this</h2><div>{titles.slice(1, 5).map((item) => <Tile compact title={item} key={item.id} />)}</div></section>
  </>;
};

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
  const [uploaded, setUploaded] = useState(false);
  const title = ({ studio:"Creator overview",upload:"Upload video","create-live":"Create live stream",content:"Content manager",analytics:"Video analytics",channel:"Your channel",earnings:"Creator earnings" } as Partial<Record<StreamPageKind,string>>)[kind] ?? "Creator Studio";
  return <div className="sw-management"><aside><b>CREATOR STUDIO</b>{studioNav.map(([label,path]) => <Link key={path} to={`/app/services/stream/${path}`}>{label}</Link>)}</aside><section><header className="sw-manage-head"><div><span>CREATOR FIRST</span><h1>{title}</h1></div>{kind === "studio" ? <Link to="/app/services/stream/studio/upload"><AddRoundedIcon /> New video</Link> : null}</header>
    {kind === "studio" ? <><div className="sw-metrics">{[["Total views","248K","+18%"],["Watch time","18.2K h","+12%"],["Followers","32,840","+824"],["Pi earnings","π 4,284","+21%"]].map(([label,value,change]) => <article key={label}><small>{label}</small><strong>{value}</strong><span>{change}</span></article>)}</div><div className="sw-panel"><h2>Channel performance</h2><div className="sw-chart">{[25,48,34,62,55,78,72,91,68,88,95,84].map((height,i) => <i key={i} style={{height:`${height}%`}} />)}</div></div></> : null}
    {kind === "upload" ? <form className="sw-form" onSubmit={(event) => {event.preventDefault();setUploaded(true)}}><label className="sw-drop"><CloudUploadRoundedIcon /><b>{uploaded ? "Video ready to publish" : "Drop your video here"}</b><span>MP4, WebM or MOV · up to 20GB</span><input type="file" accept="video/*" onChange={() => setUploaded(true)}/></label><label>Title<input required placeholder="Give your video a clear title" /></label><label>Description<textarea rows={4} placeholder="Tell viewers about this video" /></label><div><label>Category<select><option>Entertainment</option><option>Music</option><option>Learning</option></select></label><label>Visibility<select><option>Public</option><option>Unlisted</option><option>Private</option></select></label></div><button type="submit">Publish video</button></form> : null}
    {kind === "create-live" ? <form className="sw-form"><div className="sw-live-setup"><VideoCallRoundedIcon /><h2>Set up your live stream</h2><p>Schedule an event or go live when you are ready.</p></div><label>Stream title<input placeholder="What are you streaming?" /></label><div><label>Start<select><option>Go live now</option><option>Schedule for later</option></select></label><label>Chat<select><option>Enabled</option><option>Followers only</option><option>Disabled</option></select></label></div><button type="button">Create stream</button></form> : null}
    {kind === "content" ? <div className="sw-table"><header><b>Video</b><b>Status</b><b>Views</b><b>Published</b></header>{titles.slice(0,6).map((item,i) => <div key={item.id}><span><i className={item.tone}/><b>{item.name}</b></span><em>{i === 0 ? "Processing" : "Published"}</em><span>{(84-i*9)}K</span><span>{i+1} days ago</span></div>)}</div> : null}
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
