import { NextResponse } from "next/server";
import { apiError, apiUser, readJson } from "@/lib/api";
import { storageConfig } from "@/lib/storage";
import { deletePrefix } from "@/lib/storage-admin";

const CONFIRMATION_WORD = "SUPPRIMER";

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
