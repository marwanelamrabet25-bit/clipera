/**
 * INFORMATIONS LÉGALES — À COMPLÉTER AVANT PUBLICATION
 * ─────────────────────────────────────────────────────
 * Aucune de ces informations n'a été communiquée : elles restent `null`.
 * Tant qu'une valeur est `null`, la page affiche « À compléter » de façon visible.
 *
 * Références : article 6 de la loi n° 2004-575 du 21 juin 2004 (LCEN) et RGPD.
 * Faire valider ces pages par l'exploitant (et idéalement un professionnel du droit).
 */

export const legal = {
  /** Nom et prénom de l'exploitant (entreprise individuelle) ou dénomination sociale. */
  publisherName: null as string | null,
  /** Ex. « Entreprise individuelle (micro-entreprise) », « SAS au capital de … € ». */
  legalForm: null as string | null,
  siren: null as string | null,
  siret: null as string | null,
  /** RCS ou RNE selon le statut, ex. « Inscrite au RNE ». */
  registration: null as string | null,
  /** N° de TVA intracommunautaire, ou mention d'exonération. */
  vatNumber: null as string | null,
  /** Adresse du siège / de domiciliation (obligatoire dans les mentions légales). */
  registeredAddress: null as string | null,
  /** Directeur ou directrice de la publication. */
  publicationDirector: null as string | null,
  /** Hébergeur : nom, adresse et téléphone (obligatoires). Ex. si Vercel : « Vercel Inc., … ». */
  /**
   * Hébergeur réel du site (déploiement Vercel). Adresse : politique de confidentialité officielle de Vercel.
   * Téléphone : non publié sur les pages officielles de Vercel → à compléter après vérification.
   */
  host: {
    name: "Vercel Inc." as string | null,
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis" as string | null,
    phone: null as string | null,
  },
  /** Date de dernière mise à jour des pages légales (format libre). */
  lastUpdated: null as string | null,
};

export const legalIsComplete = () =>
  Boolean(
    legal.publisherName &&
      legal.legalForm &&
      legal.siren &&
      legal.registeredAddress &&
      legal.publicationDirector &&
      legal.host.name &&
      legal.host.address &&
      legal.host.phone,
  );
