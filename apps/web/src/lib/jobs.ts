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
  { key: "analyzing", label: "Analyse", description: "Compréhension du contenu" },
  { key: "selecting", label: "Sélection", description: "Choix des meilleurs passages" },
  { key: "rendering", label: "Montage", description: "Découpe, cadrage et sous-titres" },
  { key: "uploading", label: "Export", description: "Préparation des fichiers MP4" },
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
