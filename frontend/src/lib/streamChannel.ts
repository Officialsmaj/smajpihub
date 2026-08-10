import { axiosClient } from "./axiosClient";

export type PublicChannelVideo = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string | null;
  youtubeVideoId?: string;
  cloudflareUid: string;
  contentSource?: string;
  createdAt?: string;
};
export type PublicChannelLive = {
  liveInputUid: string;
  title: string;
  thumbnailUrl?: string | null;
  processingStatus?: string;
};
export type PublicStreamChannel = {
  channel: { name: string; handle: string; description: string; avatarUrl: string; bannerUrl: string };
  videos: PublicChannelVideo[];
  live: PublicChannelLive[];
};
export type StreamSubscription = {
  creatorId: string;
  subscribedAt: string | null;
  channel: { name: string; handle: string; avatarUrl: string };
  videos: Array<PublicChannelVideo & { contentType?: string; liveInputUid?: string; processingStatus?: string }>;
};
export type StreamCreatorDirectoryItem = {
  creatorId: string;
  channel: { name: string; handle: string; description: string; avatarUrl: string; bannerUrl: string };
  stats: { videos: number; live: number; latestAt: string | null };
  latestVideos: PublicChannelVideo[];
};

export const getPublicStreamChannel = async (handle: string) =>
  (await axiosClient.get<PublicStreamChannel>(`/stream/channels/${encodeURIComponent(handle)}`)).data;
export const getStreamCreators = async () =>
  (await axiosClient.get<{ creators: StreamCreatorDirectoryItem[] }>("/stream/creators")).data.creators;
export const getStreamSubscriptions = async () =>
  (await axiosClient.get<{ channels: StreamSubscription[] }>("/stream/subscriptions")).data.channels;
export const getStreamSubscriptionStatus = async (handle: string) =>
  (await axiosClient.get<{ subscribed: boolean }>(`/stream/subscriptions/${encodeURIComponent(handle)}/status`)).data
    .subscribed;
export const subscribeToStreamChannel = async (handle: string) =>
  (await axiosClient.post<{ subscribed: true }>(`/stream/subscriptions/${encodeURIComponent(handle)}`)).data;
export const unsubscribeFromStreamChannel = async (handle: string) =>
  (await axiosClient.delete<{ subscribed: false }>(`/stream/subscriptions/${encodeURIComponent(handle)}`)).data;
