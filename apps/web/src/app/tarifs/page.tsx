import { Breadcrumbs, CtaBlock, Questions, RelatedLinks } from "@/components/marketing/content-page";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/legal/site-footer";
import { PricingTable } from "@/components/pricing/pricing-table";
import { JsonLd } from "@/components/seo/json-ld";
import { euros } from "@/lib/pricing";
import { getPublicPlans } from "@/lib/public-plans";
import { breadcrumbLd, graph, organizationLd, pageMetadata, softwareLd } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/tarifs",
  metaTitle: "Tarifs : offre gratuite, Starter, Pro et Ultimate",
  metaDescription:
    "Tarifs Clipera : offre gratuite sans carte bancaire, puis Starter, Pro et Ultimate, en mensuel sans engagement ou en annuel avec 2 mois offerts.",
});

const QUESTIONS = [
  {
    q: "Puis-je utiliser Clipera gratuitement ?",
    a: "Oui. L'offre gratuite ne demande pas de carte bancaire. Les clips sont exportés en 720p avec un filigrane Clipera.",
  },
  {
    q: "Comment fonctionne l'abonnement annuel ?",
    a: "Tu paies l'année en une seule fois, au prix de 10 mois au lieu de 12. Tes quotas (vidéos et minutes) restent mensuels et se renouvellent chaque mois.",
  },
  {
    q: "Puis-je arrêter quand je veux ?",
    a: "Le mensuel est sans engagement : tu peux résilier à tout moment depuis ton espace, et ton offre reste active jusqu'à la fin de la période payée.",
  },
  {
    q: "Que se passe-t-il si un traitement échoue ?",
    a: "Si aucun clip n'est produit, la vidéo n'est pas décomptée de ton quota : elle t'est restituée automatiquement.",
  },
  {
    q: "Le paiement est-il déjà ouvert ?",
    a: "Le paiement en ligne des offres payantes ouvre très bientôt. L'offre gratuite est disponible dès maintenant.",
  },
];

const hours = (s: number) => (s >= 3600 ? `${s / 3600} h` : `${Math.round(s / 60)} min`);

export default async function TarifsPage() {
  const plans = await getPublicPlans();
  const crumbs = [{ name: "Tarifs", path: "/tarifs" }];
  const rows: [string, (p: (typeof plans)[number]) => string][] = [
    ["Prix mensuel", (p) => (p.price_cents ? `${euros(p.price_cents)} / mois` : "Gratuit")],
    ["Prix annuel", (p) => (p.annual_price_cents ? `${euros(p.annual_price_cents)} / an` : "—")],
    ["Vidéos par mois", (p) => String(p.monthly_source_videos)],
    ["Minutes de vidéo par mois", (p) => `${Math.round(p.monthly_source_seconds / 60)} min`],
    ["Durée maximale d'une vidéo", (p) => hours(p.max_video_seconds)],
    ["Clips par vidéo (maximum)", (p) => String(p.max_clips_per_video)],
    ["Qualité d'export", (p) => `${p.export_max_height}p`],
    ["Filigrane Clipera", (p) => (p.watermark ? "Oui" : "Non")],
    ["Traitement prioritaire", (p) => (p.priority > 0 ? "Oui" : "Non")],
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={graph(organizationLd(), softwareLd(plans), breadcrumbLd(crumbs))} />
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-8 sm:pt-14">
          <Breadcrumbs items={crumbs} />
          <div className="mx-auto mt-8 max-w-2xl text-center">
            <p className="text-small font-semibold text-primary-soft">Tarifs</p>
            <h1 className="mt-3 text-h1 font-bold text-balance sm:text-display">Les tarifs de Clipera</h1>
            <p className="mt-5 text-body text-muted">
              Commence gratuitement, sans carte bancaire. Passe ensuite à l&apos;offre adaptée à ton rythme de
              publication : mensuel sans engagement, ou annuel avec 2 mois offerts. Prix TTC.
            </p>
          </div>
          {plans.length > 0 ? (
            <>
              <div className="mt-12">
                <PricingTable plans={plans} />
              </div>
              <section className="mt-20">
                <h2 className="text-h2 font-bold">Comparer les offres en détail</h2>
                <div className="mt-6 overflow-x-auto rounded-xl border border-line">
                  <table className="w-full min-w-[640px] text-left text-small">
                    <caption className="sr-only">Comparaison détaillée des offres Clipera</caption>
                    <thead className="bg-surface text-fg">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Offre
                        </th>
                        {plans.map((p) => (
                          <th key={p.id} scope="col" className="px-4 py-3 font-semibold">
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-muted">
                      {rows.map(([label, value]) => (
                        <tr key={label}>
                          <th scope="row" className="px-4 py-3 font-medium text-fg">
                            {label}
                          </th>
                          {plans.map((p) => (
                            <td key={p.id} className="px-4 py-3 tabular-nums">
                              {value(p)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-caption text-subtle">
                  Toutes les offres incluent les sous-titres (4 styles), les formats 9:16, 1:1 et 16:9 et les trois modes
                  de cadrage. L&apos;export ne dépasse jamais la qualité de ta vidéo d&apos;origine.
                </p>
              </section>
            </>
          ) : (
            <p className="mt-10 text-center text-muted">Les tarifs sont momentanément indisponibles.</p>
          )}
          <div className="mx-auto mt-20 flex max-w-3xl flex-col gap-16">
            <Questions items={QUESTIONS} />
            <RelatedLinks paths={["/generateur-clips-ia", "/transformer-podcast-en-clips"]} />
            <CtaBlock
              title="Essaie Clipera sur ta prochaine vidéo"
              text="L'offre gratuite te permet de générer tes premiers clips et de juger la qualité par toi-même."
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
