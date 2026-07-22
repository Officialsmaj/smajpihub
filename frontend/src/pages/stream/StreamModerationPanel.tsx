import { useEffect, useState } from "react";
import { getModerationVideos, updateModerationVideo, type ModerationVideo } from "../../lib/streamAdmin";
import { searchStreamCatalog, type StreamCatalogTitle } from "../../lib/streamCatalog";

const StreamModerationPanel = () => {
  const [videos, setVideos] = useState<ModerationVideo[] | null>(null);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [searchUid, setSearchUid] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StreamCatalogTitle[]>([]);
  const load = () => void getModerationVideos(filter).then(setVideos).catch(error => { setVideos([]); setMessage(error?.response?.data?.message || "The moderation queue could not be loaded."); });
  useEffect(load, [filter]);
  const act = async (video: ModerationVideo, body: Record<string, unknown>) => { try { setBusy(video.cloudflareUid); setMessage(""); await updateModerationVideo(video.cloudflareUid, body); load(); } catch (error) { setMessage((error as { response?: { data?: { message?: string } } }).response?.data?.message || "The video could not be updated."); } finally { setBusy(""); } };
  const reject = (video: ModerationVideo) => { const reason = window.prompt("Why is this video rejected?"); if (reason) void act(video, { action: "reject", reason }); };
  const search = async () => { if (query.trim().length < 2) return; try { setResults((await searchStreamCatalog(query.trim())).results.slice(0, 8)); } catch { setMessage("TMDB search is unavailable."); } };
  if (!videos) return <div className="sw-catalog-status">Loading moderation queue…</div>;
  return <><div className="sw-moderation-toolbar"><label>Status<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All videos</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label><span>{videos.length} videos</span></div>{message ? <p className="sw-profile-message error">{message}</p> : null}<div className="sw-moderation-list">{videos.map(video => <article key={video.cloudflareUid}><div className="sw-moderation-preview">{video.thumbnailUrl ? <img src={video.thumbnailUrl} alt="" /> : <span>VIDEO</span>}</div><div className="sw-moderation-copy"><h2>{video.title}</h2><p>{video.creatorName || "Creator"} · {video.contentSource === "youtube" ? "YouTube" : video.processingStatus}</p><small>Rights declaration: {video.rightsConfirmed ? "Confirmed" : "Missing"}</small>{video.moderationReason ? <em>{video.moderationReason}</em> : null}{video.catalogAttachment ? <b>Attached to {video.catalogAttachment.title || `TMDB #${video.catalogAttachment.tmdbId}`}</b> : null}</div><div className="sw-moderation-actions"><button disabled={busy === video.cloudflareUid} onClick={() => void act(video, { action: "approve" })}>Approve</button><button disabled={busy === video.cloudflareUid} onClick={() => reject(video)}>Reject</button><label><input type="checkbox" checked={video.playbackAllowed === true} onChange={event => void act(video, { action: "playback", enabled: event.target.checked })} /> Playback</label><select value={video.visibility} onChange={event => void act(video, { action: "visibility", visibility: event.target.value })}><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select><button onClick={() => { setSearchUid(video.cloudflareUid); setQuery(""); setResults([]); }}>Attach TMDB</button></div>{searchUid === video.cloudflareUid ? <div className="sw-attach-panel"><div><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search movie or series" /><button onClick={() => void search()}>Search</button></div>{results.map(title => <button key={`${title.mediaType}-${title.id}`} onClick={() => { void act(video, { action: "attach", tmdbId: title.tmdbId, mediaType: title.mediaType, title: title.title }); setSearchUid(""); }}><span>{title.posterUrl ? <img src={title.posterUrl} alt="" /> : null}</span><b>{title.title}</b><small>{title.mediaType === "tv" ? "Series" : "Movie"} · {title.releaseDate?.slice(0,4) || "New"}</small></button>)}</div> : null}</article>)}</div></>;
};

export default StreamModerationPanel;
