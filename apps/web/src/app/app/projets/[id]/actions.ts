"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CAPTION_STYLES, CREATE_JOB_ERRORS, FORMATS, FRAMINGS } from "@/lib/jobs";
import { storageConfig } from "@/lib/storage";
import { deletePrefix } from "@/lib/storage-admin";
import { createClient } from "@/lib/supabase/server";

export type GenerateState = { status: "idle" | "error"; message?: string; upgrade?: boolean };

const UPGRADE_CODES = ["quota_videos_exceeded", "quota_minutes_exceeded", "video_too_long_for_plan"];

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
    return {
      status: "error",
      message: code ? CREATE_JOB_ERRORS[code] : "Impossible de lancer la génération. Réessaie.",
      upgrade: code ? UPGRADE_CODES.includes(code) : false,
    };
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

export type DeleteState = { status: "idle" | "error"; message?: string };

/**
 * Supprime un projet : fichiers d'abord (vidéo source + clips), puis les lignes en base. Si l'effacement des
 * fichiers échoue, rien n'est supprimé. Refusé pendant un traitement. Le quota consommé n'est pas rendu.
 */
export async function deleteProject(_prev: DeleteState, form: FormData): Promise<DeleteState> {
  const projectId = String(form.get("project_id") ?? "");
  if (!UUID_RE.test(projectId)) return { status: "error", message: "Requête invalide. Recharge la page." };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) return { status: "error", message: "Session expirée. Reconnecte-toi." };
  // Lecture sous la RLS : seul le propriétaire voit le projet.
  const { data: project } = await supabase
    .from("projects")
    .select("id, source_videos(id), processing_jobs(id, kind, status)")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return { status: "error", message: "Projet introuvable." };
  if (project.processing_jobs.some((j) => !["completed", "failed", "cancelled"].includes(j.status))) {
    return { status: "error", message: "Un traitement est en cours. Annule-le ou attends la fin, puis réessaie." };
  }
  if (storageConfig()) {
    try {
      const prefixes = [
        ...project.source_videos.map((v) => `sources/${uid}/${v.id}/`),
        ...project.processing_jobs.filter((j) => j.kind === "clip_generation").map((j) => `clips/${uid}/${j.id}/`),
      ];
      for (const prefix of prefixes) await deletePrefix(prefix);
    } catch (e) {
      console.error(JSON.stringify({ event: "project_delete_storage_failed", project: projectId, error: String(e) }));
      return { status: "error", message: "La suppression des fichiers a échoué. Rien n'a été supprimé : réessaie." };
    }
  }
  const { error } = await supabase.rpc("delete_my_project", { p_project_id: projectId });
  if (error) {
    const running = error.message.includes("job_in_progress");
    return {
      status: "error",
      message: running ? "Un traitement est en cours. Annule-le ou attends la fin, puis réessaie." : "La suppression a échoué. Réessaie.",
    };
  }
  revalidatePath("/app/projets");
  redirect("/app/projets?supprime=1");
}
