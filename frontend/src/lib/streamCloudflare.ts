import { Upload } from "tus-js-client";
import { axiosClient } from "./axiosClient";

type CloudflareUploadSession = { uid: string; uploadURL: string; expiresAt: string };
export type CloudflareMovieStatus = { uid: string; ready: boolean; status: string; error?: string | null };

const uploadWithTus = (file: File, uploadURL: string, onProgress: (percent: number) => void) => new Promise<void>((resolve, reject) => {
  const upload = new Upload(file, {
    endpoint: uploadURL,
    chunkSize: 50 * 1024 * 1024,
    retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
    removeFingerprintOnSuccess: true,
    metadata: { filename: file.name, filetype: file.type || "video/mp4" },
    onError: error => reject(error),
    onProgress: (uploaded, total) => onProgress(total ? Math.round((uploaded / total) * 100) : 0),
    onSuccess: () => resolve(),
  });
  upload.start();
});

export const uploadCloudflareMovie = async (tmdbId: number, file: File, onProgress: (percent: number) => void) => {
  const session = (await axiosClient.post<CloudflareUploadSession>("/stream/admin/cloudflare/movies/upload/start", {
    tmdbId,
    fileName: file.name,
    fileSize: file.size,
    maxDurationSeconds: 14_400,
  })).data;
  await uploadWithTus(file, session.uploadURL, onProgress);
  onProgress(100);
  await axiosClient.post(`/stream/admin/cloudflare/movies/${encodeURIComponent(session.uid)}/complete`);
  return (await axiosClient.get<CloudflareMovieStatus>(`/stream/admin/cloudflare/movies/${encodeURIComponent(session.uid)}/status`)).data;
};
