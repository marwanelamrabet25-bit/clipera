import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { apiError, apiUser, ownedPendingVideo, readJson, sqlError } from "@/lib/api";
import { s3 } from "@/lib/storage";

type Body = { uploadId?: unknown; parts?: unknown };
type Part = { partNumber: number; etag: string };

function isPart(p: unknown): p is Part {
  const o = p as Part;
  return Boolean(o) && Number.isInteger(o.partNumber) && o.partNumber >= 1 && typeof o.etag === "string" && o.etag.length < 200;
}

/** Étape 3 : assemble les morceaux, vérifie le fichier obtenu, puis lance la vérification par le worker. */
export async function POST(request: Request, ctx: RouteContext<"/api/uploads/[id]/complete">) {
  const auth = await apiUser();
  if (!auth) return apiError(401, "not_authenticated", "Session expirée. Reconnecte-toi.");
  const { id } = await ctx.params;
  const video = await ownedPendingVideo(auth.supabase, id, auth.userId);
  if (!video) return apiError(404, "upload_not_found", "Envoi introuvable ou déjà terminé.");

  const body = await readJson<Body>(request);
  const uploadId = typeof body?.uploadId === "string" ? body.uploadId : "";
  const parts = Array.isArray(body?.parts) ? body.parts : [];
  if (!uploadId || parts.length === 0 || parts.length > 10000 || !parts.every(isPart)) {
    return apiError(400, "invalid_request", "Requête invalide.");
  }

  const { client, bucket } = s3();
  const Key = video.storage_key;
  try {
    await client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: [...parts].sort((a, b) => a.partNumber - b.partNumber).map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
        },
      }),
    );
  } catch (e) {
    console.error(JSON.stringify({ event: "upload_complete_failed", sourceVideoId: id, error: String(e) }));
    return apiError(502, "storage_error", "L'assemblage du fichier a échoué. Réessaie l'envoi.");
  }

  // Le fichier stocké doit faire exactement la taille annoncée (sinon : envoi corrompu ou contournement du quota).
  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key })).catch(() => null);
  if (!head || head.ContentLength !== video.declared_size_bytes) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key })).catch(() => {});
    await client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key, UploadId: uploadId })).catch(() => {});
    await auth.supabase.rpc("abort_upload", { p_source_video_id: id });
    return apiError(400, "size_mismatch", "Le fichier reçu est incomplet. Recommence l'envoi.");
  }

  const { data, error } = await auth.supabase.rpc("complete_upload", { p_source_video_id: id });
  if (error || !data) return sqlError(error?.message);
  return NextResponse.json({ projectId: video.project_id, jobId: data.id });
}
