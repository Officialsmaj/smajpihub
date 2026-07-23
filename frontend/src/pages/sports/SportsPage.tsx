import { useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
import AppLayout from "../../layouts/AppLayout";
import useSportsCatalog from "../../hooks/useSportsCatalog";
import type { SportsCatalog } from "../../types/sports";
import { FavoriteTeam, MatchCard, TeamMark } from "./SportsComponents";
import SportsHeader from "./SportsHeader";
import "./SportsPage.css";

export type SportsPageKind =
  | "home"
  | "live"
  | "matches"
  | "competitions"
  | "teams"
  | "news"
  | "community"
  | "match"
  | "team";

const filterItems = ["All sports", "Football", "Basketball", "Athletics", "Tennis"];

type SportsViewProps = {
  catalog: SportsCatalog;
  favorites: Set<string>;
  onToggleFavorite: (teamId: string) => void;
};

const StandingsTable = ({ standings }: { standings: SportsCatalog["standings"] }) => (
  <div className="sports-table-wrap">
    <table className="sports-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Club</th>
          <th>P</th>
          <th>W</th>
          <th>D</th>
          <th>L</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((row, index) => (
          <tr key={row.team.id}>
            <td>{index + 1}</td>
            <td>
              <TeamMark team={row.team} small />
              <b>{row.team.name}</b>
            </td>
            <td>{row.played}</td>
            <td>{row.won}</td>
            <td>{row.draw}</td>
            <td>{row.lost}</td>
            <td>
              <strong>{row.points}</strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const NewsGrid = ({ stories, query = "" }: { stories: SportsCatalog["stories"]; query?: string }) => {
  const visibleStories = stories.filter(story =>
    `${story.title} ${story.category}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="sports-news-grid">
      {visibleStories.map((story, index) => (
        <Link
          to={`/services/sports/news/${story.id}`}
          className={`sports-story ${story.tone}${index === 0 ? " featured" : ""}`}
          key={story.id}
        >
          <div>
            <span>{story.category}</span>
            <i>{story.time}</i>
          </div>
          <h3>{story.title}</h3>
          <p>{story.summary}</p>
          <b>
            Read story <ArrowForwardRoundedIcon />
          </b>
        </Link>
      ))}
    </div>
  );
};

const HomeContent = ({ query, catalog, favorites, onToggleFavorite }: SportsViewProps & { query: string }) => {
  const live = catalog.matches.filter(match => match.status === "live");
  const featured = live[0] || catalog.matches[0];
  return (
    <>
      <section className="sports-hero">
        <div className="sports-hero-copy">
          <span className="sports-eyebrow">
            <i /> LIVE · SMAJ CHAMPIONS LEAGUE
          </span>
          <h1>
            Every game.
            <br />
            <em>One community.</em>
          </h1>
          <p>
            Follow live scores, discover teams and celebrate every moment with sports fans across the SMAJ ecosystem.
          </p>
          <div>
            <Link to="/services/sports/live">
              <PlayArrowRoundedIcon /> Watch live
            </Link>
            <Link to="/services/sports/matches">
              <CalendarMonthRoundedIcon /> All matches
            </Link>
          </div>
        </div>
        {featured ? (
          <Link to={`/services/sports/match/${featured.id}`} className="sports-feature-score">
            <span>67' · LIVE</span>
            <p>Unity Arena · Group A</p>
            <div>
              <article>
                <TeamMark team={featured.home} />
                <b>{featured.home.name}</b>
              </article>
              <strong>
                {featured.homeScore ?? "–"}
                <i>:</i>
                {featured.awayScore ?? "–"}
              </strong>
              <article>
                <TeamMark team={featured.away} />
                <b>{featured.away.name}</b>
              </article>
            </div>
            <small>
              Match centre <ArrowForwardRoundedIcon />
            </small>
          </Link>
        ) : null}
      </section>
      <section className="sports-section">
        <div className="sports-section-head">
          <div>
            <span>HAPPENING NOW</span>
            <h2>Live matches</h2>
          </div>
          <Link to="/services/sports/live">
            View all <ArrowForwardRoundedIcon />
          </Link>
        </div>
        <div className="sports-live-grid">
          {live.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
      <section className="sports-section">
        <div className="sports-section-head">
          <div>
            <span>YOUR CLUBS</span>
            <h2>Teams to follow</h2>
          </div>
          <Link to="/services/sports/teams">
            Explore teams <ArrowForwardRoundedIcon />
          </Link>
        </div>
        <div className="sports-teams-grid">
          {catalog.teams.slice(0, 4).map(team => (
            <FavoriteTeam team={team} favorite={favorites.has(team.id)} onToggle={onToggleFavorite} key={team.id} />
          ))}
        </div>
      </section>
      <section className="sports-section split">
        <div>
          <div className="sports-section-head">
            <div>
              <span>LATEST</span>
              <h2>Sports stories</h2>
            </div>
          </div>
          <NewsGrid stories={catalog.stories} query={query} />
        </div>
        <aside>
          <div className="sports-section-head">
            <div>
              <span>TABLE</span>
              <h2>Top standings</h2>
            </div>
          </div>
          <StandingsTable standings={catalog.standings} />
          <Link className="sports-block-link" to="/services/sports/competitions">
            Full standings <ArrowForwardRoundedIcon />
          </Link>
        </aside>
      </section>
    </>
  );
};

const ListingContent = ({
  kind,
  query,
  catalog,
  favorites,
  onToggleFavorite,
}: SportsViewProps & { kind: SportsPageKind; query: string }) => {
  if (kind === "live" || kind === "matches") {
    const matches = catalog.matches
      .filter(match => (kind === "live" ? match.status === "live" : true))
      .filter(match =>
        `${match.home.name} ${match.away.name} ${match.competition}`.toLowerCase().includes(query.toLowerCase())
      );
    return (
      <section className="sports-workspace">
        <div className="sports-page-title">
          <span>{kind === "live" ? "LIVE CENTRE" : "FIXTURES & RESULTS"}</span>
          <h1>{kind === "live" ? "Live right now" : "Every match, one place"}</h1>
          <p>Scores, schedules and match details from across the SMAJ Sports network.</p>
        </div>
        <div className="sports-filter-row">
          {filterItems.map((item, index) => (
            <button className={index === 0 ? "active" : ""} type="button" key={item}>
              {item}
            </button>
          ))}
        </div>
        <div className="sports-match-list">
          {matches.map(match => (
            <MatchCard match={match} key={match.id} />
          ))}
        </div>
      </section>
    );
  }
  if (kind === "competitions")
    return (
      <section className="sports-workspace">
        <div className="sports-page-title">
          <span>COMPETITIONS</span>
          <h1>Chase every title</h1>
          <p>Fixtures, results and standings for the competitions that matter.</p>
        </div>
        <div className="sports-competition-hero">
          <div>
            <span>SMAJ FEATURED COMPETITION</span>
            <h2>SMAJ Champions League</h2>
            <p>16 clubs · 8 cities · One continental champion</p>
          </div>
          <SportsSoccerRoundedIcon />
        </div>
        <StandingsTable standings={catalog.standings} />
      </section>
    );
  if (kind === "teams")
    return (
      <section className="sports-workspace">
        <div className="sports-page-title">
          <span>CLUB DIRECTORY</span>
          <h1>Find your team</h1>
          <p>Follow clubs to personalize scores, stories and notifications.</p>
        </div>
        <div className="sports-teams-grid large">
          {catalog.teams
            .filter(team => team.name.toLowerCase().includes(query.toLowerCase()))
            .map(team => (
              <FavoriteTeam team={team} favorite={favorites.has(team.id)} onToggle={onToggleFavorite} key={team.id} />
            ))}
        </div>
      </section>
    );
  if (kind === "news")
    return (
      <section className="sports-workspace">
        <div className="sports-page-title">
          <span>NEWSROOM</span>
          <h1>The stories behind the score</h1>
          <p>Match reports, interviews and community stories.</p>
        </div>
        <NewsGrid stories={catalog.stories} query={query} />
      </section>
    );
  return (
    <section className="sports-workspace">
      <div className="sports-page-title">
        <span>FAN COMMUNITY</span>
        <h1>More than spectators</h1>
        <p>Meet fans, share predictions and celebrate your club together.</p>
      </div>
      <div className="sports-community-grid">
        {[
          "Who wins tonight's headline match?",
          "Show us your match-day colors",
          "Vote: goal of the week",
          "Build your all-star starting XI",
        ].map((title, index) => (
          <article key={title}>
            <span>
              <GroupsRoundedIcon /> {1200 + index * 347} fans
            </span>
            <h2>{title}</h2>
            <p>
              {index % 2
                ? "Share a photo or story with supporters across the ecosystem."
                : "Join the conversation and make your match prediction."}
            </p>
            <button type="button">
              Join discussion <ArrowForwardRoundedIcon />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

const DetailContent = ({ kind, catalog, favorites, onToggleFavorite }: SportsViewProps & { kind: SportsPageKind }) => {
  const { id } = useParams();
  if (kind === "team") {
    const team = catalog.teams.find(item => item.id === id) || catalog.teams[0];
    if (!team) return <div className="sports-empty-state">Team not found.</div>;
    return (
      <section className="sports-workspace">
        <div className="sports-team-hero">
          <TeamMark team={team} />
          <div>
            <span>{team.city.toUpperCase()}</span>
            <h1>{team.name}</h1>
            <p>Official SMAJ Sports club profile</p>
          </div>
          <button type="button" onClick={() => onToggleFavorite(team.id)}>
            {favorites.has(team.id) ? "★ Following" : "☆ Follow team"}
          </button>
        </div>
        <div className="sports-detail-grid">
          <div>
            <h2>Recent form</h2>
            <div className="sports-form-large">
              {team.form.map((result, index) => (
                <i className={result.toLowerCase()} key={index}>
                  {result}
                </i>
              ))}
            </div>
            <h2>Recent matches</h2>
            {catalog.matches
              .filter(match => match.home.id === team.id || match.away.id === team.id)
              .map(match => (
                <MatchCard compact match={match} key={match.id} />
              ))}
          </div>
          <aside>
            <h2>Club details</h2>
            <p>
              City <b>{team.city}</b>
            </p>
            <p>
              Competition <b>SMAJ Champions League</b>
            </p>
            <p>
              Followers <b>24.8K</b>
            </p>
          </aside>
        </div>
      </section>
    );
  }
  const match = catalog.matches.find(item => item.id === id) || catalog.matches[0];
  if (!match) return <div className="sports-empty-state">Match not found.</div>;
  return (
    <section className="sports-workspace">
      <div className="sports-match-detail">
        <span>{match.competition}</span>
        <p>
          {match.dateLabel} · {match.venue}
        </p>
        <div>
          <article>
            <TeamMark team={match.home} />
            <h2>{match.home.name}</h2>
          </article>
          <strong>
            {match.homeScore ?? "–"}
            <i>:</i>
            {match.awayScore ?? "–"}
            <small>{match.status === "live" ? match.minute : match.status}</small>
          </strong>
          <article>
            <TeamMark team={match.away} />
            <h2>{match.away.name}</h2>
          </article>
        </div>
      </div>
      <div className="sports-detail-grid">
        <div>
          <h2>Match timeline</h2>
          {[
            "12'  First big chance of the match",
            "31'  Goal — Lagos Lions",
            "45'  Half time",
            "54'  Goal — Accra Stars",
            "67'  Goal — Lagos Lions",
          ].map(event => (
            <p className="sports-event" key={event}>
              {event}
            </p>
          ))}
        </div>
        <aside>
          <h2>Match facts</h2>
          <p>
            Possession <b>54% — 46%</b>
          </p>
          <p>
            Shots <b>12 — 8</b>
          </p>
          <p>
            On target <b>6 — 3</b>
          </p>
          <p>
            Corners <b>5 — 4</b>
          </p>
        </aside>
      </div>
    </section>
  );
};

const SportsPage = ({ kind = "home" }: { kind?: SportsPageKind }) => {
  const [query, setQuery] = useState("");
  const { catalog, favorites, loading, usingFallback, lastUpdated, refresh, toggleFavorite } = useSportsCatalog();
  return (
    <AppLayout showFooter={false} showHeader={false}>
      <main className="sports-page">
        <SportsHeader query={query} onQueryChange={setQuery} />
        <div className={`sports-data-status${usingFallback ? " fallback" : ""}`} role="status">
          <span>
            {loading
              ? "Loading latest sports data…"
              : usingFallback
                ? "Live service unavailable — showing saved demo data."
                : `Scores updated ${lastUpdated?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "now"}`}
          </span>
          {!loading ? (
            <button type="button" onClick={() => void refresh()}>
              Refresh
            </button>
          ) : null}
        </div>
        <div className="sports-content">
          {kind === "home" ? (
            <HomeContent query={query} catalog={catalog} favorites={favorites} onToggleFavorite={toggleFavorite} />
          ) : kind === "match" || kind === "team" ? (
            <DetailContent kind={kind} catalog={catalog} favorites={favorites} onToggleFavorite={toggleFavorite} />
          ) : (
            <ListingContent
              kind={kind}
              query={query}
              catalog={catalog}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>
        <nav className="sports-mobile-nav">
          <NavLink end to="/services/sports">
            <HomeRoundedIcon />
            <span>Home</span>
          </NavLink>
          <NavLink to="/services/sports/live">
            <LiveTvRoundedIcon />
            <span>Live</span>
          </NavLink>
          <NavLink to="/services/sports/matches">
            <CalendarMonthRoundedIcon />
            <span>Matches</span>
          </NavLink>
          <NavLink to="/services/sports/news">
            <NewspaperRoundedIcon />
            <span>News</span>
          </NavLink>
          <NavLink to="/services/sports/community">
            <GroupsRoundedIcon />
            <span>Community</span>
          </NavLink>
        </nav>
      </main>
    </AppLayout>
  );
};

export default SportsPage;
