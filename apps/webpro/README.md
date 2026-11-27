# WEBPRO AGENCY — site officiel

> « Votre présence en ligne, notre métier. »
> Agence digitale basée à **Pierrefontaine-les-Varans (Doubs, 25)**. Deux prestations : **création de sites internet** et **gestion des réseaux sociaux** (visuels, montage vidéo, Reels et contenus courts compris), pour les professionnels de tout le Doubs.

Ce dossier est un projet **indépendant** du reste du dépôt (Clipera) : il a ses propres dépendances, sa configuration et son déploiement.

## Sommaire
- [Lancer le site](#lancer-le-site)
- [Pages](#pages)
- [Modifier les contenus](#modifier-les-contenus)
- [Offres et tarifs](#offres-et-tarifs)
- [Formulaires et demandes](#formulaires-et-demandes)
- [Déploiement](#déploiement)
- [Contrôle qualité](#contrôle-qualité)
- [Documentation](#documentation)

## Lancer le site
Prérequis : Node.js 20 ou plus récent, pnpm 10.

```bash
cd apps/webpro
pnpm install
cp .env.example .env.local   # puis renseigner les valeurs
pnpm dev                     # http://localhost:3000
```

Production locale :
```bash
pnpm build && pnpm start
```

Vérifications : `pnpm typecheck`, `pnpm lint`, `pnpm build` (ou `pnpm check` pour les trois).

## Stack
- **Next.js 16** (App Router, pages statiques), **React 19.3**, **TypeScript strict**
- **Tailwind CSS 4** (design system dans `src/app/globals.css`)
- **Lucide** pour les icônes
- Animations : CSS + un seul observateur `IntersectionObserver` + View Transitions natives. Aucune bibliothèque d'animation : c'est plus léger qu'un Framer Motion ou un GSAP pour le même rendu (voir `docs/DESIGN-SYSTEM.md`).
- Polices auto-hébergées (aucune requête vers Google Fonts) : Manrope + Geist Mono.
- Aucun cookie, aucun traceur : pas de bandeau de consentement nécessaire.

## Pages
| URL | Rôle |
| --- | --- |
| `/` | Accueil : 2 prestations, maquette gratuite, tarifs, méthode, ancrage local, FAQ |
| `/creation-site-web` | Catégorie 01 : création de sites internet |
| `/gestion-reseaux-sociaux` | Catégorie 02 : gestion des réseaux sociaux (vidéos, Reels et contenus courts inclus) |
| `/maquette-gratuite` | Offre « maquette gratuite » + formulaire dédié |
| `/tarifs` | Site Internet, Gestion des réseaux sociaux, WEBPRO PACK, option WEBPRO CARE |
| `/a-propos` | L'agence |
| `/contact` | Formulaire et coordonnées (`/contact?offre=site|social|pack|care` présélectionne l'offre) |
| `/blog` · `/blog/[slug]` | Conseils (2 articles) |
| `/mentions-legales` · `/politique-confidentialite` | Pages légales (à compléter) |
| `/apercu/[slug]` | Exemples de maquettes en plein écran (entreprises fictives, non indexés) |

Pas de page « Réalisations » : l'agence ne présente pas de réalisations clients pour l'instant. Les anciennes adresses (`/realisations`, `/portfolio`) redirigent temporairement vers la maquette gratuite ; `/creation-contenu` redirige vers la section vidéos de la page réseaux sociaux. Voir `next.config.ts`.

## Modifier les contenus
Toutes les informations modifiables sont centralisées :

| Fichier | Contenu |
| --- | --- |
| `src/config/site.ts` | Nom, signature, coordonnées, localisation, zone d'intervention, **réseaux sociaux** (URL à renseigner) |
| `src/config/services.ts` | Les **deux** catégories de prestations |
| `src/config/offers.ts` | **Offres et tarifs** (voir ci-dessous) |
| `src/config/legal.ts` | **Informations légales** : à compléter avant publication |
| `src/config/navigation.ts` | Menus et appel à l'action principal |
| `src/content/mockups.ts` | Exemples de maquettes (entreprises fictives) affichés sur la page maquette gratuite |
| `src/content/faq.ts` | FAQ de l'accueil (montants lus dans `offers.ts`) |
| `src/content/articles.ts` | Articles de conseils |

## Offres et tarifs
**Un seul fichier : `src/config/offers.ts`.** Cartes tarifaires, pages services, FAQ, formulaires, images de partage et données structurées y lisent les montants : aucun prix n'est écrit ailleurs (contrôle : `grep -rn "€" src` ne doit rien trouver hors de ce fichier et des maquettes fictives).

| Offre | Montant | Facturation |
| --- | --- | --- |
| Site Internet | 99 € | paiement unique, sans abonnement obligatoire |
| Gestion des réseaux sociaux | 49,99 € | par mois |
| WEBPRO PACK | 49,99 € + 39,99 € | création du site en paiement unique **+** réseaux sociaux par mois (deux paiements distincts) ; économie mensuelle calculée automatiquement (10 €) |
| WEBPRO CARE (option) | 14,99 € / mois envisagé | `status: "on-request"` → affiché « Maintenance facultative — sur demande », sans prix, tant que les conditions ne sont pas validées |

Pour chaque offre : nom, description, lignes de facturation (`once` / `month`), contenu, éléments non compris, conditions (vide = non communiquées, rien n'est inventé), visibilité (`visible`). Les quantités de la gestion des réseaux sociaux (`socialQuantities`) restent à `null` tant qu'elles ne sont pas validées. La mention de TVA (`vatNote`) s'affiche dès qu'elle est renseignée.

### Exemples de maquettes
Les trois exemples (restaurant, menuiserie, institut de beauté) sont des maquettes conçues pour des **entreprises fictives**, présentées comme telles partout (« exemple fictif », « pas une réalisation client »). Pour les masquer : `showMockupExamples = false` dans `src/content/mockups.ts`. Quand l'agence aura des réalisations clients réelles (avec accord écrit), une page dédiée pourra être recréée (implémentation disponible dans l'historique Git, commit `e4818da`).

### Régénérer les visuels des projets de démonstration
Les visuels sont des captures des exemples en plein écran (`/apercu/...`) :
```bash
pnpm build && pnpm start &          # ou pnpm dev
BASE_URL=http://localhost:3000 node scripts/capture-demos.cjs
```

### Logo
Le logo officiel a été extrait de la planche d'identité fournie (`brand/source/planche-identite-visuelle.png`) avec fond transparent, sans modification des proportions (script : `brand/extract-logo.py`). Fichiers : `public/brand/`, favicon et icônes : `src/app/`.
**À prévoir** : remplacer par les fichiers sources vectoriels (SVG) dès qu'ils sont disponibles, pour une netteté parfaite sur grand écran.

## Formulaires et demandes
Deux formulaires : **contact** (`/contact`) et **maquette gratuite** (`/maquette-gratuite`). Les demandes sont envoyées par email à **webproagency25@gmail.com** via **Resend**, côté serveur uniquement (`src/lib/mailer.ts`, modèles `src/lib/email-templates.ts`).

Fonctionnement :
1. validation dans le navigateur, puis **validation stricte côté serveur** (`src/lib/contact-schema.ts`, `src/lib/mockup-schema.ts`) ;
2. le serveur tente l'envoi ; la confirmation « Merci… » ne s'affiche **que si Resend a accepté l'email** (réponse avec identifiant) ;
3. sinon, un message d'erreur explicite s'affiche, les champs restent remplis et le visiteur peut écrire depuis sa messagerie ou appeler ;
4. bouton désactivé et indicateur de chargement pendant l'envoi (pas de double soumission).

Sécurité : clé API uniquement dans les variables d'environnement serveur ; champ piège invisible (`hp_confirm`) et délai minimal de remplissage, **sans faux succès** ; limite de 5 envois / 10 min par IP (au mieux, par instance) ; champs d'une ligne nettoyés (aucun retour à la ligne : pas d'injection d'en-têtes) ; HTML de l'email entièrement échappé ; protection CSRF native des actions serveur Next.js ; aucune donnée personnelle dans les journaux.

Emails reçus : objet explicite (`[WEBPRO] Nouvelle demande de contact — …` / `[WEBPRO] Demande de maquette gratuite — …`), badge distinct, tous les champs (champs vides indiqués « Non renseigné »), message complet, **date de réception** (heure de Paris), « Répondre » adressé directement au prospect. Accusé de réception au prospect : prévu, désactivé par défaut (voir ci-dessous).

### Activer l'envoi réel (Resend) — étapes
1. Créer un compte gratuit sur **resend.com** avec l'adresse **webproagency25@gmail.com** (important : sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte, via l'expéditeur de test `onboarding@resend.dev`).
2. Resend → **API Keys** → **Create API Key** → permission *Sending access* → copier la clé (elle ne s'affiche qu'une fois).
3. Vercel → projet **webpro-agency** → **Settings** → **Environment Variables** → ajouter `RESEND_API_KEY` = la clé, environnements *Production* et *Preview*, type *Sensitive*. (`CONTACT_TO_EMAIL` est déjà défini sur `webproagency25@gmail.com`.)
4. Redéployer (Vercel → Deployments → ⋯ → *Redeploy*), puis envoyer une demande de test depuis **chaque** formulaire et vérifier la réception dans Gmail (penser au dossier *Spam* / *Promotions* la première fois, et marquer l'expéditeur comme fiable).
5. **Plus tard, avec un nom de domaine** : Resend → *Domains* → *Add Domain* → ajouter chez le registraire les enregistrements DNS indiqués (SPF/DKIM) → une fois vérifié, définir `CONTACT_FROM_EMAIL` = `WEBPRO AGENCY <contact@votre-domaine.fr>` et, si souhaité, `CONTACT_AUTOREPLY` = `true` pour l'accusé de réception automatique au prospect.

Tant que `RESEND_API_KEY` n'est pas défini, rien n'est envoyé et le formulaire l'indique honnêtement au visiteur.

## Déploiement
Recommandé : **Vercel** (créateurs de Next.js, offre gratuite adaptée à un site vitrine). Tout hébergeur Node.js convient aussi (`pnpm build && pnpm start`).

1. Importer le dépôt dans Vercel, **Root Directory : `apps/webpro`** (framework détecté automatiquement).
2. Variables d'environnement (Production) : `RESEND_API_KEY` (secrète), `CONTACT_TO_EMAIL`, puis, une fois le domaine et les mentions légales prêts, `NEXT_PUBLIC_SITE_URL` (rend le site indexable), `CONTACT_FROM_EMAIL`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
3. Ajouter le nom de domaine, rediriger la variante sans/avec `www` vers l'adresse principale (réglage Vercel « Redirect »). HTTPS est automatique.
4. Le site n'est indexable qu'en production **et** si `NEXT_PUBLIC_SITE_URL` est définie ; sinon (prévisualisations, adresse provisoire) `robots.txt` et la balise `noindex` bloquent l'indexation.
5. Compléter `src/config/legal.ts` (dont l'hébergeur), redéployer.
6. Suivre `docs/CHECKLISTS.md`.

## Contrôle qualité
Avec le site lancé (`pnpm start`) :
```bash
BASE_URL=http://localhost:3000 node scripts/qa.mjs --shots ./captures   # 13 pages × 2 largeurs
BASE_URL=http://localhost:3000 node scripts/e2e.cjs                     # 25 parcours réels
```
`qa.mjs` contrôle : statut HTTP, erreurs console, images cassées, attributs alt, débordement horizontal, H1 unique, titles et descriptions uniques et de bonne longueur, canonical, JSON-LD valide, liens internes. `e2e.cjs` teste les deux formulaires (erreurs, focus, piège à robots, repli sans configuration), la présélection d'offre depuis les tarifs, le menu mobile (focus, Échap, blocage du défilement), le menu Services, le lien d'évitement, la FAQ, le rendu sans JavaScript et avec mouvement réduit.

Résultats au moment de la livraison :
- `qa.mjs` : aucun problème ; `e2e.cjs` : 25/25.
- Lighthouse mobile avec bridage réel (4G lente, processeur ×4) : **Performance 93–98, Accessibilité 100, Bonnes pratiques 100** ; **LCP 1,6–1,8 s**, CLS 0. SEO 100 avec `NEXT_PUBLIC_SITE_URL` définie ; sans elle, le site est volontairement en `noindex` et Lighthouse affiche 69 (« page bloquée à l'indexation »).
- En mode « simulé » par défaut, Lighthouse estime un LCP de 2,7–3,0 s sur les pages dont le titre est animé ; la mesure réelle de Chrome (PerformanceObserver) place pourtant le LCP au premier affichage, l'animation ne masquant jamais totalement le titre.

Typographie française : `python3 scripts/fr-typo.py src` pose les espaces insécables avant « ? ! : ; » et dans les guillemets après une modification de textes.

## Documentation
- [`docs/A-VALIDER.md`](docs/A-VALIDER.md) — **informations manquantes et points à valider avant publication**
- [`docs/CHECKLISTS.md`](docs/CHECKLISTS.md) — avant mise en ligne, Google Search Console, Google Business Profile
- [`docs/SEO-LOCAL.md`](docs/SEO-LOCAL.md) — stratégie SEO locale, mots-clés, mapping par page
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — direction artistique, typographie, grille, composants, mouvement
