import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import env from '../environments';

const configured = () => Boolean(
  env.cloudflare_r2_account_id
  && env.cloudflare_r2_access_key_id
  && env.cloudflare_r2_secret_access_key,
);

let client: S3Client | null = null;

const r2 = () => {
  if (!configured()) throw new Error('Cloudflare R2 is not configured.');
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.cloudflare_r2_account_id}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.cloudflare_r2_access_key_id,
        secretAccessKey: env.cloudflare_r2_secret_access_key,
      },
    });
  }
  return client;
};

export const streamR2Configured = configured;
export const streamMovieKey = (tmdbId: number) => `movies/${tmdbId}/movie.mp4`;

export const createMovieMultipartUpload = async (key: string) => {
  const result = await r2().send(new CreateMultipartUploadCommand({
    Bucket: env.cloudflare_r2_bucket,
    Key: key,
    ContentType: 'video/mp4',
    CacheControl: 'private, max-age=0',
    Metadata: { source: 'smaj-stream-admin' },
  }));
  if (!result.UploadId) throw new Error('R2 did not create a multipart upload.');
  return result.UploadId;
};

export const signMovieUploadPart = (key: string, uploadId: string, partNumber: number) =>
  getSignedUrl(r2(), new UploadPartCommand({
    Bucket: env.cloudflare_r2_bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  }), { expiresIn: 15 * 60 });

export const completeMovieMultipartUpload = async (
  key: string,
  uploadId: string,
  parts: Array<{ PartNumber: number; ETag: string }>,
) => {
  await r2().send(new CompleteMultipartUploadCommand({
    Bucket: env.cloudflare_r2_bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  }));
  return r2().send(new HeadObjectCommand({ Bucket: env.cloudflare_r2_bucket, Key: key }));
};

export const abortMovieMultipartUpload = (key: string, uploadId: string) =>
  r2().send(new AbortMultipartUploadCommand({
    Bucket: env.cloudflare_r2_bucket,
    Key: key,
    UploadId: uploadId,
  }));

export const signMoviePlayback = (key: string) =>
  getSignedUrl(r2(), new GetObjectCommand({
    Bucket: env.cloudflare_r2_bucket,
    Key: key,
    ResponseContentType: 'video/mp4',
    ResponseContentDisposition: 'inline',
  }), { expiresIn: 60 * 60 });

export const privateMovieUrl = (key: string) => `r2://${env.cloudflare_r2_bucket}/${key}`;
