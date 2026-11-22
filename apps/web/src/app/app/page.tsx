import { ArrowRight, Check, Clock, Film, FolderOpen, Gift, Plus, Upload, Video } from "lucide-react";
import Link from "next/link";
import { Meter, PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate, formatMinutes, getAccount } from "@/lib/account";
import { clipDuration, clipRoutes } from "@/lib/clips";
import { cn } from "@/lib/cn";
import { isStorageConfigured } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { videoStatus } from "@/lib/video-status";

export default async function DashboardPage() {
  const { displayName, quota, plan } = await getAccount();
  const supabase = await createClient();
  const [processed, clipCount, recentProjects, recentClips] = await Promise.all([
    supabase
      .from("processing_jobs")
      .select("id", { count: "exact", head: true })
      .eq("kind", "clip_generation")
      .eq("status", "completed"),
    supabase.from("clips").select("id", { count: "exact", head: true }).eq("status", "ready"),
    supabase
      .from("projects")
      .select("id, title, created_at, source_videos(status), processing_jobs(kind, status, created_at)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("clips")
      .select("id, project_id, title, start_seconds, end_seconds, thumbnail_key, created_at")
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const projects = recentProjects.data ?? [];
  const clips = recentClips.data ?? [];
  const storage = isStorageConfigured();
  const videosLeft = quota ? Math.max(quota.videosLimit - quota.videosUsed, 0) : 0;
  const secondsLeft = quota ? Math.max(quota.secondsLimit - quota.secondsUsed, 0) : 0;
  const stats = [
    { label: "Vidéos traitées", value: String(processed.count ?? 0), icon: Video },
    { label: "Clips générés", value: String(clipCount.count ?? 0), icon: Film },
    { label: "Minutes restantes", value: formatMinutes(secondsLeft), icon: Clock },
    { label: "Vidéos restantes", value: quota ? `${videosLeft} / ${quota.videosLimit}` : "—", icon: Upload },
  ];

  // Guide de démarrage : affiché tant que l'utilisateur n'a pas encore obtenu de clip.
  const steps = [
    { done: projects.length > 0, title: "Importe une vidéo", text: "Un fichier ou un lien Google Drive / Dropbox, avec de la parole." },
    { done: (processed.count ?? 0) > 0, title: "Génère tes clips", text: "Choisis le format, le cadrage et les sous-titres." },
    { done: (clipCount.count ?? 0) > 0, title: "Télécharge et publie", text: "Des MP4 prêts pour TikTok, Reels et Shorts." },
  ];
  const onboarding = (clipCount.count ?? 0) === 0;
  const outOfQuota = quota !== null && videosLeft === 0;

  return (
    <>
      <PageHeader
        title={`Bonjour ${displayName}`}
        description={onboarding ? "Tes premiers clips sont à 3 étapes." : "Prêt à transformer une nouvelle vidéo ?"}
        action={
          <Link href="/app/nouveau" className={buttonStyles({ size: "lg" })}>
            <Plus /> Nouveau projet
          </Link>
        }
      />

      {onboarding && (
        <Card className="mb-4 border-primary-line">
          <CardBody>
            <p className="text-small font-semibold">Bien démarrer avec Clipera</p>
            <ol className="mt-4 grid gap-3 md:grid-cols-3">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className={cn("flex gap-3 rounded-lg border p-4", s.done ? "border-line bg-surface/40" : "border-primary-line bg-primary-wash/40")}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full text-caption font-semibold",
                      s.done ? "bg-primary text-on-primary" : "border border-primary-line text-primary-soft",
                    )}
                    aria-hidden
                  >
                    {s.done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span>
                    <span className={cn("block text-small font-medium", s.done && "text-muted line-through")}>{s.title}</span>
                    <span className="mt-0.5 block text-caption text-muted">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            {projects.length === 0 && (
              <Link href="/app/nouveau" className={buttonStyles({ className: "mt-5" })}>
                Importer ma première vidéo <ArrowRight />
              </Link>
            )}
          </CardBody>
        </Card>
      )}

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
            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
              <p className="text-caption text-subtle">
                Offre {plan?.name ?? "Free"} · quota renouvelé le {formatDate(quota.periodEnd)}.
              </p>
              {(outOfQuota || plan?.id === "free") && (
                <Link href="/app/abonnement" className="text-small font-medium text-primary-soft hover:underline">
                  {outOfQuota ? "Quota atteint : voir les offres" : "Passer en HD sans filigrane"} →
                </Link>
              )}
            </div>
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
            {projects.length > 0 ? (
              <ul className="-mx-2 divide-y divide-line">
                {projects.map((p) => {
                  const probe = p.processing_jobs
                    .filter((j) => j.kind === "probe")
                    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
                  const s = videoStatus(p.source_videos[0]?.status, probe);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/app/projets/${p.id}`}
                        className="flex items-center justify-between gap-3 rounded-md px-2 py-3 text-small transition-colors hover:bg-elevated"
                      >
                        <span className="min-w-0 truncate font-medium">{p.title}</span>
                        <span className="flex shrink-0 items-center gap-3">
                          <Badge tone={s.tone}>{s.label}</Badge>
                          <span className="hidden text-subtle sm:inline">{formatDate(p.created_at)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
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
            {clips.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="recent-clips">
                {clips.map((c) => {
                  const thumb = storage ? clipRoutes(c).thumbnail : null;
                  return (
                    <li key={c.id}>
                      <Link href={`/app/projets/${c.project_id}`} className="group block" title={c.title ?? "Clip"}>
                        <div className="aspect-[9/16] overflow-hidden rounded-md border border-line bg-canvas transition-colors group-hover:border-primary-line">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element -- miniature privée servie par l'API
                            <img src={thumb} alt="" className="size-full object-cover" loading="lazy" />
                          ) : (
                            <div className="grid size-full place-items-center text-subtle">
                              <Film aria-hidden />
                            </div>
                          )}
                        </div>
                        <p className="mt-1.5 truncate text-caption text-muted">{clipDuration(c)}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={<Film />}
                title="Aucun clip pour l'instant"
                description="Tes clips apparaîtront ici dès que ta première vidéo aura été traitée."
              />
            )}
          </CardBody>
        </Card>
      </div>

      <Link
        href="/app/parrainage"
        className="mt-4 flex items-center gap-4 rounded-xl border border-line bg-surface/40 p-4 text-small transition-colors hover:border-primary-line"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-primary-line bg-primary-wash text-primary-soft">
          <Gift className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">Invite un ami créateur, gagne 1 mois offert</span>
          <span className="block text-caption text-muted">Il profite de -50 % sur son premier mois.</span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-primary-soft" aria-hidden />
      </Link>
    </>
  );
}
