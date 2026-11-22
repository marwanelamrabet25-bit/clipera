import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, CtaBlock, Prose, RelatedLinks } from "@/components/marketing/content-page";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/legal/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { longDate, POSTS, postBySlug } from "@/content/blog";
import { articleLd, breadcrumbLd, graph, organizationLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = postBySlug((await params).slug);
  if (!post) return {};
  const m = pageMetadata({
    path: `/blog/${post.slug}`,
    metaTitle: post.metaTitle,
    metaDescription: post.description,
    type: "article",
  });
  return { ...m, openGraph: { ...m.openGraph, publishedTime: post.published, modifiedTime: post.modified } };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;
  const crumbs = [
    { name: "Blog", path: "/blog" },
    { name: post.title, path },
  ];
  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd
        data={graph(
          organizationLd(),
          breadcrumbLd(crumbs),
          articleLd({ title: post.title, description: post.description, path, published: post.published, modified: post.modified }),
        )}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-10 pb-20 sm:px-8 sm:pt-14">
        <Breadcrumbs items={crumbs} />
        <article className="mt-8">
          <header>
            <p className="text-caption text-subtle">
              Par l&apos;équipe Clipera · <time dateTime={post.published}>{longDate(post.published)}</time> ·{" "}
              {post.readingMinutes} min de lecture
            </p>
            <h1 className="mt-3 text-h1 font-bold text-balance">{post.title}</h1>
            {post.intro.map((p) => (
              <p key={p.slice(0, 40)} className="mt-5 text-body text-muted sm:text-h3 sm:font-normal">
                {p}
              </p>
            ))}
          </header>
          <div className="mt-12">
            <Prose sections={post.sections} />
          </div>
        </article>
        <div className="mt-16 flex flex-col gap-16">
          <RelatedLinks paths={post.related} />
          <CtaBlock
            title="Essaie la méthode automatique"
            text="Importe une vidéo : Clipera choisit les moments, recadre en vertical et ajoute les sous-titres."
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
