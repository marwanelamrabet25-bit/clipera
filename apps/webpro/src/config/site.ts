/**
 * CONFIGURATION DE MARQUE — WEBPRO AGENCY
 * ───────────────────────────────────────
 * Toutes les informations publiques de l'agence sont centralisées ici.
 * Modifier ce fichier suffit pour mettre à jour le site entier (pages, pied de page,
 * données structurées, métadonnées).
 *
 * Règle : une valeur inconnue reste `null`. Le site n'affiche jamais d'information inventée.
 */

/** URL publique du site. À définir avec NEXT_PUBLIC_SITE_URL (ex. https://www.exemple.fr) avant la mise en ligne. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const brand = {
  name: "WEBPRO AGENCY",
  /** Forme utilisée dans les phrases courantes. */
  shortName: "WebPro Agency",
  tagline: "Votre présence en ligne, notre métier.",
  description:
    "Agence digitale basée à Pierrefontaine-les-Varans (Doubs) : création de sites internet, gestion des réseaux sociaux et création de contenus visuels et vidéo pour les professionnels de tout le Doubs.",
  /** Phrase de référence du brief, réutilisée dans les contenus. */
  referenceSentence:
    "WEBPRO AGENCY, agence digitale basée à Pierrefontaine-les-Varans, dans le Doubs, accompagne les professionnels dans leurs projets numériques dans tout le département et les communes environnantes.",
  logo: {
    horizontal: { src: "/brand/logo-horizontal.png", width: 795, height: 117 },
    stacked: { src: "/brand/logo-stacked.png", width: 566, height: 239 },
    symbol: { src: "/brand/symbol.png", width: 315, height: 173 },
    icon512: "/brand/icon-512.png",
  },
} as const;

export const contact = {
  email: "webproagency25@gmail.com",
  /** Format affiché. */
  phoneDisplay: "07 68 35 50 56",
  /** Format international pour les liens tel: et les données structurées. */
  phoneE164: "+33768355056",
} as const;

export const location = {
  locality: "Pierrefontaine-les-Varans",
  /** Code postal de la commune (information publique). À confirmer par l'agence. */
  postalCode: "25510",
  department: "Doubs",
  departmentCode: "25",
  region: "Bourgogne-Franche-Comté",
  country: "France",
  countryCode: "FR",
  /** Coordonnées approximatives du centre de la commune (pas d'adresse précise publiée). */
  geo: { latitude: 47.2175, longitude: 6.5397 },
  /**
   * Adresse postale précise : volontairement absente.
   * Ne la renseigner que si l'agence reçoit du public à cette adresse et accepte qu'elle soit publiée.
   */
  streetAddress: null as string | null,
} as const;

/**
 * Zone d'intervention : tout le Doubs, sans rayon fixe.
 * Les secteurs listés sont des repères pour le visiteur, pas une limite.
 */
export const serviceArea = {
  summary: "Pierrefontaine-les-Varans · Doubs et communes environnantes",
  sentence:
    "Basée à Pierrefontaine-les-Varans, WEBPRO AGENCY accompagne les entreprises, artisans, commerçants et indépendants dans tout le Doubs et les communes environnantes.",
  sectors: [
    "Pierrefontaine-les-Varans et alentours",
    "Haut-Doubs",
    "Valdahon",
    "Pontarlier",
    "Morteau",
    "Besançon",
    "Ornans",
    "Maîche",
  ],
} as const;

/**
 * Réseaux sociaux : renseigner l'URL complète du profil quand il existe.
 * Un réseau à `null` n'est affiché nulle part.
 */
export const socials: { name: "Instagram" | "Facebook" | "TikTok"; url: string | null }[] = [
  { name: "Instagram", url: null },
  { name: "Facebook", url: null },
  { name: "TikTok", url: null },
];

export const activeSocials = socials.filter((s): s is { name: typeof s.name; url: string } => Boolean(s.url));

/** Année de référence pour le pied de page (évaluée à la construction du site). */
export const COPYRIGHT_YEAR = 2026;
