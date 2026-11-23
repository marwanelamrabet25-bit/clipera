import { NextResponse } from "next/server";
import { apiError, apiUser, readJson } from "@/lib/api";
import { fetchYouTubeMeta } from "@/lib/youtube-meta";
import { parseYouTubeUrl, YOUTUBE_LINK_ERRORS } from "@/lib/youtube-url";

/**
 * Reconnaît un lien YouTube et renvoie les informations publiques de la vidéo (titre, chaîne, miniature).
 * Réservé aux utilisateurs connectés. Ne récupère jamais le fichier vidéo (interdit par les conditions de YouTube).
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth) return apiError(401, "not_authenticated", "Session expirée. Reconnecte-toi.");

  const body = await readJson<{ url?: unknown }>(request);
  const link = parseYouTubeUrl(typeof body?.url === "string" ? body.url : "");
  if (!link.ok) return apiError(400, `link_${link.reason}`, YOUTUBE_LINK_ERRORS[link.reason]);

  const meta = await fetchYouTubeMeta(link.id);
  console.log(JSON.stringify({ event: "youtube_lookup", status: meta.status }));
  switch (meta.status) {
    case "ok":
      return NextResponse.json({ video: { ...meta, isShort: link.isShort } }, { headers: { "Cache-Control": "private, no-store" } });
    case "not_found":
      return apiError(404, "video_not_found", "Vidéo introuvable : elle a peut-être été supprimée, ou le lien est incorrect.");
    case "private":
      return apiError(403, "video_private",
        "Cette vidéo est privée, ou son propriétaire a bloqué son intégration. Si c'est la tienne, tu peux quand même la récupérer depuis YouTube Studio.");
    default:
      return apiError(502, "youtube_unreachable", "YouTube ne répond pas pour le moment. Réessaie dans un instant.");
  }
}
