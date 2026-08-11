import { axiosClient } from "./axiosClient";

export type StreamReview = {
  _id: string;
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  posterUrl: string | null;
  rating: number;
  body: string;
  likes: number;
  comments: number;
  reviewer: { id: string; name: string; avatarUrl: string };
  createdAt: string;
  updatedAt: string;
};

export const getPopularStreamReviews = async (limit = 10) =>
  (await axiosClient.get<{ reviews: StreamReview[] }>("/stream/reviews/popular", { params: { limit } })).data.reviews;

export const getTitleStreamReviews = async (mediaType: "movie" | "tv", tmdbId: string | number) =>
  (await axiosClient.get<{ reviews: StreamReview[] }>(`/stream/reviews/title/${mediaType}/${tmdbId}`)).data.reviews;

export const saveTitleStreamReview = async (
  mediaType: "movie" | "tv",
  tmdbId: string | number,
  input: { title: string; posterUrl?: string | null; rating: number; body: string },
) => (await axiosClient.post<{ review: StreamReview }>(`/stream/reviews/title/${mediaType}/${tmdbId}`, input)).data.review;

export const toggleStreamReviewLike = async (reviewId: string) =>
  (await axiosClient.post<{ liked: boolean; likes: number }>(`/stream/reviews/${reviewId}/like`)).data;
