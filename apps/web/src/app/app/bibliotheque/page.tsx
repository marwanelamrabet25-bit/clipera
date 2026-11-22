import type { Metadata } from "next";
import { Download, Film, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate } from "@/lib/account";
import { clipDuration, clipRoutes } from "@/lib/clips";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Bibliothèque" };

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: clips, error } = await supabase
    .from("clips")
    .select(
      `id, user_id, project_id, rank, title, start_seconds, end_seconds, storage_key, thumbnail_key, width, height,
       size_bytes, score_total, score_details, transcript_excerpt, created_at`,
    )
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .order("rank")
    .limit(60);
  const links = (clips ?? []).map((c) => clipRoutes(c));

  return (
    <>
      <PageHeader title="Bibliothèque" description="Tous tes clips, prêts à prévisualiser et télécharger." />
      {error ? (
        <p className="text-danger">Impossible de charger tes clips. Recharge la page.</p>
      ) : clips && clips.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {clips.map((c, i) => (
            <li key={c.id}>
              <Card className="overflow-hidden transition-colors hover:border-primary-line" data-testid="library-clip">
                <Link href={`/app/projets/${c.project_id}`} className="block" title="Ouvrir le projet">
                  <div className="aspect-[9/16] bg-canvas">
                    {links[i].thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element -- miniature privée servie par l'API
                      <img src={links[i].thumbnail!} alt="" className="size-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid size-full place-items-center text-subtle">
                        <Film aria-hidden />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex items-start gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-small font-medium">{c.title ?? "Clip sans titre"}</p>
                    <p className="text-caption text-subtle tabular-nums">
                      {clipDuration(c)} · {formatDate(c.created_at)}
                    </p>
                  </div>
                  <a
                    href={links[i].download!}
                    className="grid size-8 shrink-0 place-items-center rounded-md border border-line text-muted transition-colors hover:border-primary-line hover:text-fg"
                    aria-label={`Télécharger « ${c.title ?? "clip"} »`}
                    title="Télécharger le MP4"
                  >
                    <Download className="size-4" aria-hidden />
                  </a>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Film />}
          title="Ta bibliothèque est vide"
          description="Les clips générés à partir de tes vidéos apparaîtront ici."
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
