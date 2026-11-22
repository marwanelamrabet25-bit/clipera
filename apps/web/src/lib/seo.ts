/**
 * Référencement : adresse officielle, liens du site et données structurées (JSON-LD).
 * Règle : uniquement des informations vraies et visibles sur le site. Aucune note, aucun avis, aucune adresse inventés.
 */
import { planPrice } from "./pricing";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const BRAND = "Clipera";

/** Profils officiels de la marque. À compléter seulement quand ils existent réellement. */
export const SOCIAL_PROFILES: string[] = [];

/** Pages publiques de contenu (une par besoin réel), utilisées par le menu, le pied de page et le sitemap. */
export const SOLUTION_PAGES = [
  { href: "/generateur-clips-ia", label: "Générateur de clips IA" },
  { href: "/transformer-podcast-en-clips", label: "Transformer un podcast en clips" },
  { href: "/youtube-shorts-tiktok-reels", label: "Shorts, TikTok et Reels" },
  { href: "/sous-titres-automatiques", label: "Sous-titres automatiques" },
  { href: "/recadrage-vertical-automatique", label: "Recadrage vertical automatique" },
] as const;

export const abs = (path: string) => `${SITE_URL}${path === "/" ? "/" : path}`;

const ORG_ID = `${SITE_URL}/#organisation`;
const SITE_ID = `${SITE_URL}/#site`;
const APP_ID = `${SITE_URL}/#logiciel`;

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: BRAND,
    url: abs("/"),
    logo: { "@type": "ImageObject", url: abs("/brand/clipera-app-icon.png"), width: 256, height: 256 },
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    name: BRAND,
    alternateName: ["Clipera AI", "clipera.fr"],
    url: abs("/"),
    inLanguage: "fr-FR",
    publisher: { "@id": ORG_ID },
  };
}

type PlanForLd = { id: string; name: string; price_cents: number; annual_price_cents: number };

/** Le logiciel et ses offres, avec les prix réels lus en base (affichés sur la page). */
export function softwareLd(plans: PlanForLd[]) {
  const offers = plans.flatMap((p) => {
    const pr = planPrice(p);
    const monthly = {
      "@type": "Offer",
      name: pr.free ? `${p.name} (gratuit)` : `${p.name} mensuel`,
      price: (pr.monthlyCents / 100).toFixed(2),
      priceCurrency: "EUR",
      url: abs("/tarifs"),
    };
    if (pr.free) return [monthly];
    return [monthly, { ...monthly, name: `${p.name} annuel`, price: (pr.annualCents / 100).toFixed(2) }];
  });
  return {
    "@type": "SoftwareApplication",
    "@id": APP_ID,
    name: BRAND,
    url: abs("/"),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    description:
      "Clipera transforme les vidéos longues (podcasts, interviews, lives) en clips courts verticaux sous-titrés, prêts pour TikTok, YouTube Shorts et Instagram Reels.",
    publisher: { "@id": ORG_ID },
    ...(offers.length ? { offers } : {}),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Accueil", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function articleLd(a: { title: string; description: string; path: string; published: string; modified: string }) {
  return {
    "@type": "BlogPosting",
    headline: a.title,
    description: a.description,
    url: abs(a.path),
    mainEntityOfPage: abs(a.path),
    datePublished: a.published,
    dateModified: a.modified,
    inLanguage: "fr-FR",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    image: abs("/opengraph-image"),
  };
}

/** Regroupe plusieurs entités dans un seul bloc JSON-LD (`@graph`). */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Métadonnées d'une page publique : titre unique, description, adresse officielle et aperçu de partage. */
/** Image d'aperçu commune (générée par app/opengraph-image.tsx). */
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Clipera — Transforme tes vidéos. Multiplie tes opportunités." };

export function pageMetadata(p: { path: string; metaTitle: string; metaDescription: string; type?: "website" | "article" }) {
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: p.path },
    openGraph: {
      title: `${p.metaTitle} · ${BRAND}`,
      description: p.metaDescription,
      url: p.path,
      type: p.type ?? "website",
      locale: "fr_FR",
      siteName: BRAND,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${p.metaTitle} · ${BRAND}`,
      description: p.metaDescription,
      images: [OG_IMAGE],
    },
  };
}
