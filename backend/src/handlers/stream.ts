import type { Request, Response, Router } from "express";
import axios from "axios";
import env from "../environments";
import { resolveCurrentUser } from "../services/auth";

const TMDB_API_URL = "https://api.themoviedb.org/3";
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; value: unknown }>();

const youtubeVideoId = (input: string) => {
  try {
    const value = input.trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const candidate = host === "youtu.be" ? url.pathname.split("/").filter(Boolean)[0]
      : host.endsWith("youtube.com") ? (url.searchParams.get("v") || (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : "")) : "";
    return candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
  } catch { return null; }
};

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

  const requireViewer = async (req: Request, res: Response) => {
    const user = await resolveCurrentUser(req);
    if (!user) { res.status(401).json({ error: "authentication_required", message: "Sign in to manage My List." }); return null; }
    if (!req.app.locals.userCollection) { res.status(503).json({ error: "service_unavailable", message: "User storage is not ready." }); return null; }
    return user;
  };

  router.get("/my-list", async (req, res) => {
    const user = await requireViewer(req, res); if (!user) return;
    const stored = await req.app.locals.userCollection.findOne({ _id: user._id });
    return res.json({ items: Array.isArray(stored?.streamMyList) ? stored.streamMyList : [] });
  });

  router.get("/my-list/:type(movie|tv)/:id", async (req, res) => {
    const user = await requireViewer(req, res); if (!user) return;
    const tmdbId = Number(req.params.id);
    const stored = await req.app.locals.userCollection.findOne({ _id: user._id, streamMyList: { $elemMatch: { tmdbId, mediaType: req.params.type } } });
    return res.json({ saved: Boolean(stored) });
  });

  router.post("/my-list", async (req, res) => {
    const user = await requireViewer(req, res); if (!user) return;
    const tmdbId = Number(req.body?.tmdbId);
    const mediaType = req.body?.mediaType === "tv" ? "tv" : req.body?.mediaType === "movie" ? "movie" : null;
    const title = String(req.body?.title || "").trim().slice(0, 180);
    if (!Number.isInteger(tmdbId) || tmdbId <= 0 || !mediaType || !title) return res.status(400).json({ error: "bad_request", message: "A valid TMDB title is required." });
    const item = { tmdbId, id: String(tmdbId), mediaType, title, overview: String(req.body?.overview || "").slice(0, 1200), posterUrl: req.body?.posterUrl ? String(req.body.posterUrl).slice(0, 500) : null, backdropUrl: req.body?.backdropUrl ? String(req.body.backdropUrl).slice(0, 500) : null, releaseDate: req.body?.releaseDate ? String(req.body.releaseDate).slice(0, 20) : null, rating: Number.isFinite(Number(req.body?.rating)) ? Number(req.body.rating) : null, savedAt: new Date() };
    await req.app.locals.userCollection.updateOne({ _id: user._id }, { $pull: { streamMyList: { tmdbId, mediaType } } });
    await req.app.locals.userCollection.updateOne({ _id: user._id }, { $addToSet: { streamMyList: item } });
    return res.status(201).json({ saved: true, item });
  });

  router.delete("/my-list/:type(movie|tv)/:id", async (req, res) => {
    const user = await requireViewer(req, res); if (!user) return;
    await req.app.locals.userCollection.updateOne({ _id: user._id }, { $pull: { streamMyList: { tmdbId: Number(req.params.id), mediaType: req.params.type } } });
    return res.json({ saved: false });
  });

  const streamProfileCompletion = (profile: Record<string, unknown>) => {
    let value = 0;
    if (profile.avatarUrl) value += 15;
    if (profile.displayName) value += 10;
    if (profile.country) value += 10;
    if (profile.language) value += 10;
    if (Array.isArray(profile.favoriteGenres) && profile.favoriteGenres.length >= 3) value += 15;
    if (profile.maturityLevel) value += 10;
    if (profile.videoQuality) value += 10;
    if (typeof profile.showActivity === "boolean") value += 10;
    if (typeof profile.emailNotifications === "boolean") value += 10;
    return value;
  };

  router.get("/profile", async (req, res) => {
    const user = await requireViewer(req, res); if (!user) return;
    const stored = await req.app.locals.userCollection.findOne({ _id: user._id });
    const profile = { displayName: stored?.streamProfile?.displayName || stored?.displayName || stored?.username || stored?.piUsername || "", avatarUrl: stored?.streamProfile?.avatarUrl || stored?.avatarUrl || "", country: stored?.streamProfile?.country || stored?.country || "", language: stored?.streamProfile?.language || "en", subtitleLanguage: stored?.streamProfile?.subtitleLanguage || "en", favoriteGenres: stored?.streamProfile?.favoriteGenres || [], preferredRegions: stored?.streamProfile?.preferredRegions || [], maturityLevel: stored?.streamProfile?.maturityLevel || "16", videoQuality: stored?.streamProfile?.videoQuality || "auto", autoplay: stored?.streamProfile?.autoplay ?? true, dataSaver: stored?.streamProfile?.dataSaver ?? false, showActivity: stored?.streamProfile?.showActivity ?? false, emailNotifications: stored?.streamProfile?.emailNotifications ?? false };
    return res.json({ profile, completion: streamProfileCompletion(profile), username: stored?.piUsername || stored?.username || "" });
  });

  router.put("/profile", async (req, res) => {
    const user = await requireViewer(req, res); if (!user) return;
    const genres = ["action", "anime", "comedy", "documentary", "drama", "family", "horror", "music", "romance", "sports", "thriller"];
    const regions = ["african", "bollywood", "chinese", "hollywood", "k-drama", "kannywood", "nollywood"];
    const avatarUrl = String(req.body?.avatarUrl || "").trim().slice(0, 500);
    if (avatarUrl && !/^https:\/\//i.test(avatarUrl)) return res.status(400).json({ error: "invalid_avatar", message: "Avatar must use a secure HTTPS URL." });
    const profile = { displayName: String(req.body?.displayName || "").trim().slice(0, 80), avatarUrl, country: String(req.body?.country || "").trim().toUpperCase().slice(0, 2), language: String(req.body?.language || "en").trim().slice(0, 10), subtitleLanguage: String(req.body?.subtitleLanguage || "en").trim().slice(0, 10), favoriteGenres: Array.isArray(req.body?.favoriteGenres) ? [...new Set(req.body.favoriteGenres.map(String).filter((item: string) => genres.includes(item)))].slice(0, 8) : [], preferredRegions: Array.isArray(req.body?.preferredRegions) ? [...new Set(req.body.preferredRegions.map(String).filter((item: string) => regions.includes(item)))].slice(0, 7) : [], maturityLevel: ["kids", "13", "16", "18"].includes(req.body?.maturityLevel) ? req.body.maturityLevel : "16", videoQuality: ["auto", "data-saver", "hd", "full-hd"].includes(req.body?.videoQuality) ? req.body.videoQuality : "auto", autoplay: req.body?.autoplay === true, dataSaver: req.body?.dataSaver === true, showActivity: req.body?.showActivity === true, emailNotifications: req.body?.emailNotifications === true, updatedAt: new Date() };
    if (profile.displayName.length < 2) return res.status(400).json({ error: "invalid_name", message: "Display name must contain at least two characters." });
    await req.app.locals.userCollection.updateOne({ _id: user._id }, { $set: { streamProfile: profile } });
    return res.json({ profile, completion: streamProfileCompletion(profile) });
  });

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

  router.post("/creator/youtube", async (req, res) => {
    try {
      const user = await requireCreator(req, res); if (!user) return;
      const videoId = youtubeVideoId(String(req.body?.youtubeUrl || ""));
      const title = String(req.body?.title || "").trim().slice(0, 140);
      const description = String(req.body?.description || "").trim().slice(0, 3000);
      const category = String(req.body?.category || "Entertainment").trim().slice(0, 60);
      const visibility = ["public", "unlisted", "private"].includes(req.body?.visibility) ? req.body.visibility : "private";
      if (!videoId) return res.status(400).json({ error: "invalid_youtube_url", message: "Enter a valid YouTube video, Short or embed URL." });
      if (!title || description.length < 20) return res.status(400).json({ error: "bad_request", message: "Add a title and a description of at least 20 characters." });
      if (req.body?.rightsConfirmed !== true) return res.status(400).json({ error: "rights_required", message: "Confirm that you own the video or have permission to publish it here." });
      const creatorId = String(user._id);
      const existing = await req.app.locals.streamContentCollection.findOne({ creatorId, youtubeVideoId: videoId });
      if (existing) return res.status(409).json({ error: "already_submitted", message: "This YouTube video is already in your content manager." });
      const now = new Date();
      const record = { cloudflareUid: `youtube-${creatorId}-${videoId}`, contentSource: "youtube", youtubeVideoId: videoId, creatorId, creatorName: user.displayName || user.username || user.piUsername || "Creator", title, description, category, visibility, rightsConfirmed: true, rightsConfirmedAt: now, processingStatus: "ready", moderationStatus: "pending", playbackAllowed: false, thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, createdAt: now, updatedAt: now };
      const result = await req.app.locals.streamContentCollection.insertOne(record);
      return res.status(201).json({ video: { ...record, _id: String(result.insertedId) } });
    } catch (error) {
      return res.status(500).json({ error: "youtube_publish_failed", message: error instanceof Error ? error.message : "Unable to publish YouTube video" });
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

  router.get("/creator-content", async (req, res) => {
    if (!req.app.locals.streamContentCollection) return res.json({ videos: [] });
    const videos = await req.app.locals.streamContentCollection.find({ visibility: "public", moderationStatus: "approved", playbackAllowed: true }).sort({ createdAt: -1 }).limit(20).toArray();
    return res.json({ videos: videos.map((video: Record<string, unknown>) => ({ _id: String(video._id), title: video.title, creatorName: video.creatorName, category: video.category, thumbnailUrl: video.thumbnailUrl, youtubeVideoId: video.youtubeVideoId, cloudflareUid: video.cloudflareUid, contentSource: video.contentSource, createdAt: video.createdAt })) });
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
      const data = await tmdbGet<{ page: number; total_pages: number; total_results: number; results: TmdbMedia[] }>(path, { page, language: String(req.query.language || "en-US"), include_adult: false, sort_by: req.query.sort ? String(req.query.sort) : undefined, with_genres: req.query.genre ? String(req.query.genre) : undefined });
      res.json({ ...data, results: data.results.filter((item) => item.media_type !== "person").map((item) => normalizeMedia(item, fallbackType)), source: "TMDB" });
    } catch (error) {
      const status = Number((error as { status?: number; response?: { status?: number } }).status || (error as { response?: { status?: number } }).response?.status || 502);
      res.status(status).json({ error: error instanceof Error ? error.message : "Unable to load entertainment catalogue" });
    }
  };

  router.get("/trending", list("/trending/all/week", "movie"));
  router.get("/movies", list("/discover/movie", "movie"));
  router.get("/series", list("/discover/tv", "tv"));
  const categoryDefinitions: Record<string, { title: string; type: "movie" | "tv"; params: Record<string, string | number | boolean> }> = {
    hollywood: { title: "Hollywood", type: "movie", params: { with_origin_country: "US", with_original_language: "en" } },
    bollywood: { title: "Bollywood", type: "movie", params: { with_origin_country: "IN", with_original_language: "hi" } },
    nollywood: { title: "Nollywood", type: "movie", params: { with_origin_country: "NG" } },
    kannywood: { title: "Kannywood", type: "movie", params: { with_origin_country: "NG", with_original_language: "ha" } },
    anime: { title: "Anime", type: "tv", params: { with_origin_country: "JP", with_original_language: "ja", with_genres: 16 } },
    "k-drama": { title: "K-Drama", type: "tv", params: { with_origin_country: "KR", with_original_language: "ko" } },
    "chinese-drama": { title: "Chinese Drama", type: "tv", params: { with_origin_country: "CN", with_original_language: "zh" } },
    "african-movies": { title: "African Movies", type: "movie", params: { with_origin_country: "NG|ZA|GH|KE" } },
    documentaries: { title: "Documentaries", type: "movie", params: { with_genres: 99 } },
    kids: { title: "Kids & Family", type: "movie", params: { with_genres: 10751 } },
    action: { title: "Action", type: "movie", params: { with_genres: 28 } },
    comedy: { title: "Comedy", type: "movie", params: { with_genres: 35 } },
    romance: { title: "Romance", type: "movie", params: { with_genres: 10749 } },
    horror: { title: "Horror", type: "movie", params: { with_genres: 27 } },
    sports: { title: "Sports", type: "tv", params: { with_genres: 10767 } },
  };
  router.get("/category/:slug", async (req, res) => {
    const definition = categoryDefinitions[String(req.params.slug || "").toLowerCase()];
    if (!definition) return res.status(404).json({ error: "category_not_found", message: "This Stream category is not available." });
    try {
      const page = Math.max(1, Math.min(100, Number(req.query.page) || 1));
      const data = await tmdbGet<{ page: number; total_pages: number; total_results: number; results: TmdbMedia[] }>(`/discover/${definition.type}`, { ...definition.params, page, language: String(req.query.language || "en-US"), include_adult: false, sort_by: String(req.query.sort || "popularity.desc"), with_genres: req.query.genre ? String(req.query.genre) : definition.params.with_genres });
      return res.json({ ...data, category: { slug: req.params.slug, title: definition.title, mediaType: definition.type }, results: data.results.map((item) => normalizeMedia(item, definition.type)), source: "TMDB" });
    } catch (error) {
      const status = Number((error as { response?: { status?: number } }).response?.status || 502);
      return res.status(status).json({ error: error instanceof Error ? error.message : "Unable to load category" });
    }
  });
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
      const data = await tmdbGet<TmdbMedia & { genres?: Array<{ id: number; name: string }>; runtime?: number; episode_run_time?: number[] }>(`/${type}/${id}`, { language: String(req.query.language || "en-US"), append_to_response: "videos,credits,recommendations,external_ids" });
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
