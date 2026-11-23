import type { Metadata } from "next";
import { FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { formatDuration, videoStatus } from "@/lib/video-status";

export const metadata: Metadata = { title: "Mes projets" };

export default async function ProjectsPage({ searchParams }: PageProps<"/app/projets">) {
  const deleted = (await searchParams).supprime === "1";
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, created_at, source_videos(status, duration_seconds), processing_jobs(kind, status, created_at)")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Mes projets"
        description="Chaque projet correspond à une vidéo importée."
        action={
          <Link href="/app/nouveau" className={buttonStyles()}>
            <Plus /> Nouveau projet
          </Link>
        }
      />
      {deleted && (
        <Alert tone="success" title="Projet supprimé" className="mb-6">
          La vidéo et ses clips ont été effacés de nos serveurs.
        </Alert>
      )}
      {error ? (
        <p className="text-danger">Impossible de charger tes projets. Recharge la page.</p>
      ) : projects && projects.length > 0 ? (
        <Card>
          <ul className="divide-y divide-line">
            {projects.map((p) => {
              const v = p.source_videos[0];
              const probe = p.processing_jobs
                .filter((j) => j.kind === "probe")
                .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
              const s = videoStatus(v?.status, probe);
              return (
                <li key={p.id}>
                  <Link
                    href={`/app/projets/${p.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 text-small transition-colors hover:bg-elevated"
                  >
                    <span className="min-w-0 truncate font-medium">{p.title}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-subtle tabular-nums sm:inline">{formatDuration(v?.duration_seconds)}</span>
                      <Badge tone={s.tone}>{s.label}</Badge>
                      <span className="hidden text-subtle sm:inline">{formatDate(p.created_at)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <EmptyState
          icon={<FolderOpen />}
          title="Aucun projet pour l'instant"
          description="Importe ta première vidéo longue pour créer ton premier projet."
          action={
            <Link href="/app/nouveau" className={buttonStyles()}>
              <Plus /> Nouveau projet
            </Link>
          }
        />
      )}
    </>
  );
}
