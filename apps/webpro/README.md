# WEBPRO AGENCY — site officiel

> « Votre présence en ligne, notre métier. »
> Agence digitale basée à **Pierrefontaine-les-Varans (Doubs, 25)** : création de sites internet, gestion des réseaux sociaux, création de contenus visuels et vidéo, pour les professionnels de tout le Doubs.

Ce dossier est un projet **indépendant** du reste du dépôt (Clipera) : il a ses propres dépendances, sa configuration et son déploiement.

## Sommaire
- [Lancer le site](#lancer-le-site)
- [Pages](#pages)
- [Modifier les contenus](#modifier-les-contenus)
- [Formulaire de contact](#formulaire-de-contact)
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
| `/` | Accueil |
| `/creation-site-web` | Service : création de sites internet |
| `/gestion-reseaux-sociaux` | Service : réseaux sociaux |
| `/creation-contenu` | Service : contenus vidéo et visuels |
| `/realisations` · `/realisations/[slug]` | Portfolio filtrable et fiches projets |
| `/a-propos` | L'agence |
| `/contact` | Formulaire et coordonnées |
| `/blog` · `/blog/[slug]` | Conseils (2 articles) |
| `/mentions-legales` · `/politique-confidentialite` | Pages légales (à compléter) |
| `/apercu/[slug]` | Aperçus navigables des projets de démonstration (non indexés) |

Redirections permanentes pour les variantes courantes (`/portfolio`, `/devis`, `/contactez-nous`…) : voir `next.config.ts`.

## Modifier les contenus
Toutes les informations modifiables sont centralisées :

| Fichier | Contenu |
| --- | --- |
| `src/config/site.ts` | Nom, signature, coordonnées, localisation, zone d'intervention, **réseaux sociaux** (URL à renseigner) |
| `src/config/services.ts` | Les trois prestations |
| `src/config/pricing.ts` | **Tarifs** : désactivés (`enabled: false`) tant qu'ils ne sont pas validés |
| `src/config/legal.ts` | **Informations légales** : à compléter avant publication |
| `src/config/navigation.ts` | Menus |
| `src/content/projects.ts` | Réalisations (projets de démonstration + futurs projets clients) |
| `src/content/faq.ts` | FAQ de l'accueil |
| `src/content/articles.ts` | Articles de conseils |

### Ajouter une réalisation client
1. Déposer les visuels dans `public/projects/<slug>/` : `desktop.png` (1440×900), `mobile.png` (390×844), `full.png` (page entière).
2. Ajouter l'objet dans `src/content/projects.ts` avec `demo: false` et `previewHref` (lien du site en ligne, ou `null`).
3. La fiche, le sitemap et le filtre se mettent à jour automatiquement.

### Régénérer les visuels des projets de démonstration
Les visuels sont des captures des aperçus réels (`/apercu/...`) :
```bash
pnpm build && pnpm start &          # ou pnpm dev
BASE_URL=http://localhost:3000 node scripts/capture-demos.cjs
```

### Logo
Le logo officiel a été extrait de la planche d'identité fournie (`brand/source/planche-identite-visuelle.png`) avec fond transparent, sans modification des proportions (script : `brand/extract-logo.py`). Fichiers : `public/brand/`, favicon et icônes : `src/app/`.
**À prévoir** : remplacer par les fichiers sources vectoriels (SVG) dès qu'ils sont disponibles, pour une netteté parfaite sur grand écran.

## Formulaire de contact
- Validation côté navigateur **et** côté serveur (action serveur `src/app/(site)/contact/actions.ts`), règles partagées dans `src/lib/contact-schema.ts`.
- Anti-spam : champ piège invisible, délai minimal de remplissage, limite de fréquence par adresse IP, nettoyage des caractères de contrôle, échappement HTML de l'email.
- Envoi : API Resend (sans dépendance). Variables : `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.
- **Tant que l'envoi n'est pas configuré**, le formulaire le dit clairement et propose d'ouvrir la messagerie du visiteur avec le message prérempli (le message n'est jamais perdu), ainsi que le téléphone.

Mise en place de Resend (gratuit jusqu'à un certain volume, vérifier les conditions actuelles) :
1. Créer un compte sur resend.com.
2. Ajouter et **vérifier le nom de domaine** du site (enregistrements DNS fournis par Resend).
3. Créer une clé API (droit « envoi » uniquement).
4. Définir `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (ex. `WEBPRO AGENCY <contact@domaine.fr>`) et `CONTACT_TO_EMAIL` chez l'hébergeur.
5. Tester un envoi réel, puis `node scripts/e2e.cjs` avec `RESEND_API_KEY` défini.

## Déploiement
Recommandé : **Vercel** (créateurs de Next.js, offre gratuite adaptée à un site vitrine). Tout hébergeur Node.js convient aussi (`pnpm build && pnpm start`).

1. Importer le dépôt dans Vercel, **Root Directory : `apps/webpro`** (framework détecté automatiquement).
2. Variables d'environnement (Production) : `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.
3. Ajouter le nom de domaine, rediriger la variante sans/avec `www` vers l'adresse principale (réglage Vercel « Redirect »). HTTPS est automatique.
4. Les déploiements de prévisualisation sont automatiquement exclus de l'indexation (`robots.txt` + balise `noindex` selon `VERCEL_ENV`).
5. Compléter `src/config/legal.ts` (dont l'hébergeur), redéployer.
6. Suivre `docs/CHECKLISTS.md`.

## Contrôle qualité
Avec le site lancé (`pnpm start`) :
```bash
BASE_URL=http://localhost:3000 node scripts/qa.mjs --shots ./captures   # 34 vérifications de pages (2 largeurs)
BASE_URL=http://localhost:3000 node scripts/e2e.cjs                     # 23 parcours réels
```
`qa.mjs` contrôle : statut HTTP, erreurs console, images cassées, attributs alt, débordement horizontal, H1 unique, titles et descriptions uniques et de bonne longueur, canonical, JSON-LD valide, liens internes. `e2e.cjs` teste le formulaire (erreurs, focus, piège à robots, repli sans configuration), le menu mobile (focus, Échap, blocage du défilement), le menu Services, le lien d'évitement, le filtre du portfolio, la FAQ, le rendu sans JavaScript et avec mouvement réduit.

Résultats au moment de la livraison :
- `qa.mjs` : aucun problème ; `e2e.cjs` : 23/23.
- Lighthouse mobile avec bridage réel (4G lente, processeur ×4), 10 pages testées : **Performance 94–98, Accessibilité 100, Bonnes pratiques 100, SEO 100** ; **LCP 1,5–1,7 s**, CLS 0 à 0,002.
- En mode « simulé » par défaut, Lighthouse estime un LCP de 2,7–3,0 s sur les pages dont le titre est animé ; la mesure réelle de Chrome (PerformanceObserver) place pourtant le LCP au premier affichage, l'animation ne masquant jamais totalement le titre.

Typographie française : `python3 scripts/fr-typo.py src` pose les espaces insécables avant « ? ! : ; » et dans les guillemets après une modification de textes.

## Documentation
- [`docs/A-VALIDER.md`](docs/A-VALIDER.md) — **informations manquantes et points à valider avant publication**
- [`docs/CHECKLISTS.md`](docs/CHECKLISTS.md) — avant mise en ligne, Google Search Console, Google Business Profile
- [`docs/SEO-LOCAL.md`](docs/SEO-LOCAL.md) — stratégie SEO locale, mots-clés, mapping par page
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — direction artistique, typographie, grille, composants, mouvement
