import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";
import { articles } from "@/content/articles";

/** Plan du site : pages publiques uniquement (les exemples de maquettes /apercu sont exclus et en noindex). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-26");
  const pages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "monthly" },
    { path: "/creation-site-web", priority: 0.9, freq: "monthly" },
    { path: "/gestion-reseaux-sociaux", priority: 0.9, freq: "monthly" },
    { path: "/maquette-gratuite", priority: 0.9, freq: "monthly" },
    { path: "/tarifs", priority: 0.8, freq: "monthly" },
    { path: "/a-propos", priority: 0.7, freq: "yearly" },
    { path: "/contact", priority: 0.8, freq: "yearly" },
    { path: "/blog", priority: 0.6, freq: "monthly" },
    { path: "/mentions-legales", priority: 0.2, freq: "yearly" },
    { path: "/politique-confidentialite", priority: 0.2, freq: "yearly" },
  ];
  return [
    ...pages.map((p) => ({ url: abs(p.path), lastModified: now, changeFrequency: p.freq, priority: p.priority })),
    ...articles.map((a) => ({ url: abs(`/blog/${a.slug}`), lastModified: new Date(a.updated ?? a.published), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
