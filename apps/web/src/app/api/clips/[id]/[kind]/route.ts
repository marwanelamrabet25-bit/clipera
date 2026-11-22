import { NextResponse } from "next/server";
import { apiError, apiUser } from "@/lib/api";
import { signClip } from "@/lib/clips";

const KINDS = ["video", "download", "thumbnail"] as const;
type Kind = (typeof KINDS)[number];

/**
 * Lien permanent vers un clip (aperçu, téléchargement, miniature). À chaque appel : session vérifiée, clip lu sous
 * la RLS (jamais celui d'un autre utilisateur), puis redirection vers un lien signé tout neuf. Une page restée
 * ouverte longtemps ne se retrouve donc plus avec des liens expirés.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/clips/[id]/[kind]">) {
  const { id, kind } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !KINDS.includes(kind as Kind)) return apiError(404, "not_found", "Clip introuvable.");
  const auth = await apiUser();
  if (!auth) return apiError(401, "not_authenticated", "Session expirée. Reconnecte-toi.");
  const { data: clip } = await auth.supabase
    .from("clips")
    .select("id, user_id, rank, title, start_seconds, end_seconds, storage_key, thumbnail_key, width, height, size_bytes, score_total, score_details, transcript_excerpt")
    .eq("id", id)
    .eq("status", "ready")
    .maybeSingle();
  if (!clip) return apiError(404, "not_found", "Clip introuvable.");
  const links = await signClip(clip);
  const url = links[kind as Kind];
  if (!url) return apiError(404, "not_found", "Fichier indisponible.");
  const res = NextResponse.redirect(url, 302);
  // Le lien signé vaut 1 h : le navigateur peut réutiliser la redirection quelques minutes, jamais le partager.
  res.headers.set("Cache-Control", "private, max-age=300");
  return res;
}
