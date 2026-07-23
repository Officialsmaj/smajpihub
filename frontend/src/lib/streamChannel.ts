import { axiosClient } from "./axiosClient";

export type PublicChannelVideo = { _id: string; title: string; description?: string; category?: string; thumbnailUrl?: string | null; youtubeVideoId?: string; cloudflareUid: string; contentSource?: string; createdAt?: string };
export type PublicChannelLive = { liveInputUid: string; title: string; thumbnailUrl?: string | null; processingStatus?: string };
export type PublicStreamChannel = { channel: { name: string; handle: string; description: string; avatarUrl: string; bannerUrl: string }; videos: PublicChannelVideo[]; live: PublicChannelLive[] };

export const getPublicStreamChannel = async (handle: string) => (await axiosClient.get<PublicStreamChannel>(`/stream/channels/${encodeURIComponent(handle)}`)).data;
