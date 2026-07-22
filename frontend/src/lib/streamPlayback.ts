import { axiosClient } from "./axiosClient";

export type StreamPlaybackVideo = {
  id: string;
  sourceType: "hls" | "youtube";
  playbackUrl?: string;
  youtubeVideoId?: string;
  title: string;
  description?: string;
  creatorName?: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
};

export type StreamWatchProgress = { videoId: string; title: string; thumbnailUrl: string | null; position: number; duration: number; completed: boolean; updatedAt: string };

export const getStreamPlayback = async (id: string) => (await axiosClient.get<{ video: StreamPlaybackVideo }>(`/stream/playback/${encodeURIComponent(id)}`)).data.video;
export const getStreamProgress = async (id: string) => (await axiosClient.get<{ progress: StreamWatchProgress | null }>(`/stream/progress/${encodeURIComponent(id)}`)).data.progress;
export const saveStreamProgress = async (id: string, progress: Pick<StreamWatchProgress, "title" | "thumbnailUrl" | "position" | "duration" | "completed">) => (await axiosClient.put<{ progress: StreamWatchProgress }>(`/stream/progress/${encodeURIComponent(id)}`, progress)).data.progress;
export const getStreamWatchHistory = async () => (await axiosClient.get<{ items: StreamWatchProgress[] }>("/stream/watch-history")).data.items;
