# Design system — WEBPRO AGENCY

## 1. Recherche créative

### Références étudiées
| Référence | Ce qui en a été retenu (principes, pas d'interface copiée) |
| --- | --- |
| **Locomotive** (Montréal) | Typographie de grande taille comme élément graphique principal ; rythme lent, mouvements amortis ; beaucoup d'espace. |
| **BASIC/DEPT** | Les réalisations au centre du discours ; présentations de projets éditoriales plutôt que des vignettes ; affirmation par le contenu. |
| **Ex Nihilo** (Paris) | Le mouvement comme signature, mais toujours au service du récit ; détails soignés au survol. |
| **Awwwards** (sélections) | Hiérarchies très contrastées (gros titre / petit libellé), grilles visibles, libellés techniques en chasse fixe. |
| **M-Access, Okato** (références locales) | Domaines introuvables depuis l'environnement de travail (erreurs DNS) : aucune analyse directe n'a pu être faite. À la place, les sites d'agences du Doubs visibles dans les annuaires ont servi de repère : promesses génériques, peu de preuves visuelles, ancrage local souvent limité à une ville. Le site se distingue sur ces trois points : démonstrations navigables, honnêteté sur les projets, ancrage départemental. |

### Constat et parti pris
Les sites d'agences locales se ressemblent : héros centré, cartes de services identiques, chiffres invérifiables, logos clients. WEBPRO AGENCY ne peut ni ne veut afficher de faux chiffres ni de faux clients : le site **montre** au lieu d'affirmer, avec des prix clairs et une maquette gratuite. Trois exemples de maquettes, conçus pour des entreprises fictives et présentés comme tels, sont de vrais mini-sites navigables : ils illustrent l'offre de maquette gratuite et servent de matière visuelle, sans jamais être présentés comme des réalisations clients.

## 2. Système graphique

### Concept : « l'orbite et la grille »
- **L'orbite** — le mouvement circulaire du W du logo devient un trait elliptique fin, en dégradé bleu : soulignement de mots clés (« à sa hauteur », « commence ici »), grande orbite derrière la composition du hero et de l'appel final, point lumineux qui la parcourt lentement. Utilisée avec parcimonie : jamais plus d'une fois par écran.
- **La grille éditoriale** — 12 colonnes, filets fins visibles, libellés numérotés en chasse fixe (`01 — Approche`). Elle donne la rigueur d'un studio et structure la lecture.

### Palette
| Rôle | Couleur | Usage |
| --- | --- | --- |
| Noir profond | `#050608` | Fond principal |
| Noir secondaire | `#0B0E14` | Surfaces, sections alternées |
| Noir bleuté | `#101722` | Surfaces élevées (encadrés, champs actifs) |
| Bleu nuit | `#141923` | Structure (planche d'identité) |
| Blanc | `#F7F9FC` | Titres, texte important |
| Gris clair | `#B7C0CE` | Texte courant secondaire (contraste 11:1) |
| Gris secondaire | `#737E8D` | Libellés et seconde moitié des titres (≥ 4,5:1 sur le fond principal ; jamais en petit corps sur `#101722`) |
| Bleu électrique | `#087BFF` | Accent principal : boutons, mots clés, indices, filets actifs |
| Bleu lumineux | `#00A8FF` | Survols, focus clavier, point de l'orbite |
| Bleu profond | `#064FCB` | Réserve (dégradés de l'orbite) |

Règles : le bleu n'apparaît que sur ce qui est interactif ou signifiant. Pas de halo derrière les titres, pas de glassmorphism généralisé (seul l'en-tête au défilement utilise un flou, pour la lisibilité).
**Accessibilité** : le texte des boutons bleus est noir (`#050608` sur `#087BFF` : 5,2:1), le blanc sur ce bleu n'atteignant que 3,9:1.

### Typographie
- **Manrope** (variable 200–800) pour tout le texte. Choisie pour ses formes géométriques tendues qui répondent au mot-symbole du logo, sa très bonne tenue en grande taille avec un interlettrage serré (-0,05 em), ses chiffres lisibles et sa lisibilité en petit corps sur mobile. Inter était plus neutre, Sora trop « tech », Plus Jakarta Sans plus douce ; Manrope offre le meilleur équilibre entre caractère et sérieux.
- **Geist Mono** pour les détails éditoriaux : libellés, numéros, légendes techniques (formats, minutages). Elle apporte la précision d'un plan d'atelier.
- Exemples de maquettes : **Fraunces** (restaurant, fromagerie, institut) et **Archivo étroit** (menuiserie), chargées uniquement sur ces exemples.

Échelle (utilitaires dans `globals.css`) :
| Utilitaire | Taille (fluide) | Interligne | Usage |
| --- | --- | --- | --- |
| `t-display` | 42 → 116 px | 0,96 | Appel final |
| `t-h1` | 38 → 88 px | 1,0 | Titres de pages |
| `t-h2` | 32 → 64 px | 1,04 | Titres de sections |
| `t-h3` | 22 → 32 px | 1,15 | Sous-titres |
| `t-lead` | 18 → 22 px | 1,55 | Chapôs |
| corps | 17 px | 1,65 | Texte courant (lignes ≤ 60 caractères) |
| `t-label` | 12 px mono, capitales | 1,3 | Libellés, indices |

Les titres associent une partie blanche et une partie grise : une hiérarchie interne qui remplace les effets décoratifs. Typographie française : espaces insécables avant `? ! : ;` (script `scripts/fr-typo.py`).

### Grille et espacements
- Conteneur max. 1472 px, gouttière fluide `clamp(20px, 4vw, 56px)`.
- 4 colonnes en mobile, 12 colonnes dès 768 px, gouttière 16 / 24 px.
- Sections : 112 px (mobile) → 160 px (desktop) de respiration verticale ; sections alternées par un très léger changement de fond et un filet.
- Compositions asymétriques : libellé sur 3 colonnes, contenu sur 9 ; services en alternance texte/visuel ; réalisations en deux colonnes décalées.

### Style visuel des images
- Les visuels sont des **captures d'exemples de maquettes** (entreprises fictives, étiquetées comme telles) présentées dans des cadres neutres de navigateur et de téléphone, sans marque d'appareil.
- Photographie à venir (équipe, coulisses, projets clients) : lumière naturelle, cadrages serrés sur les mains et les matières, tons neutres un peu froids pour s'accorder au noir et au bleu ; pas de photos de banque d'images génériques (poignées de main, open spaces).

## 3. Composants
| Composant | Fichier | Notes |
| --- | --- | --- |
| En-tête | `components/layout/header.tsx` | Transparent puis fond flouté au défilement ; menu Services accessible (clic, survol, Échap, clic extérieur) ; état actif souligné en bleu |
| Menu mobile | `components/layout/mobile-nav.tsx` | Rideau plein écran, cascade, focus piégé, Échap, blocage du défilement, retour du focus |
| Pied de page | `components/layout/footer.tsx` | Logo, signature, plan du site, prestations, coordonnées, réseaux (s'ils sont renseignés) |
| Boutons | `components/ui/button.tsx` | Rectangulaires (rayon 3 px, pas de « pilule »), flèche animée au survol, enfoncement au clic |
| Titres révélés | `components/ui/words.tsx` | Mots révélés derrière un masque ; texte intact pour l'accessibilité et le SEO |
| Cadres | `components/visuals/frames.tsx` | Navigateur (défilement de la page au survol) et téléphone |
| Orbite | `components/visuals/orbit.tsx` | Soulignement dessiné et grande orbite |
| Carte du Doubs | `components/visuals/doubs-map.tsx` | Une commune = un point ; liaisons vers des repères, sans rayon |
| FAQ | `components/ui/faq.tsx` | `<details>` natif : fonctionne sans JavaScript |
| Encadré « ce que nous ne promettons pas » | `components/ui/honest-note.tsx` | Signature de ton : honnêteté |
| Cartes tarifaires | `components/offers/offer-cards.tsx` | Montants lus dans `config/offers.ts` ; paiements uniques et mensuels toujours séparés ; offre combinée mise en avant |
| Maquette gratuite | `components/offers/mockup-offer.tsx` | Section d'accueil, pile d'exemples fictifs, bandeau de rappel |
| Formulaires | `components/forms/` | Briques communes : champs, consentement, pièges à robots, alertes, confirmation |

### États interactifs
- Survol : couleur (`#00A8FF`), soulignement qui se dessine, flèche qui avance, écran qui défile dans les cadres.
- Focus clavier : contour `#00A8FF` de 2 px décalé de 3 px, partout ; lien d'évitement « Aller au contenu ».
- Actif : soulignement bleu dans la navigation, `aria-current="page"`.
- Formulaire : bordure bleue au focus, rouge clair et message explicite en cas d'erreur, `aria-invalid` et `aria-describedby`.

## 4. Mouvement
Principes : le mouvement accompagne la lecture, il ne la retarde jamais. Pas de détournement du défilement, aucune animation obligatoire pour accéder au contenu.

| Élément | Animation | Durée / courbe |
| --- | --- | --- |
| Titre du hero | Mots qui montent derrière un masque, dès le premier affichage (sans attendre le JavaScript) | 1,1 s, `cubic-bezier(.16,1,.3,1)`, 45 ms entre les mots |
| Soulignement orbite | Tracé qui se dessine | 1,5 s, `cubic-bezier(.76,0,.24,1)` |
| Composition du hero | Entrées échelonnées + parallaxe légère au pointeur (souris uniquement) | 1,1 s |
| Sections | Apparition (fondu + 28 px) à l'entrée dans l'écran | 1 s |
| Exemples de maquettes | Apparition échelonnée de la pile ; survol : la page défile dans le cadre | 1 s / 6–9 s |
| Méthode | Fil de progression lié au défilement, étape active mise en valeur | continu |
| Carte | Liaisons tracées, point de la base qui pulse | 1,6 s / 2,8 s |
| Navigation | Transition de page native (fondu + léger glissement) | 200 / 560 ms |

Technique : CSS + un unique `IntersectionObserver` (`components/ui/reveal-observer.tsx`) + View Transitions natives (`app/(site)/template.tsx`). Le contenu est visible sans JavaScript (les états initiaux ne s'appliquent qu'avec la classe `.js`), et `prefers-reduced-motion` désactive toutes les animations.
