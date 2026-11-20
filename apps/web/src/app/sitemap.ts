import type { MetadataRoute } from "next";
import { legalIsComplete } from "@/content/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pages: MetadataRoute.Sitemap = [{ url: `${base}/`, changeFrequency: "weekly", priority: 1 }];
  // Les pages légales ne sont référencées qu'une fois complètes.
  if (legalIsComplete()) {
    for (const p of ["/mentions-legales", "/confidentialite", "/cgu"]) {
      pages.push({ url: `${base}${p}`, changeFrequency: "yearly", priority: 0.2 });
    }
  }
  return pages;
}
