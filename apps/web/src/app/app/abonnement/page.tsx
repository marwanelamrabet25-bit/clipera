import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Meter, PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { formatDate, formatMinutes, formatPrice, getAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Abonnement" };

export default async function BillingPage() {
  const { plan: current, quota } = await getAccount();
  const supabase = await createClient();
  const { data: plans } = await supabase.from("plans").select("*").order("sort_order");

  return (
    <>
      <PageHeader title="Abonnement" description="Ton offre actuelle et ta consommation du mois." />

      {current && quota && (
        <Card className="mb-8">
          <CardBody className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div>
              <p className="text-small text-muted">Offre actuelle</p>
              <p className="mt-1 text-h2 font-bold">{current.name}</p>
              <p className="text-small text-subtle">{formatPrice(current.price_cents)} / mois</p>
            </div>
            <div className="flex flex-col gap-5">
              <Meter
                label="Vidéos"
                used={quota.videosUsed}
                limit={quota.videosLimit}
                detail={`${quota.videosUsed} / ${quota.videosLimit}`}
              />
              <Meter
                label="Minutes de vidéo"
                used={quota.secondsUsed}
                limit={quota.secondsLimit}
                detail={`${formatMinutes(quota.secondsUsed)} / ${formatMinutes(quota.secondsLimit)}`}
              />
              <p className="text-caption text-subtle">Renouvellement le {formatDate(quota.periodEnd)}.</p>
            </div>
          </CardBody>
        </Card>
      )}

      <Alert title="Le paiement en ligne n'est pas encore ouvert" className="mb-6">
        Les offres payantes seront disponibles prochainement. Les limites affichées sont celles réellement appliquées.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(plans ?? []).map((p) => {
          const isCurrent = p.id === current?.id;
          const perks = [
            `${p.monthly_source_videos} vidéos sources / mois`,
            `${formatMinutes(p.monthly_source_seconds)} de vidéo / mois`,
            `Jusqu'à ${p.max_clips_per_video} clips par vidéo`,
            `Export ${p.export_max_height}p`,
            p.watermark ? "Filigrane Clipera" : "Sans filigrane",
          ];
          return (
            <Card key={p.id} className={cn(isCurrent && "border-primary-line")}>
              <CardBody className="flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-h3 font-semibold">{p.name}</p>
                  {isCurrent && <Badge tone="primary">Actuelle</Badge>}
                </div>
                <p className="mt-3 text-h2 font-bold tabular-nums">
                  {formatPrice(p.price_cents)}
                  <span className="text-small font-normal text-subtle"> / mois</span>
                </p>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {perks.map((perk) => (
                    <li key={perk} className="flex gap-2 text-small text-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary-soft" aria-hidden />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Button variant={isCurrent ? "secondary" : "primary"} className="mt-6 w-full" disabled>
                  {isCurrent ? "Offre actuelle" : "Bientôt disponible"}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
