/**
 * TARIFS — CONFIGURATION CENTRALISÉE
 * ──────────────────────────────────
 * Des tarifs ont été évoqués mais ne sont PAS validés. Tant que `enabled` vaut `false`,
 * le site n'affiche aucun prix : chaque bloc « Tarifs » invite à demander un devis.
 *
 * Pour publier des offres :
 *  1. Renseigner chaque offre ci-dessous (nom, prix, contenu exact validé par l'agence).
 *  2. Passer `enabled` à `true`.
 *  3. Vérifier les mentions obligatoires (prix TTC/HT selon le statut de l'entreprise).
 *
 * Ne jamais inventer le contenu d'une offre.
 */

import type { ServiceSlug } from "./services";

export type Offer = {
  service: ServiceSlug;
  name: string;
  /** Prix affiché tel quel, ex. « à partir de 900 € HT ». */
  price: string;
  /** Détail validé de l'offre. */
  includes: string[];
  note?: string;
};

export const pricing: { enabled: boolean; vatNote: string | null; offers: Offer[] } = {
  enabled: false,
  /** Ex. « TVA non applicable, art. 293 B du CGI » — dépend du statut juridique. */
  vatNote: null,
  offers: [
    // Exemple de structure (désactivé) :
    // { service: "creation-site-web", name: "Site vitrine", price: "à partir de … €", includes: ["…"] },
  ],
};

export const offersFor = (service: ServiceSlug) =>
  pricing.enabled ? pricing.offers.filter((o) => o.service === service) : [];

/** Tranches proposées dans le formulaire de contact (budget du prospect, champ facultatif). */
export const budgetRanges = [
  "Je ne sais pas encore",
  "Moins de 1 000 €",
  "1 000 € à 2 500 €",
  "2 500 € à 5 000 €",
  "Plus de 5 000 €",
] as const;
