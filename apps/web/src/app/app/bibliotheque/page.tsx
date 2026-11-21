import type { Metadata } from "next";
import { Film } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate } from "@/lib/account";
import { clipDuration, signClip } from "@/lib/clips";
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
  const links = await Promise.all((clips ?? []).map((c) => signClip(c)));

  return (
    <>
      <PageHeader title="Bibliothèque" description="Tous tes clips, prêts à prévisualiser et télécharger." />
      {error ? (
        <p className="text-danger">Impossible de charger tes clips. Recharge la page.</p>
      ) : clips && clips.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {clips.map((c, i) => (
            <li key={c.id}>
              <Link href={`/app/projets/${c.project_id}`} className="group block" data-testid="library-clip">
                <Card className="overflow-hidden transition-colors group-hover:border-primary-line">
                  <div className="aspect-[9/16] bg-canvas">
                    {links[i].thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element -- lien signé temporaire, pas d'optimisation
                      <img src={links[i].thumbnail!} alt="" className="size-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid size-full place-items-center text-subtle">
                        <Film aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-small font-medium">{c.title ?? "Clip sans titre"}</p>
                    <p className="text-caption text-subtle tabular-nums">
                      {clipDuration(c)} · {formatDate(c.created_at)}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Film />}
          title="Ta bibliothèque est vide"
          description="Les clips générés à partir de tes vidéos apparaîtront ici."
        />
      )}
    </>
  );
}
