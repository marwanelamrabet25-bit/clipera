/**
 * Informations légales de l'éditeur. À COMPLÉTER par le fondateur : rien ici ne doit être inventé.
 * Tant qu'un champ vaut null, les pages légales l'indiquent clairement comme « à compléter ».
 */
export const LEGAL = {
  /** Nom commercial du service. */
  tradeName: "Clipera",
  /** Micro-entreprise : nom et prénom de l'entrepreneur (l'éditeur légal est la personne physique). */
  publisherName: null as string | null,
  /** Forme juridique. */
  legalForm: "Entrepreneur individuel (micro-entreprise)" as string | null,
  /** Adresse du siège (ou de domiciliation). */
  address: null as string | null,
  /** SIREN ou SIRET. */
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
  updatedAt: "20 novembre 2026",
};

export const HOSTS = [
  { name: "Vercel Inc.", role: "Hébergement du site et de l'application", location: "États-Unis", url: "https://vercel.com" },
  { name: "Supabase", role: "Base de données et comptes utilisateurs", location: "Union européenne (Paris)", url: "https://supabase.com" },
  { name: "Cloudflare (R2)", role: "Stockage des vidéos et des clips", location: "Union européenne", url: "https://www.cloudflare.com" },
];

export function legalIsComplete() {
  return Object.entries(LEGAL).every(([k, v]) => k === "vatNumber" || v !== null);
}
