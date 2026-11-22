/**
 * Informations légales de l'éditeur. À COMPLÉTER par le fondateur : rien ici ne doit être inventé.
 * Tant qu'un champ vaut null, les pages légales l'indiquent clairement comme « à compléter ».
 */
export const LEGAL = {
  /** Nom commercial du service. */
  tradeName: "Clipera",
  /** Nom et prénom de l'éditeur (personne physique, titulaire du compte Stripe qui encaisse les paiements). */
  publisherName: "Marwane Lamrabet" as string | null,
  /** Forme juridique. */
  legalForm: "personne physique" as string | null,
  /** Adresse de l'éditeur. */
  address: "3 cité Yves Authier, 09600 Laroque-d'Olmes, France" as string | null,
  /** SIREN ou SIRET (null tant que l'activité n'est pas immatriculée : affiché tel quel, jamais inventé). */
  siret: null as string | null,
  /** Numéro de TVA intracommunautaire (si assujetti). */
  vatNumber: null as string | null,
  /** Directeur ou directrice de la publication (personne physique). */
  publicationDirector: null as string | null,
  /** Adresse e-mail de contact, y compris pour les demandes RGPD. */
  contactEmail: null as string | null,
  /** Médiateur de la consommation (obligatoire pour vendre à des particuliers en France) : nom + site. */
  consumerMediator: null as string | null,
  /** Date de dernière mise à jour des documents. */
  updatedAt: "22 novembre 2026",
};

export const HOSTS = [
  { name: "Vercel Inc.", role: "Hébergement du site et de l'application", location: "États-Unis", url: "https://vercel.com" },
  { name: "Supabase", role: "Base de données et comptes utilisateurs", location: "Union européenne (Paris)", url: "https://supabase.com" },
  { name: "Cloudflare (R2)", role: "Stockage des vidéos et des clips", location: "Union européenne", url: "https://www.cloudflare.com" },
];

/** Version des CGV acceptée au moment du paiement (enregistrée avec chaque abonnement). */
export const CGV_VERSION = "2026-11-22";

export function legalIsComplete() {
  // TVA : facultative (franchise en base des micro-entreprises). Directeur de publication : l'entrepreneur par défaut.
  return Object.entries(LEGAL).every(([k, v]) => k === "vatNumber" || k === "publicationDirector" || v !== null);
}
