import type { Request, Response, Router } from "express";
import axios from "axios";
import env from "../environments";

const TMDB_API_URL = "https://api.themoviedb.org/3";
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; value: unknown }>();

type TmdbMedia = {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
};

const normalizeMedia = (item: TmdbMedia, fallbackType: "movie" | "tv" = "movie") => ({
  id: String(item.id),
  tmdbId: item.id,
  mediaType: item.media_type === "tv" || item.media_type === "movie" ? item.media_type : fallbackType,
  title: item.title || item.name || "Untitled",
  overview: item.overview || "",
  posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
  backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
  releaseDate: item.release_date || item.first_air_date || null,
  rating: typeof item.vote_average === "number" ? Number(item.vote_average.toFixed(1)) : null,
  voteCount: item.vote_count || 0,
  genreIds: item.genre_ids || [],
});

const tmdbGet = async <T>(path: string, params: Record<string, string | number | boolean | undefined> = {}) => {
  if (!env.tmdb_access_token) {
    const error = new Error("TMDB is not configured. Add TMDB_ACCESS_TOKEN to the backend environment.");
    Object.assign(error, { status: 503 });
    throw error;
  }
  const key = `${path}?${new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => entry[1] !== undefined).map(([name, value]) => [name, String(value)])).toString()}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  const response = await axios.get<T>(`${TMDB_API_URL}${path}`, {
    params,
    timeout: 12_000,
    headers: { Authorization: `Bearer ${env.tmdb_access_token}`, Accept: "application/json" },
  });
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value: response.data });
  return response.data;
};

const mountStreamEndpoints = (router: Router) => {
  const list = (path: string, fallbackType: "movie" | "tv") => async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, Math.min(100, Number(req.query.page) || 1));
      const data = await tmdbGet<{ page: number; total_pages: number; total_results: number; results: TmdbMedia[] }>(path, { page, language: String(req.query.language || "en-US"), include_adult: false });
      res.json({ ...data, results: data.results.filter((item) => item.media_type !== "person").map((item) => normalizeMedia(item, fallbackType)), source: "TMDB" });
    } catch (error) {
      const status = Number((error as { status?: number; response?: { status?: number } }).status || (error as { response?: { status?: number } }).response?.status || 502);
      res.status(status).json({ error: error instanceof Error ? error.message : "Unable to load entertainment catalogue" });
    }
  };

  router.get("/trending", list("/trending/all/week", "movie"));
  router.get("/movies", list("/discover/movie", "movie"));
  router.get("/series", list("/discover/tv", "tv"));
  router.get("/search", async (req, res) => {
    const query = String(req.query.q || "").trim().slice(0, 120);
    if (!query) return res.json({ page: 1, total_pages: 0, total_results: 0, results: [], source: "TMDB" });
    try {
      const page = Math.max(1, Math.min(100, Number(req.query.page) || 1));
      const data = await tmdbGet<{ page: number; total_pages: number; total_results: number; results: TmdbMedia[] }>("/search/multi", { query, page, language: String(req.query.language || "en-US"), include_adult: false });
      return res.json({ ...data, results: data.results.filter((item) => item.media_type !== "person").map((item) => normalizeMedia(item)), source: "TMDB" });
    } catch (error) {
      const status = Number((error as { status?: number; response?: { status?: number } }).status || (error as { response?: { status?: number } }).response?.status || 502);
      return res.status(status).json({ error: error instanceof Error ? error.message : "Unable to search entertainment catalogue" });
    }
  });
  router.get("/:type(movie|tv)/:id", async (req, res) => {
    try {
      const type = req.params.type as "movie" | "tv";
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid TMDB title ID" });
      const data = await tmdbGet<TmdbMedia & { genres?: Array<{ id: number; name: string }>; runtime?: number; episode_run_time?: number[] }>(`/${type}/${id}`, { language: String(req.query.language || "en-US"), append_to_response: "videos,credits" });
      return res.json({ ...normalizeMedia(data, type), genres: data.genres || [], runtime: data.runtime || data.episode_run_time?.[0] || null, source: "TMDB", raw: data });
    } catch (error) {
      const status = Number((error as { status?: number; response?: { status?: number } }).status || (error as { response?: { status?: number } }).response?.status || 502);
      return res.status(status).json({ error: error instanceof Error ? error.message : "Unable to load title" });
    }
  });
  router.get("/:type(movie|tv)/:id/providers", async (req, res) => {
    try {
      const type = req.params.type as "movie" | "tv";
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid TMDB title ID" });
      const data = await tmdbGet<{ results: Record<string, unknown> }>(`/${type}/${id}/watch/providers`);
      return res.json({ results: data.results, source: "JustWatch via TMDB", attributionRequired: true });
    } catch (error) {
      return res.status(502).json({ error: error instanceof Error ? error.message : "Unable to load watch providers" });
    }
  });
};

export default mountStreamEndpoints;
