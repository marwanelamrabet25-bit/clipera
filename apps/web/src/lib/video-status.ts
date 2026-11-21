import type { Enums } from "./supabase/database.types";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger";

/** Statut affiché d'une vidéo importée, d'après son état réel en base et celui du job de vérification. */
export function videoStatus(
  status: Enums<"source_video_status"> | undefined,
  probeJob?: { status: Enums<"job_status"> } | null,
): { label: string; tone: Tone; busy: boolean } {
  switch (status) {
    case "importing":
      return { label: "Import depuis YouTube…", tone: "primary", busy: true };
    case "pending_upload":
      return { label: "Envoi en cours", tone: "warning", busy: false };
    case "uploaded":
      if (probeJob?.status === "failed") return { label: "Vérification impossible", tone: "danger", busy: false };
      return { label: "Vérification…", tone: "primary", busy: true };
    case "validated":
      return { label: "Prête", tone: "success", busy: false };
    case "rejected":
      return { label: "Refusée", tone: "danger", busy: false };
    default:
      return { label: "—", tone: "neutral", busy: false };
  }
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "—";
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min ${String(r).padStart(2, "0")} s`;
}

export function formatSize(bytes: number | null | undefined) {
  if (!bytes) return "—";
  const fr = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  return bytes >= 1024 ** 3 ? `${fr.format(bytes / 1024 ** 3)} Go` : `${Math.round(bytes / 1024 ** 2)} Mo`;
}
