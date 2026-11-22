import "server-only";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isStorageConfigured, s3 } from "./storage";

/** Durée de validité des liens d'aperçu et de téléchargement. */
const LINK_SECONDS = 60 * 60;

export type ClipRow = {
  id: string;
  user_id: string;
  rank: number;
  title: string | null;
  start_seconds: number;
  end_seconds: number;
  storage_key: string | null;
  thumbnail_key: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  score_total: number | null;
  score_details: unknown;
  transcript_excerpt: string | null;
};

export type ClipLinks = { video: string | null; thumbnail: string | null; download: string | null };

/** Liens stables vers un clip, servis par /api/clips/[id]/… (lien signé frais à chaque ouverture). */
export function clipRoutes(clip: { id: string; thumbnail_key?: string | null }): ClipLinks {
  const base = `/api/clips/${clip.id}`;
  return { video: `${base}/video`, download: `${base}/download`, thumbnail: clip.thumbnail_key ? `${base}/thumbnail` : null };
}

function slug(text: string | null) {
  const s = (text ?? "clip")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return s || "clip";
}

/**
 * Liens signés vers le stockage privé. Les lignes viennent d'une requête sous RLS (clips de l'utilisateur
 * connecté) ; on revérifie quand même que la clé appartient bien à son propriétaire.
 */
export async function signClip(clip: ClipRow): Promise<ClipLinks> {
  const owned = (key: string | null) => key && key.startsWith(`clips/${clip.user_id}/`);
  if (!isStorageConfigured() || !owned(clip.storage_key)) return { video: null, thumbnail: null, download: null };
  const { client, bucket } = s3();
  const get = (key: string, extra: Partial<ConstructorParameters<typeof GetObjectCommand>[0]> = {}) =>
    getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key, ...extra }), { expiresIn: LINK_SECONDS });
  const [video, download, thumbnail] = await Promise.all([
    get(clip.storage_key!),
    get(clip.storage_key!, {
      ResponseContentDisposition: `attachment; filename="clipera-${slug(clip.title)}-${clip.rank}.mp4"`,
    }),
    owned(clip.thumbnail_key) ? get(clip.thumbnail_key!) : Promise.resolve(null),
  ]);
  return { video, download, thumbnail };
}

export type ScoreDetails = {
  criteria?: Record<string, number>;
  reasons?: Record<string, string>;
  flags?: string[];
  method?: string;
};

export const CRITERIA_LABELS: Record<string, string> = {
  hook: "Accroche",
  interest: "Intérêt",
  context: "Contexte",
  coherence: "Cohérence",
  ending: "Conclusion",
  standalone: "Autonomie",
  duration: "Durée",
};

export function clipDuration(c: { start_seconds: number; end_seconds: number }) {
  const s = Math.round(c.end_seconds - c.start_seconds);
  return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s` : `${s} s`;
}
