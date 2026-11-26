import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHead } from "@/components/ui/section-head";
import { CareOption, OfferGrid, PricingFootnote } from "@/components/offers/offer-cards";
import { MockupBand } from "@/components/offers/mockup-offer";
import { FaqSection } from "@/components/home/faq-section";
import { ClosingCta } from "@/components/ui/closing-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { care, externalCosts, formatPrice, offerById, packMonthlySaving } from "@/config/offers";
import { offerCatalogJsonLd, pageMetadata } from "@/lib/seo";
import type { QA } from "@/content/faq";

export const metadata: Metadata = pageMetadata({
  title: "Tarifs : site internet et réseaux sociaux",
  description: `Site internet à ${formatPrice(offerById("site").billing[0].amount)} en paiement unique, gestion des réseaux sociaux à ${formatPrice(offerById("social").billing[0].amount)} par mois, WEBPRO PACK : des tarifs clairs pour les entreprises du Doubs.`,
  path: "/tarifs",
});

const externalDetails: Record<(typeof externalCosts)[number], string> = {
  "Nom de domaine": "L'adresse de votre site (ex. votre-entreprise.fr), enregistrée à votre nom auprès d'un registraire.",
  Hébergement: "Le service qui rend votre site accessible en ligne. Plusieurs solutions existent selon les besoins.",
  "Licences éventuelles": "Certaines polices, photos ou outils peuvent nécessiter une licence payante. Nous vous prévenons avant.",
  "Frais externes": "Tout autre service tiers éventuel (outil spécifique, prestataire externe), toujours précisé à l'avance.",
};

export default function Page() {
  const site = offerById("site").billing[0];
  const social = offerById("social").billing[0];
  const [packSite, packSocial] = offerById("pack").billing;
  const faq: QA[] = [
    {
      q: "Y a-t-il un abonnement obligatoire pour le site internet ?",
      a: `Non. La création du site internet est un paiement unique de ${formatPrice(site.amount)}. Le nom de domaine, l'hébergement, les licences éventuelles et les frais externes sont distincts et vous sont précisés avant la mise en ligne.`,
    },
    {
      q: "Le WEBPRO PACK se paie-t-il en une seule fois ?",
      a: `Non, il comprend deux paiements distincts : ${formatPrice(packSite.amount)} une seule fois pour la création du site, puis ${formatPrice(packSocial.amount)} par mois pour la gestion des réseaux sociaux, soit ${formatPrice(packMonthlySaving())} de moins chaque mois que l'offre réseaux sociaux seule (${formatPrice(social.amount)} par mois).`,
    },
    {
      q: "Combien de publications et de vidéos sont comprises ?",
      a: "Le nombre de publications, de vidéos et les réseaux concernés sont définis avec vous selon la formule choisie, avant le démarrage. Rien n'est laissé au hasard : tout est précisé dans la proposition.",
    },
    {
      q: "Quelle est la durée d'engagement ?",
      a: "Les conditions de la gestion des réseaux sociaux (durée, résiliation) vous sont précisées dans la proposition commerciale, avant tout engagement.",
    },
    {
      q: "La maintenance est-elle obligatoire ?",
      a:
        care.status === "published"
          ? `Non. ${care.name} est une option facultative à ${formatPrice(care.monthly)} par mois.`
          : `Non. Une option de maintenance facultative (${care.name}) peut être proposée sur demande ; elle n'est jamais obligatoire.`,
    },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ name: "Tarifs", path: "/tarifs" }]}
        eyebrow="Tarifs"
        wide
        title={["Des tarifs clairs,", { text: "sans surprise.", className: "text-slate" }]}
        lead={
          <p>
            Un site internet en paiement unique, une gestion des réseaux sociaux au mois, ou les deux réunis dans le WEBPRO PACK.
            Chaque montant est affiché tel qu&apos;il sera facturé.
          </p>
        }
        className="!pb-12 md:!pb-16"
      />

      <section aria-label="Offres" className="shell pb-24 md:pb-32">
        <OfferGrid headingLevel="h2" instant />
        <PricingFootnote />
        <CareOption className="mt-10" />
      </section>

      <section aria-labelledby="tf-external" className="border-t border-line bg-ink-2/40 py-24 md:py-32">
        <div className="shell">
          <SectionHead index="01" label="À prévoir séparément" id="tf-external" title={["Ce qui est facturé", { text: "à part.", className: "text-slate" }]}>
            <p>Ces frais ne dépendent pas de nous : ils sont distincts de nos prestations et toujours précisés avant la mise en ligne.</p>
          </SectionHead>
          <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {externalCosts.map((c, i) => (
              <li key={c} data-reveal style={{ "--d": i * 90 } as CSSProperties} className="border-t border-line-strong pt-6">
                <h3 className="text-[1.2rem] font-semibold tracking-[-0.02em] text-paper">{c}</h3>
                <p className="mt-3 text-mist">{externalDetails[c]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <MockupBand />
      <FaqSection items={faq} index="02" title="Tarifs :" titleMuted="vos questions." />
      <ClosingCta title="Une question" highlight="sur nos offres ?" text="Écrivez-nous ou appelez-nous : nous vous aidons à choisir la formule adaptée à votre activité." />
      <JsonLd data={offerCatalogJsonLd()} />
    </>
  );
}
