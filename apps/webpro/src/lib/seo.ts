import type { Metadata } from "next";
import { SITE_URL, brand, contact, location } from "@/config/site";

export const abs = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

type PageMeta = {
  /** Title complet (≤ 60 caractères recommandés). Le nom de l'agence est ajouté par le gabarit sauf si `absoluteTitle`. */
  title: string;
  absoluteTitle?: boolean;
  description: string;
  path: string;
  /** Image Open Graph spécifique (sinon : image générée pour la route). */
  noindex?: boolean;
};

/** Construit les métadonnées d'une page : title unique, description, canonical, Open Graph. */
export function pageMetadata({ title, absoluteTitle, description, path, noindex }: PageMeta): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · ${brand.shortName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: brand.name,
      locale: "fr_FR",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    // Clé absente (et non `undefined`) quand la page est indexable : la règle du layout racine s'applique.
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/* ─── Données structurées (JSON-LD) ───────────────────────────────────── */

export const ORG_ID = `${SITE_URL}/#organisation`;
export const WEBSITE_ID = `${SITE_URL}/#site`;

/**
 * Entité principale. ProfessionalService est utilisé car les informations publiées sont réelles
 * (nom, commune, téléphone, email, zone desservie). Aucune adresse précise, aucun horaire,
 * aucune note ni aucun avis ne sont déclarés : ils n'existent pas encore.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: brand.name,
    alternateName: brand.shortName,
    slogan: brand.tagline,
    description: brand.description,
    url: SITE_URL,
    logo: abs(brand.logo.icon512),
    image: abs(brand.logo.icon512),
    email: contact.email,
    telephone: contact.phoneE164,
    address: {
      "@type": "PostalAddress",
      addressLocality: location.locality,
      postalCode: location.postalCode,
      addressRegion: location.region,
      addressCountry: location.countryCode,
      ...(location.streetAddress ? { streetAddress: location.streetAddress } : {}),
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Doubs",
      containedInPlace: { "@type": "AdministrativeArea", name: location.region },
    },
    knowsAbout: [
      "Création de sites internet",
      "Refonte de sites internet",
      "Référencement naturel local",
      "Gestion des réseaux sociaux",
      "Création de contenus vidéo",
      "Création de visuels",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: brand.name,
    inLanguage: "fr-FR",
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Accueil", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function serviceJsonLd(s: { name: string; description: string; path: string; serviceType: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    serviceType: s.serviceType,
    description: s.description,
    url: abs(s.path),
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "AdministrativeArea", name: "Doubs" },
    inLanguage: "fr-FR",
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
