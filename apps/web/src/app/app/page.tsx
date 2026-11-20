import { Clock, Film, FolderOpen, Plus, Upload, Video } from "lucide-react";
import Link from "next/link";
import { Meter, PageHeader } from "@/components/app/page-header";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate, formatMinutes, getAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { displayName, quota } = await getAccount();
  const supabase = await createClient();
  const [processed, clips, recentProjects] = await Promise.all([
    supabase
      .from("processing_jobs")
      .select("id", { count: "exact", head: true })
      .eq("kind", "clip_generation")
      .eq("status", "completed"),
    supabase.from("clips").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const videosLeft = quota ? Math.max(quota.videosLimit - quota.videosUsed, 0) : 0;
  const secondsLeft = quota ? Math.max(quota.secondsLimit - quota.secondsUsed, 0) : 0;
  const stats = [
    { label: "Vidéos traitées", value: String(processed.count ?? 0), icon: Video },
    { label: "Clips générés", value: String(clips.count ?? 0), icon: Film },
    { label: "Minutes restantes", value: formatMinutes(secondsLeft), icon: Clock },
    { label: "Vidéos restantes", value: quota ? `${videosLeft} / ${quota.videosLimit}` : "—", icon: Upload },
  ];

  return (
    <>
      <PageHeader
        title={`Bonjour ${displayName}`}
        description="Prêt à transformer une nouvelle vidéo ?"
        action={
          <Link href="/app/nouveau" className={buttonStyles({ size: "lg" })}>
            <Plus /> Nouveau projet
          </Link>
        }
      />

      <section aria-label="Statistiques" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-small text-muted">{label}</span>
                <Icon className="size-4 text-subtle" aria-hidden />
              </div>
              <p className="mt-3 text-h2 font-bold tabular-nums">{value}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      {quota && (
        <Card className="mt-4">
          <CardBody className="grid gap-6 sm:grid-cols-2">
            <Meter
              label="Vidéos ce mois-ci"
              used={quota.videosUsed}
              limit={quota.videosLimit}
              detail={`${quota.videosUsed} / ${quota.videosLimit}`}
            />
            <Meter
              label="Minutes ce mois-ci"
              used={quota.secondsUsed}
              limit={quota.secondsLimit}
              detail={`${formatMinutes(quota.secondsUsed)} / ${formatMinutes(quota.secondsLimit)}`}
            />
            <p className="text-caption text-subtle sm:col-span-2">
              Quota renouvelé le {formatDate(quota.periodEnd)}.
            </p>
          </CardBody>
        </Card>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Derniers projets</CardTitle>
            <Link href="/app/projets" className="text-small text-primary-soft hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardBody>
            {recentProjects.data && recentProjects.data.length > 0 ? (
              <ul className="divide-y divide-line">
                {recentProjects.data.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3 text-small">
                    <span className="truncate font-medium">{p.title}</span>
                    <span className="shrink-0 text-subtle">{formatDate(p.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<FolderOpen />}
                title="Aucun projet pour l'instant"
                description="Importe ta première vidéo longue : Clipera en tirera des clips courts prêts à publier."
              />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Derniers clips</CardTitle>
            <Link href="/app/bibliotheque" className="text-small text-primary-soft hover:underline">
              Bibliothèque
            </Link>
          </CardHeader>
          <CardBody>
            <EmptyState
              icon={<Film />}
              title="Aucun clip pour l'instant"
              description="Tes clips apparaîtront ici dès que ta première vidéo aura été traitée."
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
