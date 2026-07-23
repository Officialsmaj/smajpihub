import type { Router } from "express";

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

const stories = [
  {
    id: "n1",
    category: "Football",
    title: "The final four are set after a dramatic night",
    summary:
      "Late goals, a packed stadium and one unforgettable comeback shaped the quarter-finals.",
    time: "18 min ago",
    tone: "blue",
  },
  {
    id: "n2",
    category: "Basketball",
    title: "Royals extend their unbeaten home run",
    summary: "A dominant fourth quarter keeps the league leaders in control.",
    time: "1 hr ago",
    tone: "purple",
  },
  {
    id: "n3",
    category: "Community",
    title: "Fans choose the goal of the week",
    summary:
      "Watch the shortlist and cast your vote with the SMAJ Sports community.",
    time: "3 hrs ago",
    tone: "green",
  },
  {
    id: "n4",
    category: "Athletics",
    title: "Rising stars to watch this season",
    summary:
      "Six young athletes are already rewriting personal and national records.",
    time: "Yesterday",
    tone: "orange",
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

const responseMeta = () => ({
  source: "smaj-demo",
  updatedAt: new Date().toISOString(),
  refreshAfterSeconds: 45,
});

const mountSportsEndpoints = (router: Router) => {
  router.get("/bootstrap", (_, res) =>
    res.json({ matches, teams, stories, standings, meta: responseMeta() }),
  );
  router.get("/matches", (req, res) => {
    const status = String(req.query.status || "");
    const items = status
      ? matches.filter((match) => match.status === status)
      : matches;
    res.json({ items, meta: responseMeta() });
  });
  router.get("/matches/:id", (req, res) => {
    const match = matches.find((item) => item.id === req.params.id);
    if (!match)
      return res
        .status(404)
        .json({ error: "not_found", message: "Match not found." });
    return res.json({ item: match, meta: responseMeta() });
  });
  router.get("/teams", (_, res) =>
    res.json({ items: teams, meta: responseMeta() }),
  );
  router.get("/teams/:id", (req, res) => {
    const team = teams.find((item) => item.id === req.params.id);
    if (!team)
      return res
        .status(404)
        .json({ error: "not_found", message: "Team not found." });
    return res.json({ item: team, meta: responseMeta() });
  });
  router.get("/competitions", (_, res) =>
    res.json({
      items: [
        {
          id: "smaj-champions-league",
          name: "SMAJ Champions League",
          sport: "Football",
          teamCount: 16,
        },
      ],
      meta: responseMeta(),
    }),
  );
  router.get("/competitions/:id/standings", (_, res) =>
    res.json({ items: standings, meta: responseMeta() }),
  );
  router.get("/news", (_, res) =>
    res.json({ items: stories, meta: responseMeta() }),
  );
  router.get("/news/:id", (req, res) => {
    const story = stories.find((item) => item.id === req.params.id);
    if (!story)
      return res
        .status(404)
        .json({ error: "not_found", message: "Story not found." });
    return res.json({ item: story, meta: responseMeta() });
  });
};

export default mountSportsEndpoints;
