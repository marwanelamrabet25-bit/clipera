import type { Metadata } from "next";
import { Meter, PageHeader } from "@/components/app/page-header";
import { ManageButton } from "@/components/pricing/billing-buttons";
import { PricingTable } from "@/components/pricing/pricing-table";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { formatDate, formatMinutes, formatPrice, getAccount } from "@/lib/account";
import { euros } from "@/lib/pricing";
import { isStripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Abonnement" };

export default async function BillingPage({ searchParams }: PageProps<"/app/abonnement">) {
  const { paiement } = await searchParams;
  const { plan: current, quota } = await getAccount();
  const supabase = await createClient();
  const [{ data: plans }, { data: sub }] = await Promise.all([
    supabase.from("plans").select("*").eq("is_public", true).order("sort_order"),
    supabase.from("subscriptions").select("*").maybeSingle(),
  ]);
  const paid = Boolean(sub?.stripe_subscription_id && current && current.price_cents > 0);
  const billingOpen = isStripeConfigured();

  return (
    <>
      <PageHeader title="Abonnement" description="Ton offre actuelle et ta consommation du mois." />

      {current && quota && (
        <Card className="mb-8">
          <CardBody className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div>
              <p className="text-small text-muted">Offre actuelle</p>
              <p className="mt-1 text-h2 font-bold">{current.name}</p>
              <p className="text-small text-subtle">
                {paid && sub?.billing_interval === "year"
                  ? `${euros(current.annual_price_cents)} / an`
                  : `${formatPrice(current.price_cents)} / mois`}
              </p>
              {paid && sub?.current_period_end && (
                <p className="mt-2 text-caption text-muted">
                  {sub.cancel_at_period_end ? "Se termine le " : "Renouvellement le "}
                  {formatDate(sub.current_period_end)}
                </p>
              )}
              {paid && billingOpen && (
                <div className="mt-4">
                  <ManageButton />
                </div>
              )}
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
              <p className="text-caption text-subtle">Quotas renouvelés le {formatDate(quota.periodEnd)}.</p>
            </div>
          </CardBody>
        </Card>
      )}

      {paiement === "ok" && (
        <Alert tone="success" title="Merci ! Ton paiement est validé" className="mb-8">
          Ton offre s&apos;active dans quelques secondes (recharge la page si elle n&apos;apparaît pas encore). Ta facture est disponible
          dans « Gérer mon abonnement ».
        </Alert>
      )}
      {!billingOpen && (
        <Alert title="Le paiement en ligne ouvre très bientôt" className="mb-8">
          Tu peux déjà comparer les offres et voir le récapitulatif exact de ce qui sera facturé. Les limites affichées
          sont celles réellement appliquées.
        </Alert>
      )}

      <PricingTable plans={plans ?? []} currentPlanId={current?.id} freeHref="/app" />
    </>
  );
}
