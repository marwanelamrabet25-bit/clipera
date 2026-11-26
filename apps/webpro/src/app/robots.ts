import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";

/**
 * Production : tout est indexable sauf les aperçus de démonstration (déjà en noindex).
 * Déploiements de prévisualisation Vercel : indexation bloquée pour éviter le contenu dupliqué.
 */
export default function robots(): MetadataRoute.Robots {
  const preview = process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development";
  if (preview) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: abs("/sitemap.xml"),
  };
}
