/**
 * OFFRES COMMERCIALES — CONFIGURATION UNIQUE
 * ──────────────────────────────────────────
 * Tous les prix du site viennent de ce fichier : cartes tarifaires, pages services, FAQ,
 * formulaires et données structurées. Ne jamais écrire un montant en dur ailleurs.
 *
 * Règles :
 *  - `oneTime` = montant payé une seule fois ; `monthly` = montant mensuel. Jamais additionnés.
 *  - `visible: false` masque l'offre partout.
 *  - Les quantités (publications, vidéos, réseaux) restent `null` tant qu'elles ne sont pas validées :
 *    le site affiche alors qu'elles sont définies avec le client.
 *  - Aucune durée d'engagement ni condition de résiliation n'est inventée : `conditions` reste vide
 *    tant que l'agence ne les a pas fixées.
 */

export type BillingLine = {
  label: string;
  amount: number;
  /** « once » = paiement unique, « month » = paiement mensuel. */
  period: "once" | "month";
};

export type Offer = {
  id: "site" | "social" | "pack";
  /** Valeur transmise au formulaire de contact (?offre=…). */
  formValue: string;
  index: string;
  name: string;
  description: string;
  /** Lignes de facturation affichées séparément, dans cet ordre. */
  billing: BillingLine[];
  /** Ce que couvre l'offre (périmètre de la prestation). */
  includes: string[];
  /** Ce qui n'est pas compris ou reste à préciser. */
  notIncluded: string[];
  /** Conditions validées par l'agence (engagement, résiliation…). Vide = non communiquées. */
  conditions: string[];
  highlight?: string;
  visible: boolean;
};

/** Frais externes, jamais inclus dans les prix des offres. */
export const externalCosts = ["Nom de domaine", "Hébergement", "Licences éventuelles", "Frais externes"] as const;

const externalNote = "Nom de domaine, hébergement, licences éventuelles et frais externes : non compris, précisés avant la mise en ligne.";

/** Quantités de la gestion des réseaux sociaux : `null` tant qu'elles ne sont pas validées. */
export const socialQuantities: { publicationsPerMonth: number | null; videosPerMonth: number | null; platforms: string[] | null } = {
  publicationsPerMonth: null,
  videosPerMonth: null,
  platforms: null,
};

const quantitiesNote =
  "Nombre de publications, de vidéos et réseaux concernés : définis avec vous selon la formule choisie, avant le démarrage.";

export const offers: Offer[] = [
  {
    id: "site",
    formValue: "Site Internet",
    index: "01",
    name: "Site Internet",
    description: "Un site internet professionnel pour présenter votre activité et développer votre présence en ligne.",
    billing: [{ label: "Création du site", amount: 99, period: "once" }],
    includes: [
      "Création d'un site vitrine",
      "Conception graphique et design personnalisé",
      "Adaptation mobile",
      "Présentation de vos activités",
      "Formulaire de contact",
      "Optimisation SEO de base",
      "Mise en ligne selon les conditions convenues",
    ],
    notIncluded: [externalNote],
    conditions: [],
    visible: true,
  },
  {
    id: "social",
    formValue: "Gestion des réseaux sociaux",
    index: "02",
    name: "Gestion des réseaux sociaux",
    description: "Une communication régulière et des contenus adaptés pour valoriser votre entreprise sur les réseaux sociaux.",
    billing: [{ label: "Gestion des réseaux sociaux", amount: 49.99, period: "month" }],
    includes: [
      "Création de publications et de visuels",
      "Montage vidéo, Reels et vidéos promotionnelles",
      "Contenus courts",
      "Préparation des contenus",
      "Accompagnement éditorial",
      "Gestion des publications selon la formule choisie",
    ],
    notIncluded: [quantitiesNote],
    conditions: [],
    visible: true,
  },
  {
    id: "pack",
    formValue: "WEBPRO PACK",
    index: "03",
    name: "WEBPRO PACK",
    description: "Réunissez votre site internet et votre communication digitale dans une seule offre avantageuse.",
    billing: [
      { label: "Création du site internet", amount: 49.99, period: "once" },
      { label: "Gestion des réseaux sociaux", amount: 39.99, period: "month" },
    ],
    includes: ["Tout le contenu de l'offre Site Internet", "Tout le contenu de l'offre Gestion des réseaux sociaux"],
    notIncluded: [externalNote, quantitiesNote],
    conditions: [],
    highlight: "Offre combinée",
    visible: true,
  },
];

/**
 * WEBPRO CARE — maintenance facultative.
 * status :
 *  - "on-request" : conditions non validées → le site affiche « Maintenance facultative — sur demande », sans prix.
 *  - "published"  : offre définitive affichée avec son prix (à activer une fois les conditions validées).
 *  - "hidden"     : option masquée.
 */
export const care = {
  name: "WEBPRO CARE",
  status: "on-request" as "on-request" | "published" | "hidden",
  monthly: 14.99,
  description: "Une option de maintenance facultative pour garder votre site en bon état de fonctionnement.",
  /** Prestations envisagées : à confirmer selon l'hébergement retenu avant de passer en « published ». */
  includes: [
    "Vérifications régulières",
    "Sauvegardes selon les possibilités de l'hébergement",
    "Mises à jour techniques compatibles",
    "Surveillance du fonctionnement",
    "Petites modifications dans une limite définie au contrat",
  ],
  notIncluded: "Hébergement, nom de domaine, licences et interventions importantes : traités séparément.",
  formValue: "Maintenance (WEBPRO CARE)",
};

/** Mentions fiscales (TVA) : à renseigner selon le statut de l'entreprise, ex. « TVA non applicable, art. 293 B du CGI ». */
export const vatNote: string | null = null;

/* ─── Outils ─────────────────────────────────────────────────────────── */

export const visibleOffers = () => offers.filter((o) => o.visible);
export const offerById = (id: Offer["id"]) => offers.find((o) => o.id === id)!;

/** 99 → « 99 € » ; 49.99 → « 49,99 € » (espaces insécables). */
export function formatPrice(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const periodLabel = (p: BillingLine["period"]) => (p === "once" ? "paiement unique" : "par mois");
export const priceWithPeriod = (l: BillingLine) => `${formatPrice(l.amount)}${l.period === "month" ? " / mois" : ""}`;

/** Économie mensuelle du pack sur la gestion des réseaux sociaux par rapport à l'offre seule (calculée, jamais saisie). */
export function packMonthlySaving() {
  const solo = offerById("social").billing.find((l) => l.period === "month")!.amount;
  const pack = offerById("pack").billing.find((l) => l.period === "month")!.amount;
  return Math.round((solo - pack) * 100) / 100;
}

/** Options proposées dans les formulaires (offres visibles + maintenance si elle n'est pas masquée). */
export const offerFormOptions = () => [
  ...visibleOffers().map((o) => o.formValue),
  ...(care.status !== "hidden" ? [care.formValue] : []),
  "Autre demande",
];
