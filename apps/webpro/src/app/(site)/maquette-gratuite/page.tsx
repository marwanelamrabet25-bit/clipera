import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink, ArrowLink } from "@/components/ui/button";
import { SectionHead } from "@/components/ui/section-head";
import { MockupForm } from "@/components/forms/mockup-form";
import { mockupSteps } from "@/components/offers/mockup-offer";
import { FaqSection } from "@/components/home/faq-section";
import { contact } from "@/config/site";
import { formatPrice, offerById } from "@/config/offers";
import { mockupExamples, showMockupExamples } from "@/content/mockups";
import { pageMetadata } from "@/lib/seo";
import type { QA } from "@/content/faq";

export const metadata: Metadata = pageMetadata({
  title: "Maquette gratuite de votre site internet",
  description:
    "Découvrez gratuitement une première maquette visuelle de votre futur site internet, adaptée à votre entreprise. WEBPRO AGENCY, agence web dans le Doubs.",
  path: "/maquette-gratuite",
});

const faq: QA[] = [
  {
    q: "La maquette est-elle vraiment gratuite ?",
    a: "Oui. La première maquette visuelle est offerte. Il s'agit d'une proposition pour vous aider à imaginer votre futur site, et non de la création gratuite d'un site complet.",
  },
  {
    q: "La maquette est-elle générée automatiquement ?",
    a: "Non. Elle est préparée par nos soins à partir des informations que vous nous transmettez sur votre entreprise et votre activité, puis nous vous la présentons.",
  },
  {
    q: "Quelles informations dois-je fournir ?",
    a: "Le nom de votre entreprise, votre secteur d'activité et une description de ce que vous faites. L'adresse de votre site actuel, votre logo ou vos couleurs sont utiles, mais facultatifs.",
  },
  {
    q: "Que se passe-t-il si la maquette me plaît ?",
    a: `Nous échangeons sur la création de votre site. Pour information, la création d'un site internet est proposée à ${formatPrice(offerById("site").billing[0].amount)} en paiement unique (hors nom de domaine, hébergement et frais externes), ou dans le WEBPRO PACK avec la gestion des réseaux sociaux.`,
  },
];

export default function Page() {
  const site = offerById("site").billing[0];
  const [packSite, packSocial] = offerById("pack").billing;
  return (
    <>
      <PageHero
        crumbs={[{ name: "Maquette gratuite", path: "/maquette-gratuite" }]}
        eyebrow="Offert · Première maquette"
        title={["Découvrez gratuitement une première maquette", { text: "de votre futur site internet.", className: "text-slate" }]}
        lead={
          <p>
            Vous souhaitez savoir à quoi pourrait ressembler votre futur site internet ? WEBPRO AGENCY vous propose de découvrir
            gratuitement une première maquette visuelle adaptée à votre entreprise et à votre activité.
          </p>
        }
        actions={
          <>
            <ButtonLink href="#formulaire">Demander ma maquette gratuite</ButtonLink>
            <ButtonLink href="/tarifs" variant="outline">
              Voir les tarifs
            </ButtonLink>
          </>
        }
      />

      <section aria-labelledby="mk-how" className="border-t border-line py-24 md:py-32">
        <div className="shell">
          <SectionHead index="01" label="Déroulé" id="mk-how" title={["Simple,", { text: "en trois étapes.", className: "text-slate" }]} />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[6px] border border-line bg-line md:grid-cols-3">
            {mockupSteps.map((s, i) => (
              <li key={s.t} data-reveal style={{ "--d": i * 100 } as CSSProperties} className="bg-ink p-7 md:p-8">
                <span className="font-mono text-sm text-electric">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 text-[1.3rem] leading-tight font-semibold tracking-[-0.02em] text-paper">{s.t}</h3>
                <p className="mt-3 text-mist">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div data-reveal className="border-t border-line-strong pt-6">
              <p className="t-label text-electric">Ce que c&apos;est</p>
              <p className="mt-3 text-paper">
                Une première proposition visuelle, conçue pour votre entreprise et votre activité, pour vous aider à imaginer
                votre futur site.
              </p>
            </div>
            <div data-reveal style={{ "--d": 100 } as CSSProperties} className="border-t border-line-strong pt-6">
              <p className="t-label text-slate">Ce que ce n&apos;est pas</p>
              <p className="mt-3 text-mist">
                Ni la création gratuite d&apos;un site complet, ni un modèle généré automatiquement : chaque maquette est préparée
                par nos soins.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="formulaire" aria-labelledby="mk-form-title" className="scroll-mt-24 border-t border-line bg-ink-2/40 py-24 md:py-32">
        <div className="shell grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <p className="t-label text-mist">02 — Votre demande</p>
              <h2 id="mk-form-title" className="t-h2 mt-6 max-w-[12ch] text-paper">
                Parlez-nous de <span className="text-slate">votre entreprise.</span>
              </h2>
              <p className="mt-6 max-w-[38ch] text-mist">
                Plus vous nous en dites, plus la maquette vous ressemblera. Une question avant de remplir le formulaire ?
              </p>
              <p className="mt-4">
                <a href={`tel:${contact.phoneE164}`} className="text-[1.3rem] font-bold tracking-[-0.02em] text-paper hover:text-glow">
                  {contact.phoneDisplay}
                </a>
              </p>
            </div>
          </div>
          <div className="col-span-4 md:col-span-12 lg:col-span-7 lg:col-start-6">
            <MockupForm />
          </div>
        </div>
      </section>

      {showMockupExamples && (
        <section aria-labelledby="mk-examples" className="border-t border-line py-24 md:py-32">
          <div className="shell">
            <SectionHead index="03" label="Exemples" id="mk-examples" title={["À quoi peut ressembler", { text: "une maquette ?", className: "text-slate" }]}>
              <p>
                Trois exemples conçus pour des entreprises <strong className="font-semibold text-paper">fictives</strong> : ce ne
                sont pas des réalisations clients. Chaque maquette part de l&apos;activité et de la clientèle de l&apos;entreprise.
              </p>
            </SectionHead>
            <ul className="mt-16 grid gap-6 md:grid-cols-3">
              {mockupExamples.map((m, i) => (
                <li key={m.slug} data-reveal style={{ "--d": i * 120 } as CSSProperties}>
                  <a href={m.previewHref} target="_blank" rel="noopener" className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] ring-1 ring-paper/10">
                      <Image
                        src={m.images.desktop}
                        alt={`Exemple de maquette pour un ${m.sector.toLowerCase()} (entreprise fictive « ${m.name} »)`}
                        fill
                        sizes="(min-width: 768px) 30vw, 92vw"
                        className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                      />
                      <span className="t-label absolute top-3 left-3 rounded-[2px] bg-black/55 px-2 py-1 text-[0.6rem] text-paper/90 backdrop-blur-sm">
                        Exemple fictif
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span>
                        <span className="block font-semibold text-paper">{m.sector}</span>
                        <span className="block text-sm text-mist">Entreprise imaginaire « {m.name} »</span>
                      </span>
                      <span className="flex gap-1" role="img" aria-label="Palette de couleurs de l'exemple">
                        {m.palette.map((c) => (
                          <span key={c} className="size-3 rounded-full ring-1 ring-paper/15" style={{ background: c }} />
                        ))}
                      </span>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-paper group-hover:text-glow">
                      Voir l&apos;exemple en plein écran <span aria-hidden>↗</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-label="Et ensuite" className="border-t border-line py-20">
        <div className="shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-label text-slate">Et ensuite ?</p>
            <p className="mt-4 max-w-[52ch] text-[1.25rem] leading-snug text-paper">
              Si la maquette vous plaît : création du site à {formatPrice(site.amount)} en paiement unique, ou WEBPRO PACK (site à{" "}
              {formatPrice(packSite.amount)} en paiement unique, puis réseaux sociaux à {formatPrice(packSocial.amount)}/mois).
            </p>
          </div>
          <ArrowLink href="/tarifs">Détail des tarifs</ArrowLink>
        </div>
      </section>

      <FaqSection items={faq} index="04" title="Maquette gratuite :" titleMuted="vos questions." />
    </>
  );
}
