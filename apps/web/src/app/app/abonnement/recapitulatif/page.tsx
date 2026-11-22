import type { Metadata } from "next";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { PayButton } from "@/components/pricing/billing-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { getAccount } from "@/lib/account";
import { type Billing, euros, planPerks, planPrice, renewalDate } from "@/lib/pricing";
import { isStripeConfigured } from "@/lib/stripe";
import { hasReferralDiscount } from "@/lib/referral";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Récapitulatif" };

/**
 * Récapitulatif AVANT paiement : formule, prix équivalent, montant débité aujourd'hui, période, renouvellement.
 * Les montants viennent de la base (jamais de l'adresse de la page).
 */
export default async function SummaryPage({ searchParams }: PageProps<"/app/abonnement/recapitulatif">) {
  const sp = await searchParams;
  const planId = typeof sp.offre === "string" ? sp.offre : "";
  const billing: Billing = sp.periode === "annuel" ? "annual" : "monthly";
  if (!/^[a-z_]+$/.test(planId)) notFound();

  const supabase = await createClient();
  const [{ data: plan }, account] = await Promise.all([
    supabase.from("plans").select("*").eq("id", planId).eq("is_public", true).maybeSingle(),
    getAccount(),
  ]);
  const current = account.plan;
  if (!plan || plan.price_cents === 0) notFound();

  const price = planPrice(plan);
  const annual = billing === "annual";
  const renewal = annual ? price.annualCents : price.monthlyCents;
  // Filleul : -50 % sur le premier mois d'un abonnement mensuel (même règle que le serveur de paiement).
  const referral = !annual && (await hasReferralDiscount(account.user.id));
  // Même arrondi que Stripe : la remise (50 %) est arrondie au centime supérieur (9,99 € → 4,99 €).
  const today = referral ? renewal - Math.round(renewal / 2) : renewal;
  const rows: [string, string][] = [
    ["Formule", `${plan.name} — ${annual ? "annuelle" : "mensuelle"}`],
    ...(annual ? [["Prix équivalent", `${euros(price.equivalentMonthlyCents)} / mois`] as [string, string]] : []),
    ["Période", annual ? "12 mois" : "1 mois"],
    ["Prochain renouvellement", renewalDate(billing)],
    ["Prix au renouvellement", `${euros(renewal)} ${annual ? "/ an" : "/ mois"}`],
  ];

  return (
    <>
      <Link href="/app/abonnement" className="mb-4 inline-flex items-center gap-1.5 text-small text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> Offres
      </Link>
      <PageHeader title="Récapitulatif" description="Vérifie ce qui sera facturé avant de payer." />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardBody>
            <div className="rounded-xl border border-primary-line bg-primary-wash/50 p-5" data-testid="charged-today">
              <p className="text-small text-muted">Montant débité aujourd&apos;hui</p>
              <p className="mt-1 text-h1 font-bold tabular-nums">{euros(today)}</p>
              <p className="mt-1 text-caption text-muted">
                {annual
                  ? `Paiement unique pour 12 mois. Économie de ${euros(price.savingsCents)} par rapport au mensuel (2 mois offerts).`
                  : referral
                    ? `Parrainage : -50 % sur ton premier mois. Puis ${euros(renewal)} chaque mois, résiliable à tout moment.`
                    : "Puis le même montant chaque mois, résiliable à tout moment."}
              </p>
            </div>
            <dl className="mt-6 divide-y divide-line" data-testid="summary-rows">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3 text-small">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-caption text-subtle">
              Prix TTC. Renouvellement automatique au même prix, sauf résiliation avant la date de renouvellement. Tu
              peux résilier à tout moment depuis ton espace : l&apos;accès reste actif jusqu&apos;à la fin de la période
              payée.
            </p>
            {current?.id === plan.id && (
              <Alert className="mt-6" title="C'est déjà ton offre actuelle" />
            )}
            {isStripeConfigured() ? (
              <PayButton plan={plan.id} billing={billing} label={`Payer ${euros(today)}`} />
            ) : (
              <>
                <Alert className="mt-6" title="Le paiement en ligne ouvre très bientôt">
                  Aucun paiement n&apos;est possible pour le moment : tu ne seras pas débité.
                </Alert>
                <Button size="lg" className="mt-6 w-full sm:w-auto" disabled>
                  <Lock /> Payer {euros(today)}
                </Button>
              </>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-small font-semibold">Inclus dans {plan.name}</p>
            <ul className="mt-4 flex flex-col gap-2 text-small text-muted">
              {planPerks(plan).map((perk) => (
                <li key={perk}>• {perk}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
