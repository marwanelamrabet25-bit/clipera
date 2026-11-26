import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ViewTransition } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { BrowserFrame, PhoneFrame } from "@/components/visuals/frames";
import { ClosingCta } from "@/components/ui/closing-cta";
import { projects, projectBySlug } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/config/services";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/realisations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  return pageMetadata({
    title: `${p.name}, ${p.sector.split(" — ")[0].toLowerCase()} (projet de démonstration)`,
    description: `${p.summary} Projet de démonstration de WEBPRO AGENCY.`,
    path: `/realisations/${p.slug}`,
  });
}

/** Prestations liées à chaque catégorie, pour le maillage interne. */
const serviceFor = (cat: string) =>
  cat === "Communication" ? services[1] : cat === "Vidéos" ? services[2] : services[0];

export default async function Page({ params }: PageProps<"/realisations/[slug]">) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];
  const linked = Array.from(new Set(p.categories.map(serviceFor)));

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Réalisations", path: "/realisations" },
          { name: p.name, path: `/realisations/${p.slug}` },
        ]}
        eyebrow={p.demo ? "Projet de démonstration · entreprise fictive" : "Réalisation"}
        title={[p.name]}
        titleClassName="!text-[clamp(3.25rem,1.5rem+7vw,8.5rem)] !leading-[0.92]"
        lead={
          <>
            <p className="text-paper">{p.sector}</p>
            <p className="mt-3">{p.summary}</p>
          </>
        }
        actions={
          p.previewHref ? (
            <>
              <ButtonLink href={p.previewHref} icon="up" target="_blank" rel="noopener">
                Ouvrir l&apos;aperçu du site
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Un projet similaire ?
              </ButtonLink>
            </>
          ) : undefined
        }
      />

      <section aria-label="Aperçu principal" className="shell pb-24">
        <div className="relative overflow-hidden rounded-[8px] px-[5%] pt-[5%]" style={{ background: p.tone }}>
          <div aria-hidden className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(80% 60% at 70% 0%, rgba(255,255,255,0.14), transparent 60%)" }} />
          <ViewTransition name={`card-${p.slug}`}>
            <div className="enter-soft relative">
              <BrowserFrame
                src={p.images.desktop}
                alt={`Page d'accueil du site ${p.name} (projet de démonstration)`}
                label={`${p.name} — ${p.demo ? "démonstration" : "réalisation"}`}
                sizes="(min-width: 1440px) 1200px, 90vw"
                preload
                className="rounded-b-none"
              />
            </div>
          </ViewTransition>
        </div>
      </section>

      <section aria-label="Fiche projet" className="shell grid-12 gap-y-14 pb-28 md:pb-36">
        <aside className="col-span-4 md:col-span-12 lg:col-span-4">
          <dl className="grid gap-6 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-1 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <div>
              <dt className="t-label text-slate">Secteur</dt>
              <dd className="mt-2 text-paper">{p.sector}</dd>
            </div>
            <div>
              <dt className="t-label text-slate">Catégories</dt>
              <dd className="mt-2 text-paper">{p.categories.join(" / ")}</dd>
            </div>
            <div>
              <dt className="t-label text-slate">Typographie</dt>
              <dd className="mt-2 text-paper">{p.typography}</dd>
            </div>
            <div>
              <dt className="t-label text-slate">Technologies</dt>
              <dd className="mt-2 text-paper">{p.technologies.join(" · ")}</dd>
            </div>
            <div>
              <dt className="t-label text-slate">Statut</dt>
              <dd className="mt-2 text-paper">{p.demo ? "Projet de démonstration — entreprise fictive" : "Projet client"}</dd>
            </div>
          </dl>
        </aside>

        <div className="col-span-4 md:col-span-12 lg:col-span-7 lg:col-start-6">
          <div data-reveal>
            <SectionLabel index="01">Contexte</SectionLabel>
            <p className="t-lead mt-6 text-mist">{p.context}</p>
          </div>
          <div data-reveal className="mt-16">
            <SectionLabel index="02">Objectif</SectionLabel>
            <p className="t-lead mt-6 text-paper">{p.objective}</p>
          </div>
          <div data-reveal className="mt-16">
            <SectionLabel index="03">Travail réalisé</SectionLabel>
            <ul className="mt-6 border-t border-line">
              {p.work.map((w) => (
                <li key={w} className="flex gap-4 border-b border-line py-4 text-paper">
                  <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-electric" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal className="mt-16">
            <SectionLabel index="04">Palette</SectionLabel>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {p.palette.map((c) => (
                <li key={c.hex}>
                  <span className="block aspect-[4/3] rounded-[4px] ring-1 ring-paper/10" style={{ background: c.hex }} />
                  <span className="mt-2 block text-sm font-semibold text-paper">{c.name}</span>
                  <span className="block font-mono text-xs text-slate">{c.hex}</span>
                </li>
              ))}
            </ul>
          </div>
          <blockquote data-reveal className="mt-16 border-l-2 border-electric pl-6 text-[1.4rem] leading-snug font-semibold tracking-[-0.02em] text-paper">
            {p.takeaway}
          </blockquote>
        </div>
      </section>

      <section aria-labelledby="gallery-title" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell">
          <SectionLabel index="05">Galerie</SectionLabel>
          <h2 id="gallery-title" className="t-h2 mt-8 text-paper">
            Sur mobile, <span className="text-slate">et page entière.</span>
          </h2>
          <div className="mt-16 grid-12 items-start gap-y-14">
            <div data-reveal className="col-span-4 md:col-span-4 lg:col-span-3">
              <PhoneFrame src={p.images.mobile} alt={`Version mobile du site ${p.name}`} sizes="(min-width: 1024px) 22vw, 60vw" className="mx-auto max-w-[17rem]" />
            </div>
            <div data-reveal style={{ "--d": 150 } as CSSProperties} className="group col-span-4 md:col-span-8 lg:col-span-9">
              <BrowserFrame src={p.images.full} alt={`Page complète du site ${p.name} (défile au survol)`} label="Page complète — survolez pour défiler" sizes="(min-width: 1024px) 66vw, 92vw" scrollOnHover />
            </div>
          </div>
          {p.images.extra?.map((x) => (
            <figure key={x.src} data-reveal className="mt-14">
              <div className="relative overflow-hidden rounded-[6px] ring-1 ring-paper/10" style={{ aspectRatio: x.ratio }}>
                <Image src={x.src} alt={x.alt} fill sizes="(min-width: 1440px) 1330px, 94vw" className="object-cover" />
              </div>
              <figcaption className="t-meta mt-3 text-slate">{x.alt}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section aria-label="Liens utiles" className="border-t border-line py-20">
        <div className="shell flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-label text-slate">Prestations mobilisées</p>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              {linked.map((s) => (
                <li key={s.slug}>
                  <Link href={s.href} className="link-underline font-semibold text-paper hover:text-glow">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href={`/realisations/${next.slug}`} className="group text-right">
            <span className="t-label block text-slate">Projet suivant</span>
            <span className="mt-2 block text-[clamp(2rem,1.5rem+2vw,3.5rem)] leading-none font-bold tracking-[-0.04em] text-paper transition-colors group-hover:text-glow">
              {next.name} <span aria-hidden className="inline-block transition-transform group-hover:translate-x-2">→</span>
            </span>
          </Link>
        </div>
      </section>

      <ClosingCta title="Un projet" highlight="dans le même esprit ?" />
    </>
  );
}
