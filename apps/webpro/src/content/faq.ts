import { contact } from "@/config/site";
import { care, formatPrice, offerById, packMonthlySaving } from "@/config/offers";

export type QA = { q: string; a: string };

const site = offerById("site").billing[0];
const social = offerById("social").billing[0];
const [packSite, packSocial] = offerById("pack").billing;

/** Montants toujours lus dans src/config/offers.ts. */
export const priceSentences = {
  site: `La création d'un site internet est proposée à ${formatPrice(site.amount)}, en paiement unique, sans abonnement obligatoire.`,
  social: `La gestion des réseaux sociaux est proposée à ${formatPrice(social.amount)} par mois.`,
  pack: `Le WEBPRO PACK réunit la création du site à ${formatPrice(packSite.amount)} (paiement unique) et la gestion des réseaux sociaux à ${formatPrice(packSocial.amount)} par mois, soit ${formatPrice(packMonthlySaving())} d'économie chaque mois sur la gestion des réseaux sociaux.`,
  external: "Le nom de domaine, l'hébergement, les éventuelles licences et les frais externes ne sont pas compris : ils sont précisés avant la mise en ligne.",
};

/** FAQ de l'accueil : questions réelles de prospects, réponses fidèles aux offres (aucun délai ni garantie inventés). */
export const homeFaq: QA[] = [
  {
    q: "Pourquoi mon entreprise a-t-elle besoin d'un site internet ?",
    a: "Quand un client entend parler de vous, son premier réflexe est souvent de vous chercher sur internet. Un site présente clairement votre activité, vos services et vos coordonnées, avec vos mots et votre image. Contrairement à une page sur les réseaux sociaux, il vous appartient, il peut apparaître dans les résultats de Google et il rassemble au même endroit ce qu'un client doit savoir avant de vous contacter.",
  },
  {
    q: "Combien coûte la création d'un site internet ?",
    a: `${priceSentences.site} ${priceSentences.external} ${priceSentences.pack}`,
  },
  {
    q: "La maquette gratuite, comment ça marche ?",
    a: "Vous nous présentez votre entreprise via le formulaire dédié. Nous préparons une première proposition visuelle adaptée à votre activité, puis nous vous la présentons. Il s'agit d'une première maquette, gratuite, et non de la création gratuite d'un site complet.",
  },
  {
    q: "Est-il possible de remplacer un site existant ?",
    a: "Oui. Nous pouvons créer un nouveau site vitrine pour remplacer votre site actuel, en partant de ce qui fonctionne et des contenus utiles à conserver. Indiquez l'adresse de votre site dans la demande de maquette : elle nous aide à comprendre votre point de départ.",
  },
  {
    q: "Le site sera-t-il adapté aux téléphones ?",
    a: "Oui. L'adaptation mobile fait partie de la création : la mise en page s'ajuste aux téléphones, aux tablettes et aux ordinateurs. Une grande partie de vos visiteurs vous découvriront depuis leur téléphone.",
  },
  {
    q: "Le référencement Google est-il inclus ?",
    a: "Une optimisation SEO de base est comprise : structure des pages, titres et descriptions, adaptation au mobile, contenus rédigés autour de votre activité et de votre secteur. Le référencement se construit ensuite dans la durée : aucun prestataire sérieux ne peut garantir une position précise sur Google.",
  },
  {
    q: "Que comprend la gestion des réseaux sociaux ?",
    a: `La création de publications et de visuels, le montage vidéo, les Reels et vidéos promotionnelles, les contenus courts, la préparation des contenus, l'accompagnement éditorial et la gestion des publications selon la formule choisie. ${priceSentences.social} Le nombre de publications, de vidéos et les réseaux concernés sont définis avec vous avant le démarrage.`,
  },
  {
    q: "Travaillez-vous avec les entreprises du Doubs ?",
    a: "Oui, c'est notre territoire. Basée à Pierrefontaine-les-Varans, WEBPRO AGENCY accompagne les professionnels dans tout le Doubs : Haut-Doubs, secteurs de Valdahon, Pontarlier, Morteau, Besançon, Ornans, Maîche et les autres communes du département. Nous privilégions les échanges directs, et pouvons aussi avancer à distance selon les projets.",
  },
  {
    q: "Proposez-vous la maintenance du site ?",
    a:
      care.status === "published"
        ? `Oui, avec l'option facultative ${care.name} à ${formatPrice(care.monthly)} par mois. Elle n'est jamais obligatoire. L'hébergement, le domaine, les licences et les interventions importantes sont traités séparément.`
        : `Une option de maintenance facultative (${care.name}) peut être proposée sur demande. Elle n'est jamais obligatoire et ses conditions vous sont précisées avant tout engagement.`,
  },
  {
    q: "Comment demander un devis ou une maquette ?",
    a: `Pour découvrir une première maquette de votre site, utilisez le formulaire « Maquette gratuite ». Pour toute autre demande, écrivez-nous depuis la page contact, appelez le ${contact.phoneDisplay} ou écrivez à ${contact.email}.`,
  },
];
