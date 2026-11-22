import type { MetadataRoute } from "next";
import { POSTS } from "@/content/blog";
import { legalIsComplete } from "@/content/legal";
import { abs, SOLUTION_PAGES } from "@/lib/seo";

/** Toutes les pages publiques utiles, et seulement elles (l'espace client et l'API sont exclus). */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: abs("/"), changeFrequency: "weekly", priority: 1 },
    { url: abs("/tarifs"), changeFrequency: "monthly", priority: 0.8 },
    ...SOLUTION_PAGES.map((p) => ({ url: abs(p.href), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: abs("/blog"), changeFrequency: "weekly", priority: 0.6 },
    ...POSTS.map((p) => ({
      url: abs(`/blog/${p.slug}`),
      lastModified: new Date(p.modified),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
  // Les pages légales ne sont référencées qu'une fois complètes (identité de l'éditeur renseignée).
  if (legalIsComplete()) {
    for (const p of ["/mentions-legales", "/confidentialite", "/cgu"]) {
      pages.push({ url: abs(p), changeFrequency: "yearly", priority: 0.2 });
    }
  }
  return pages;
}
