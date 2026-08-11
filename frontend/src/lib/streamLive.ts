import { axiosClient } from "./axiosClient";

export type CreatorLiveInput = { liveInputUid: string; title: string; chatMode: string; visibility: string; moderationStatus: string; playbackAllowed: boolean; processingStatus: string; createdAt: string };
export type LiveCredentials = { rtmpsUrl: string; streamKey: string; srtUrl?: string | null; srtStreamId?: string | null };
export type PublishedLiveInput = Pick<CreatorLiveInput, "liveInputUid" | "title" | "processingStatus" | "chatMode"> & { creatorName?: string; thumbnailUrl?: string | null; contentSource?: "cloudflare" | "youtube"; youtubeVideoId?: string; youtubeChannelId?: string; publishedAt?: string | null };
export const publishedLivePlaybackPath = (item: PublishedLiveInput) =>
  item.contentSource === "youtube" && item.youtubeVideoId
    ? `/app/services/stream/watch/yt-${item.youtubeVideoId}`
    : `/app/services/stream/live/${item.liveInputUid}`;

export const createLiveInput = async (body: { title: string; chatMode: string }) => (await axiosClient.post<{ live: CreatorLiveInput & { credentials: LiveCredentials } }>("/stream/creator/live-inputs", body)).data.live;
export const getCreatorLiveInputs = async () => (await axiosClient.get<{ live: CreatorLiveInput[] }>("/stream/creator/live-inputs")).data.live;
export const getLiveInputStatus = async (uid: string) => (await axiosClient.get<{ status: "idle" | "live"; activeVideoUid?: string | null; preview?: string | null }>(`/stream/creator/live-inputs/${encodeURIComponent(uid)}/status`)).data;
export const getLivePlayback = async (uid: string) => (await axiosClient.get<{ live: { id: string; title: string; creatorName: string; chatMode: string; playbackUrl: string; thumbnailUrl?: string | null } }>(`/stream/live/${encodeURIComponent(uid)}/playback`)).data.live;
export const getPublishedLiveInputs = async () => (await axiosClient.get<{ live: PublishedLiveInput[] }>("/stream/live-content")).data.live;
