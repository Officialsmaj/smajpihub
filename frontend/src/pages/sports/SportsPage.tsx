import { useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
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
  | "team"
  | "article";

const sportLabel = (sport: string) => (sport.toLowerCase() === "soccer" ? "Football" : sport);

type SportsViewProps = {
  catalog: SportsCatalog;
  favorites: Set<string>;
  onToggleFavorite: (teamId: string) => void;
};

const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <div className="sports-empty-state">
    <h2>{title}</h2>
    <p>{message}</p>
  </div>
);

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
    {!standings.length ? (
      <EmptyState
        title="Standings unavailable"
        message="The free data feed does not currently include enough completed matches to build a reliable table."
      />
    ) : null}
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

const HomeMatchRow = ({ match }: { match: SportsCatalog["matches"][number] }) => (
  <Link className="sports-score-row" to={`/services/sports/match/${match.id}`}>
    <div>
      <TeamMark team={match.home} small />
      <span>{match.home.name}</span>
    </div>
    <strong>
      {match.status === "finished" ? (
        <>
          {match.homeScore ?? "–"} <i>–</i> {match.awayScore ?? "–"}
        </>
      ) : (
        match.dateLabel
      )}
      <small>{match.status === "finished" ? "FT" : "UPCOMING"}</small>
    </strong>
    <div>
      <span>{match.away.name}</span>
      <TeamMark team={match.away} small />
    </div>
  </Link>
);

const HomeLeagueSection = ({ competition, matches }: { competition: string; matches: SportsCatalog["matches"] }) => (
  <section className="sports-league-block">
    <header>
      <div>
        <SportsSoccerRoundedIcon />
        <span>
          <b>{competition}</b>
          <small>{matches[0]?.sport ? sportLabel(matches[0].sport) : "Sport"}</small>
        </span>
      </div>
      <Link to="/services/sports/matches">View all →</Link>
    </header>
    <div>
      {matches.map(match => (
        <HomeMatchRow match={match} key={match.id} />
      ))}
    </div>
  </section>
);

const HomeContent = ({ query, catalog, favorites, onToggleFavorite }: SportsViewProps & { query: string }) => {
  const [status, setStatus] = useState<"all" | "upcoming" | "finished">("all");
  const sports = ["All", ...new Set(catalog.matches.map(match => sportLabel(match.sport)))];
  const [selectedSport, setSelectedSport] = useState("All");
  const visibleMatches = catalog.matches
    .filter(match => status === "all" || match.status === status)
    .filter(match => selectedSport === "All" || sportLabel(match.sport) === selectedSport)
    .filter(match =>
      `${match.home.name} ${match.away.name} ${match.competition}`.toLowerCase().includes(query.toLowerCase())
    );
  const groupedMatches = [...new Set(visibleMatches.map(match => match.competition))].map(competition => ({
    competition,
    matches: visibleMatches.filter(match => match.competition === competition),
  }));
  const favoriteTeams = catalog.teams.filter(team => favorites.has(team.id));
  return (
    <div className="sports-score-home">
      <section className="sports-score-intro">
        <div>
          <span>SCORES & FIXTURES</span>
          <h1>Today in sports</h1>
          <p>Real fixtures and results from your selected competitions.</p>
        </div>
        <Link to="/services/sports/matches">
          All matches <ArrowForwardRoundedIcon />
        </Link>
      </section>

      <section className="sports-score-controls">
        <div className="sports-sport-tabs">
          {sports.map(sport => (
            <button
              type="button"
              className={selectedSport === sport ? "active" : ""}
              onClick={() => setSelectedSport(sport)}
              key={sport}
            >
              {sport}
            </button>
          ))}
        </div>
        <div className="sports-status-tabs">
          {(["all", "upcoming", "finished"] as const).map(item => (
            <button
              type="button"
              className={status === item ? "active" : ""}
              onClick={() => setStatus(item)}
              key={item}
            >
              {item === "all" ? "All" : item === "upcoming" ? "Upcoming" : "Results"}
            </button>
          ))}
        </div>
      </section>

      <section className="sports-score-layout">
        <div className="sports-league-list">
          {groupedMatches.map(group => (
            <HomeLeagueSection competition={group.competition} matches={group.matches} key={group.competition} />
          ))}
          {!groupedMatches.length ? (
            <EmptyState
              title="No matches found"
              message="Try another sport, status, or search. The free provider may not cover this selection."
            />
          ) : null}
        </div>
        <aside className="sports-score-sidebar">
          <section>
            <header>
              <div>
                <span>YOUR TEAMS</span>
                <h2>{favoriteTeams.length ? "Favorites" : "Choose your teams"}</h2>
              </div>
              <Link to="/services/sports/teams">Manage →</Link>
            </header>
            <div className="sports-favorite-list">
              {(favoriteTeams.length ? favoriteTeams : catalog.teams.slice(0, 4)).map(team => (
                <FavoriteTeam team={team} favorite={favorites.has(team.id)} onToggle={onToggleFavorite} key={team.id} />
              ))}
            </div>
          </section>
          <section>
            <header>
              <div>
                <span>SMAJ EDITORIAL</span>
                <h2>Latest stories</h2>
              </div>
              <Link to="/services/sports/news">More →</Link>
            </header>
            <div className="sports-compact-news">
              {catalog.stories.slice(0, 3).map(story => (
                <Link to={`/services/sports/news/${story.id}`} key={story.id}>
                  <small>{story.category}</small>
                  <b>{story.title}</b>
                  <span>{story.time}</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="sports-home-standings">
        <div className="sports-section-head">
          <div>
            <span>COMPETITION</span>
            <h2>Standings</h2>
          </div>
          <Link to="/services/sports/competitions">
            Full table <ArrowForwardRoundedIcon />
          </Link>
        </div>
        <StandingsTable standings={catalog.standings} />
      </section>
    </div>
  );
};

const ListingContent = ({
  kind,
  query,
  catalog,
  favorites,
  onToggleFavorite,
  activeSport,
  onSportChange,
}: SportsViewProps & {
  kind: SportsPageKind;
  query: string;
  activeSport: string;
  onSportChange: (sport: string) => void;
}) => {
  if (kind === "live" || kind === "matches") {
    const filterItems = ["All sports", ...new Set(catalog.matches.map(match => sportLabel(match.sport)))];
    const matches = catalog.matches
      .filter(match => activeSport === "All sports" || sportLabel(match.sport) === activeSport)
      .filter(match =>
        `${match.home.name} ${match.away.name} ${match.competition}`.toLowerCase().includes(query.toLowerCase())
      );
    return (
      <section className="sports-workspace">
        <div className="sports-page-title">
          <span>{kind === "live" ? "LATEST SCORES" : "FIXTURES & RESULTS"}</span>
          <h1>{kind === "live" ? "Latest results and fixtures" : "Every match, one place"}</h1>
          <p>
            {kind === "live"
              ? "The free data plan provides schedules and completed results. Real-time live scores are coming soon."
              : "Real schedules and results supplied through the SMAJ Sports data service."}
          </p>
        </div>
        <div className="sports-filter-row">
          {filterItems.map(item => (
            <button
              className={activeSport === item ? "active" : ""}
              type="button"
              key={item}
              onClick={() => onSportChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="sports-match-list">
          {matches.map(match => (
            <MatchCard match={match} key={match.id} />
          ))}
          {!matches.length ? (
            <EmptyState
              title="No matching fixtures"
              message="Try another sport or search term. The free provider may not cover this category."
            />
          ) : null}
        </div>
      </section>
    );
  }
  if (kind === "competitions") {
    const competition = catalog.competitions[0];
    return (
      <section className="sports-workspace">
        <div className="sports-page-title">
          <span>COMPETITIONS</span>
          <h1>Chase every title</h1>
          <p>Fixtures, results and standings for the competitions that matter.</p>
        </div>
        <div className="sports-competition-hero">
          <div>
            <span>FEATURED COMPETITION</span>
            <h2>{competition?.name || "Competition unavailable"}</h2>
            <p>
              {competition
                ? `${competition.teamCount} clubs · ${competition.sport}`
                : "The provider has not returned competition information."}
            </p>
          </div>
          <SportsSoccerRoundedIcon />
        </div>
        <StandingsTable standings={catalog.standings} />
      </section>
    );
  }
  if (kind === "teams")
    return (
      <section className="sports-workspace">
        <div className="sports-page-title">
          <span>CLUB DIRECTORY</span>
          <h1>Find your team</h1>
          <p>Follow clubs on this device to personalize your SMAJ Sports experience.</p>
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
          <h1>SMAJ Sports stories</h1>
          <p>Editorial previews from SMAJ Sports. Third-party sports news integration is coming soon.</p>
        </div>
        <NewsGrid stories={catalog.stories} query={query} />
        {!catalog.stories.length ? (
          <EmptyState title="No stories available" message="Provider news integration is coming soon." />
        ) : null}
      </section>
    );
  return (
    <section className="sports-workspace">
      <div className="sports-page-title">
        <span>FAN COMMUNITY</span>
        <h1>More than spectators</h1>
        <p>Community discussions are being prepared and are not yet available in this MVP.</p>
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
              <GroupsRoundedIcon /> COMING SOON
            </span>
            <h2>{title}</h2>
            <p>
              {index % 2
                ? "Share a photo or story with supporters across the ecosystem."
                : "Join the conversation and make your match prediction."}
            </p>
            <button type="button" disabled title="Community discussions are coming soon">
              Coming soon <ArrowForwardRoundedIcon />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

const DetailContent = ({ kind, catalog, favorites, onToggleFavorite }: SportsViewProps & { kind: SportsPageKind }) => {
  const { id } = useParams();
  if (kind === "article") {
    const story = catalog.stories.find(item => item.id === id);
    if (!story) return <EmptyState title="Story not found" message="This SMAJ Sports story is unavailable." />;
    return (
      <article className="sports-workspace sports-article-detail">
        <Link to="/services/sports/news">← Back to stories</Link>
        <span>{story.category} · SMAJ SPORTS EDITORIAL</span>
        <h1>{story.title}</h1>
        <p>{story.summary}</p>
        <aside>This is an SMAJ Sports editorial preview. Third-party sports news integration is coming soon.</aside>
      </article>
    );
  }
  if (kind === "team") {
    const team = catalog.teams.find(item => item.id === id) || catalog.teams[0];
    if (!team) return <div className="sports-empty-state">Team not found.</div>;
    return (
      <section className="sports-workspace">
        <div className="sports-team-hero">
          <TeamMark team={team} />
          <div>
            <span>{team.city ? team.city.toUpperCase() : "TEAM PROFILE"}</span>
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
            {team.form.length ? (
              <div className="sports-form-large">
                {team.form.map((result, index) => (
                  <i className={result.toLowerCase()} key={index}>
                    {result}
                  </i>
                ))}
              </div>
            ) : (
              <p className="sports-data-note">Form data is not included in the current free provider feed.</p>
            )}
            <h2>Recent matches</h2>
            {catalog.matches
              .filter(match => match.home.id === team.id || match.away.id === team.id)
              .map(match => (
                <MatchCard compact match={match} key={match.id} />
              ))}
            {!catalog.matches.some(match => match.home.id === team.id || match.away.id === team.id) ? (
              <EmptyState title="No recent matches" message="No fixtures are currently available for this team." />
            ) : null}
          </div>
          <aside>
            <h2>Club details</h2>
            {team.city ? (
              <p>
                City <b>{team.city}</b>
              </p>
            ) : null}
            <p>
              Competition{" "}
              <b>
                {catalog.matches.find(match => match.home.id === team.id || match.away.id === team.id)?.competition ||
                  "Unavailable"}
              </b>
            </p>
            <p>
              Data source <b>{catalog.meta?.source === "thesportsdb" ? "TheSportsDB" : "SMAJ fallback"}</b>
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
          <h2>Match information</h2>
          <p className="sports-data-note">
            Event timelines are not included in the current free provider feed. SMAJ Sports will show them when a
            supported live-data plan is connected.
          </p>
        </div>
        <aside>
          <h2>Details</h2>
          <p>
            Competition <b>{match.competition}</b>
          </p>
          <p>
            Venue <b>{match.venue || "Unavailable"}</b>
          </p>
          <p>
            Status <b>{match.status}</b>
          </p>
          <p>
            Data source <b>{catalog.meta?.source === "thesportsdb" ? "TheSportsDB" : "SMAJ fallback"}</b>
          </p>
        </aside>
      </div>
    </section>
  );
};

const SportsPage = ({ kind = "home" }: { kind?: SportsPageKind }) => {
  const [query, setQuery] = useState("");
  const [activeSport, setActiveSport] = useState("All sports");
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
                ? "Sports provider unavailable — showing saved demo data."
                : `Updated ${lastUpdated?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "now"} · Data: TheSportsDB`}
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
          ) : kind === "match" || kind === "team" || kind === "article" ? (
            <DetailContent kind={kind} catalog={catalog} favorites={favorites} onToggleFavorite={toggleFavorite} />
          ) : (
            <ListingContent
              kind={kind}
              query={query}
              catalog={catalog}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              activeSport={activeSport}
              onSportChange={setActiveSport}
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
            <span>Latest</span>
          </NavLink>
          <NavLink to="/services/sports/matches">
            <CalendarMonthRoundedIcon />
            <span>Matches</span>
          </NavLink>
          <NavLink to="/services/sports/news">
            <NewspaperRoundedIcon />
            <span>News</span>
          </NavLink>
          <NavLink to="/services/sports/teams">
            <SportsSoccerRoundedIcon />
            <span>Teams</span>
          </NavLink>
        </nav>
      </main>
    </AppLayout>
  );
};

export default SportsPage;
