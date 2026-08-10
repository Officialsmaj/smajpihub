import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { getStreamCreators, type StreamCreatorDirectoryItem } from "../../lib/streamChannel";

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StreamCreatorsDirectory = () => {
  const [creators, setCreators] = useState<StreamCreatorDirectoryItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void getStreamCreators()
      .then(setCreators)
      .catch(() => {
        setCreators([]);
        setError("Creator channels could not load. Check your connection and retry.");
      });
  }, []);

  return (
    <>
      <header className="sw-page-head">
        <span>
          <GroupsRoundedIcon /> SMAJ CREATORS
        </span>
        <h1>Creators</h1>
        <p>Follow channels publishing approved videos and live broadcasts on SMAJ Stream.</p>
      </header>
      {creators === null ? <div className="sw-catalog-status">Loading creator channels...</div> : null}
      {error ? <div className="sw-catalog-status warning">{error}</div> : null}
      {creators?.length ? (
        <section className="sw-creators-directory">
          {creators.map(creator => (
            <article key={creator.creatorId}>
              <Link
                className="sw-creator-banner"
                to={`/app/services/stream/channel/${creator.channel.handle}`}
                style={creator.channel.bannerUrl ? { backgroundImage: `url("${creator.channel.bannerUrl}")` } : undefined}
              >
                <span className="sw-creator-avatar">
                  {creator.channel.avatarUrl ? <img src={creator.channel.avatarUrl} alt="" /> : initialsFor(creator.channel.name)}
                </span>
              </Link>
              <div className="sw-creator-card-body">
                <div>
                  <h2>{creator.channel.name}</h2>
                  <p>@{creator.channel.handle}</p>
                </div>
                <Link to={`/app/services/stream/channel/${creator.channel.handle}`}>View channel</Link>
              </div>
              <p>{creator.channel.description || "This creator has not added a channel description yet."}</p>
              <div className="sw-creator-stats">
                <span>{creator.stats.videos} videos</span>
                <span>{creator.stats.live} live</span>
                {creator.stats.latestAt ? <span>Latest {new Date(creator.stats.latestAt).toLocaleDateString()}</span> : null}
              </div>
              {creator.latestVideos.length ? (
                <div className="sw-creator-latest">
                  {creator.latestVideos.map(video => (
                    <Link
                      key={video._id}
                      to={`/app/services/stream/watch/${video.youtubeVideoId ? `yt-${video.youtubeVideoId}` : video.cloudflareUid}`}
                    >
                      <span style={video.thumbnailUrl ? { backgroundImage: `url("${video.thumbnailUrl}")` } : undefined}>
                        <PlayArrowRoundedIcon />
                      </span>
                      <b>{video.title}</b>
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}
      {creators && !creators.length && !error ? (
        <div className="sw-list-empty">
          <GroupsRoundedIcon />
          <h2>No creator channels yet</h2>
          <p>Approved creator channels will appear here after their first public video or live broadcast.</p>
          <Link to="/app/services/stream/studio">Open Creator Studio</Link>
        </div>
      ) : null}
    </>
  );
};

export default StreamCreatorsDirectory;
