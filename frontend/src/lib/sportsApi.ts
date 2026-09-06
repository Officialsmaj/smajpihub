import { apiFetch } from "./axiosClient";
import type { SportsCatalog } from "../types/sports";

export const getSportsCatalog = async (signal?: AbortSignal) => {
  const response = await apiFetch("/sports/bootstrap", { signal });
  if (!response.ok) throw new Error(`Sports API returned ${response.status}.`);
  return response.json() as Promise<SportsCatalog>;
};

export type SportsPreferences = {
  completed: boolean;
  favoriteTeamIds: string[];
  favoriteCompetitionIds: string[];
  notifications: {
    breakingNews: boolean;
    matchStart: boolean;
    matchEnd: boolean;
    scoreUpdates: boolean;
  };
  updatedAt?: string | null;
};

export const getSportsPreferences = async () => {
  const { axiosClient } = await import("./axiosClient");
  const { data } = await axiosClient.get<{ preferences: SportsPreferences | null }>("/sports/preferences");
  return data.preferences;
};

export const saveSportsPreferences = async (preferences: SportsPreferences) => {
  const { axiosClient } = await import("./axiosClient");
  const { data } = await axiosClient.put<{ preferences: SportsPreferences }>("/sports/preferences", preferences);
  return data.preferences;
};