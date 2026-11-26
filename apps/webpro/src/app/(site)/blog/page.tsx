import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { ClosingCta } from "@/components/ui/closing-cta";
import { articles } from "@/content/articles";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Conseils pour votre présence en ligne",
  description:
    "Visibilité locale sur Google, site internet, réseaux sociaux : des conseils concrets et vérifiés pour les entreprises, artisans et commerçants du Doubs.",
  path: "/blog",
});

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Conseils", path: "/blog" }]}
        eyebrow="Conseils"
        wide
        title={["Des conseils clairs", { text: "pour votre présence en ligne.", className: "text-slate" }]}
        lead={<p>Peu d&apos;articles, mais utiles : des repères concrets, vérifiés et sans jargon, pour les professionnels du Doubs.</p>}
      />
      <section aria-label="Articles" className="shell pb-28 md:pb-40">
        <ul className="border-t border-line">
          {articles.map((a, i) => (
            <li key={a.slug} data-reveal style={{ "--d": i * 100 } as CSSProperties} className="border-b border-line">
              <Link href={`/blog/${a.slug}`} className="group grid-12 gap-y-4 py-10 md:py-14">
                <p className="t-meta col-span-4 text-slate md:col-span-3">
                  {fmt(a.published)} · {a.readingMinutes} min
                  <span className="mt-2 block text-mist">{a.tags.join(" · ")}</span>
                </p>
                <div className="col-span-4 md:col-span-8">
                  <h2 className="text-[clamp(1.6rem,1.2rem+1.6vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.035em] text-paper transition-colors group-hover:text-glow">
                    {a.title}
                  </h2>
                  <p className="mt-4 max-w-[60ch] text-mist">{a.excerpt}</p>
                </div>
                <span aria-hidden className="col-span-4 hidden self-center justify-self-end text-2xl text-mist transition-transform group-hover:translate-x-1 group-hover:text-electric md:col-span-1 md:block">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <ClosingCta />
    </>
  );
}
