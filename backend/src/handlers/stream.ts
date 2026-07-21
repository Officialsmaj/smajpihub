import type { Request, Response, Router } from "express";
import axios from "axios";
import env from "../environments";
import { resolveCurrentUser } from "../services/auth";

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
  const requireCreator = async (req: Request, res: Response) => {
    const user = await resolveCurrentUser(req);
    if (!user) { res.status(401).json({ error: "authentication_required", message: "Sign in to use Creator Studio." }); return null; }
    if (!req.app.locals.streamContentCollection) { res.status(503).json({ error: "service_unavailable", message: "Stream content storage is not ready." }); return null; }
    return user;
  };

  router.post("/creator/uploads", async (req, res) => {
    try {
      const user = await requireCreator(req, res);
      if (!user) return;
      if (!env.cloudflare_stream_account_id || !env.cloudflare_stream_api_token) return res.status(503).json({ error: "cloudflare_stream_not_configured", message: "Add Cloudflare Stream credentials to the backend environment." });
      const title = String(req.body?.title || "").trim().slice(0, 140);
      const description = String(req.body?.description || "").trim().slice(0, 3000);
      const category = String(req.body?.category || "Entertainment").trim().slice(0, 60);
      const visibility = ["public", "unlisted", "private"].includes(req.body?.visibility) ? req.body.visibility : "private";
      const fileName = String(req.body?.fileName || "video.mp4").trim().slice(0, 180);
      const fileSize = Number(req.body?.fileSize || 0);
      const maxDurationSeconds = Math.max(1, Math.min(14_400, Number(req.body?.maxDurationSeconds) || 3600));
      if (!title || description.length < 20) return res.status(400).json({ error: "bad_request", message: "Add a title and a description of at least 20 characters." });
      if (fileSize <= 0 || fileSize > 200 * 1024 * 1024) return res.status(400).json({ error: "file_size", message: "This upload flow supports video files up to 200 MB." });
      if (req.body?.rightsConfirmed !== true) return res.status(400).json({ error: "rights_required", message: "Confirm that you own or control the rights to distribute this video." });
      const creatorId = String(user._id);
      const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const response = await axios.post<{ success: boolean; result?: { uid?: string; uploadURL?: string }; errors?: Array<{ message?: string }> }>(`https://api.cloudflare.com/client/v4/accounts/${env.cloudflare_stream_account_id}/stream/direct_upload`, {
        maxDurationSeconds,
        expiry,
        creator: creatorId.slice(0, 64),
        requireSignedURLs: false,
        meta: { name: fileName, smajTitle: title },
      }, { headers: { Authorization: `Bearer ${env.cloudflare_stream_api_token}`, "Content-Type": "application/json" }, timeout: 15_000 });
      const uid = response.data.result?.uid;
      const uploadURL = response.data.result?.uploadURL;
      if (!response.data.success || !uid || !uploadURL) throw new Error(response.data.errors?.[0]?.message || "Cloudflare did not create an upload URL.");
      const now = new Date();
      const record = { cloudflareUid: uid, creatorId, creatorName: user.displayName || user.username || user.piUsername || "Creator", title, description, category, visibility, fileName, fileSize, rightsConfirmed: true, rightsConfirmedAt: now, processingStatus: "awaiting_upload", moderationStatus: "pending", playbackAllowed: false, createdAt: now, updatedAt: now };
      const result = await req.app.locals.streamContentCollection.insertOne(record);
      return res.status(201).json({ upload: { id: String(result.insertedId), uid, uploadURL, expiresAt: expiry, status: record.processingStatus } });
    } catch (error) {
      console.error("Failed to create Stream upload:", error);
      const message = axios.isAxiosError(error) ? String(error.response?.data?.errors?.[0]?.message || error.message) : error instanceof Error ? error.message : "Unable to create upload";
      return res.status(502).json({ error: "upload_session_failed", message });
    }
  });

  router.post("/creator/videos/:uid/complete", async (req, res) => {
    const user = await requireCreator(req, res); if (!user) return;
    const uid = String(req.params.uid || "");
    const result = await req.app.locals.streamContentCollection.updateOne({ cloudflareUid: uid, creatorId: String(user._id) }, { $set: { processingStatus: "processing", updatedAt: new Date() } });
    if (!result.matchedCount) return res.status(404).json({ error: "not_found", message: "Video upload record not found." });
    return res.json({ uid, status: "processing", moderationStatus: "pending" });
  });

  router.get("/creator/videos", async (req, res) => {
    const user = await requireCreator(req, res); if (!user) return;
    const videos = await req.app.locals.streamContentCollection.find({ creatorId: String(user._id) }).sort({ createdAt: -1 }).limit(100).toArray();
    return res.json({ videos: videos.map((video: Record<string, unknown>) => ({ ...video, _id: String(video._id) })) });
  });

  router.get("/creator/videos/:uid/status", async (req, res) => {
    try {
      const user = await requireCreator(req, res); if (!user) return;
      const uid = String(req.params.uid || "");
      const video = await req.app.locals.streamContentCollection.findOne({ cloudflareUid: uid, creatorId: String(user._id) });
      if (!video) return res.status(404).json({ error: "not_found", message: "Video not found." });
      if (!env.cloudflare_stream_account_id || !env.cloudflare_stream_api_token) return res.json({ video });
      const response = await axios.get<{ success: boolean; result?: { readyToStream?: boolean; status?: { state?: string; errorReasonText?: string }; playback?: { hls?: string; dash?: string }; thumbnail?: string; duration?: number } }>(`https://api.cloudflare.com/client/v4/accounts/${env.cloudflare_stream_account_id}/stream/${uid}`, { headers: { Authorization: `Bearer ${env.cloudflare_stream_api_token}` }, timeout: 12_000 });
      const remote = response.data.result;
      const processingStatus = remote?.readyToStream ? "ready" : remote?.status?.state || "processing";
      await req.app.locals.streamContentCollection.updateOne({ cloudflareUid: uid }, { $set: { processingStatus, playback: remote?.playback || null, thumbnailUrl: remote?.thumbnail || null, duration: remote?.duration || null, processingError: remote?.status?.errorReasonText || null, updatedAt: new Date() } });
      return res.json({ video: { ...video, processingStatus, playback: remote?.playback || null, thumbnailUrl: remote?.thumbnail || null, duration: remote?.duration || null } });
    } catch (error) {
      return res.status(502).json({ error: "status_failed", message: error instanceof Error ? error.message : "Unable to refresh video status" });
    }
  });

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
