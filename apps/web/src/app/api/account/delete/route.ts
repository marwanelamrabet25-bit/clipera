import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { apiError, apiUser, readJson } from "@/lib/api";
import { s3, storageConfig } from "@/lib/storage";

const CONFIRMATION_WORD = "SUPPRIMER";

/** Supprime tous les objets d'un préfixe (par lots de 1000, limite S3). Renvoie le nombre supprimé. */
async function deletePrefix(prefix: string) {
  const { client, bucket } = s3();
  let deleted = 0;
  let token: string | undefined;
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }));
    const keys = (page.Contents ?? []).map((o) => ({ Key: o.Key! }));
    if (keys.length) {
      const res = await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys, Quiet: true } }));
      if (res.Errors?.length) throw new Error(`delete errors: ${res.Errors.length}`);
      deleted += keys.length;
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return deleted;
}

/** Suppression définitive du compte : fichiers d'abord, puis données (cascade en base), puis déconnexion. */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth) return apiError(401, "not_authenticated", "Session expirée. Reconnecte-toi.");
  const body = await readJson<{ confirmation?: unknown }>(request);
  if (body?.confirmation !== CONFIRMATION_WORD) {
    return apiError(400, "confirmation_required", `Tape ${CONFIRMATION_WORD} pour confirmer.`);
  }

  if (storageConfig()) {
    try {
      // Les clés sont toujours préfixées par l'identifiant du propriétaire (contrainte SQL).
      for (const prefix of [`sources/${auth.userId}/`, `clips/${auth.userId}/`]) await deletePrefix(prefix);
    } catch (e) {
      console.error(JSON.stringify({ event: "account_delete_storage_failed", error: String(e) }));
      return apiError(502, "storage_error", "La suppression de tes fichiers a échoué. Ton compte n'a pas été supprimé : réessaie.");
    }
  }

  const { error } = await auth.supabase.rpc("delete_my_account");
  if (error) {
    console.error(JSON.stringify({ event: "account_delete_failed", error: error.message }));
    return apiError(500, "delete_failed", "La suppression a échoué. Réessaie ou contacte-nous.");
  }
  await auth.supabase.auth.signOut().catch(() => {});
  return NextResponse.json({ ok: true });
}
