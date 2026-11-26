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
import { RelatedProjects } from "@/components/projects/related-projects";
import { FaqSection } from "@/components/home/faq-section";
import { ClosingCta } from "@/components/ui/closing-cta";
import { PricingBlock } from "@/components/ui/pricing-block";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import { projects } from "@/content/projects";
import type { QA } from "@/content/faq";

const PATH = "/creation-site-web";
const DESCRIPTION =
  "Création et refonte de sites internet pour les professionnels du Doubs : design personnalisé, adapté au mobile, pensé pour Google et pour la prise de contact.";

export const metadata: Metadata = pageMetadata({
  title: "Création de site internet dans le Doubs",
  description: DESCRIPTION,
  path: PATH,
});

const types = [
  {
    t: "Site vitrine",
    d: "Quelques pages essentielles pour présenter votre activité, vos services et vos coordonnées. Idéal pour démarrer, ou pour une activité locale qui veut être trouvée facilement.",
  },
  {
    t: "Site professionnel",
    d: "Une structure plus complète : une page par service, vos réalisations, votre zone d'intervention, vos actualités. Pour les entreprises qui ont beaucoup à montrer.",
  },
  {
    t: "Refonte",
    d: "Votre site existe mais il date, s'affiche mal sur téléphone ou n'apporte pas de demandes ? Nous le repensons en conservant ce qui a de la valeur, notamment pour le référencement.",
  },
  {
    t: "Projets spécifiques",
    d: "Vente en ligne, prise de rendez-vous, catalogue : décrivez votre besoin, nous étudions avec vous la solution la plus adaptée.",
  },
];

const features = [
  { t: "Formulaire de contact", d: "Les demandes arrivent dans votre boîte mail, avec les informations utiles pour y répondre." },
  { t: "Appel en un geste", d: "Sur téléphone, votre numéro se compose d'un simple toucher. Pratique pour un client pressé." },
  { t: "Une page par service", d: "Chaque prestation expliquée clairement : le visiteur trouve vite ce qui le concerne." },
  { t: "Vos réalisations", d: "Une galerie pour montrer votre travail. C'est souvent ce qui convainc le plus." },
  { t: "Zone d'intervention", d: "Où vous travaillez, clairement indiqué, pour rassurer vos clients et pour Google." },
  { t: "Pages légales", d: "Mentions légales et politique de confidentialité prévues dans la structure du site." },
];

const seo = [
  "Une structure de titres claire sur chaque page",
  "Un titre et une description uniques par page",
  "Des adresses de pages lisibles",
  "Un affichage rapide, y compris sur mobile",
  "Des contenus rédigés autour de votre métier et de votre secteur",
  "Des données structurées pour aider les moteurs de recherche",
  "Un plan du site transmis à Google (sitemap)",
];

const faq: QA[] = [
  {
    q: "Combien de temps faut-il pour créer un site ?",
    a: "Cela dépend surtout du nombre de pages, des fonctionnalités et de la disponibilité des contenus (textes, photos). Un calendrier vous est proposé avec le devis, une fois le projet défini ensemble.",
  },
  {
    q: "Dois-je fournir les textes et les photos ?",
    a: "Vous connaissez votre métier mieux que personne : vos informations sont la base. Nous vous aidons à les structurer, et la création de visuels fait partie de nos prestations. Nous définissons ensemble ce que chacun prépare.",
  },
  {
    q: "Pourrai-je modifier mon site moi-même ?",
    a: "Cela dépend de la solution retenue. Nous en parlons dès le premier échange, selon que vous souhaitez être autonome sur certaines mises à jour (actualités, horaires, photos) ou non. La solution est choisie en conséquence.",
  },
  {
    q: "Le nom de domaine et l'hébergement sont-ils compris ?",
    a: "Ils sont indispensables à la mise en ligne. Nous vous expliquons les options possibles et le devis précise clairement ce qui est inclus.",
  },
  {
    q: "Mon site sera-t-il visible sur Google ?",
    a: "Nous mettons en place les bases techniques et éditoriales du référencement. La visibilité se construit ensuite dans la durée : contenus, avis clients, fiche d'établissement, liens. Personne ne peut honnêtement garantir une position précise.",
  },
];

export default function Page() {
  const sylve = projects.find((p) => p.slug === "atelier-sylve")!;
  return (
    <>
      <PageHero
        crumbs={[{ name: "Création de sites internet", path: PATH }]}
        eyebrow="Service 01 · Sites internet"
        title={["Création de sites internet", { text: "pour les professionnels du Doubs.", className: "text-slate" }]}
        lead={
          <p>
            Site vitrine, site professionnel ou refonte : nous concevons des sites clairs, rapides et soignés, qui présentent
            votre activité et facilitent la prise de contact. Pour les artisans, commerçants, indépendants et entreprises de
            tout le Doubs.
          </p>
        }
        actions={
          <>
            <ButtonLink href="/contact">Demander un devis</ButtonLink>
            <ButtonLink href="/realisations" variant="outline">
              Voir des exemples
            </ButtonLink>
          </>
        }
      />

      {/* Visuel pleine largeur : le site, de l'écran au téléphone */}
      <section aria-label="Aperçu d'un site de démonstration" className="shell relative -mt-6 pb-28 md:pb-40">
        <div className="group relative">
          <div className="enter-soft">
            <BrowserFrame
              src={sylve.images.full}
              alt="Page d'accueil du site de démonstration Atelier Sylve, menuiserie fictive (la page défile au survol)"
              label="Atelier Sylve — menuiserie (démonstration)"
              sizes="(min-width: 1440px) 1330px, 94vw"
              scrollOnHover
              preload
            />
          </div>
          <div style={{ "--d": 480 } as CSSProperties} className="enter absolute -bottom-10 right-[4%] w-[24%] max-w-[15rem] md:-bottom-16">
            <PhoneFrame src={sylve.images.mobile} alt="Version mobile du site de démonstration Atelier Sylve" sizes="(min-width: 1024px) 15rem, 24vw" />
          </div>
        </div>
        <p className="t-label mt-20 text-slate md:mt-10">
          Projet de démonstration<span className="hidden lg:inline"> · survolez pour parcourir la page</span>
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

      <section aria-labelledby="sw-types" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell">
          <SectionHead index="02" label="Types de sites" id="sw-types" title={["Le bon format", { text: "pour votre activité.", className: "text-slate" }]} />
          <FeatureList items={types} columns={4} className="mt-16" />
        </div>
      </section>

      <section aria-labelledby="sw-design" className="border-t border-line py-28 md:py-36">
        <div className="shell grid-12 items-center gap-y-14">
          <div className="col-span-4 md:col-span-12 lg:col-span-5">
            <SectionHead index="03" label="Approche design" id="sw-design" title={["Un design personnalisé,", { text: "pas un modèle de plus.", className: "text-slate" }]} stacked />
            <div data-reveal className="mt-8 space-y-5 text-mist">
              <p>
                Votre site doit refléter votre métier et votre façon de travailler. Nous construisons une direction visuelle
                propre à votre activité : couleurs, typographies, images, ton des textes.
              </p>
              <p>
                Un restaurant, une menuiserie, une fromagerie et un institut de beauté n&apos;ont pas besoin du même site : nos
                quatre projets de démonstration le montrent.
              </p>
            </div>
            <div data-reveal className="mt-10">
              <ArrowLink href="/realisations">Comparer les quatre directions</ArrowLink>
            </div>
          </div>
          <div className="col-span-4 md:col-span-12 lg:col-span-6 lg:col-start-7">
            <ul className="grid grid-cols-2 gap-3 sm:gap-4">
              {projects.map((p, i) => (
                <li key={p.slug} data-reveal style={{ "--d": i * 90 } as CSSProperties}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] ring-1 ring-paper/10">
                    <Image src={p.images.desktop} alt={`Page d'accueil du projet de démonstration ${p.name}`} fill sizes="(min-width: 1024px) 24vw, 46vw" className="object-cover object-top" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-paper">{p.name}</span>
                    <span role="img" className="flex gap-1" aria-label={`Palette : ${p.palette.map((c) => c.name).join(", ")}`}>
                      {p.palette.map((c) => (
                        <span key={c.hex} className="size-3 rounded-full ring-1 ring-paper/15" style={{ background: c.hex }} />
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
            <SectionHead index="04" label="Responsive" id="sw-mobile" title={["Lisible partout,", { text: "d'abord sur téléphone.", className: "text-slate" }]} stacked />
            <div data-reveal className="mt-8 space-y-5 text-mist">
              <p>
                Une grande partie de vos visiteurs vous découvriront sur leur téléphone, parfois entre deux rendez-vous. Nous
                concevons chaque page pour le petit écran autant que pour l&apos;ordinateur : textes lisibles sans zoomer, boutons
                faciles à toucher, informations essentielles en premier.
              </p>
              <p>L&apos;affichage est vérifié sur plusieurs tailles d&apos;écran avant la mise en ligne.</p>
            </div>
          </div>
          <div className="col-span-4 md:col-span-12 lg:order-1 lg:col-span-6">
            <div className="flex items-end justify-center gap-3 sm:gap-6">
              {(["oree", "nacre", "la-meule"] as const).map((slug, i) => {
                const p = projects.find((x) => x.slug === slug)!;
                return (
                  <div key={slug} data-reveal className="w-[31%] max-w-[13.5rem]" style={{ "--d": i * 120, marginBottom: i === 1 ? "3rem" : 0 } as CSSProperties}>
                    <PhoneFrame src={p.images.mobile} alt={`Version mobile du projet de démonstration ${p.name}`} sizes="(min-width: 1024px) 13.5rem, 31vw" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="sw-features" className="border-t border-line py-28 md:py-36">
        <div className="shell">
          <SectionHead index="05" label="Fonctionnalités" id="sw-features" title={["Les fonctionnalités utiles,", { text: "sans superflu.", className: "text-slate" }]}>
            <p>Chaque élément du site a une raison d&apos;être : aider votre visiteur à comprendre, à se décider, puis à vous contacter.</p>
          </SectionHead>
          <FeatureList items={features} className="mt-16" />
        </div>
      </section>

      <section aria-labelledby="sw-seo" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-12 lg:col-span-6">
            <SectionHead index="06" label="Référencement" id="sw-seo" title={["Pensé pour être trouvé", { text: "sur Google.", className: "text-slate" }]} stacked />
            <div data-reveal className="t-lead mt-8 max-w-[48ch] space-y-5 text-mist">
              <p>
                Le référencement naturel commence dès la conception. Un site bien structuré, rapide et rédigé pour vos clients a
                toutes les chances d&apos;être mieux compris par les moteurs de recherche, notamment pour les recherches locales
                dans le Doubs.
              </p>
            </div>
            <HonestNote title="Ce que nous ne promettons pas" className="mt-10">
              <p>
                Une première place garantie. Le positionnement dépend aussi de la concurrence, de l&apos;ancienneté du site, des
                avis clients et de la qualité des contenus dans le temps. Nous posons des bases solides et vous expliquons comment
                les faire fructifier.
              </p>
            </HonestNote>
          </div>
          <div className="col-span-4 md:col-span-12 lg:col-span-5 lg:col-start-8">
            <p className="t-label text-slate">Intégré à la conception</p>
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

      <Method index="07" headingId="sw-method" />
      <PricingBlock service="creation-site-web" index="08" />
      <RelatedProjects slugs={["atelier-sylve", "nacre"]} index="09" title={["Des sites qui", { text: "ressemblent à leur métier.", className: "text-slate" }]} />
      <FaqSection items={faq} index="10" title="Création de site :" titleMuted="vos questions." />
      <ClosingCta title="Parlons de" highlight="votre futur site." text="Décrivez votre activité et vos besoins : nous revenons vers vous pour en discuter et vous proposer une solution adaptée." cta="Demander un devis" />
      <JsonLd data={serviceJsonLd({ name: "Création de sites internet", serviceType: "Création de site internet", description: DESCRIPTION, path: PATH })} />
    </>
  );
}
