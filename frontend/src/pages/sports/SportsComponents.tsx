import { Link } from "react-router-dom";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import type { SportsMatch, SportsTeam } from "../../types/sports";

export const TeamMark = ({ team, small = false }: { team: SportsTeam; small?: boolean }) => (
  <span
    className={`sports-team-mark${small ? " small" : ""}`}
    style={{ "--team-color": team.color } as React.CSSProperties}
  >
    <i aria-hidden="true">{team.shortName.slice(0, 1)}</i>
    {team.logoUrl ? (
      <img
        src={team.logoUrl}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={event => {
          event.currentTarget.style.display = "none";
        }}
      />
    ) : null}
  </span>
);

export const MatchCard = ({ match, compact = false }: { match: SportsMatch; compact?: boolean }) => (
  <Link to={`/services/sports/match/${match.id}`} className={`sports-match-card${compact ? " compact" : ""}`}>
    <div className="sports-match-meta">
      <span>{match.competition}</span>
      {match.status === "live" ? <b className="sports-live-dot">{match.minute} LIVE</b> : <b>{match.dateLabel}</b>}
    </div>
    <div className="sports-match-team">
      <TeamMark team={match.home} small />
      <strong>{match.home.name}</strong>
      <em>{match.homeScore ?? "–"}</em>
    </div>
    <div className="sports-match-team">
      <TeamMark team={match.away} small />
      <strong>{match.away.name}</strong>
      <em>{match.awayScore ?? "–"}</em>
    </div>
    <small>{match.venue}</small>
  </Link>
);

export const FavoriteTeam = ({
  team,
  favorite = false,
  onToggle,
}: {
  team: SportsTeam;
  favorite?: boolean;
  onToggle?: (teamId: string) => void;
}) => (
  <Link to={`/services/sports/team/${team.id}`} className="sports-team-card">
    <button
      className={favorite ? "favorite" : ""}
      type="button"
      aria-label={`${favorite ? "Unfollow" : "Follow"} ${team.name}`}
      aria-pressed={favorite}
      onClick={event => {
        event.preventDefault();
        onToggle?.(team.id);
      }}
    >
      {favorite ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
    </button>
    <TeamMark team={team} />
    <strong>{team.name}</strong>
    <span>{team.city}</span>
    <div>
      {team.form.map((result, index) => (
        <i className={result.toLowerCase()} key={`${result}-${index}`}>
          {result}
        </i>
      ))}
    </div>
  </Link>
);
