# SEO de Clipera

Dernière mise à jour : 22 novembre 2026.

## 1. Audit initial (avant modifications)

| Gravité | Constat |
|---|---|
| Critique | Google ne connaît pas encore la marque : la recherche « Clipera » ne renvoie que des pages sur les « clippers ». Domaine neuf, non déclaré dans Search Console. |
| Critique | Une seule page indexable (l'accueil). Aucune page ne répondait aux recherches visées. |
| Critique | Phrases devenues fausses sur l'accueil : « accès anticipé », « génération en cours de finalisation », « Clipera ne télécharge pas depuis d'autres plateformes » (alors que Drive/Dropbox existe), « silences retirés », « choisis ton style naturel/dynamique », « correction manuelle du cadrage » (pas encore développés), « jamais utilisées pour entraîner l'IA » (non garanti : Deepgram n'était pas désactivé). |
| Important | Aucune donnée structurée (Organization, WebSite, SoftwareApplication). |
| Important | H1 sans le nom de marque. Page 404 en anglais. Pas de profils sociaux officiels. Pages légales incomplètes (non indexées). |
| Bon | HTTPS, `www` → `clipera.fr` en 308, canonical, robots.txt, sitemap, rendu serveur, `lang="fr"`, espace client exclu, mobile sans débordement, LCP ≈ 0,8 s sur mobile simulé (CPU ×4), CLS 0, page ≈ 200 Ko. |

## 2. Ce qui a été fait

**Vérité du contenu**
- Accueil corrigé : plus aucune fonctionnalité annoncée qui n'existe pas.
- Deepgram : paramètre `mip_opt_out=true` (sans surcoût depuis mars 2026). Les audios des utilisateurs ne servent plus à entraîner les modèles du prestataire, ce qui rend vraie la phrase de la FAQ.

**Marque**
- H1 « Clipera transforme tes vidéos longues en clips courts grâce à l'IA ».
- FAQ « Qu'est-ce que Clipera ? ».
- Badge « Clipera · générateur de clips IA en français ».
- Données structurées sur toutes les pages publiques :
  - `Organization` (nom, logo, site) ;
  - `WebSite` (`alternateName` : Clipera AI, clipera.fr) ;
  - `SoftwareApplication` (prix réels lus en base, aucune note ni aucun avis) ;
  - `BreadcrumbList` ;
  - `BlogPosting`.
- `SOCIAL_PROFILES` dans `src/lib/seo.ts` : à remplir dès que les comptes officiels existent (ajoute `sameAs`).

**Nouvelles pages (11 URL dans le sitemap)**

| URL | Intention de recherche |
|---|---|
| `/generateur-clips-ia` | générateur de clips IA, logiciel de clipping |
| `/transformer-podcast-en-clips` | podcast en clips, outil IA pour podcasteurs (cible prioritaire) |
| `/youtube-shorts-tiktok-reels` | créer des Shorts / TikTok / Reels depuis une vidéo longue |
| `/sous-titres-automatiques` | sous-titres automatiques en français |
| `/recadrage-vertical-automatique` | passer une vidéo 16:9 en 9:16 |
| `/tarifs` | prix, offre gratuite, comparaison détaillée des offres |
| `/blog` + 3 articles | méthode podcast, guide des sous-titres, guide du recadrage |

**Technique**
- En-tête partagé avec navigation (Fonctionnalités, Podcasts, Tarifs, Blog).
- Pied de page avec liens vers toutes les pages publiques (maillage interne).
- Bloc « Pour qui ? » sur l'accueil, liens « À lire aussi » sur chaque page, fil d'Ariane visible.
- Titre et description uniques par page ; image de partage sur toutes les pages.
- Page 404 en français, avec un vrai code 404, y compris pour un article de blog inexistant.
- Sitemap dynamique : accueil, tarifs, pages de contenu, blog, articles avec date de mise à jour. Les pages légales y entreront automatiquement une fois complètes.
- Tarifs : un échec temporaire de lecture des prix n'est jamais mis en cache.

**Tests effectués**
- Build de production.
- Contrôle automatique des 11 URL :
  - code 200, titre unique, description de 50 à 160 caractères ;
  - canonical exact, un seul H1, JSON-LD valide, image de partage.
- 21 liens internes testés, tous à 200.
- 404 réels vérifiés.
- Affichage mobile (Pixel 7) et ordinateur, sans débordement ni erreur console.
- Tests E2E des tarifs : 11/11.
- Test du paramètre Deepgram.

## 3. À faire par le fondateur (gratuit)

**Google Search Console**
1. Va sur search.google.com/search-console, puis « Ajouter une propriété » → **Domaine** → `clipera.fr`.
2. Google affiche un enregistrement **TXT**. Chez IONOS (DNS de clipera.fr) : « Ajouter un enregistrement » → TXT → nom d'hôte `@` → colle la valeur.
3. Reviens sur Search Console → « Valider ». Ça peut prendre jusqu'à quelques heures.
4. Menu **Sitemaps** → saisis `sitemap.xml` → Envoyer.
5. Menu **Inspection de l'URL** → `https://clipera.fr/` → « Demander une indexation ». Fais pareil pour `/transformer-podcast-en-clips` et `/tarifs`.

**Bing Webmaster Tools**
- bing.com/webmasters → « Importer depuis Google Search Console ». Bing alimente aussi d'autres moteurs.

**Profils officiels**
- Créer @clipera sur TikTok, Instagram, YouTube et LinkedIn, puis envoyer les liens pour les ajouter dans `SOCIAL_PROFILES`.

**Pages légales**
- Les compléter dès réception du SIRET : elles seront alors indexées, ce qui renforce la confiance.

## 4. Mots-clés à suivre (Search Console → Performances)

- **Marque** : clipera, clipera ai, clipera.fr, clipera avis, clipera application, clipera logiciel.
- **Podcast (priorité)** : transformer un podcast en clips, clips podcast, podcast en vidéo courte, outil ia podcasteur.
- **Fonction** : générateur de clips ia, découper une vidéo automatiquement ia, logiciel clipping ia, sous-titres automatiques français, recadrer vidéo en vertical, passer une vidéo en 9:16.
- **Plateformes** : transformer une vidéo youtube en tiktok, créer des shorts youtube automatiquement, générateur de reels instagram.

Indicateurs à suivre chaque mois :
- impressions et clics ;
- position moyenne sur « clipera » (objectif : 1) ;
- pages indexées (objectif : 11/11) ;
- inscriptions venant de la recherche Google (avec un outil de mesure, à choisir plus tard, gratuit si possible).

## 5. Calendrier éditorial (2 articles par mois)

Règles :
- un article = une vraie question de créateur ;
- aucun chiffre sans source ;
- relecture par le fondateur avant publication.

| Période | Sujet |
|---|---|
| Déc. S1 | Comment filmer un podcast pour faciliter le recadrage vertical |
| Déc. S3 | 10 types de passages qui font de bons clips (avec exemples) |
| Janv. S1 | Écrire une bonne accroche pour un clip : 12 façons de commencer |
| Janv. S3 | Shorts, TikTok ou Reels : où publier les clips de ton podcast |
| Févr. S1 | Combien de clips publier par semaine quand on a un podcast |
| Févr. S3 | Clips vidéo pour coachs et formateurs : méthode et erreurs à éviter |
| Mars S1 | Comparatif honnête des outils de clipping en français (faits vérifiés, date de vérification affichée) |
| Mars S3 | Étude de cas réelle d'un créateur utilisateur de Clipera (avec son accord) |

## 6. Liens entrants (backlinks) : stratégie réaliste

Aucune action n'a encore été faite. Aucun achat de liens, aucun réseau de sites.

1. **Annuaires sérieux** (gratuits, à vérifier un par un) : Product Hunt (lancement à préparer), BetaList, AlternativeTo, SaaSHub, There's An AI For That, Futurepedia, Indie Hackers. Je prépare les textes de présentation.
2. **Écosystème français** : communautés de podcasteurs et de créateurs, groupes LinkedIn. Partager les guides du blog quand ils répondent à une question posée, jamais en spam.
3. **Partenariats créateurs** : clips offerts à des podcasteurs en échange d'un retour honnête et, s'ils le souhaitent, d'une mention.
4. **Articles invités** : sur des blogs de podcasting ou de création de contenu, avec un vrai guide (ex. « filmer un podcast pour le format vertical »).
5. **Histoire du fondateur** : publication LinkedIn sur la construction de Clipera ; les médias startup reprennent parfois ce type d'histoire.

## 7. Plan sur 90 jours

- **Semaine 1** : Search Console + Bing, demandes d'indexation, profils sociaux, Product Hunt préparé.
- **Semaines 2 à 4** : annuaires (un par jour), 2 articles, premiers échanges avec des podcasteurs.
- **Mois 2** : 2 articles ; analyse des requêtes réelles dans Search Console ; renforcer les pages qui reçoivent des impressions.
- **Mois 3** : 2 articles, lancement Product Hunt, premières études de cas ; nouvelles pages seulement si Search Console montre une vraie demande.

**Attendus réalistes**
- « Clipera » en 1ʳᵉ position : quelques semaines après la validation de Search Console.
- Requêtes de niche en français (podcast, sous-titres) : 2 à 4 mois.
- Requêtes génériques (« générateur de clips IA ») : très concurrentielles (VEED, CapCut, HeyGen…), à viser sur 6 à 12 mois avec des liens entrants.
