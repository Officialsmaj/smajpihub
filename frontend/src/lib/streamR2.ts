import { axiosClient } from './axiosClient';

type R2UploadStart = { uploadId: string; key: string; partSize: number; totalParts: number };

const uploadPart = (url: string, blob: Blob, onProgress: (loaded: number) => void) => new Promise<string>((resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open('PUT', url);
  request.upload.onprogress = event => onProgress(event.loaded);
  request.onerror = () => reject(new Error('The R2 upload connection failed.'));
  request.onload = () => {
    if (request.status < 200 || request.status >= 300) return reject(new Error(`R2 rejected upload part (${request.status}).`));
    const etag = request.getResponseHeader('ETag');
    if (!etag) return reject(new Error('R2 did not expose ETag. Add ETag to the bucket CORS ExposeHeaders list.'));
    resolve(etag);
  };
  request.send(blob);
});

export const uploadR2Movie = async (tmdbId: number, file: File, onProgress: (percent: number) => void) => {
  const start = (await axiosClient.post<R2UploadStart>('/stream/admin/r2/movies/upload/start', { tmdbId, fileSize: file.size, contentType: file.type || 'video/mp4' })).data;
  const parts: Array<{ partNumber: number; etag: string }> = [];
  let completedBytes = 0;
  try {
    for (let partNumber = 1; partNumber <= start.totalParts; partNumber += 1) {
      const begin = (partNumber - 1) * start.partSize;
      const end = Math.min(begin + start.partSize, file.size);
      const blob = file.slice(begin, end);
      const signed = (await axiosClient.post<{ url: string }>('/stream/admin/r2/movies/upload/part-url', { tmdbId, uploadId: start.uploadId, partNumber })).data;
      const etag = await uploadPart(signed.url, blob, loaded => onProgress(Math.min(99, Math.round(((completedBytes + loaded) / file.size) * 100))));
      parts.push({ partNumber, etag });
      completedBytes += blob.size;
    }
    const result = (await axiosClient.post('/stream/admin/r2/movies/upload/complete', { tmdbId, uploadId: start.uploadId, parts })).data;
    onProgress(100);
    return result;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'The R2 movie upload failed.';
    await axiosClient.post('/stream/admin/r2/movies/upload/abort', { tmdbId, uploadId: start.uploadId, reason }).catch(() => undefined);
    throw error;
  }
};
