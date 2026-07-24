export type SportsTeam = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  color: string;
  form: string[];
  logoUrl?: string;
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

export type SportsStanding = {
  team: SportsTeam;
  played: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
};

export type SportsCompetition = {
  id: string;
  name: string;
  sport: string;
  teamCount: number;
};

export type SportsCatalog = {
  matches: SportsMatch[];
  teams: SportsTeam[];
  stories: SportsStory[];
  standings: SportsStanding[];
  competitions: SportsCompetition[];
  meta?: {
    source: string;
    updatedAt: string;
    refreshAfterSeconds: number;
  };
};
