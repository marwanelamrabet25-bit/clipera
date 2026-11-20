import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { apiError, apiUser, ownedPendingVideo, readJson } from "@/lib/api";
import { PRESIGN_SECONDS, s3 } from "@/lib/storage";

type Body = { uploadId?: unknown; partNumbers?: unknown };

/** Étape 2 : URLs signées (1 h) pour envoyer chaque morceau directement au stockage. */
export async function POST(request: Request, ctx: RouteContext<"/api/uploads/[id]/parts">) {
  const auth = await apiUser();
  if (!auth) return apiError(401, "not_authenticated", "Session expirée. Reconnecte-toi.");
  const { id } = await ctx.params;
  const video = await ownedPendingVideo(auth.supabase, id, auth.userId);
  if (!video) return apiError(404, "upload_not_found", "Envoi introuvable ou déjà terminé.");

  const body = await readJson<Body>(request);
  const uploadId = typeof body?.uploadId === "string" ? body.uploadId : "";
  const parts = Array.isArray(body?.partNumbers) ? body.partNumbers : [];
  const valid = parts.every((n) => Number.isInteger(n) && n >= 1 && n <= 10000);
  if (!uploadId || parts.length === 0 || parts.length > 50 || !valid) {
    return apiError(400, "invalid_request", "Requête invalide.");
  }

  const { client, bucket } = s3();
  const urls: Record<number, string> = {};
  for (const n of parts as number[]) {
    urls[n] = await getSignedUrl(
      client,
      new UploadPartCommand({ Bucket: bucket, Key: video.storage_key, UploadId: uploadId, PartNumber: n }),
      { expiresIn: PRESIGN_SECONDS },
    );
  }
  return NextResponse.json({ urls });
}
