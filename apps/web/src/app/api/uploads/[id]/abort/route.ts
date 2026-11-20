import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { apiError, apiUser, ownedPendingVideo, readJson } from "@/lib/api";
import { s3 } from "@/lib/storage";

/** Annulation : libère les morceaux déjà envoyés et masque le projet. */
export async function POST(request: Request, ctx: RouteContext<"/api/uploads/[id]/abort">) {
  const auth = await apiUser();
  if (!auth) return apiError(401, "not_authenticated", "Session expirée. Reconnecte-toi.");
  const { id } = await ctx.params;
  const video = await ownedPendingVideo(auth.supabase, id, auth.userId);
  if (!video) return NextResponse.json({ ok: true });
  const body = await readJson<{ uploadId?: unknown }>(request);
  if (typeof body?.uploadId === "string" && body.uploadId) {
    const { client, bucket } = s3();
    await client
      .send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: video.storage_key, UploadId: body.uploadId }))
      .catch(() => {});
  }
  await auth.supabase.rpc("abort_upload", { p_source_video_id: id });
  return NextResponse.json({ ok: true });
}
