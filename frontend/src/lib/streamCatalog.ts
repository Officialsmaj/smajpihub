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

export const getStreamCatalog = async (kind: "trending" | "movies" | "series", page = 1) => {
  const response = await axiosClient.get<CatalogResponse>(`/stream/${kind}`, { params: { page } });
  return response.data;
};

export const searchStreamCatalog = async (query: string, page = 1) => {
  const response = await axiosClient.get<CatalogResponse>("/stream/search", { params: { q: query, page } });
  return response.data;
};

export const getStreamTitle = async (type: "movie" | "tv", id: string) => {
  const response = await axiosClient.get<StreamCatalogTitle & { genres: Array<{ id: number; name: string }>; runtime: number | null; raw: unknown }>(`/stream/${type}/${id}`);
  return response.data;
};
