import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { SectionHead } from "@/components/ui/section-head";
import { FeatureList } from "@/components/ui/feature-list";
import { HonestNote } from "@/components/ui/honest-note";
import { SocialVisual } from "@/components/visuals/service-visuals";
import { RelatedProjects } from "@/components/projects/related-projects";
import { FaqSection } from "@/components/home/faq-section";
import { ClosingCta } from "@/components/ui/closing-cta";
import { PricingBlock } from "@/components/ui/pricing-block";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import type { QA } from "@/content/faq";

const PATH = "/gestion-reseaux-sociaux";
const DESCRIPTION =
  "Publications, visuels, organisation éditoriale : une présence régulière et cohérente sur les réseaux sociaux pour les entreprises du Doubs.";

export const metadata: Metadata = pageMetadata({
  title: "Gestion des réseaux sociaux dans le Doubs",
  description: DESCRIPTION,
  path: PATH,
});

const prestations = [
  { t: "Création de publications", d: "Des publications pensées pour votre activité : nouveautés, coulisses, conseils, événements, réalisations." },
  { t: "Création de visuels", d: "Des visuels aux couleurs de votre entreprise, reconnaissables au premier coup d'œil dans un fil d'actualité." },
  { t: "Préparation de contenus", d: "Textes, accroches, formats : chaque publication est préparée avec soin avant d'être mise en ligne." },
  { t: "Accompagnement éditorial", d: "Quoi publier, à quel rythme, sur quel ton : nous vous aidons à définir une ligne claire et tenable." },
  { t: "Organisation des publications", d: "Un calendrier pour garder la régularité, sans improvisation de dernière minute." },
  { t: "Présentation de l'activité", d: "Mettre en avant vos services, vos produits, votre savoir-faire et ce qui vous rend différent." },
];

const audiences = [
  { t: "Commerçants", d: "Annoncer les nouveautés, les arrivages, les temps forts et les horaires exceptionnels." },
  { t: "Artisans & bâtiment", d: "Montrer les chantiers, les étapes de fabrication, les avant / après." },
  { t: "Restaurants & cafés", d: "Partager la carte du moment, les événements, l'ambiance du lieu." },
  { t: "Services & entreprises", d: "Valoriser une expertise, présenter l'équipe, partager les actualités de l'entreprise." },
];

const steps = [
  { t: "On fait le point", d: "Vos comptes actuels, vos clients, ce que vous voulez montrer et le temps que vous pouvez y consacrer." },
  { t: "On définit la ligne", d: "Les thèmes, le ton, le style visuel et un rythme de publication réaliste." },
  { t: "On prépare, vous validez", d: "Les publications sont préparées à l'avance, validées selon le mode convenu, puis programmées." },
];

const faq: QA[] = [
  {
    q: "Sur quels réseaux sociaux intervenez-vous ?",
    a: "Sur les réseaux les plus utilisés par les entreprises locales, comme Instagram, Facebook ou TikTok. Le choix dépend de votre activité et de votre clientèle : inutile d'être partout, mieux vaut être bien présent là où se trouvent vos clients.",
  },
  {
    q: "Dois-je fournir des photos ?",
    a: "Vos propres photos (produits, chantiers, équipe, lieu) sont précieuses, car elles sont authentiques. Nous pouvons aussi créer des visuels et des vidéos pour les compléter.",
  },
  {
    q: "Est-ce que je garde la main sur mes comptes ?",
    a: "Oui. Vos comptes restent les vôtres : vous en gardez la propriété et les accès. Le mode de validation des publications est défini ensemble au démarrage.",
  },
  {
    q: "Combien de publications faut-il par semaine ?",
    a: "Il n'y a pas de chiffre magique : la régularité compte davantage que la quantité. Le rythme est défini selon votre activité et vos objectifs, puis précisé dans la proposition.",
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Gestion des réseaux sociaux", path: PATH }]}
        eyebrow="Service 02 · Réseaux sociaux"
        title={["Gestion des réseaux sociaux", { text: "pour les entreprises du Doubs.", className: "text-slate" }]}
        lead={
          <p>
            Publications, visuels, calendrier : nous vous aidons à entretenir une présence régulière et cohérente sur les réseaux
            sociaux, sans y passer vos soirées.
          </p>
        }
        actions={
          <>
            <ButtonLink href="/contact">Parlons de vos réseaux</ButtonLink>
            <ButtonLink href="#prestations" variant="outline">
              Ce que nous faisons
            </ButtonLink>
          </>
        }
        aside={<SocialVisual />}
      />

      <section aria-labelledby="rs-why" className="border-t border-line py-28 md:py-36">
        <div className="shell">
          <SectionHead index="01" label="Pourquoi" id="rs-why" title={["Vos clients vous cherchent", { text: "aussi là.", className: "text-slate" }]}>
            <p>
              Un profil régulièrement alimenté montre que votre entreprise est active, donne un aperçu concret de votre travail et
              entretient le lien avec vos clients. À l&apos;inverse, un compte laissé à l&apos;abandon peut donner une impression
              d&apos;inactivité.
            </p>
            <p className="text-paper">
              Les réseaux sociaux complètent votre site : l&apos;un rassure et informe, l&apos;autre fait vivre votre activité au
              quotidien.
            </p>
          </SectionHead>
        </div>
      </section>

      <section id="prestations" aria-labelledby="rs-what" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell">
          <SectionHead index="02" label="Prestations" id="rs-what" title={["Ce que nous prenons", { text: "en charge.", className: "text-slate" }]} />
          <FeatureList items={prestations} className="mt-16" />
        </div>
      </section>

      <section aria-labelledby="rs-brand" className="border-t border-line py-28 md:py-36">
        <div className="shell">
          <SectionHead index="03" label="Cohérence de marque" id="rs-brand" title={["Une voix,", { text: "un style, une régularité.", className: "text-slate" }]}>
            <p>
              Couleurs, typographies, ton, cadrages : quand chaque publication respecte les mêmes règles, votre entreprise devient
              reconnaissable avant même que l&apos;on lise son nom. Deux exemples, pour deux projets de démonstration.
            </p>
          </SectionHead>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              { src: "/projects/oree/social.png", name: "Orée", d: "Restaurant : annonces de carte, plats, réservations du soir." },
              { src: "/projects/la-meule/social.png", name: "La Meule", d: "Fromagerie : arrivages, conseils, retrait en boutique." },
            ].map((k, i) => (
              <figure key={k.name} data-reveal style={{ "--d": i * 140 } as CSSProperties}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] ring-1 ring-paper/10">
                  <Image src={k.src} alt={`Planche de publications de démonstration pour ${k.name}`} fill sizes="(min-width: 768px) 46vw, 92vw" className="object-cover" />
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold text-paper">{k.name}</span>
                  <span className="text-sm text-mist">{k.d}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="t-label mt-8 text-slate">Projets de démonstration · entreprises fictives</p>
        </div>
      </section>

      <section aria-labelledby="rs-who" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell">
          <SectionHead index="04" label="Pour qui" id="rs-who" title={["Chaque activité", { text: "a quelque chose à montrer.", className: "text-slate" }]} />
          <FeatureList items={audiences} columns={4} numbered={false} className="mt-16" />
        </div>
      </section>

      <section aria-labelledby="rs-how" className="border-t border-line py-28 md:py-36">
        <div className="shell grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-12 lg:col-span-5">
            <SectionHead stacked index="05" label="Fonctionnement" id="rs-how" title={["Simple,", { text: "et sans surprise.", className: "text-slate" }]} />
            <HonestNote title="Ce que nous ne promettons pas" className="mt-12">
              <p>
                Un nombre d&apos;abonnés, de « j&apos;aime » ou de ventes. Nous construisons une présence régulière, soignée et
                fidèle à votre image : c&apos;est elle qui, dans la durée, inspire confiance.
              </p>
            </HonestNote>
          </div>
          <ol className="col-span-4 md:col-span-12 lg:col-span-6 lg:col-start-7">
            {steps.map((s, i) => (
              <li key={s.t} data-reveal style={{ "--d": i * 120 } as CSSProperties} className="grid grid-cols-[4.5rem_1fr] border-t border-line py-8 last:border-b">
                <span className="font-mono text-4xl leading-none font-light tracking-[-0.06em] text-electric">{i + 1}</span>
                <div>
                  <h3 className="text-[1.5rem] leading-tight font-bold tracking-[-0.03em] text-paper">{s.t}</h3>
                  <p className="mt-3 text-mist">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PricingBlock service="gestion-reseaux-sociaux" index="06" />
      <RelatedProjects slugs={["oree", "la-meule"]} index="07" title={["Le site et les réseaux,", { text: "d'une même voix.", className: "text-slate" }]} />
      <FaqSection items={faq} index="08" title="Réseaux sociaux :" titleMuted="vos questions." />
      <ClosingCta title="Faisons vivre" highlight="votre activité en ligne." text="Parlez-nous de votre entreprise et de vos comptes actuels : nous vous proposons un accompagnement à votre mesure." />
      <JsonLd data={serviceJsonLd({ name: "Gestion des réseaux sociaux", serviceType: "Gestion de réseaux sociaux (community management)", description: DESCRIPTION, path: PATH })} />
    </>
  );
}
