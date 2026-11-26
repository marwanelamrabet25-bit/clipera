/**
 * Prestations de WEBPRO AGENCY : exactement DEUX catégories.
 * La création de vidéos et de contenus fait partie de la gestion des réseaux sociaux
 * (ce n'est pas une catégorie à part).
 */

export type ServiceSlug = "creation-site-web" | "gestion-reseaux-sociaux";

export type Service = {
  slug: ServiceSlug;
  index: string;
  /** Nom court (navigation, cartes). */
  name: string;
  /** Nom long (titres). */
  title: string;
  pitch: string;
  items: string[];
  /** Description courte pour menus et liens internes. */
  menuHint: string;
  href: `/${ServiceSlug}`;
  /** Offre tarifaire principale associée (voir src/config/offers.ts). */
  offerId: "site" | "social";
  /** Expression principale visée par la page (voir docs/SEO-LOCAL.md). */
  primaryKeyword: string;
};

export const services: Service[] = [
  {
    slug: "creation-site-web",
    index: "01",
    name: "Sites internet",
    title: "Création de sites internet",
    pitch:
      "Des sites professionnels conçus pour présenter votre activité, valoriser votre image et faciliter la prise de contact.",
    items: [
      "Création de sites vitrines",
      "Conception graphique",
      "Design personnalisé",
      "Adaptation mobile",
      "Présentation des activités",
      "Formulaires de contact",
      "Optimisation SEO de base",
      "Mise en ligne selon les conditions convenues",
    ],
    menuHint: "Site vitrine, design personnalisé, mobile",
    href: "/creation-site-web",
    offerId: "site",
    primaryKeyword: "création site internet Doubs",
  },
  {
    slug: "gestion-reseaux-sociaux",
    index: "02",
    name: "Réseaux sociaux",
    title: "Gestion des réseaux sociaux",
    pitch:
      "Une communication cohérente, des visuels et des vidéos pour valoriser votre entreprise et entretenir votre présence en ligne.",
    items: [
      "Création de publications",
      "Création de visuels",
      "Montage vidéo",
      "Création de Reels",
      "Vidéos promotionnelles",
      "Contenus courts",
      "Préparation de contenus",
      "Accompagnement éditorial",
      "Gestion des publications selon la formule choisie",
    ],
    menuHint: "Publications, visuels, vidéos et Reels",
    href: "/gestion-reseaux-sociaux",
    offerId: "social",
    primaryKeyword: "gestion réseaux sociaux Doubs",
  },
];

export const serviceBySlug = (slug: ServiceSlug) => services.find((s) => s.slug === slug)!;
