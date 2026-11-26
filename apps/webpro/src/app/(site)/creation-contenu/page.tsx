import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { SectionHead } from "@/components/ui/section-head";
import { FeatureList } from "@/components/ui/feature-list";
import { ContentVisual } from "@/components/visuals/service-visuals";
import { RelatedProjects } from "@/components/projects/related-projects";
import { FaqSection } from "@/components/home/faq-section";
import { ClosingCta } from "@/components/ui/closing-cta";
import { PricingBlock } from "@/components/ui/pricing-block";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import type { QA } from "@/content/faq";
import { cn } from "@/lib/cn";

const PATH = "/creation-contenu";
const DESCRIPTION =
  "Vidéos promotionnelles, reels, montage et visuels publicitaires pour mettre en valeur les produits et le savoir-faire des entreprises du Doubs.";

export const metadata: Metadata = pageMetadata({
  title: "Création de contenu vidéo dans le Doubs",
  description: DESCRIPTION,
  path: PATH,
});

const prestations = [
  { t: "Vidéos promotionnelles", d: "Présenter votre entreprise, un service ou un événement en quelques dizaines de secondes." },
  { t: "Reels", d: "Des formats verticaux courts, rythmés et sous-titrés, pensés pour les réseaux sociaux." },
  { t: "Montage vidéo", d: "Vous avez des images ? Nous les assemblons : découpage, rythme, titres, sous-titres." },
  { t: "Visuels publicitaires", d: "Affiches, bannières, visuels d'annonce aux couleurs de votre entreprise." },
  { t: "Présentation de produits", d: "Mettre en scène vos produits pour donner envie : détails, usages, nouveautés." },
  { t: "Formats adaptés aux réseaux", d: "Chaque contenu décliné aux bons formats, selon l'endroit où il sera publié." },
];

const formats = [
  { r: "9 / 16", w: 9, h: 16, t: "Vertical", d: "Reels, stories, formats courts" },
  { r: "4 / 5", w: 4, h: 5, t: "Portrait", d: "Publications dans le fil" },
  { r: "1 / 1", w: 1, h: 1, t: "Carré", d: "Publications, visuels d'annonce" },
  { r: "16 / 9", w: 16, h: 9, t: "Horizontal", d: "Vidéo pour votre site, présentations" },
];

const principles = [
  { t: "Capter tout de suite", d: "Les premières secondes décident si l'on continue à regarder. Le message principal arrive vite." },
  { t: "Être compris sans le son", d: "Beaucoup de vidéos sont regardées en silence : sous-titres et textes à l'écran sont essentiels." },
  { t: "Donner une suite", d: "Appeler, réserver, passer en boutique, visiter le site : chaque contenu propose une prochaine étape." },
];

const steps = ["Idée & message", "Préparation", "Création des images", "Montage", "Déclinaisons"];

const faq: QA[] = [
  {
    q: "Faut-il un gros tournage pour obtenir une vidéo efficace ?",
    a: "Pas forcément. Beaucoup de formats efficaces reposent sur des images simples, bien cadrées et bien montées. Le dispositif est adapté au projet et à votre budget.",
  },
  {
    q: "Pouvez-vous monter des vidéos que j'ai déjà filmées ?",
    a: "Oui, le montage vidéo fait partie de nos prestations : vous nous transmettez vos images, nous les transformons en contenu prêt à publier.",
  },
  {
    q: "Les contenus seront-ils adaptés à chaque réseau ?",
    a: "Oui. Nous déclinons les contenus aux formats utiles (vertical, carré, portrait, horizontal) selon l'endroit où ils seront publiés.",
  },
  {
    q: "Pouvez-vous aussi créer des visuels sans vidéo ?",
    a: "Oui : visuels publicitaires, annonces, présentations de produits ou publications pour les réseaux sociaux.",
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Création de contenus", path: PATH }]}
        eyebrow="Service 03 · Contenus & vidéo"
        title={["Création de contenus", { text: "vidéo et visuels pour les entreprises du Doubs.", className: "text-slate" }]}
        lead={
          <p>
            Vidéos promotionnelles, reels, présentations de produits, visuels publicitaires : des formats pensés pour être vus,
            compris et retenus, sur les réseaux comme sur votre site.
          </p>
        }
        actions={
          <>
            <ButtonLink href="/contact">Parlons de votre contenu</ButtonLink>
            <ButtonLink href="#formats" variant="outline">
              Les formats
            </ButtonLink>
          </>
        }
      />

      <section aria-label="Exemples de formats verticaux" className="shell -mt-6 pb-28 md:pb-36">
        <ContentVisual />
        <p className="t-label mt-6 text-slate">Formats de démonstration · entreprises fictives</p>
      </section>

      <section id="formats" aria-labelledby="cc-formats" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell">
          <SectionHead index="01" label="Formats" id="cc-formats" title={["Le bon cadre", { text: "pour chaque écran.", className: "text-slate" }]}>
            <p>Un même message ne se montre pas de la même façon dans une story, un fil d&apos;actualité ou sur votre site.</p>
          </SectionHead>
          <ul className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {formats.map((f, i) => (
              <li key={f.r} data-reveal style={{ "--d": i * 100 } as CSSProperties}>
                <div className="flex h-56 items-end">
                  <div
                    className={cn("relative rounded-[6px] border border-line-strong bg-ink-3", i === 0 && "border-electric")}
                    style={{ aspectRatio: `${f.w} / ${f.h}`, height: f.h >= f.w ? "100%" : "auto", width: f.h >= f.w ? "auto" : "100%" }}
                  >
                    <span className="t-label absolute top-3 left-3 text-mist">{f.r}</span>
                    {i === 0 && <span className="absolute inset-x-3 bottom-3 h-[3px] rounded-full bg-electric/60" />}
                  </div>
                </div>
                <h3 className="mt-6 text-[1.25rem] font-semibold tracking-[-0.02em] text-paper">{f.t}</h3>
                <p className="mt-1 text-mist">{f.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="cc-what" className="border-t border-line py-28 md:py-36">
        <div className="shell">
          <SectionHead index="02" label="Prestations" id="cc-what" title={["Des contenus", { text: "qui donnent envie.", className: "text-slate" }]} />
          <FeatureList items={prestations} className="mt-16" />
        </div>
      </section>

      <section aria-labelledby="cc-good" className="relative overflow-clip border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell grid-12 items-center gap-y-16">
          <div className="col-span-4 md:col-span-12 lg:col-span-6">
            <SectionHead stacked index="03" label="Nos principes" id="cc-good" title={["Ce qu'un bon contenu", { text: "doit faire.", className: "text-slate" }]} />
            <ol className="mt-12 border-t border-line">
              {principles.map((p, i) => (
                <li key={p.t} data-reveal style={{ "--d": i * 100 } as CSSProperties} className="grid grid-cols-[3rem_1fr] border-b border-line py-7">
                  <span className="t-label pt-1.5 text-electric">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-paper">{p.t}</h3>
                    <p className="mt-2 text-mist">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="col-span-4 md:col-span-12 lg:col-span-5 lg:col-start-8">
            <div className="relative mx-auto max-w-[22rem]">
              <div data-reveal="scale" className="relative aspect-[9/16] overflow-hidden rounded-[14px] ring-1 ring-paper/10 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.95)]">
                <Image src="/projects/formats/reel-sylve.png" alt="Format vertical de démonstration : coulisses d'un atelier, avec sous-titres à l'écran" fill sizes="22rem" className="object-cover" />
              </div>
              <p className="t-label absolute top-[18%] -left-4 hidden bg-ink px-2 py-1 text-mist sm:block lg:-left-24">← accroche</p>
              <p className="t-label absolute bottom-[19%] -right-4 hidden bg-ink px-2 py-1 text-mist sm:block lg:-right-24">sous-titres →</p>
              <p className="t-label absolute top-4 -right-4 hidden bg-ink px-2 py-1 text-mist sm:block lg:-right-28">progression →</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="cc-steps" className="border-t border-line py-28 md:py-36">
        <div className="shell">
          <SectionHead index="04" label="Déroulé" id="cc-steps" title={["De l'idée", { text: "à la publication.", className: "text-slate" }]}>
            <p>Création des images par prises de vue ou éléments graphiques, selon le projet. Chaque étape est validée avec vous.</p>
          </SectionHead>
          <ol className="mt-16 grid gap-px overflow-hidden rounded-[6px] border border-line bg-line sm:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s} data-reveal style={{ "--d": i * 90 } as CSSProperties} className="bg-ink p-6">
                <span className="font-mono text-sm text-electric">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-10 text-[1.15rem] leading-tight font-semibold tracking-[-0.02em] text-paper">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PricingBlock service="creation-contenu" index="05" />
      <RelatedProjects slugs={["oree", "la-meule"]} index="06" title={["Des contenus", { text: "au service du message.", className: "text-slate" }]} />
      <FaqSection items={faq} index="07" title="Contenus & vidéo :" titleMuted="vos questions." />
      <ClosingCta title="Donnons vie à" highlight="votre savoir-faire." text="Un produit à présenter, un événement à annoncer, des images à monter ? Parlons-en." />
      <JsonLd data={serviceJsonLd({ name: "Création de contenus vidéo et visuels", serviceType: "Création de contenus vidéo et visuels", description: DESCRIPTION, path: PATH })} />
    </>
  );
}
