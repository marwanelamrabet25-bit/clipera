"use server";

import { revalidatePath } from "next/cache";
import { CAPTION_STYLES, CREATE_JOB_ERRORS, FORMATS, FRAMINGS } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";

export type GenerateState = { status: "idle" | "error"; message?: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

/**
 * Lance la génération. Tous les contrôles (droits, vidéo validée, quota, nombre de clips de l'offre, jobs
 * simultanés) sont refaits par la fonction SQL create_clip_job, dans une transaction : le formulaire n'est
 * qu'un confort. La clé d'idempotence évite un double lancement (double clic, renvoi du formulaire).
 */
export async function generateClips(_prev: GenerateState, form: FormData): Promise<GenerateState> {
  const videoId = String(form.get("video_id") ?? "");
  const projectId = String(form.get("project_id") ?? "");
  const key = String(form.get("idempotency_key") ?? "");
  const requested = Number(form.get("requested_clips"));
  const format = String(form.get("format") ?? "9:16");
  const captions = form.get("captions") === "on";
  const style = String(form.get("caption_style") ?? "classic");
  const framing = String(form.get("framing") ?? "stable");

  if (!UUID_RE.test(videoId) || !UUID_RE.test(projectId) || !/^[\w-]{8,100}$/.test(key)) {
    return { status: "error", message: "Requête invalide. Recharge la page." };
  }
  if (!Number.isInteger(requested) || requested < 1 || requested > 20) {
    return { status: "error", message: CREATE_JOB_ERRORS.requested_clips_out_of_range };
  }
  if (
    !FORMATS.some((f) => f.value === format) ||
    !CAPTION_STYLES.some((s) => s.value === style) ||
    !FRAMINGS.some((f) => f.value === framing)
  ) {
    return { status: "error", message: "Option invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_clip_job", {
    p_source_video_id: videoId,
    p_requested_clips: requested,
    p_options: { format, framing, captions: { enabled: captions, style }, language: "fr" },
    p_idempotency_key: key,
  });
  if (error) {
    const code = Object.keys(CREATE_JOB_ERRORS).find((k) => error.message.includes(k));
    if (error.message.includes("not_authenticated")) {
      return { status: "error", message: "Session expirée. Reconnecte-toi." };
    }
    return { status: "error", message: code ? CREATE_JOB_ERRORS[code] : "Impossible de lancer la génération. Réessaie." };
  }
  // Le mode de cadrage choisi devient la préférence de l'utilisateur pour ses prochaines générations.
  const { data: claims } = await supabase.auth.getClaims();
  if (claims?.claims?.sub) {
    await supabase.from("user_settings").update({ default_framing: framing }).eq("user_id", claims.claims.sub);
  }
  revalidatePath(`/app/projets/${projectId}`);
  return { status: "idle" };
}

/** Annule la génération : immédiate si elle attend encore, sinon transmise au worker (quota recrédité). */
export async function cancelGeneration(form: FormData): Promise<void> {
  const jobId = String(form.get("job_id") ?? "");
  const projectId = String(form.get("project_id") ?? "");
  if (!UUID_RE.test(jobId) || !UUID_RE.test(projectId)) return;
  const supabase = await createClient();
  await supabase.rpc("cancel_job", { p_job_id: jobId });
  revalidatePath(`/app/projets/${projectId}`);
}
