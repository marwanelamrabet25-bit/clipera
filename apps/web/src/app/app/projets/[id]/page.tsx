import type { Metadata } from "next";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { formatDate } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { formatDuration, formatSize, videoStatus } from "@/lib/video-status";

export const metadata: Metadata = { title: "Projet" };

export default async function ProjectPage({ params }: PageProps<"/app/projets/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, created_at, source_videos(*), processing_jobs(id, kind, status, error_code, created_at)")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const video = project.source_videos[0];
  const probe = project.processing_jobs
    .filter((j) => j.kind === "probe")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const status = videoStatus(video?.status, probe);

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
      <AutoRefresh active={status.busy} />
      <Link href="/app/projets" className="mb-4 inline-flex items-center gap-1.5 text-small text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> Mes projets
      </Link>
      <PageHeader
        title={project.title}
        description={`Créé le ${formatDate(project.created_at)}${video ? ` · ${video.original_filename}` : ""}`}
        action={<Badge tone={status.tone}>{status.label}</Badge>}
      />

      {status.busy && (
        <Alert title="Ta vidéo est bien reçue" className="mb-6">
          Elle est en file d&apos;attente pour sa vérification (format, durée, son). Pendant l&apos;accès anticipé, cette
          étape peut prendre plus de temps ; cette page se met à jour toute seule.
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

      <div className="grid gap-4 lg:grid-cols-2">
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
                  <dd className="mt-0.5 text-small font-medium tabular-nums">{video?.status === "validated" || k === "Taille" ? v : "—"}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Génération des clips</CardTitle>
              <CardDescription>Analyse, sélection des meilleurs passages, montage.</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-small text-muted">
              {video?.status === "validated"
                ? "Ta vidéo est prête. La génération automatique des clips arrive dans la prochaine version : elle utilisera cette vidéo directement."
                : "Disponible dès que la vidéo est vérifiée."}
            </p>
            <Button className="mt-5" disabled>
              <Sparkles /> Générer les clips (bientôt)
            </Button>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
