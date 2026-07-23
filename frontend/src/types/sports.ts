export type SportsTeam = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  color: string;
  form: string[];
};

export type SportsMatch = {
  id: string;
  competition: string;
  sport: string;
  status: "live" | "upcoming" | "finished";
  minute?: string;
  dateLabel: string;
  venue: string;
  home: SportsTeam;
  away: SportsTeam;
  homeScore?: number;
  awayScore?: number;
};

export type SportsStory = {
  id: string;
  category: string;
  title: string;
  summary: string;
  time: string;
  tone: string;
};
