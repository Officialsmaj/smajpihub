import { axiosClient } from "./axiosClient";

export type StreamCatalogTitle = {
  id: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  rating: number | null;
  voteCount: number;
  genreIds: number[];
};

type CatalogResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results: StreamCatalogTitle[];
  source: "TMDB";
};

export const getStreamCatalog = async (kind: "trending" | "movies" | "series", page = 1, sort?: string, genre?: number) => {
  const response = await axiosClient.get<CatalogResponse>(`/stream/${kind}`, { params: { page, sort, genre } });
  return response.data;
};

export const searchStreamCatalog = async (query: string, page = 1) => {
  const response = await axiosClient.get<CatalogResponse>("/stream/search", { params: { q: query, page } });
  return response.data;
};

export const getStreamCategory = async (slug: string, page = 1, sort = "popularity.desc", genre?: number) => {
  const response = await axiosClient.get<CatalogResponse & { category: { slug: string; title: string; mediaType: "movie" | "tv" } }>(`/stream/category/${encodeURIComponent(slug)}`, { params: { page, sort, genre } });
  return response.data;
};

export const getStreamTitle = async (type: "movie" | "tv", id: string) => {
  const response = await axiosClient.get<StreamCatalogTitle & { genres: Array<{ id: number; name: string }>; runtime: number | null; raw: unknown }>(`/stream/${type}/${id}`);
  return response.data;
};

export type StreamWatchProvider = { provider_id: number; provider_name: string; logo_path: string | null };
export type StreamWatchRegion = { link?: string; flatrate?: StreamWatchProvider[]; rent?: StreamWatchProvider[]; buy?: StreamWatchProvider[]; free?: StreamWatchProvider[]; ads?: StreamWatchProvider[] };

export const getStreamWatchProviders = async (type: "movie" | "tv", id: string) => {
  const response = await axiosClient.get<{ results: Record<string, StreamWatchRegion> }>(`/stream/${type}/${id}/providers`);
  return response.data.results;
};

export const getStreamMyList = async () => {
  const response = await axiosClient.get<{ items: StreamCatalogTitle[] }>("/stream/my-list");
  return response.data.items;
};

export const getStreamMyListStatus = async (type: "movie" | "tv", id: string) => {
  const response = await axiosClient.get<{ saved: boolean }>(`/stream/my-list/${type}/${id}`);
  return response.data.saved;
};

export const saveStreamTitle = async (title: StreamCatalogTitle) => {
  const response = await axiosClient.post<{ saved: true }>("/stream/my-list", title);
  return response.data;
};

export const removeStreamTitle = async (type: "movie" | "tv", id: string) => {
  const response = await axiosClient.delete<{ saved: false }>(`/stream/my-list/${type}/${id}`);
  return response.data;
};
