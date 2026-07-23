import { apiFetch } from "./axiosClient";
import type { SportsCatalog } from "../types/sports";

export const getSportsCatalog = async (signal?: AbortSignal) => {
  const response = await apiFetch("/sports/bootstrap", { signal });
  if (!response.ok) throw new Error(`Sports API returned ${response.status}.`);
  return response.json() as Promise<SportsCatalog>;
};
