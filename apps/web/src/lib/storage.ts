import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Stockage objet compatible S3 : Cloudflare R2 en production.
 * S3_ENDPOINT permet de pointer vers un faux S3 local pour les tests (jamais en production).
 */
export function storageConfig() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, S3_ENDPOINT } = process.env;
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || (!R2_ACCOUNT_ID && !S3_ENDPOINT)) return null;
  return {
    bucket: R2_BUCKET,
    endpoint: S3_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: Boolean(S3_ENDPOINT),
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  };
}

export function isStorageConfigured() {
  return storageConfig() !== null;
}

let client: S3Client | null = null;

export function s3() {
  const cfg = storageConfig();
  if (!cfg) throw new Error("storage_not_configured");
  client ??= new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    forcePathStyle: cfg.forcePathStyle,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
  return { client, bucket: cfg.bucket };
}

/** Taille des morceaux envoyés en parallèle (16 Mio) : 8 Go = 512 morceaux, bien sous la limite S3 de 10 000. */
export const PART_SIZE = 16 * 1024 * 1024;
export const PRESIGN_SECONDS = 60 * 60;

const CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  mkv: "video/x-matroska",
  webm: "video/webm",
};

export function contentTypeFor(key: string) {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}
