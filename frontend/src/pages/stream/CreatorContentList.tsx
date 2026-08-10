import { useEffect, useState } from "react";
import { getCreatorVideos, type CreatorVideo } from "../../lib/streamCreator";
import { Link } from "react-router-dom";

const CreatorContentList = () => {
  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    void getCreatorVideos().then((items) => { setVideos(items); setState("ready"); }).catch(() => setState("error"));
  }, []);
  if (state === "loading") return <div className="sw-catalog-status">Loading your videos...</div>;
  if (state === "error") return <div className="sw-catalog-status warning">Creator content could not be loaded. Check the backend connection and sign-in.</div>;
  if (!videos.length) return <div className="sw-catalog-status">No creator videos yet. Upload your first video to begin processing.</div>;
  return <div className="sw-table"><header><b>Video</b><b>Source</b><b>Moderation</b><b>Visibility</b></header>{videos.map((video) => <div key={video._id}><span>{video.thumbnailUrl ? <img className="sw-content-thumb" src={video.thumbnailUrl} alt="" /> : <i className="purple"/>}<b>{video.youtubeVideoId || video.cloudflareUid ? <Link to={`/app/services/stream/watch/${video.youtubeVideoId ? `yt-${video.youtubeVideoId}` : video.cloudflareUid}`}>{video.title}</Link> : video.title}</b></span><em>{video.contentSource === "youtube" ? "YouTube" : video.processingStatus}</em><span>{video.moderationStatus}</span><span>{video.visibility}</span></div>)}</div>;
};

export default CreatorContentList;
