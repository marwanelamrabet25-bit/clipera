import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs, CtaBlock } from "@/components/marketing/content-page";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/legal/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { longDate, POSTS } from "@/content/blog";
import { breadcrumbLd, graph, organizationLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/blog",
  metaTitle: "Blog : conseils pour créer des clips vidéo courts",
  metaDescription:
    "Guides pratiques pour transformer tes vidéos longues en clips : podcasts, sous-titres, recadrage vertical, TikTok, Reels et YouTube Shorts.",
});

export default function BlogIndex() {
  const crumbs = [{ name: "Blog", path: "/blog" }];
  const posts = [...POSTS].sort((a, b) => b.published.localeCompare(a.published));
  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={graph(organizationLd(), breadcrumbLd(crumbs))} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-10 pb-20 sm:px-8 sm:pt-14">
        <Breadcrumbs items={crumbs} />
        <p className="mt-8 text-small font-semibold text-primary-soft">Blog</p>
        <h1 className="mt-3 text-h1 font-bold text-balance sm:text-display">Créer de meilleurs clips vidéo</h1>
        <p className="mt-5 text-body text-muted">
          Des guides concrets pour transformer tes vidéos longues en clips courts : choisir les bons moments, recadrer,
          sous-titrer et publier sur TikTok, Reels et YouTube Shorts.
        </p>
        <ul className="mt-12 flex flex-col gap-4">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block rounded-xl border border-line bg-surface/40 p-6 transition-colors hover:border-primary-line"
              >
                <p className="text-caption text-subtle">
                  <time dateTime={p.published}>{longDate(p.published)}</time> · {p.readingMinutes} min de lecture
                </p>
                <h2 className="mt-2 text-h3 font-semibold text-fg">{p.title}</h2>
                <p className="mt-2 text-small text-muted">{p.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-primary-soft">
                  Lire l&apos;article <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-20">
          <CtaBlock
            title="Passe de la théorie à la pratique"
            text="Importe une vidéo et laisse Clipera appliquer ces règles pour toi. L'offre gratuite suffit pour essayer."
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
