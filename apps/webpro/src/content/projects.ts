/**
 * RÉALISATIONS
 * ────────────
 * Pour ajouter une réalisation réelle : copier un objet, mettre `demo: false`,
 * renseigner les champs et déposer les visuels dans /public/projects/<slug>/.
 *
 * Les projets ci-dessous sont des PROJETS DE DÉMONSTRATION : entreprises fictives,
 * conçues par WEBPRO AGENCY pour montrer son savoir-faire. Ils sont étiquetés comme tels
 * partout sur le site. Aucun client, résultat ou témoignage n'est inventé.
 */

export const categories = ["Sites vitrines", "E-commerce", "Communication", "Identité visuelle", "Vidéos"] as const;
export type Category = (typeof categories)[number];

export type Project = {
  slug: string;
  name: string;
  /** Secteur d'activité (fictif pour les démonstrations). */
  sector: string;
  sectorShort: "Restaurant" | "Artisan" | "Commerce" | "Services";
  demo: boolean;
  categories: Category[];
  /** Une phrase d'accroche. */
  summary: string;
  context: string;
  objective: string;
  work: string[];
  technologies: string[];
  /** Ce que le projet démontre pour un prospect réel. */
  takeaway: string;
  palette: { name: string; hex: string }[];
  typography: string;
  /** Couleur d'ambiance utilisée dans les présentations. */
  tone: string;
  /** Aperçu navigable (projets de démonstration). */
  previewHref: string | null;
  images: {
    desktop: string;
    mobile: string;
    full: string;
    extra?: { src: string; alt: string; ratio: string }[];
  };
};

const img = (slug: string) => ({
  desktop: `/projects/${slug}/desktop.png`,
  mobile: `/projects/${slug}/mobile.png`,
  full: `/projects/${slug}/full.png`,
});

export const projects: Project[] = [
  {
    slug: "oree",
    name: "Orée",
    sector: "Restaurant — cuisine de saison",
    sectorShort: "Restaurant",
    demo: true,
    categories: ["Sites vitrines", "Communication", "Vidéos"],
    summary: "Un site qui met l'eau à la bouche et rend la réservation évidente, même depuis un téléphone.",
    context:
      "Scénario fictif : un restaurant de cuisine de saison dont la carte change régulièrement. Sa présence en ligne se limite à une page sur les réseaux sociaux ; les clients y cherchent en vain la carte du moment, les horaires et le moyen de réserver.",
    objective:
      "Donner envie dès le premier écran, rendre la carte lisible sur mobile et placer l'appel ou la réservation à portée de pouce, sans alourdir la page.",
    work: [
      "Direction artistique : palette végétale, typographie éditoriale à empattements, illustrations",
      "Page d'accueil : carte de saison, présentation du lieu, horaires, accès et réservation",
      "Mise en page pensée d'abord pour le téléphone",
      "Visuels pour annoncer la nouvelle carte sur les réseaux sociaux",
      "Maquette d'un reel vertical « nouveautés de la semaine »"
    ],
    technologies: ["Next.js", "Design responsive", "Typographie variable", "Illustrations vectorielles (SVG)"],
    takeaway:
      "Pour un restaurant, le site répond d'abord à trois questions : qu'est-ce qu'on mange, quand est-ce ouvert, comment réserver.",
    palette: [
      { name: "Sapin", hex: "#1E2B23" },
      { name: "Crème", hex: "#F2EADC" },
      { name: "Terre cuite", hex: "#C2603A" },
      { name: "Sauge", hex: "#8FA588" },
    ],
    typography: "Fraunces (titres) · Manrope (texte)",
    tone: "#1E2B23",
    previewHref: "/apercu/oree",
    images: {
      ...img("oree"),
      extra: [
        { src: "/projects/oree/social.png", alt: "Visuels pour les réseaux sociaux du restaurant de démonstration Orée", ratio: "1200/900" },
      ],
    },
  },
  {
    slug: "atelier-sylve",
    name: "Atelier Sylve",
    sector: "Artisan — menuiserie & agencement",
    sectorShort: "Artisan",
    demo: true,
    categories: ["Sites vitrines", "Identité visuelle"],
    summary: "Le savoir-faire d'un menuisier, présenté avec la précision d'un plan d'atelier.",
    context:
      "Scénario fictif : un menuisier-agenceur travaille surtout grâce au bouche-à-oreille. Sans site, il peine à montrer l'étendue de son travail (escaliers, cuisines, dressings) et reçoit des demandes trop vagues pour chiffrer.",
    objective:
      "Présenter clairement les types de travaux, la méthode et la zone d'intervention, puis guider le visiteur vers une demande de devis précise.",
    work: [
      "Identité visuelle : logotype, palette chêne et charbon, motif de veinage",
      "Page d'accueil : savoir-faire, méthode en quatre étapes, appel à la demande de devis",
      "Typographie étroite et dessin technique pour évoquer le plan d'atelier",
      "Maquette d'un format vertical « dans l'atelier » pour les réseaux"
    ],
    technologies: ["Next.js", "Design responsive", "Textures vectorielles générées (SVG)"],
    takeaway:
      "Un artisan n'a pas besoin d'en dire beaucoup : il a besoin de montrer, puis de faciliter une demande exploitable.",
    palette: [
      { name: "Charbon", hex: "#1C1B19" },
      { name: "Chêne", hex: "#B8875A" },
      { name: "Plâtre", hex: "#ECE7DF" },
      { name: "Graphite", hex: "#5C5A55" },
    ],
    typography: "Archivo étroit (titres) · Manrope (texte)",
    tone: "#2A2723",
    previewHref: "/apercu/atelier-sylve",
    images: img("atelier-sylve"),
  },
  {
    slug: "la-meule",
    name: "La Meule",
    sector: "Commerce — fromagerie & épicerie fine",
    sectorShort: "Commerce",
    demo: true,
    categories: ["E-commerce", "Communication"],
    summary: "Une boutique en ligne gourmande, pensée pour commander le matin et retirer le soir.",
    context:
      "Scénario fictif : une fromagerie de centre-bourg souhaite proposer la commande en ligne avec retrait en boutique, et annoncer chaque semaine ses arrivages et ses produits de saison.",
    objective:
      "Rendre le catalogue appétissant et simple à parcourir, raccourcir le chemin jusqu'à la commande et créer un rendez-vous hebdomadaire sur les réseaux.",
    work: [
      "Accueil de boutique en ligne : recherche, familles de produits, sélection de la semaine, ajout au panier",
      "Parcours « commande et retrait » expliqué en trois étapes",
      "Gabarits de visuels « arrivage de la semaine » pour les réseaux",
      "Maquette d'un format vertical « conseil de dégustation »"
    ],
    technologies: ["Next.js", "Interface e-commerce (maquette)", "Design responsive", "Illustrations vectorielles (SVG)"],
    takeaway:
      "En e-commerce de proximité, chaque étape en moins entre l'envie et la commande compte.",
    palette: [
      { name: "Croûte", hex: "#3A2A1C" },
      { name: "Pâte", hex: "#F3D27A" },
      { name: "Lait", hex: "#FBF6EA" },
      { name: "Prairie", hex: "#5E7D4E" },
    ],
    typography: "Fraunces (titres) · Manrope (texte)",
    tone: "#3A2A1C",
    previewHref: "/apercu/la-meule",
    images: {
      ...img("la-meule"),
      extra: [
        { src: "/projects/la-meule/social.png", alt: "Gabarits de publications « arrivage de la semaine » pour la fromagerie de démonstration La Meule", ratio: "1200/900" },
      ],
    },
  },
  {
    slug: "nacre",
    name: "Nacre",
    sector: "Services — institut de beauté",
    sectorShort: "Services",
    demo: true,
    categories: ["Sites vitrines", "Identité visuelle"],
    summary: "Une identité douce et lumineuse, et une carte de soins enfin claire.",
    context:
      "Scénario fictif : un institut de beauté souhaite une image plus soignée, cohérente avec la qualité de ses soins, et une présentation lisible de ses prestations et de leur durée.",
    objective:
      "Installer une ambiance apaisante, présenter les soins par famille, rassurer sur le déroulé d'un rendez-vous et faciliter la prise de contact.",
    work: [
      "Identité visuelle : logotype, palette nacrée, sphère graphique",
      "Page d'accueil : soins par famille avec leur durée, déroulé d'une séance, prise de rendez-vous",
      "Textes au ton chaleureux et précis",
      "Contrastes de lecture soignés malgré une palette claire",
      "Maquette d'un format vertical « rituel en trois gestes »"
    ],
    technologies: ["Next.js", "Design responsive", "Dégradés CSS (aucune image)"],
    takeaway:
      "Pour une activité de service, la clarté de l'offre rassure autant que l'esthétique.",
    palette: [
      { name: "Nacre", hex: "#F4ECE7" },
      { name: "Poudre", hex: "#E3C9C0" },
      { name: "Encre", hex: "#2B2326" },
      { name: "Bronze", hex: "#9A6B56" },
    ],
    typography: "Fraunces italique (titres) · Manrope (texte)",
    tone: "#2B2326",
    previewHref: "/apercu/nacre",
    images: img("nacre"),
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
