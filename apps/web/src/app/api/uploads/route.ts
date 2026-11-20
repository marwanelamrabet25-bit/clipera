import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { apiError, apiUser, readJson, sqlError } from "@/lib/api";
import { contentTypeFor, PART_SIZE, s3, storageConfig } from "@/lib/storage";

type Body = { filename?: unknown; size?: unknown; rightsConfirmed?: unknown };

/** Étape 1 : réserve l'envoi (contrôles en base) et ouvre un envoi multipart dans le stockage. */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth) return apiError(401, "not_authenticated", "Session expirée. Reconnecte-toi.");
  if (!storageConfig()) return apiError(503, "storage_not_configured", "L'import de vidéos n'est pas encore activé.");

  const body = await readJson<Body>(request);
  const filename = typeof body?.filename === "string" ? body.filename.trim() : "";
  const size = typeof body?.size === "number" && Number.isSafeInteger(body.size) ? body.size : -1;
  if (!filename || size <= 0) return apiError(400, "invalid_request", "Requête invalide.");

  const { data, error } = await auth.supabase.rpc("create_upload", {
    p_filename: filename,
    p_size_bytes: size,
    p_rights_confirmed: body?.rightsConfirmed === true,
  });
  if (error || !data?.[0]) return sqlError(error?.message);
  const { source_video_id, project_id, storage_key } = data[0];

  try {
    const { client, bucket } = s3();
    const res = await client.send(
      new CreateMultipartUploadCommand({ Bucket: bucket, Key: storage_key, ContentType: contentTypeFor(storage_key) }),
    );
    if (!res.UploadId) throw new Error("no upload id");
    return NextResponse.json({
      sourceVideoId: source_video_id,
      projectId: project_id,
      uploadId: res.UploadId,
      partSize: PART_SIZE,
      partCount: Math.ceil(size / PART_SIZE),
    });
  } catch (e) {
    console.error(JSON.stringify({ event: "upload_init_failed", sourceVideoId: source_video_id, error: String(e) }));
    await auth.supabase.rpc("abort_upload", { p_source_video_id: source_video_id });
    return apiError(502, "storage_error", "Le stockage est momentanément indisponible. Réessaie.");
  }
}
