import type { Metadata } from "next";
import { Meter, PageHeader } from "@/components/app/page-header";
import { PricingTable } from "@/components/pricing/pricing-table";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { formatDate, formatMinutes, formatPrice, getAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Abonnement" };

export default async function BillingPage() {
  const { plan: current, quota } = await getAccount();
  const supabase = await createClient();
  const { data: plans } = await supabase.from("plans").select("*").eq("is_public", true).order("sort_order");

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

      <Alert title="Le paiement en ligne ouvre très bientôt" className="mb-8">
        Tu peux déjà comparer les offres et voir le récapitulatif exact de ce qui sera facturé. Les limites affichées
        sont celles réellement appliquées.
      </Alert>

      <PricingTable plans={plans ?? []} currentPlanId={current?.id} freeHref="/app" />
    </>
  );
}
