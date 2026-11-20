import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "./supabase/server";

export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Session vérifiée pour une route API (pas de redirection : réponse 401 en JSON). */
export async function apiUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  return sub ? { supabase, userId: sub } : null;
}

/** Messages utilisateur pour les erreurs levées par les fonctions SQL. */
const SQL_ERRORS: Record<string, [number, string]> = {
  rights_not_confirmed: [400, "Confirme que tu détiens les droits sur cette vidéo."],
  invalid_filename: [400, "Nom de fichier invalide."],
  unsupported_extension: [400, "Format non pris en charge. Utilise MP4, MOV, M4V, MKV ou WEBM."],
  invalid_size: [400, "Fichier vide ou taille invalide."],
  file_too_large: [413, "Fichier trop volumineux pour ton offre."],
  quota_videos_exceeded: [402, "Tu as utilisé toutes tes vidéos ce mois-ci."],
  too_many_pending_uploads: [429, "Tu as déjà 3 envois en cours. Termine-les ou patiente."],
  source_video_not_found: [404, "Vidéo introuvable."],
  not_authenticated: [401, "Session expirée. Reconnecte-toi."],
};

export function sqlError(message: string | undefined) {
  const key = Object.keys(SQL_ERRORS).find((k) => message?.includes(k));
  const [status, text] = key ? SQL_ERRORS[key] : [500, "Erreur inattendue. Réessaie dans un instant."];
  return apiError(status, key ?? "internal_error", text);
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/** Charge une vidéo en cours d'envoi appartenant à l'utilisateur (RLS + vérification explicite). */
export async function ownedPendingVideo(supabase: Awaited<ReturnType<typeof createClient>>, id: string, userId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase
    .from("source_videos")
    .select("id, user_id, project_id, storage_key, status, declared_size_bytes")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.user_id !== userId || data.status !== "pending_upload") return null;
  return data;
}
