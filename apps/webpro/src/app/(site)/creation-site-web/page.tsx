import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink, ArrowLink } from "@/components/ui/button";
import { SectionHead } from "@/components/ui/section-head";
import { FeatureList } from "@/components/ui/feature-list";
import { HonestNote } from "@/components/ui/honest-note";
import { BrowserFrame, PhoneFrame } from "@/components/visuals/frames";
import { Method } from "@/components/home/method";
import { FaqSection } from "@/components/home/faq-section";
import { ClosingCta } from "@/components/ui/closing-cta";
import { PricingSection } from "@/components/offers/pricing-section";
import { MockupBand } from "@/components/offers/mockup-offer";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import { formatPrice, offerById } from "@/config/offers";
import { primaryCta } from "@/config/navigation";
import { mockupExamples, mockupBySlug } from "@/content/mockups";
import { priceSentences, type QA } from "@/content/faq";

const PATH = "/creation-site-web";
const sitePrice = offerById("site").billing[0].amount;
const DESCRIPTION = `Création de sites vitrines pour les professionnels du Doubs : design personnalisé, adapté au mobile, SEO de base. À partir de ${formatPrice(sitePrice)} en paiement unique.`;

export const metadata: Metadata = pageMetadata({
  title: "Création de site internet dans le Doubs",
  description: DESCRIPTION,
  path: PATH,
});

/** Les huit éléments de la catégorie 01, détaillés. */
const included = [
  { t: "Création de sites vitrines", d: "Un site clair qui présente votre entreprise, vos services et vos coordonnées." },
  { t: "Conception graphique", d: "Une mise en page soignée, pensée pour être lue facilement et inspirer confiance." },
  { t: "Design personnalisé", d: "Des couleurs, des typographies et un ton propres à votre activité, pas un modèle de plus." },
  { t: "Adaptation mobile", d: "Un affichage confortable sur téléphone, tablette et ordinateur." },
  { t: "Présentation des activités", d: "Vos prestations expliquées simplement, pour que chaque visiteur trouve ce qui le concerne." },
  { t: "Formulaires de contact", d: "Les demandes de vos clients arrivent directement dans votre boîte mail." },
  { t: "Optimisation SEO de base", d: "Structure des pages, titres, descriptions et contenus pensés pour Google." },
  { t: "Mise en ligne", d: "Publication du site selon les conditions convenues ensemble." },
];

const seo = [
  "Une structure de titres claire sur chaque page",
  "Un titre et une description uniques par page",
  "Des adresses de pages lisibles",
  "Un affichage rapide, y compris sur mobile",
  "Des contenus rédigés autour de votre métier et de votre secteur",
  "Un plan du site transmis à Google (sitemap)",
];

const faq: QA[] = [
  { q: "Combien coûte la création d'un site internet ?", a: `${priceSentences.site} ${priceSentences.external}` },
  {
    q: "Combien de temps faut-il pour créer un site ?",
    a: "Cela dépend surtout du nombre de pages et de la disponibilité des contenus (textes, photos). Un calendrier vous est proposé une fois le projet défini ensemble.",
  },
  {
    q: "Dois-je fournir les textes et les photos ?",
    a: "Vous connaissez votre métier mieux que personne : vos informations sont la base. Nous vous aidons à les présenter clairement, et la création de visuels fait partie de nos prestations réseaux sociaux. Nous définissons ensemble ce que chacun prépare.",
  },
  {
    q: "Le nom de domaine et l'hébergement sont-ils compris ?",
    a: "Non : ils sont distincts du prix de création. Nous vous expliquons les options possibles et les précisons avant la mise en ligne, tout comme les licences éventuelles et les frais externes.",
  },
  {
    q: "Puis-je voir une maquette avant de me décider ?",
    a: "Oui : demandez votre maquette gratuite. Il s'agit d'une première proposition visuelle adaptée à votre entreprise, pas de la création gratuite d'un site complet.",
  },
];

export default function Page() {
  const sylve = mockupBySlug("atelier-sylve")!;
  return (
    <>
      <PageHero
        crumbs={[{ name: "Création de sites internet", path: PATH }]}
        eyebrow="Service 01 · Sites internet"
        title={["Création de sites internet", { text: "pour les professionnels du Doubs.", className: "text-slate" }]}
        lead={
          <p>
            Des sites vitrines clairs, rapides et soignés, qui présentent votre activité et facilitent la prise de contact. Pour
            les artisans, commerçants, indépendants et entreprises de tout le Doubs, à {formatPrice(sitePrice)} en paiement unique.
          </p>
        }
        actions={
          <>
            <ButtonLink href={primaryCta.href}>{primaryCta.longLabel}</ButtonLink>
            <ButtonLink href="#tarifs" variant="outline">
              Voir le tarif
            </ButtonLink>
          </>
        }
      />

      <section aria-label="Exemple de maquette de site vitrine" className="shell relative -mt-6 pb-28 md:pb-40">
        <div className="group relative">
          <div className="enter-soft">
            <BrowserFrame
              src={sylve.images.full ?? sylve.images.desktop}
              alt="Exemple de maquette de site vitrine pour une menuiserie fictive (la page défile au survol)"
              label="Exemple de maquette — menuiserie (fictive)"
              sizes="(min-width: 1440px) 1330px, 94vw"
              scrollOnHover
              preload
            />
          </div>
          <div style={{ "--d": 480 } as CSSProperties} className="enter absolute right-[4%] -bottom-10 w-[24%] max-w-[15rem] md:-bottom-16">
            <PhoneFrame src={sylve.images.mobile} alt="Version mobile de l'exemple de maquette pour une menuiserie fictive" sizes="(min-width: 1024px) 15rem, 24vw" />
          </div>
        </div>
        <p className="t-label mt-20 text-slate md:mt-10">
          Exemple de maquette · entreprise fictive<span className="hidden lg:inline"> · survolez pour parcourir la page</span>
        </p>
      </section>

      <section aria-labelledby="sw-intro" className="border-t border-line py-28 md:py-36">
        <div className="shell">
          <SectionHead index="01" label="Pourquoi un site" id="sw-intro" title={["Votre site, c'est souvent", { text: "la première rencontre.", className: "text-slate" }]}>
            <p>
              Avant d&apos;appeler, beaucoup de clients regardent d&apos;abord ce que vous faites, où vous intervenez et comment
              vous joindre. Un site bien conçu répond à ces questions en quelques secondes, inspire confiance et donne envie
              d&apos;aller plus loin.
            </p>
            <p className="text-paper">
              C&apos;est ce que nous construisons : un outil au service de votre activité, pas une simple vitrine décorative.
            </p>
          </SectionHead>
        </div>
      </section>

      <section aria-labelledby="sw-included" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell">
          <SectionHead index="02" label="Ce qui est compris" id="sw-included" title={["Tout ce qu'il faut", { text: "pour être présent en ligne.", className: "text-slate" }]} />
          <FeatureList items={included} columns={4} className="mt-16" />
        </div>
      </section>

      <section aria-labelledby="sw-design" className="border-t border-line py-28 md:py-36">
        <div className="shell grid-12 items-center gap-y-14">
          <div className="col-span-4 md:col-span-12 lg:col-span-5">
            <SectionHead stacked index="03" label="Design personnalisé" id="sw-design" title={["Un design pour votre activité,", { text: "pas un modèle de plus.", className: "text-slate" }]} />
            <div data-reveal className="mt-8 space-y-5 text-mist">
              <p>
                Votre site doit refléter votre métier et votre façon de travailler. Nous construisons une direction visuelle propre
                à votre activité : couleurs, typographies, images, ton des textes.
              </p>
              <p>Un restaurant, une menuiserie et un institut de beauté n&apos;ont pas besoin du même site : ces trois exemples de maquettes, conçus pour des entreprises fictives, le montrent.</p>
            </div>
            <div data-reveal className="mt-10">
              <ArrowLink href="/maquette-gratuite">Recevoir une maquette pour mon entreprise</ArrowLink>
            </div>
          </div>
          <div className="col-span-4 md:col-span-12 lg:col-span-6 lg:col-start-7">
            <ul className="grid grid-cols-2 gap-3 sm:gap-4">
              {mockupExamples.map((m, i) => (
                <li key={m.slug} data-reveal style={{ "--d": i * 90 } as CSSProperties} className={i === 0 ? "col-span-2" : undefined}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] ring-1 ring-paper/10">
                    <Image src={m.images.desktop} alt={`Exemple de maquette pour un ${m.sector.toLowerCase()} (entreprise fictive)`} fill sizes="(min-width: 1024px) 40vw, 92vw" className="object-cover object-top" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-paper">
                      {m.sector} <span className="font-normal text-slate">· exemple fictif</span>
                    </span>
                    <span className="flex gap-1" role="img" aria-label="Palette de couleurs de l'exemple">
                      {m.palette.map((c) => (
                        <span key={c} className="size-3 rounded-full ring-1 ring-paper/15" style={{ background: c }} />
                      ))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="sw-mobile" className="relative overflow-clip border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell grid-12 items-center gap-y-16">
          <div className="col-span-4 md:col-span-12 lg:order-2 lg:col-span-5 lg:col-start-8">
            <SectionHead stacked index="04" label="Adaptation mobile" id="sw-mobile" title={["Lisible partout,", { text: "d'abord sur téléphone.", className: "text-slate" }]} />
            <div data-reveal className="mt-8 space-y-5 text-mist">
              <p>
                Une grande partie de vos visiteurs vous découvriront sur leur téléphone, parfois entre deux rendez-vous. Chaque page
                est conçue pour le petit écran autant que pour l&apos;ordinateur : textes lisibles sans zoomer, boutons faciles à
                toucher, informations essentielles en premier.
              </p>
            </div>
          </div>
          <div className="col-span-4 md:col-span-12 lg:order-1 lg:col-span-6">
            <div className="flex items-end justify-center gap-3 sm:gap-6">
              {mockupExamples.map((m, i) => (
                <div key={m.slug} data-reveal className="w-[31%] max-w-[13.5rem]" style={{ "--d": i * 120, marginBottom: i === 1 ? "3rem" : 0 } as CSSProperties}>
                  <PhoneFrame src={m.images.mobile} alt={`Exemple de maquette mobile pour un ${m.sector.toLowerCase()} (entreprise fictive)`} sizes="(min-width: 1024px) 13.5rem, 31vw" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="sw-seo" className="border-t border-line py-28 md:py-36">
        <div className="shell grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-12 lg:col-span-6">
            <SectionHead stacked index="05" label="SEO de base" id="sw-seo" title={["Pensé pour être trouvé", { text: "sur Google.", className: "text-slate" }]} />
            <div data-reveal className="t-lead mt-8 max-w-[48ch] text-mist">
              <p>
                Une optimisation SEO de base est comprise dans la création : un site bien structuré, rapide et rédigé pour vos
                clients est mieux compris par les moteurs de recherche, notamment pour les recherches locales dans le Doubs.
              </p>
            </div>
            <HonestNote title="Ce que nous ne promettons pas" className="mt-10">
              <p>
                Une première place garantie. Le positionnement dépend aussi de la concurrence, de l&apos;ancienneté du site, des avis
                clients et de la qualité des contenus dans le temps.
              </p>
            </HonestNote>
          </div>
          <div className="col-span-4 md:col-span-12 lg:col-span-5 lg:col-start-8">
            <p className="t-label text-slate">Compris dans l&apos;optimisation de base</p>
            <ul className="mt-6 border-t border-line">
              {seo.map((s, i) => (
                <li key={s} data-reveal style={{ "--d": i * 60 } as CSSProperties} className="flex items-baseline gap-4 border-b border-line py-4 text-paper">
                  <span className="t-label text-electric tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ul>
            <div data-reveal className="mt-8">
              <ArrowLink href="/blog/visibilite-locale-google-entreprise-doubs">Lire : la visibilité locale sur Google, les bases</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      <PricingSection index="06" ids={["site", "pack"]} title={["Le tarif,", { text: "en toute transparence.", className: "text-slate" }]} />
      <MockupBand />
      <Method index="07" headingId="sw-method" />
      <FaqSection items={faq} index="08" title="Création de site :" titleMuted="vos questions." />
      <ClosingCta title="Parlons de" highlight="votre futur site." text="Décrivez votre activité et vos besoins : nous revenons vers vous pour en discuter." />
      <JsonLd data={serviceJsonLd({ name: "Création de sites internet", serviceType: "Création de site internet vitrine", description: DESCRIPTION, path: PATH, offerIds: ["site", "pack"] })} />
    </>
  );
}
