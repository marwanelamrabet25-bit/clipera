/**
 * Reconnaissance d'un lien YouTube (partagée navigateur / serveur, sans dépendance).
 *
 * On n'extrait qu'un identifiant de vidéo (11 caractères [A-Za-z0-9_-]). Tout appel réseau est ensuite reconstruit à
 * partir de cet identifiant vers des adresses fixes de YouTube : l'adresse collée par l'utilisateur n'est jamais
 * appelée telle quelle (pas de SSRF possible).
 */
export type YouTubeLink =
  | { ok: true; id: string; isShort: boolean }
  | { ok: false; reason: "empty" | "not_youtube" | "playlist" | "channel" | "invalid" };

const ID_RE = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

export function looksLikeYouTube(input: string) {
  return /(^|\/\/|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)(\/|$)/i.test(input.trim());
}

export function parseYouTubeUrl(input: string): YouTubeLink {
  const raw = input.trim();
  if (!raw) return { ok: false, reason: "empty" };
  if (raw.length > 2048) return { ok: false, reason: "invalid" };
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { ok: false, reason: looksLikeYouTube(raw) ? "invalid" : "not_youtube" };
  }
  const host = url.hostname.toLowerCase();
  if (!HOSTS.has(host) || (url.protocol !== "https:" && url.protocol !== "http:")) {
    return { ok: false, reason: "not_youtube" };
  }
  const parts = url.pathname.split("/").filter(Boolean);
  const done = (id: string | null | undefined, isShort = false): YouTubeLink =>
    id && ID_RE.test(id) ? { ok: true, id, isShort } : { ok: false, reason: "invalid" };

  if (host === "youtu.be") return done(parts[0]);
  const [first, second] = parts;
  if (first === "watch") {
    const v = url.searchParams.get("v");
    if (!v && url.searchParams.get("list")) return { ok: false, reason: "playlist" };
    return done(v);
  }
  if (first === "shorts") return done(second, true);
  if (first === "live" || first === "embed" || first === "v" || first === "e") return done(second);
  if (first === "playlist") return { ok: false, reason: "playlist" };
  if (first && (first.startsWith("@") || ["channel", "c", "user"].includes(first))) {
    return { ok: false, reason: "channel" };
  }
  return { ok: false, reason: "invalid" };
}

export function canonicalWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Page de la vidéo dans YouTube Studio (accessible seulement au propriétaire de la chaîne). */
export function studioUrl(id: string) {
  return `https://studio.youtube.com/video/${id}/edit`;
}

export const YOUTUBE_LINK_ERRORS: Record<Exclude<YouTubeLink, { ok: true }>["reason"], string> = {
  empty: "Colle le lien de ta vidéo YouTube.",
  not_youtube: "Ce n'est pas un lien YouTube. Exemple : https://www.youtube.com/watch?v=…",
  playlist: "C'est le lien d'une playlist. Ouvre la vidéo voulue et copie son lien.",
  channel: "C'est le lien d'une chaîne. Ouvre la vidéo voulue et copie son lien.",
  invalid: "Lien YouTube incomplet ou invalide. Copie le lien depuis le bouton « Partager » de la vidéo.",
};
