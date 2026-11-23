import "server-only";
import { canonicalWatchUrl } from "./youtube-url";

/**
 * Informations publiques d'une vidéo YouTube via oEmbed, le point d'accès officiel prévu pour l'intégration de vidéos
 * (titre, chaîne, miniature). Ne donne PAS accès au fichier vidéo : c'est voulu.
 *
 * Sécurité : l'adresse appelée est construite à partir d'un identifiant déjà validé (11 caractères), vers un hôte fixe ;
 * pas de redirection suivie, délai court, taille de réponse limitée.
 *
 * Réponses de YouTube vérifiées en réel le 23/11/2026 : 200 (vidéo publique ou non répertoriée), 400 (identifiant
 * inexistant ou vidéo supprimée). 401/403 : vidéo privée ou intégration désactivée par le propriétaire (documenté,
 * non reproduit faute de vidéo privée de test).
 */
export type YouTubeMeta =
  | { status: "ok"; id: string; title: string; channel: string | null; thumbnail: string }
  | { status: "not_found" | "private" | "unavailable"; id: string };

const MAX_BYTES = 64 * 1024;

export async function fetchYouTubeMeta(id: string, fetcher: typeof fetch = fetch): Promise<YouTubeMeta> {
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return { status: "not_found", id };
  const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(canonicalWatchUrl(id))}`;
  let res: Response;
  try {
    res = await fetcher(endpoint, {
      redirect: "error",
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return { status: "unavailable", id };
  }
  if (res.status === 400 || res.status === 404) return { status: "not_found", id };
  if (res.status === 401 || res.status === 403) return { status: "private", id };
  if (!res.ok) return { status: "unavailable", id };

  const text = await res.text().catch(() => "");
  if (!text || text.length > MAX_BYTES) return { status: "unavailable", id };
  let data: { title?: unknown; author_name?: unknown };
  try {
    data = JSON.parse(text);
  } catch {
    return { status: "unavailable", id };
  }
  const title = typeof data.title === "string" ? data.title.trim().slice(0, 200) : "";
  const channel = typeof data.author_name === "string" ? data.author_name.trim().slice(0, 120) : null;
  return {
    status: "ok",
    id,
    title: title || "Vidéo YouTube",
    channel: channel || null,
    // Miniature reconstruite depuis l'identifiant (hôte fixe), jamais l'adresse renvoyée telle quelle.
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}
