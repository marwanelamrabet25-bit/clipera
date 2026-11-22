import type { Metadata } from "next";
import Link from "next/link";
import { CopyLink } from "@/components/app/copy-link";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { euros } from "@/lib/pricing";
import { SITE_URL } from "@/lib/seo";
import { createClient, requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Parrainage" };

export default async function ReferralPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: code }, { data: rows }] = await Promise.all([
    supabase.rpc("my_referral_code"),
    supabase.from("referrals").select("status, credit_cents").eq("referrer_id", user.id),
  ]);
  const url = `${SITE_URL}/?parrain=${code ?? ""}`;
  const invited = rows?.length ?? 0;
  const paid = rows?.filter((r) => r.status === "rewarded").length ?? 0;
  const earned = rows?.reduce((s, r) => s + (r.credit_cents ?? 0), 0) ?? 0;
  const stats: [string, string][] = [
    ["Amis inscrits avec ton lien", String(invited)],
    ["Devenus clients", String(paid)],
    ["Crédit gagné", euros(earned)],
  ];

  return (
    <>
      <PageHeader
        title="Parrainage"
        description="Invite tes amis créateurs : ils ont -50 % sur leur premier mois, tu gagnes 1 mois offert."
      />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardBody>
            <p className="text-small font-semibold">Ton lien personnel</p>
            <p className="mt-1 text-caption text-muted">
              Partage-le en message privé, dans ta bio ou sous tes vidéos. Il fonctionne pendant 30 jours après le clic.
            </p>
            <div className="mt-4">
              {code ? (
                <CopyLink url={url} shareText="J'utilise Clipera pour transformer mes vidéos en clips. Avec mon lien, -50 % sur ton premier mois :" />
              ) : (
                <p className="text-small text-danger">Lien indisponible pour le moment. Recharge la page.</p>
              )}
            </div>
            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              {stats.map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-surface/50 p-4">
                  <dt className="text-caption text-muted">{k}</dt>
                  <dd className="mt-1 text-h3 font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-small font-semibold">Comment ça marche</p>
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-small text-muted">
              <li>Ton ami crée son compte avec ton lien (dans les 30 jours).</li>
              <li>Il paie son premier mois à moitié prix (abonnement mensuel).</li>
              <li>
                Dès son premier paiement, tu reçois <strong className="text-fg">1 mois de ton offre</strong> en crédit,
                déduit automatiquement de tes prochaines factures (1 mois de Starter si tu es en gratuit).
              </li>
            </ol>
            <p className="mt-4 text-caption text-subtle">
              Jusqu&apos;à 12 mois offerts par an. Pas d&apos;auto-parrainage. Détails dans les{" "}
              <Link href="/cgv#parrainage" className="text-primary-soft underline">
                conditions de vente
              </Link>
              .
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
