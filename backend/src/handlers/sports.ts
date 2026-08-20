import type { Router } from "express";
import axios from "axios";
import env from "../environments";

const teams = [
  {
    id: "lions",
    name: "Lagos Lions",
    shortName: "LIO",
    city: "Lagos",
    color: "#2563eb",
    form: ["W", "W", "D", "W", "L"],
  },
  {
    id: "stars",
    name: "Accra Stars",
    shortName: "STA",
    city: "Accra",
    color: "#f59e0b",
    form: ["D", "W", "W", "L", "W"],
  },
  {
    id: "atlas",
    name: "Atlas United",
    shortName: "ATL",
    city: "Casablanca",
    color: "#7c3aed",
    form: ["W", "W", "W", "D", "W"],
  },
  {
    id: "eagles",
    name: "Nairobi Eagles",
    shortName: "EAG",
    city: "Nairobi",
    color: "#10b981",
    form: ["L", "D", "W", "W", "D"],
  },
  {
    id: "royals",
    name: "Dakar Royals",
    shortName: "ROY",
    city: "Dakar",
    color: "#ef4444",
    form: ["W", "L", "W", "D", "W"],
  },
  {
    id: "waves",
    name: "Cape Town Waves",
    shortName: "WAV",
    city: "Cape Town",
    color: "#06b6d4",
    form: ["D", "W", "L", "W", "W"],
  },
];

const [lions, stars, atlas, eagles, royals, waves] = teams;

const matches = [
  {
    id: "m1",
    competition: "SMAJ Champions League",
    sport: "Football",
    status: "live",
    minute: "67'",
    dateLabel: "Live now",
    venue: "Unity Arena",
    home: lions,
    away: stars,
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: "m2",
    competition: "Continental Cup",
    sport: "Football",
    status: "live",
    minute: "HT",
    dateLabel: "Live now",
    venue: "Atlas Stadium",
    home: atlas,
    away: eagles,
    homeScore: 0,
    awayScore: 0,
  },
  {
    id: "m3",
    competition: "SMAJ Basketball",
    sport: "Basketball",
    status: "live",
    minute: "Q3 04:12",
    dateLabel: "Live now",
    venue: "Dakar Dome",
    home: royals,
    away: waves,
    homeScore: 68,
    awayScore: 64,
  },
  {
    id: "m4",
    competition: "SMAJ Champions League",
    sport: "Football",
    status: "upcoming",
    dateLabel: "Today · 20:00",
    venue: "National Stadium",
    home: eagles,
    away: lions,
  },
  {
    id: "m5",
    competition: "Continental Cup",
    sport: "Football",
    status: "upcoming",
    dateLabel: "Tomorrow · 18:30",
    venue: "Ocean Park",
    home: waves,
    away: atlas,
  },
  {
    id: "m6",
    competition: "SMAJ Champions League",
    sport: "Football",
    status: "finished",
    dateLabel: "Full time",
    venue: "Royal Ground",
    home: stars,
    away: royals,
    homeScore: 1,
    awayScore: 3,
  },
];

const standings = [
  { team: atlas, played: 12, won: 9, draw: 2, lost: 1, points: 29 },
  { team: lions, played: 12, won: 8, draw: 2, lost: 2, points: 26 },
  { team: royals, played: 12, won: 7, draw: 2, lost: 3, points: 23 },
  { team: stars, played: 12, won: 6, draw: 3, lost: 3, points: 21 },
  { team: eagles, played: 12, won: 5, draw: 3, lost: 4, points: 18 },
  { team: waves, played: 12, won: 4, draw: 2, lost: 6, points: 14 },
];

type Team = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  color: string;
  form: string[];
  logoUrl?: string;
};
type Match = {
  id: string;
  competition: string;
  sport: string;
  status: string;
  minute?: string;
  dateLabel: string;
  venue: string;
  home: Team;
  away: Team;
  homeScore?: number;
  awayScore?: number;
};
type Standing = {
  team: Team;
  played: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
};
type Story = {
  id: string;
  category: string;
  title: string;
  summary: string;
  time: string;
  tone: string;
};
type SportsCatalog = {
  matches: Match[];
  teams: Team[];
  stories: Story[];
  standings: Standing[];
  competitions: Array<{
    id: string;
    name: string;
    sport: string;
    teamCount: number;
  }>;
  meta: { source: string; updatedAt: string; refreshAfterSeconds: number };
};

type SportsDbEvent = {
  idEvent?: string;
  idLeague?: string;
  idHomeTeam?: string;
  idAwayTeam?: string;
  strLeague?: string;
  strSport?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strHomeTeamBadge?: string | null;
  strAwayTeamBadge?: string | null;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  dateEvent?: string;
  strTime?: string;
  strTimestamp?: string;
  strVenue?: string;
  strStatus?: string;
};

const palette = [
  "#2563eb",
  "#f59e0b",
  "#7c3aed",
  "#10b981",
  "#ef4444",
  "#06b6d4",
];
const colorFor = (value: string) =>
  palette[
    [...value].reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % palette.length
  ];
const shortName = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  const initials = words.map((word) => word[0]).join("");
  return (initials.length >= 2 ? initials : name.slice(0, 3))
    .toUpperCase()
    .slice(0, 3);
};
const score = (value?: string | null) => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const teamFromEvent = (
  id: string | undefined,
  name: string | undefined,
  badgeUrl?: string | null,
): Team => {
  const safeName = String(name || "Unknown team").trim();
  return {
    id: String(id || safeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    name: safeName,
    shortName: shortName(safeName),
    city: "",
    color: colorFor(safeName),
    form: [],
    ...(badgeUrl && /^https:\/\//i.test(badgeUrl) ? { logoUrl: badgeUrl } : {}),
  };
};
const eventDateLabel = (event: SportsDbEvent, finished: boolean) => {
  if (finished) return "Full time";
  const timestamp =
    event.strTimestamp ||
    `${event.dateEvent || ""}T${event.strTime || "00:00:00"}Z`;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime()))
    return [event.dateEvent, event.strTime?.slice(0, 5)]
      .filter(Boolean)
      .join(" · ");
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
};
const normalizeEvent = (event: SportsDbEvent): Match => {
  const homeScore = score(event.intHomeScore);
  const awayScore = score(event.intAwayScore);
  const finished = homeScore !== undefined && awayScore !== undefined;
  return {
    id: String(
      event.idEvent ||
        `${event.idHomeTeam}-${event.idAwayTeam}-${event.dateEvent}`,
    ),
    competition: String(event.strLeague || "Sports"),
    sport: String(event.strSport || "Football"),
    status: finished ? "finished" : "upcoming",
    dateLabel: eventDateLabel(event, finished),
    venue: String(event.strVenue || ""),
    home: teamFromEvent(
      event.idHomeTeam,
      event.strHomeTeam,
      event.strHomeTeamBadge,
    ),
    away: teamFromEvent(
      event.idAwayTeam,
      event.strAwayTeam,
      event.strAwayTeamBadge,
    ),
    ...(homeScore !== undefined ? { homeScore } : {}),
    ...(awayScore !== undefined ? { awayScore } : {}),
  };
};

const demoCatalog = (): SportsCatalog => ({
  matches,
  teams,
  stories: [],
  standings,
  competitions: [
    {
      id: "smaj-champions-league",
      name: "SMAJ Champions League",
      sport: "Football",
      teamCount: 16,
    },
  ],
  meta: {
    source: "smaj-demo",
    updatedAt: new Date().toISOString(),
    refreshAfterSeconds: 45,
  },
});

const buildStandings = (
  providerMatches: Match[],
  providerTeams: Team[],
): Standing[] => {
  const table = new Map<string, Standing>(
    providerTeams.map((team) => [
      team.id,
      { team, played: 0, won: 0, draw: 0, lost: 0, points: 0 },
    ]),
  );
  providerMatches
    .filter((match) => match.status === "finished")
    .forEach((match) => {
      const home = table.get(match.home.id);
      const away = table.get(match.away.id);
      if (
        !home ||
        !away ||
        match.homeScore === undefined ||
        match.awayScore === undefined
      )
        return;
      home.played += 1;
      away.played += 1;
      if (match.homeScore === match.awayScore) {
        home.draw += 1;
        away.draw += 1;
        home.points += 1;
        away.points += 1;
      } else if (match.homeScore > match.awayScore) {
        home.won += 1;
        away.lost += 1;
        home.points += 3;
      } else {
        away.won += 1;
        home.lost += 1;
        away.points += 3;
      }
    });
  return [...table.values()]
    .filter((row) => row.played > 0)
    .sort((left, right) => right.points - left.points);
};

const timeAgo = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const newsTones = ["blue", "purple", "green", "orange"];

const fetchSportsNews = async (): Promise<Story[]> => {
  if (!env.news_api_key) return [];
  const response = await axios.get(
    "https://newsapi.org/v2/everything",
    {
      params: {
        q: "sports",
        sortBy: "publishedAt",
        pageSize: 20,
        apiKey: env.news_api_key,
      },
      timeout: 12_000,
    },
  );
  const status = String(response.data?.status || "").toLowerCase();
  if (status !== "ok") {
    console.error(
      "[sports-news] provider error:",
      response.data?.message || status,
    );
    return [];
  }
  const articles = Array.isArray(response.data?.articles)
    ? response.data.articles
    : [];
  return articles
    .filter(
      (article: any) => article?.title && article?.title !== "[Removed]",
    )
    .map((article: any, index: number) => ({
      id: `newsapi-${index}-${Date.now()}`,
      category: String(article.source?.name || "Sports News"),
      title: String(article.title),
      summary: String(article.description || article.title || ""),
      time: timeAgo(article.publishedAt),
      tone: newsTones[index % newsTones.length],
    }));
};

let cachedNews: { expiresAt: number; value: Story[] } | null = null;
let pendingNews: Promise<Story[]> | null = null;

const getNews = async (): Promise<Story[]> => {
  if (cachedNews && cachedNews.expiresAt > Date.now()) return cachedNews.value;
  if (pendingNews) return pendingNews;
  pendingNews = fetchSportsNews()
    .then((value) => {
      cachedNews = {
        value,
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      return value;
    })
    .catch((error) => {
      console.error(
        "[sports-news]",
        error instanceof Error ? error.message : error,
      );
      if (cachedNews) return cachedNews.value;
      return [];
    })
    .finally(() => {
      pendingNews = null;
    });
  return pendingNews;
};

let cachedCatalog: { expiresAt: number; value: SportsCatalog } | null = null;
let pendingCatalog: Promise<SportsCatalog> | null = null;

const fetchSportsDbEvents = async (
  leagueId: string,
  endpoint: "eventsnextleague" | "eventspastleague",
) => {
  const response = await axios.get<{ events?: SportsDbEvent[] | null }>(
    `https://www.thesportsdb.com/api/v1/json/${encodeURIComponent(env.sports_api_key)}/${endpoint}.php`,
    { params: { id: leagueId }, timeout: 12_000 },
  );
  return Array.isArray(response.data.events) ? response.data.events : [];
};

const fetchProviderCatalog = async (): Promise<SportsCatalog> => {
  const eventGroups = await Promise.all(
    env.sports_league_ids.flatMap((leagueId) => [
      fetchSportsDbEvents(leagueId, "eventsnextleague"),
      fetchSportsDbEvents(leagueId, "eventspastleague"),
    ]),
  );
  const providerMatches = eventGroups.flat().map(normalizeEvent);
  if (!providerMatches.length)
    throw new Error(
      "TheSportsDB returned no events for the configured leagues.",
    );
  const teamMap = new Map<string, Team>();
  providerMatches.forEach((match) => {
    teamMap.set(match.home.id, match.home);
    teamMap.set(match.away.id, match.away);
  });
  const providerTeams = [...teamMap.values()];
  const competitions = [
    ...new Map(
      providerMatches.map((match) => [
        match.competition,
        {
          id: match.competition.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: match.competition,
          sport: match.sport,
          teamCount: new Set(
            providerMatches
              .filter((item) => item.competition === match.competition)
              .flatMap((item) => [item.home.id, item.away.id]),
          ).size,
        },
      ]),
    ).values(),
  ];
  return {
    matches: providerMatches,
    teams: providerTeams,
    stories: [],
    standings: buildStandings(providerMatches, providerTeams),
    competitions,
    meta: {
      source: "thesportsdb",
      updatedAt: new Date().toISOString(),
      refreshAfterSeconds: Math.min(env.sports_cache_seconds, 300),
    },
  };
};

const getCatalog = async () => {
  if (
    env.sports_provider !== "thesportsdb" ||
    !env.sports_api_key ||
    !env.sports_league_ids.length
  )
    return demoCatalog();
  if (cachedCatalog && cachedCatalog.expiresAt > Date.now())
    return cachedCatalog.value;
  if (pendingCatalog) return pendingCatalog;
  pendingCatalog = fetchProviderCatalog()
    .then(async (value) => {
      const news = await getNews();
      return { ...value, stories: news };
    })
    .then((value) => {
      cachedCatalog = {
        value,
        expiresAt: Date.now() + env.sports_cache_seconds * 1000,
      };
      return value;
    })
    .catch((error) => {
      console.error(
        "[sports-provider]",
        error instanceof Error ? error.message : error,
      );
      if (cachedCatalog) return cachedCatalog.value;
      return demoCatalog();
    })
    .finally(() => {
      pendingCatalog = null;
    });
  return pendingCatalog;
};

const mountSportsEndpoints = (router: Router) => {
  router.get("/bootstrap", async (_, res) => {
    const catalog = await getCatalog();
    res.json(catalog);
  });
  router.get("/matches", async (req, res) => {
    const catalog = await getCatalog();
    const status = String(req.query.status || "");
    const items = status
      ? catalog.matches.filter((match) => match.status === status)
      : catalog.matches;
    res.json({ items, meta: catalog.meta });
  });
  router.get("/matches/:id", async (req, res) => {
    const catalog = await getCatalog();
    const match = catalog.matches.find((item) => item.id === req.params.id);
    if (!match)
      return res
        .status(404)
        .json({ error: "not_found", message: "Match not found." });
    return res.json({ item: match, meta: catalog.meta });
  });
  router.get("/teams", async (_, res) => {
    const catalog = await getCatalog();
    res.json({ items: catalog.teams, meta: catalog.meta });
  });
  router.get("/teams/:id", async (req, res) => {
    const catalog = await getCatalog();
    const team = catalog.teams.find((item) => item.id === req.params.id);
    if (!team)
      return res
        .status(404)
        .json({ error: "not_found", message: "Team not found." });
    return res.json({ item: team, meta: catalog.meta });
  });
  router.get("/competitions", async (_, res) => {
    const catalog = await getCatalog();
    res.json({ items: catalog.competitions, meta: catalog.meta });
  });
  router.get("/competitions/:id/standings", async (_, res) => {
    const catalog = await getCatalog();
    res.json({ items: catalog.standings, meta: catalog.meta });
  });
  router.get("/news", async (_, res) => {
    const catalog = await getCatalog();
    res.json({ items: catalog.stories, meta: catalog.meta });
  });
  router.get("/news/:id", async (req, res) => {
    const catalog = await getCatalog();
    const story = catalog.stories.find((item) => item.id === req.params.id);
    if (!story)
      return res
        .status(404)
        .json({ error: "not_found", message: "Story not found." });
    return res.json({ item: story, meta: catalog.meta });
  });
};

export default mountSportsEndpoints;
