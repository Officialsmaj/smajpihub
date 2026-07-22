import { axiosClient } from "./axiosClient";

export type CreatorVideo = {
  _id: string;
  cloudflareUid: string;
  title: string;
  description: string;
  category: string;
  visibility: "public" | "unlisted" | "private";
  processingStatus: string;
  moderationStatus: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  contentSource?: "youtube" | "cloudflare";
  youtubeVideoId?: string;
};

export const publishCreatorYoutubeVideo = async (metadata: { youtubeUrl: string; title: string; description: string; category: string; visibility: string; rightsConfirmed: boolean }) => {
  const response = await axiosClient.post<{ video: CreatorVideo }>("/stream/creator/youtube", metadata);
  return response.data.video;
};

export const uploadCreatorVideo = async (file: File, metadata: { title: string; description: string; category: string; visibility: string; rightsConfirmed: boolean }, onProgress?: (progress: number) => void) => {
  const session = await axiosClient.post<{ upload: { uid: string; uploadURL: string } }>("/stream/creator/uploads", { ...metadata, fileName: file.name, fileSize: file.size, maxDurationSeconds: 3600 });
  const form = new FormData();
  form.append("file", file);
  await axiosClient.post(session.data.upload.uploadURL, form, {
    baseURL: "",
    withCredentials: false,
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30 * 60 * 1000,
    onUploadProgress: (event) => onProgress?.(event.total ? Math.round((event.loaded / event.total) * 100) : 0),
  });
  await axiosClient.post(`/stream/creator/videos/${session.data.upload.uid}/complete`);
  return session.data.upload;
};

export const getCreatorVideos = async () => {
  const response = await axiosClient.get<{ videos: CreatorVideo[] }>("/stream/creator/videos");
  return response.data.videos;
};

export const getPublishedCreatorVideos = async () => {
  const response = await axiosClient.get<{ videos: Array<Pick<CreatorVideo, "_id" | "title" | "thumbnailUrl" | "youtubeVideoId" | "contentSource"> & { creatorName?: string; category?: string }> }>("/stream/creator-content");
  return response.data.videos;
};
