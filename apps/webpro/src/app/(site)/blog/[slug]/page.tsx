import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/page-hero";
import { ClosingCta } from "@/components/ui/closing-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { articles, articleBySlug } from "@/content/articles";
import { abs, ORG_ID, pageMetadata } from "@/lib/seo";
import { brand } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return {};
  const meta = pageMetadata({ title: a.metaTitle, description: a.description, path: `/blog/${a.slug}` });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: a.published, modifiedTime: a.updated ?? a.published } };
}

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function Page({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();
  const toc = a.body.filter((b): b is Extract<typeof b, { type: "h2" }> => b.type === "h2");

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Conseils", path: "/blog" },
          { name: a.title, path: `/blog/${a.slug}` },
        ]}
        eyebrow={`${fmt(a.published)} · ${a.readingMinutes} min de lecture`}
        wide
        title={[a.title]}
        titleClassName="!text-[clamp(2.2rem,1.2rem+3.6vw,4.5rem)] max-w-[22ch]"
        lead={<p>{a.excerpt}</p>}
      />
      <article className="shell grid-12 gap-y-12 pb-28 md:pb-36">
        <aside className="col-span-4 md:col-span-12 lg:col-span-3">
          <nav aria-label="Sommaire" className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <p className="t-label text-slate">Sommaire</p>
            <ol className="mt-4 space-y-2.5 border-l border-line pl-4 text-[0.92rem]">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-mist transition-colors hover:text-paper">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
        <div className="col-span-4 md:col-span-12 lg:col-span-7 lg:col-start-5">
          <div className="space-y-6 text-[1.125rem] leading-[1.75] text-mist">
            {a.body.map((b, i) => {
              switch (b.type) {
                case "p":
                  return <p key={i}>{b.text}</p>;
                case "h2":
                  return (
                    <h2 key={i} id={b.id} className="!mt-16 text-[clamp(1.5rem,1.25rem+0.9vw,2.1rem)] leading-tight font-bold tracking-[-0.03em] text-paper">
                      {b.text}
                    </h2>
                  );
                case "ul":
                  return (
                    <ul key={i} className="space-y-2.5">
                      {b.items.map((it) => (
                        <li key={it} className="flex gap-4">
                          <span aria-hidden className="mt-[0.85em] h-px w-4 shrink-0 bg-electric" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  );
                case "note":
                  return (
                    <aside key={i} className="!my-10 border-l-2 border-electric bg-ink-3/60 py-6 pr-6 pl-7">
                      <p className="t-label text-electric">{b.title}</p>
                      <p className="mt-3 text-[1.02rem]">{b.text}</p>
                    </aside>
                  );
                case "table":
                  return (
                    <div key={i} className="!my-10 overflow-x-auto rounded-[6px] border border-line">
                      <table className="w-full min-w-[32rem] text-left text-[0.98rem]">
                        <thead className="bg-ink-3/70 text-paper">
                          <tr>
                            {b.head.map((h) => (
                              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {b.rows.map((r) => (
                            <tr key={r[0]} className="border-t border-line">
                              {r.map((c, ci) =>
                                ci === 0 ? (
                                  <th key={ci} scope="row" className="px-4 py-3 font-semibold text-paper">
                                    {c}
                                  </th>
                                ) : (
                                  <td key={ci} className="px-4 py-3">
                                    {c}
                                  </td>
                                ),
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
              }
            })}
          </div>

          {a.sources.length > 0 && (
            <div className="mt-16 border-t border-line pt-8">
              <p className="t-label text-slate">Sources</p>
              <ul className="mt-4 space-y-2 text-[0.95rem]">
                {a.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-inline">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-12 border-t border-line pt-8">
            <p className="t-label text-slate">Pour aller plus loin</p>
            <ul className="mt-4 flex flex-col gap-3">
              {a.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="group inline-flex items-center gap-2 font-semibold text-paper hover:text-glow">
                    {r.label} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
      <ClosingCta />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.description,
          datePublished: a.published,
          dateModified: a.updated ?? a.published,
          inLanguage: "fr-FR",
          mainEntityOfPage: abs(`/blog/${a.slug}`),
          author: { "@type": "Organization", "@id": ORG_ID, name: brand.name },
          publisher: { "@id": ORG_ID },
          image: abs(brand.logo.icon512),
        }}
      />
    </>
  );
}
