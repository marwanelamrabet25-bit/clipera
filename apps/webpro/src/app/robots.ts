import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";
import { INDEXABLE } from "@/config/site";

/**
 * Production : tout est indexable sauf les exemples de maquettes (/apercu, déjà en noindex).
 * Prévisualisations Vercel ou URL publique non définie : indexation bloquée (voir INDEXABLE).
 */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: abs("/sitemap.xml"),
  };
}
