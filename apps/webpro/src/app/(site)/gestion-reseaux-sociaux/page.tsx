import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { SectionHead } from "@/components/ui/section-head";
import { FeatureList } from "@/components/ui/feature-list";
import { HonestNote } from "@/components/ui/honest-note";
import { ContentVisual, SocialVisual } from "@/components/visuals/service-visuals";
import { FaqSection } from "@/components/home/faq-section";
import { ClosingCta } from "@/components/ui/closing-cta";
import { PricingSection } from "@/components/offers/pricing-section";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import { formatPrice, offerById } from "@/config/offers";
import { priceSentences, type QA } from "@/content/faq";
import { cn } from "@/lib/cn";

const PATH = "/gestion-reseaux-sociaux";
const socialPrice = offerById("social").billing[0].amount;
const DESCRIPTION = `Publications, visuels, montage vidéo et Reels : une présence régulière sur les réseaux sociaux pour les entreprises du Doubs, à ${formatPrice(socialPrice)} par mois.`;

export const metadata: Metadata = pageMetadata({
  title: "Gestion des réseaux sociaux dans le Doubs",
  description: DESCRIPTION,
  path: PATH,
});

const prestations = [
  { t: "Création de publications", d: "Des publications pensées pour votre activité : nouveautés, coulisses, conseils, événements." },
  { t: "Création de visuels", d: "Des visuels aux couleurs de votre entreprise, reconnaissables au premier coup d'œil." },
  { t: "Montage vidéo", d: "Vos images assemblées en vidéos rythmées : découpage, titres, sous-titres." },
  { t: "Création de Reels", d: "Des formats verticaux courts, pensés pour être regardés jusqu'au bout." },
  { t: "Vidéos promotionnelles", d: "Présenter votre entreprise, un service ou un événement en quelques dizaines de secondes." },
  { t: "Contenus courts", d: "Stories, annonces, formats rapides pour garder le lien avec vos abonnés." },
  { t: "Préparation de contenus", d: "Textes, accroches et formats préparés avec soin avant d'être publiés." },
  { t: "Accompagnement éditorial", d: "Quoi publier, à quel rythme, sur quel ton : une ligne claire et tenable." },
  { t: "Gestion des publications", d: "L'organisation et la mise en ligne de vos publications, selon la formule choisie." },
];

const formats = [
  { r: "9 / 16", w: 9, h: 16, t: "Vertical", d: "Reels, stories, vidéos courtes" },
  { r: "4 / 5", w: 4, h: 5, t: "Portrait", d: "Publications dans le fil" },
  { r: "1 / 1", w: 1, h: 1, t: "Carré", d: "Publications, visuels d'annonce" },
  { r: "16 / 9", w: 16, h: 9, t: "Horizontal", d: "Vidéo de présentation" },
];

const videoPrinciples = [
  { t: "Capter tout de suite", d: "Les premières secondes décident si l'on continue à regarder : le message arrive vite." },
  { t: "Être compris sans le son", d: "Beaucoup de vidéos sont regardées en silence : sous-titres et textes à l'écran sont essentiels." },
  { t: "Donner une suite", d: "Appeler, réserver, passer en boutique, visiter le site : chaque contenu propose une prochaine étape." },
];

const audiences = [
  { t: "Commerçants", d: "Annoncer les nouveautés, les arrivages, les temps forts et les horaires exceptionnels." },
  { t: "Artisans & bâtiment", d: "Montrer les chantiers, les étapes de fabrication, les avant / après en vidéo." },
  { t: "Restaurants & cafés", d: "Partager la carte du moment, les événements, l'ambiance du lieu." },
  { t: "Services & entreprises", d: "Valoriser une expertise, présenter l'équipe, partager les actualités." },
];

const steps = [
  { t: "On fait le point", d: "Vos comptes actuels, vos clients, ce que vous voulez montrer et le temps que vous pouvez y consacrer." },
  { t: "On définit la formule", d: "Les thèmes, le ton, le style visuel, le nombre de publications et de vidéos, les réseaux concernés." },
  { t: "On prépare, vous validez", d: "Les publications et vidéos sont préparées à l'avance, validées selon le mode convenu, puis publiées." },
];

const faq: QA[] = [
  { q: "Combien coûte la gestion des réseaux sociaux ?", a: `${priceSentences.social} ${priceSentences.pack}` },
  {
    q: "Les vidéos et les Reels sont-ils compris ?",
    a: "Oui : la création de visuels, le montage vidéo, les Reels, les vidéos promotionnelles et les contenus courts font partie de la gestion des réseaux sociaux. Leur nombre est défini avec vous selon la formule choisie.",
  },
  {
    q: "Sur quels réseaux sociaux intervenez-vous ?",
    a: "Sur les réseaux utilisés par les entreprises locales, comme Instagram, Facebook ou TikTok. Les réseaux concernés sont choisis avec vous selon votre activité et votre clientèle.",
  },
  {
    q: "Pouvez-vous monter des vidéos que j'ai déjà filmées ?",
    a: "Oui, le montage vidéo fait partie de la prestation : vous nous transmettez vos images, nous les transformons en contenu prêt à publier.",
  },
  {
    q: "Est-ce que je garde la main sur mes comptes ?",
    a: "Oui. Vos comptes restent les vôtres : vous en gardez la propriété et les accès. Le mode de validation des publications est défini ensemble au démarrage.",
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
            Publications, visuels, vidéos, Reels : nous vous aidons à entretenir une présence régulière et cohérente sur les
            réseaux sociaux, sans y passer vos soirées. À {formatPrice(socialPrice)} par mois.
          </p>
        }
        actions={
          <>
            <ButtonLink href="/contact?offre=social">Parlons de vos réseaux</ButtonLink>
            <ButtonLink href="#tarifs" variant="outline">
              Voir le tarif
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
          <SectionHead index="02" label="Ce qui est compris" id="rs-what" title={["Publications, visuels", { text: "et vidéos.", className: "text-slate" }]}>
            <p>La création de vidéos et de contenus fait partie intégrante de la gestion de vos réseaux sociaux.</p>
          </SectionHead>
          <FeatureList items={prestations} className="mt-16" />
        </div>
      </section>

      <section id="videos" aria-labelledby="rs-video" className="border-t border-line py-28 md:py-36">
        <div className="shell">
          <SectionHead index="03" label="Vidéos & contenus courts" id="rs-video" title={["Des vidéos", { text: "qui donnent envie.", className: "text-slate" }]}>
            <p>Montage, Reels, vidéos promotionnelles : des formats pensés pour être vus, compris et retenus.</p>
          </SectionHead>
          <div className="mt-16">
            <ContentVisual />
            <p className="t-label mt-6 text-slate">Exemples de formats · entreprises fictives</p>
          </div>
          <div className="mt-20 grid-12 gap-y-14">
            <ol className="col-span-4 border-t border-line md:col-span-12 lg:col-span-6">
              {videoPrinciples.map((p, i) => (
                <li key={p.t} data-reveal style={{ "--d": i * 100 } as CSSProperties} className="grid grid-cols-[3rem_1fr] border-b border-line py-7">
                  <span className="t-label pt-1.5 text-electric">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-[1.3rem] font-semibold tracking-[-0.02em] text-paper">{p.t}</h3>
                    <p className="mt-2 text-mist">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ul className="col-span-4 grid grid-cols-2 gap-x-6 gap-y-10 md:col-span-12 lg:col-span-5 lg:col-start-8">
              {formats.map((f, i) => (
                <li key={f.r} data-reveal style={{ "--d": i * 90 } as CSSProperties}>
                  <div className="flex h-36 items-end">
                    <div
                      className={cn("relative rounded-[6px] border border-line-strong bg-ink-3", i === 0 && "border-electric")}
                      style={{ aspectRatio: `${f.w} / ${f.h}`, height: f.h >= f.w ? "100%" : "auto", width: f.h >= f.w ? "auto" : "100%" }}
                    >
                      <span className="t-label absolute top-2.5 left-2.5 text-mist">{f.r}</span>
                    </div>
                  </div>
                  <h3 className="mt-4 font-semibold tracking-[-0.01em] text-paper">{f.t}</h3>
                  <p className="text-sm text-mist">{f.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="rs-brand" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell">
          <SectionHead index="04" label="Cohérence de marque" id="rs-brand" title={["Une voix,", { text: "un style, une régularité.", className: "text-slate" }]}>
            <p>
              Couleurs, typographies, ton, cadrages : quand chaque publication respecte les mêmes règles, votre entreprise devient
              reconnaissable avant même que l&apos;on lise son nom. Deux exemples, pour deux entreprises imaginaires.
            </p>
          </SectionHead>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              { src: "/projects/oree/social.png", name: "Restaurant (exemple fictif)", d: "Annonces de carte, plats, réservations du soir." },
              { src: "/projects/la-meule/social.png", name: "Fromagerie (exemple fictif)", d: "Arrivages, conseils de dégustation, temps forts." },
            ].map((k, i) => (
              <figure key={k.name} data-reveal style={{ "--d": i * 140 } as CSSProperties}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] ring-1 ring-paper/10">
                  <Image src={k.src} alt={`Exemples de publications pour un ${k.name.toLowerCase()}`} fill sizes="(min-width: 768px) 46vw, 92vw" className="object-cover" />
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold text-paper">{k.name}</span>
                  <span className="text-sm text-mist">{k.d}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="rs-who" className="border-t border-line py-28 md:py-36">
        <div className="shell">
          <SectionHead index="05" label="Pour qui" id="rs-who" title={["Chaque activité", { text: "a quelque chose à montrer.", className: "text-slate" }]} />
          <FeatureList items={audiences} columns={4} numbered={false} className="mt-16" />
        </div>
      </section>

      <section aria-labelledby="rs-how" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-12 lg:col-span-5">
            <SectionHead stacked index="06" label="Fonctionnement" id="rs-how" title={["Simple,", { text: "et sans surprise.", className: "text-slate" }]} />
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

      <PricingSection index="07" ids={["social", "pack"]} title={["Le tarif,", { text: "en toute transparence.", className: "text-slate" }]} showCare={false} />
      <FaqSection items={faq} index="08" title="Réseaux sociaux :" titleMuted="vos questions." />
      <ClosingCta title="Faisons vivre" highlight="votre activité en ligne." text="Parlez-nous de votre entreprise et de vos comptes actuels : nous vous proposons la formule adaptée." />
      <JsonLd data={serviceJsonLd({ name: "Gestion des réseaux sociaux", serviceType: "Gestion des réseaux sociaux, création de visuels et de vidéos", description: DESCRIPTION, path: PATH, offerIds: ["social", "pack"] })} />
    </>
  );
}
