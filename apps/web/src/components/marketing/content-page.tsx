import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "./site-header";
import { buttonStyles } from "@/components/ui/button";
import { POSTS } from "@/content/blog";
import { breadcrumbLd, graph, organizationLd, SOLUTION_PAGES } from "@/lib/seo";

export type ContentSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  steps?: { title: string; text: string }[];
};

export type ContentPageData = {
  path: string;
  /** Nom court (fil d'Ariane, liens). */
  name: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string[];
  sections: ContentSection[];
  questions: { q: string; a: string }[];
  /** Pages liées (maillage interne), par chemin. */
  related: string[];
  cta: { title: string; text: string };
};

const LABELS: Record<string, string> = {
  ...Object.fromEntries(SOLUTION_PAGES.map((p) => [p.href, p.label])),
  "/tarifs": "Tarifs de Clipera",
  "/blog": "Le blog Clipera",
  ...Object.fromEntries(POSTS.map((p) => [`/blog/${p.slug}`, p.title])),
};

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Accueil", path: "/" }, ...items];
  return (
    <nav aria-label="Fil d'Ariane" className="text-caption text-subtle">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {i < all.length - 1 ? (
              <Link href={it.path} className="hover:text-fg">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-muted">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CtaBlock({ title, text }: { title: string; text: string }) {
  return (
    <section className="border-t border-line pt-12">
      <p className="text-caption font-medium tracking-wide text-subtle uppercase">
        <span className="text-primary-soft">Fin</span> · à toi de jouer
      </p>
      <h2 className="mt-4 text-[1.9rem] leading-[1.1] font-bold tracking-[-0.025em] text-balance sm:text-[2.4rem]">{title}</h2>
      <p className="mt-4 max-w-xl text-body text-muted">{text}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/inscription" className={buttonStyles({ size: "lg", className: "justify-center" })}>
          Essayer gratuitement <ArrowRight />
        </Link>
        <Link href="/tarifs" className={buttonStyles({ size: "lg", variant: "ghost", className: "justify-center" })}>
          Voir les tarifs
        </Link>
      </div>
      <p className="mt-4 text-small text-subtle">Offre gratuite · sans carte bancaire</p>
    </section>
  );
}

/** Texte long lisible : titres, paragraphes, listes. Partagé par les pages de contenu et le blog. */
export function Prose({ sections }: { sections: ContentSection[] }) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((s) => (
        <section key={s.title}>
          <h2 className="text-[1.6rem] leading-tight font-bold tracking-[-0.02em] text-balance">{s.title}</h2>
          {s.paragraphs?.map((p) => (
            <p key={p.slice(0, 40)} className="mt-4 text-body text-muted">
              {p}
            </p>
          ))}
          {s.list && (
            <ul className="mt-5 flex flex-col gap-3">
              {s.list.map((li) => (
                <li key={li} className="flex gap-3 text-body text-muted">
                  <Check className="mt-1 size-4 shrink-0 text-primary-soft" aria-hidden />
                  <span>{li}</span>
                </li>
              ))}
            </ul>
          )}
          {s.steps && (
            <ol className="relative mt-8 flex flex-col">
              <span aria-hidden className="absolute top-2 bottom-2 left-[0.9rem] w-px bg-line-strong" />
              {s.steps.map((st, i) => (
                <li key={st.title} className="relative grid grid-cols-[1.85rem_1fr] gap-x-5 pb-8 last:pb-0">
                  <span className="relative grid size-[1.85rem] place-items-center rounded-full border border-line-strong bg-canvas text-caption font-semibold text-fg tabular-nums">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <h3 className="text-body font-semibold text-fg">{st.title}</h3>
                    <p className="mt-1.5 text-small text-muted">{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}
    </div>
  );
}

export function Questions({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section>
      <h2 className="text-[1.6rem] leading-tight font-bold tracking-[-0.02em]">Questions fréquentes</h2>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {items.map((f) => (
          <div key={f.q} className="py-5">
            <h3 className="text-body font-semibold text-fg">{f.q}</h3>
            <p className="mt-2 text-small text-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RelatedLinks({ paths }: { paths: string[] }) {
  return (
    <section>
      <h2 className="text-h3 font-semibold">À lire aussi</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {paths.map((p) => (
          <li key={p}>
            <Link
              href={p}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/40 px-5 py-4 text-small font-medium text-fg transition-colors hover:border-primary-line"
            >
              {LABELS[p] ?? p}
              <ArrowRight className="size-4 text-primary-soft" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Page de contenu stratégique : une intention de recherche, un contenu réel et vérifiable. */
export function ContentPage({ page }: { page: ContentPageData }) {
  const crumbs = [{ name: page.name, path: page.path }];
  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={graph(organizationLd(), breadcrumbLd(crumbs))} />
      <SiteHeader />
      <main className="flex-1">
        <section className="relative border-b border-line">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(50%_60%_at_80%_0%,rgb(139_92_246/0.12),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 pt-10 pb-16 sm:px-8 sm:pt-14">
            <Breadcrumbs items={crumbs} />
            <p className="mt-10 flex items-center gap-3 text-caption font-medium tracking-wide text-subtle uppercase">
              <span className="text-primary-soft">{page.eyebrow}</span>
              <span className="h-px w-8 bg-line-strong" aria-hidden />
              <span>Clipera</span>
            </p>
            <h1 className="mt-5 text-[2.3rem] leading-[1.06] font-bold tracking-[-0.035em] text-balance sm:text-[3.25rem]">{page.h1}</h1>
            {page.intro.map((p) => (
              <p key={p.slice(0, 40)} className="mt-5 text-body text-muted sm:text-h3 sm:font-normal">
                {p}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/inscription" className={buttonStyles({ size: "lg" })}>
                Essayer gratuitement <ArrowRight />
              </Link>
              <Link href="/#moteur" className={buttonStyles({ size: "lg", variant: "ghost" })}>
                Voir le moteur en action
              </Link>
            </div>
          </div>
        </section>
        <div className="mx-auto flex max-w-3xl flex-col gap-16 px-4 py-16 sm:px-8">
          <Prose sections={page.sections} />
          <Questions items={page.questions} />
          <RelatedLinks paths={page.related} />
          <CtaBlock title={page.cta.title} text={page.cta.text} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
