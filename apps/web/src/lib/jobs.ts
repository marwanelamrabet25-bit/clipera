/**
 * Étapes de traitement affichées à l'utilisateur.
 * Elles correspondent EXACTEMENT aux statuts de la table processing_jobs : aucune progression inventée.
 */
export type JobStatus =
  | "queued"
  | "uploading"
  | "transcribing"
  | "analyzing"
  | "selecting"
  | "rendering"
  | "completed"
  | "failed"
  | "cancelled";

export const PIPELINE_STEPS = [
  { key: "upload", label: "Import", description: "Envoi de ta vidéo" },
  { key: "transcribing", label: "Transcription", description: "Conversion de la parole en texte" },
  { key: "selecting", label: "Sélection", description: "Choix des meilleurs passages" },
  { key: "rendering", label: "Montage", description: "Découpe, cadrage, sous-titres et export MP4" },
] as const;

export type StepState = "done" | "current" | "pending" | "error";

/** Calcule l'état de chaque étape à partir du statut réel du job. */
export function stepStates(status: JobStatus | "upload", failedAt?: JobStatus): StepState[] {
  const order = PIPELINE_STEPS.map((s) => s.key as string);
  if (status === "completed") return order.map(() => "done");
  if (status === "queued") return order.map((_, i) => (i === 0 ? "done" : i === 1 ? "current" : "pending"));
  const ref = status === "failed" || status === "cancelled" ? failedAt : status;
  const idx = ref ? order.indexOf(ref) : -1;
  return order.map((_, i) => {
    if (i < idx) return "done";
    if (i === idx) return status === "failed" ? "error" : status === "cancelled" ? "pending" : "current";
    return "pending";
  });
}

/** Le job est-il encore en cours (ni terminé, ni échoué, ni annulé) ? */
export function isActive(status: JobStatus) {
  return !["completed", "failed", "cancelled"].includes(status);
}

/** Dernière étape atteinte avant un échec, d'après l'historique réel du job. */
export function lastStepReached(events: { to_status: JobStatus | null }[]): JobStatus | undefined {
  const keys = PIPELINE_STEPS.map((s) => s.key as string);
  return [...events].reverse().find((e) => e.to_status && keys.includes(e.to_status))?.to_status ?? "transcribing";
}

/** Messages clairs pour les refus de create_clip_job (codes renvoyés par la base). */
export const CREATE_JOB_ERRORS: Record<string, string> = {
  quota_videos_exceeded: "Tu as atteint le nombre de vidéos de ton offre pour ce mois-ci.",
  quota_minutes_exceeded: "Cette vidéo dépasse les minutes restantes de ton offre pour ce mois-ci.",
  video_too_long_for_plan: "Cette vidéo est trop longue pour ton offre.",
  too_many_active_jobs: "Une génération est déjà en cours. Attends qu'elle se termine.",
  requested_clips_out_of_range: "Nombre de clips invalide pour ton offre.",
  source_video_not_ready: "La vidéo n'est pas encore vérifiée.",
  source_video_not_found: "Vidéo introuvable.",
};

export const FORMATS = [
  { value: "9:16", label: "Vertical 9:16", hint: "TikTok, Reels, Shorts" },
  { value: "1:1", label: "Carré 1:1", hint: "Fil d'actualité" },
  { value: "16:9", label: "Horizontal 16:9", hint: "YouTube, LinkedIn" },
] as const;

export const CAPTION_STYLES = [
  { value: "classic", label: "Classique" },
  { value: "highlight", label: "Mot surligné" },
  { value: "modern", label: "Moderne (majuscules)" },
  { value: "minimal", label: "Minimal" },
] as const;

export const FRAMINGS = [
  { value: "stable", label: "Stable", hint: "Recommandé : cadrage propre et posé, changements rares et justifiés." },
  { value: "speaker", label: "Suivi de l'intervenant", hint: "Le cadre passe à la personne qui parle, après confirmation." },
  { value: "wide", label: "Large", hint: "Toute la scène reste visible, sur fond flouté. Aucun mouvement." },
] as const;
