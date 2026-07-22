import { axiosClient } from "./axiosClient";
import type { CreatorVideo } from "./streamCreator";

export type ModerationVideo = CreatorVideo & { creatorName?: string; rightsConfirmed?: boolean; moderationReason?: string; playbackAllowed?: boolean; catalogAttachment?: { tmdbId: number; mediaType: "movie" | "tv"; title?: string } | null };

export const getModerationVideos = async (status = "all") => (await axiosClient.get<{ videos: ModerationVideo[] }>("/stream/admin/videos", { params: { status } })).data.videos;
export const updateModerationVideo = async (uid: string, body: Record<string, unknown>) => (await axiosClient.patch<{ video: ModerationVideo }>(`/stream/admin/videos/${encodeURIComponent(uid)}`, body)).data.video;
export const getTitleAvailability = async (type: "movie" | "tv", id: string) => (await axiosClient.get<{ available: boolean; playbackId?: string; title?: string }>(`/stream/availability/${type}/${id}`)).data;
