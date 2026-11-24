import type { Metadata } from "next";
import { ArrowLeft, Download, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { ClipCard } from "@/components/app/clip-card";
import { ClipProgress } from "@/components/app/clip-progress";
import { DeleteClip } from "@/components/app/delete-clip";
import { GenerateForm } from "@/components/app/generate-form";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { PipelineSteps } from "@/components/ui/pipeline-steps";
import { formatDate, formatMinutes, getAccount } from "@/lib/account";
import { signClip, signZip, type ClipRow } from "@/lib/clips";
import { isActive, lastStepReached, type JobStatus } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { formatDuration, formatSize, videoStatus } from "@/lib/video-status";
import { cancelGeneration } from "./actions";
import { DeleteProject } from "./delete-project";

export const metadata: Metadata = { title: "Projet" };

export default async function ProjectPage({ params }: PageProps<"/app/projets/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: project }, { data: clipRows }, account, { data: settings }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        `id, title, created_at, source_videos(*), processing_jobs(id, kind, status, status_detail, error_code,
         error_message, requested_clips, clips_produced, metrics, created_at, job_events(id, to_status))`,
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("clips")
      .select(
        `id, user_id, job_id, rank, title, start_seconds, end_seconds, storage_key, thumbnail_key, width, height,
         size_bytes, score_total, score_details, transcript_excerpt, status`,
      )
      .eq("project_id", id)
      .in("status", ["ready", "rendering", "failed"])
      .order("rank"),
    getAccount(),
    supabase.from("user_settings").select("default_framing").maybeSingle(),
  ]);
  if (!project) notFound();

  const video = project.source_videos[0];
  const probe = project.processing_jobs
    .filter((j) => j.kind === "probe")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const status = videoStatus(video?.status, probe);

  const clipJobs = project.processing_jobs
    .filter((j) => j.kind === "clip_generation")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const job = clipJobs[0];
  const running = job ? isActive(job.status as JobStatus) : false;
  const completedJobs = clipJobs.filter((j) => j.status === "completed");
  // Clips prêts des générations terminées, et ceux déjà montés de la génération en cours (visibles sans attendre).
  const visibleJobs = new Set([...completedJobs.map((j) => j.id), ...(running && job ? [job.id] : [])]);
  const allRows = clipRows ?? [];
  const clips: (ClipRow & { job_id: string })[] = allRows.filter((c) => c.status === "ready" && visibleJobs.has(c.job_id));
  const progressClips = running && job ? allRows.filter((c) => c.job_id === job.id) : [];
  const failedClips = !running && job?.status === "completed" ? allRows.filter((c) => c.job_id === job.id && c.status === "failed") : [];
  const [links, zipUrl] = await Promise.all([
    Promise.all(clips.map((c) => signClip(c))),
    job?.status === "completed"
      ? signZip(account.user.id, (job.metrics as { zip_key?: string } | null)?.zip_key, project.title)
      : Promise.resolve(null),
  ]);
  const rulesBased = clips.some((c) => (c.score_details as { method?: string } | null)?.method?.startsWith("rules"));
  const latestExplanation = (completedJobs[0]?.metrics as { selection?: { explanation?: string } } | null)?.selection
    ?.explanation;

  const plan = account.plan;
  const q = account.quota;
  const quotaNote = q
    ? `utilise 1 vidéo de ton quota (${Math.max(q.videosLimit - q.videosUsed, 0)} restante(s), ` +
      `${formatMinutes(q.secondsLimit - q.secondsUsed)} restantes ce mois-ci)`
    : "utilise 1 vidéo de ton quota";
  const form =
    video?.status === "validated" && plan ? (
      <GenerateForm
        projectId={project.id}
        videoId={video.id}
        maxClips={plan.max_clips_per_video}
        exportHeight={plan.export_max_height}
        watermark={plan.watermark}
        quotaNote={quotaNote}
        defaultFraming={settings?.default_framing ?? "stable"}
      />
    ) : null;

  const facts = video
    ? [
        ["Durée", formatDuration(video.duration_seconds)],
        ["Résolution", video.width && video.height ? `${video.width} × ${video.height}` : "—"],
        ["Images / s", video.fps ? String(Math.round(video.fps * 100) / 100) : "—"],
        ["Codec vidéo", video.video_codec?.toUpperCase() ?? "—"],
        ["Son", video.has_audio === null ? "—" : video.has_audio ? `Oui (${video.audio_codec ?? "?"})` : "Non"],
        ["Taille", formatSize(video.size_bytes ?? video.declared_size_bytes)],
      ]
    : [];

  return (
    <>
      <AutoRefresh active={status.busy || running} />
      <Link href="/app/projets" className="mb-4 inline-flex items-center gap-1.5 text-small text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> Mes projets
      </Link>
      <PageHeader
        title={project.title}
        description={`Créé le ${formatDate(project.created_at)}${video ? ` · ${video.original_filename}` : ""}`}
        action={<Badge tone={status.tone}>{status.label}</Badge>}
      />

      {video?.status === "importing" && (
        <Alert title="Import en cours" className="mb-6">
          Nos serveurs récupèrent la vidéo depuis le lien, puis la vérifient (format, durée, son). Compte une à
          quelques minutes selon sa taille ; cette page se met à jour toute seule.
        </Alert>
      )}
      {status.busy && video?.status !== "importing" && (
        <Alert title="Ta vidéo est bien reçue" className="mb-6">
          Elle est en file d&apos;attente pour sa vérification (format, durée, son). Cela prend en général moins
          d&apos;une minute ; cette page se met à jour toute seule.
        </Alert>
      )}
      {video?.status === "rejected" && (
        <Alert tone="danger" title="Cette vidéo ne peut pas être traitée" className="mb-6">
          {video.rejection_reason ?? "Le fichier n'a pas passé la vérification."} Ton quota n&apos;a pas été utilisé.
        </Alert>
      )}
      {video?.status === "uploaded" && probe?.status === "failed" && (
        <Alert tone="danger" title="La vérification a échoué" className="mb-6">
          Une erreur technique est survenue. Ton quota n&apos;a pas été utilisé. Réimporte la vidéo.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Vidéo source</CardTitle>
              <CardDescription>Informations lues dans le fichier.</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-caption text-subtle">{k}</dt>
                  <dd className="mt-0.5 text-small font-medium tabular-nums">{video?.status === "validated" || (k === "Taille" && video?.status !== "importing") ? v : "—"}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Génération des clips</CardTitle>
              <CardDescription>Transcription, sélection des meilleurs passages, montage.</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            {video?.status !== "validated" ? (
              <>
                <p className="text-small text-muted">Disponible dès que la vidéo est vérifiée.</p>
                <Button className="mt-5" disabled>
                  <Sparkles /> Générer les clips
                </Button>
              </>
            ) : job && running ? (
              <div className="flex flex-col gap-5" data-testid="job-progress">
                <PipelineSteps status={job.status as JobStatus} />
                {progressClips.length > 0 && <ClipProgress clips={progressClips} />}
                {job.status === "queued" && (
                  <Alert title="En attente d'un serveur de traitement">
                    Ta demande est bien enregistrée et démarre dès qu&apos;un serveur se libère. Tu peux fermer cette
                    page : la génération continue et tes clips t&apos;attendront ici.
                  </Alert>
                )}
                <form action={cancelGeneration}>
                  <input type="hidden" name="job_id" value={job.id} />
                  <input type="hidden" name="project_id" value={project.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    <X /> Annuler la génération
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {job?.status === "failed" && (
                  <>
                    <PipelineSteps
                      status="failed"
                      failedAt={lastStepReached(
                        [...job.job_events].sort((a, b) => a.id - b.id) as { to_status: JobStatus | null }[],
                      )}
                    />
                    <Alert tone="danger" title="La génération n'a pas abouti">
                      {job.error_message ?? "Une erreur est survenue."}
                      {job.error_message?.includes("recrédité") ? "" : " Ton quota a été recrédité."}
                    </Alert>
                  </>
                )}
                {job?.status === "cancelled" && (
                  <Alert tone="warning" title="Génération annulée">
                    Ton quota a été recrédité. Tu peux relancer quand tu veux.
                  </Alert>
                )}
                {job?.status === "completed" ? (
                  <>
                    <Alert tone="success" title={`${job.clips_produced} clip${job.clips_produced > 1 ? "s" : ""} prêt${job.clips_produced > 1 ? "s" : ""}`}>
                      {latestExplanation ?? "Tes clips sont prêts ci-dessous."}
                    </Alert>
                    {failedClips.length > 0 && (
                      <Alert tone="warning" title={`${failedClips.length} clip${failedClips.length > 1 ? "s n'ont" : " n'a"} pas pu être monté${failedClips.length > 1 ? "s" : ""}`}>
                        {failedClips.map((c) => `n° ${c.rank}`).join(", ")} : le montage a échoué deux fois (dont une avec un
                        cadrage centré). Les autres clips ne sont pas concernés. Relance une génération si tu veux
                        retenter ces passages.
                      </Alert>
                    )}
                    {zipUrl && (
                      <a href={zipUrl} className={buttonStyles({ variant: "secondary", className: "self-start" })} data-testid="zip-download">
                        <Download /> Tout télécharger ({job.clips_produced} clips, ZIP)
                      </a>
                    )}
                    <details>
                      <summary className="cursor-pointer text-small text-muted hover:text-fg">
                        Générer à nouveau avec d&apos;autres options
                      </summary>
                      <div className="mt-5">{form}</div>
                    </details>
                  </>
                ) : (
                  form
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {clips.length > 0 && (
        <section className="mt-10" aria-labelledby="clips-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2 id="clips-title" className="text-h3 font-semibold">
              Tes clips
            </h2>
            <p className="text-caption text-subtle">Aperçu et téléchargement en qualité d&apos;origine (MP4).</p>
          </div>
          {rulesBased && (
            <Alert className="mb-5" title="Comment ces passages ont été choisis">
              Clipera repère les sujets de ta vidéo, puis retient des passages complets (accroche, phrases entières,
              conclusion nette, durée adaptée) sur des sujets différents, sans bavardage ni redite. Il ne juge pas
              encore finement si une histoire est drôle ou passionnante : regarde chaque clip avant de le publier.
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clips.map((c, i) => (
              <ClipCard
                key={c.id}
                clip={c}
                links={links[i]}
                actions={running ? undefined : <DeleteClip clipId={c.id} projectId={project.id} />}
              />
            ))}
          </div>
        </section>
      )}

      {!running && !status.busy && (
        <section className="mt-12 border-t border-line pt-6" aria-label="Gestion du projet">
          <DeleteProject projectId={project.id} clipCount={clips.length} />
        </section>
      )}
    </>
  );
}
