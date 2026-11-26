# Éléments manquants et points à valider avant publication

Rien de ce qui suit n'a été inventé sur le site : chaque information inconnue est soit absente, soit marquée « À compléter ».

## Informations manquantes (bloquantes pour la publication)
| Élément | Où le renseigner | Effet actuel |
| --- | --- | --- |
| Nom de domaine | Variable `NEXT_PUBLIC_SITE_URL` | Canonical, sitemap et Open Graph pointent vers `localhost` |
| Identité de l'exploitant, statut juridique, SIREN, SIRET, immatriculation, TVA, adresse légale | `src/config/legal.ts` | « À compléter » visible dans les mentions légales |
| Directeur de la publication | `src/config/legal.ts` | « À compléter » visible |
| Hébergeur (nom, adresse, téléphone) | `src/config/legal.ts` | « À compléter » visible |
| Prestataires techniques et durée de conservation des données | `src/app/(site)/politique-confidentialite/page.tsx` | « À compléter » visible |
| Configuration de la gestion des demandes (Resend et/ou webhook) | Variables d'environnement | Les deux formulaires (contact, maquette gratuite) proposent l'envoi par messagerie et le téléphone |

## Informations manquantes (non bloquantes)
| Élément | Où | Effet actuel |
| --- | --- | --- |
| URL Instagram, Facebook, TikTok | `src/config/site.ts` → `socials` | Aucun lien de réseau affiché |
| Logo vectoriel (SVG) et fichiers sources | `public/brand/` | Logo extrait de la planche (PNG, fond transparent) : net en usage courant, moins parfait en très grand format |
| Photos réelles (agence, coulisses, projets) | à ajouter | Le site s'appuie sur les visuels des démonstrations |
| Réalisations clients | — | Pas de page réalisations ; trois exemples de maquettes fictives sur la page maquette gratuite (masquables via `showMockupExamples`) |

## Offres et tarifs à valider (`src/config/offers.ts`)
- **Mention fiscale** : les prix sont affichés sans mention TTC / HT. Renseigner `vatNote` selon le statut (ex. « TVA non applicable, art. 293 B du CGI » pour une micro-entreprise en franchise). Obligatoire vis-à-vis des particuliers.
- **Site Internet 99 €** : contenu exact de la prestation (nombre de pages, nombre d'allers-retours sur la maquette, ce que recouvre « mise en ligne selon les conditions convenues »). La carte indique « sans abonnement obligatoire » : à confirmer.
- **Gestion des réseaux sociaux 49,99 €/mois** et **WEBPRO PACK** : nombre de publications, de vidéos et réseaux inclus (`socialQuantities`), durée d'engagement et conditions de résiliation (`conditions`). Aujourd'hui, le site indique qu'ils sont définis avec le client et précisés dans la proposition.
- **WEBPRO PACK** : le site affiche « 10 € d'économie par mois » (calculé : 49,99 − 39,99). Confirmer s'il faut aussi mentionner la différence sur la création du site (99 € seul, 49,99 € dans le pack) : ce n'est pas affiché pour l'instant.
- **WEBPRO CARE** : statut `on-request` (« Maintenance facultative — sur demande », sans prix). Passer à `published` pour afficher 14,99 €/mois une fois les prestations confirmées techniquement avec l'hébergement retenu et la limite des « petites modifications » fixée.
- Conditions générales de vente : à rédiger avant de vendre en ligne ou d'afficher des tarifs à des particuliers.

## Maquette gratuite à valider
- Formulation « première proposition visuelle, pas la création gratuite d'un site complet » et « préparée par nos soins ».
- Ce que contient concrètement la maquette (une page ? un visuel d'accueil ? nombre de versions ?) : volontairement non précisé sur le site.
- Aucun délai n'est annoncé : en ajouter un seulement s'il peut être tenu.
- Processus interne : qui reçoit et traite les demandes (adresse `CONTACT_TO_EMAIL`, éventuel tableur via `LEADS_WEBHOOK_URL`).

## Formulations à valider par l'agence
- Code postal **25510** (Pierrefontaine-les-Varans) dans les données structurées.
- « Nous privilégions les échanges directs, et pouvons aussi avancer à distance selon les projets. »
- Méthode en 5 étapes : contenu des étapes, notamment « Vous recevez ensuite une proposition détaillée » et « prise en main ».
- FAQ : référencement (« une optimisation SEO de base est comprise »), réseaux couverts (Instagram, Facebook, TikTok), validation des publications, remplacement d'un site existant.
- Formulaires : engagement « Elles ne sont ni cédées ni utilisées à d'autres fins ».
- Valeurs de la page À propos (Proximité, Clarté, Exigence, Honnêteté) et principes de l'accueil.
- Articles de conseils (2) : relecture et validation avant publication sous le nom de l'agence.

## Choix faits en autonomie (modifiables)
- Typographies : Manrope + Geist Mono (justification dans `DESIGN-SYSTEM.md`).
- Boutons bleus à texte noir (contraste accessible) plutôt que texte blanc.
- Aucune page géographique par ville au lancement (analyse dans `SEO-LOCAL.md`).
- Suppression du champ « budget » du formulaire de contact (les prix étant désormais fixes), remplacé par le choix de l'offre.
- Pas d'outil de mesure d'audience (donc pas de bandeau cookies). Si un outil est souhaité, préférer une solution sans cookie (ex. Vercel Web Analytics, Plausible) et mettre à jour la politique de confidentialité.
- Hébergement recommandé : Vercel ; envoi d'emails : Resend. Alternatives possibles.

## Limites rencontrées pendant la réalisation
- Les sites de référence M-Access et Okato n'étaient pas accessibles depuis l'environnement de travail (noms de domaine introuvables) : ils n'ont pas pu être analysés directement.
- Pas d'accès à des banques d'images ni à des outils de volumes de mots-clés : visuels conçus sur mesure (exemples fictifs) et priorisation SEO qualitative.
- Tests réalisés dans Chromium (desktop, tablette, mobile émulés) ; un test sur appareils réels (Safari iOS notamment) reste à faire.
