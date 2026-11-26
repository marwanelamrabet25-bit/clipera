/**
 * Prestations de WEBPRO AGENCY.
 * Les textes « pitch » proviennent du brief officiel. Les listes de prestations
 * reprennent uniquement les prestations validées dans le brief.
 */

export type ServiceSlug = "creation-site-web" | "gestion-reseaux-sociaux" | "creation-contenu";

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
      "Site vitrine",
      "Site professionnel",
      "Refonte",
      "Design personnalisé",
      "Responsive design",
      "Optimisation technique",
      "SEO",
      "Formulaires de contact",
    ],
    menuHint: "Vitrine, refonte, design sur mesure",
    href: "/creation-site-web",
    primaryKeyword: "création site internet Doubs",
  },
  {
    slug: "gestion-reseaux-sociaux",
    index: "02",
    name: "Réseaux sociaux",
    title: "Gestion des réseaux sociaux",
    pitch:
      "Une communication cohérente pour valoriser votre entreprise et entretenir votre présence en ligne.",
    items: [
      "Création de publications",
      "Création de visuels",
      "Préparation de contenus",
      "Accompagnement éditorial",
      "Organisation des publications",
      "Présentation de l'activité",
    ],
    menuHint: "Publications, visuels, organisation",
    href: "/gestion-reseaux-sociaux",
    primaryKeyword: "gestion réseaux sociaux Doubs",
  },
  {
    slug: "creation-contenu",
    index: "03",
    name: "Contenus & vidéo",
    title: "Création de contenus",
    pitch:
      "Des contenus visuels et vidéos pour mettre en valeur vos produits, vos services et votre savoir-faire.",
    items: [
      "Vidéos promotionnelles",
      "Reels",
      "Montage vidéo",
      "Visuels publicitaires",
      "Présentation de produits",
      "Formats adaptés aux réseaux sociaux",
    ],
    menuHint: "Vidéos, reels, visuels publicitaires",
    href: "/creation-contenu",
    primaryKeyword: "création contenu vidéo entreprise Doubs",
  },
];

export const serviceBySlug = (slug: ServiceSlug) => services.find((s) => s.slug === slug)!;
