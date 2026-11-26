import { ogImage, ogSize, ogContentType } from "@/lib/og";
import { articles, articleBySlug } from "@/content/articles";

export const alt = "Article — WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  return ogImage({ eyebrow: "Conseils", title: a?.title ?? "Conseils" });
}
