import { contact } from "@/config/site";

export type QA = { q: string; a: string };

/** FAQ de l'accueil : questions réelles de prospects, réponses fidèles aux prestations (aucun tarif, délai ni garantie inventés). */
export const homeFaq: QA[] = [
  {
    q: "Pourquoi mon entreprise a-t-elle besoin d'un site internet ?",
    a: "Quand un client entend parler de vous, son premier réflexe est souvent de vous chercher sur internet. Un site présente clairement votre activité, vos services et vos coordonnées, avec vos mots et votre image. Contrairement à une page sur les réseaux sociaux, il vous appartient, il peut apparaître dans les résultats de Google et il rassemble au même endroit ce qu'un client doit savoir avant de vous contacter.",
  },
  {
    q: "Combien coûte la création d'un site internet ?",
    a: "Le prix dépend du nombre de pages, des fonctionnalités (formulaire, boutique, réservation…), de la préparation des contenus et du niveau de personnalisation. Plutôt qu'un tarif générique, nous préférons comprendre votre besoin, puis vous remettre un devis détaillé. Décrivez votre projet sur la page contact : nous revenons vers vous avec une proposition adaptée.",
  },
  {
    q: "Est-il possible de refaire un site existant ?",
    a: "Oui, la refonte fait partie de nos prestations. Nous partons de l'existant : ce qui fonctionne, ce qui freine vos visiteurs, les contenus à conserver. L'objectif est un site plus clair, plus actuel et plus efficace, en préservant ce qui a de la valeur, notamment pour votre référencement.",
  },
  {
    q: "Le site sera-t-il adapté aux téléphones ?",
    a: "Oui. Chaque site est conçu en responsive design : la mise en page s'adapte aux téléphones, aux tablettes et aux ordinateurs. Nous vérifions l'affichage sur plusieurs tailles d'écran, car une grande partie de vos visiteurs vous découvriront depuis leur téléphone.",
  },
  {
    q: "Le référencement Google est-il inclus ?",
    a: "Les bases du référencement naturel sont intégrées à la conception : structure des pages, titres et descriptions, vitesse d'affichage, adaptation au mobile et contenus rédigés autour de votre activité et de votre secteur. Le référencement est un travail dans la durée : aucun prestataire sérieux ne peut garantir une position précise sur Google. Le détail de l'accompagnement figure dans le devis.",
  },
  {
    q: "Travaillez-vous avec les entreprises du Doubs ?",
    a: "Oui, c'est notre territoire. Basée à Pierrefontaine-les-Varans, WEBPRO AGENCY accompagne les professionnels dans tout le Doubs : Haut-Doubs, secteurs de Valdahon, Pontarlier, Morteau, Besançon, Ornans, Maîche et les autres communes du département. Nous privilégions les échanges directs, et pouvons aussi avancer à distance selon les projets.",
  },
  {
    q: "Pouvez-vous gérer les réseaux sociaux ?",
    a: "Oui. Nous pouvons créer vos publications et vos visuels, préparer les contenus, vous accompagner sur la ligne éditoriale et organiser vos publications. L'accompagnement s'adapte à vos besoins, de la prise en charge régulière à l'appui ponctuel. Nous ne promettons pas un nombre d'abonnés : nous construisons une communication régulière et cohérente avec votre image.",
  },
  {
    q: "Comment demander un devis ?",
    a: `Le plus simple est de remplir le formulaire de la page contact en décrivant votre activité et votre besoin. Vous pouvez aussi appeler le ${contact.phoneDisplay} ou écrire à ${contact.email}. Nous revenons vers vous pour échanger sur votre projet.`,
  },
];
