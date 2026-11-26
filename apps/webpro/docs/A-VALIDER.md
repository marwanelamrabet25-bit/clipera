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
| Configuration de l'envoi d'emails (Resend) | Variables d'environnement | Le formulaire propose l'envoi par messagerie et le téléphone |

## Informations manquantes (non bloquantes)
| Élément | Où | Effet actuel |
| --- | --- | --- |
| URL Instagram, Facebook, TikTok | `src/config/site.ts` → `socials` | Aucun lien de réseau affiché |
| Logo vectoriel (SVG) et fichiers sources | `public/brand/` | Logo extrait de la planche (PNG, fond transparent) : net en usage courant, moins parfait en très grand format |
| Photos réelles (agence, coulisses, projets) | à ajouter | Le site s'appuie sur les visuels des démonstrations |
| Vraies réalisations clients | `src/content/projects.ts` | Quatre projets de démonstration, clairement étiquetés |
| Tarifs validés | `src/config/pricing.ts` | Blocs « Un devis adapté à votre projet » |

## Formulations à valider par l'agence
- Code postal **25510** (Pierrefontaine-les-Varans) dans les données structurées.
- « Nous privilégions les échanges directs, et pouvons aussi avancer à distance selon les projets. »
- Méthode en 5 étapes (accueil et pages services) : contenu des étapes, notamment « Vous recevez ensuite une proposition détaillée » et « prise en main ».
- FAQ : réponses sur le référencement (« les bases sont intégrées à la conception »), le nom de domaine et l'hébergement (« le devis précise ce qui est inclus »), la modification du site par le client, les réseaux sociaux couverts (Instagram, Facebook, TikTok), la validation des publications.
- Formulaire : engagement « Elles ne sont ni cédées ni utilisées à d'autres fins » ; tranches de budget proposées.
- Page Contenus : « Création des images par prises de vue ou éléments graphiques, selon le projet » (l'agence réalise-t-elle des tournages sur place ?).
- Page Création de sites : « Nous vous aidons à structurer [vos textes] » et « Projets spécifiques : vente en ligne, prise de rendez-vous, catalogue » (prestation proposée ou non ?).
- Valeurs de la page À propos (Proximité, Clarté, Exigence, Honnêteté) et principes de l'accueil.
- Articles de conseils (2) : relecture et validation avant publication sous le nom de l'agence.

## Choix faits en autonomie (modifiables)
- Typographies : Manrope + Geist Mono (justification dans `DESIGN-SYSTEM.md`).
- Boutons bleus à texte noir (contraste accessible) plutôt que texte blanc.
- Aucune page géographique par ville au lancement (analyse dans `SEO-LOCAL.md`).
- Pas d'outil de mesure d'audience (donc pas de bandeau cookies). Si un outil est souhaité, préférer une solution sans cookie (ex. Vercel Web Analytics, Plausible) et mettre à jour la politique de confidentialité.
- Hébergement recommandé : Vercel ; envoi d'emails : Resend. Alternatives possibles.

## Limites rencontrées pendant la réalisation
- Les sites de référence M-Access et Okato n'étaient pas accessibles depuis l'environnement de travail (noms de domaine introuvables) : ils n'ont pas pu être analysés directement.
- Pas d'accès à des banques d'images ni à des outils de volumes de mots-clés : visuels conçus sur mesure (démonstrations) et priorisation SEO qualitative.
- Tests réalisés dans Chromium (desktop, tablette, mobile émulés) ; un test sur appareils réels (Safari iOS notamment) reste à faire.
