# Rapport — Moteur multi-clips et nouvelle page d'accueil (23-24/11/2026)

Branche `mission-multi-clips`, fusionnée dans `main`. **En ligne** : le serveur de clips (Railway) et le site
(Vercel). Le changement de base de données a été appliqué en production ; il ne supprime rien.

## A. Moteur de génération

### État initial
- **5 clips maximum par vidéo**, sur toutes les offres. La limite venait de la base de données
  (`plans.max_clips_per_video`). Ni le moteur, ni le site, ni la transcription ne bloquaient au-delà.
- Sélection « rules-v2 » : notes de forme (accroche, phrases complètes, durée, énergie de la voix).
  - Seule règle de diversité : deux clips ne pouvaient pas se chevaucher.
  - Rien n'empêchait donc 5 clips sur le même sujet, ou des clips remplis de bavardage.
- Montage **un clip après l'autre**, sans état propre à chaque clip. L'interface n'affichait que « Montage de N
  clip(s) ».
- Pas de mode automatique, pas d'archive ZIP, pas de suppression d'un clip.

### Problèmes identifiés
1. Aucune notion de sujet : les clips pouvaient tous parler de la même chose.
2. Le bavardage (« Ouais, attends, je regarde l'heure ») pouvait commencer ou terminer un clip.
3. Une vidéo courte pouvait être découpée en autant de clips que demandé.
4. Un clip se terminait parfois sur la courte réplique de l'autre intervenant, après la conclusion.
5. En production, le nombre de montages simultanés suivait les cœurs de la machine hôte, pas les limites du
   conteneur. Un clip a échoué deux fois sur Railway. **Corrigé** : point 5 de l'architecture ci-dessous.

### Architecture améliorée (« rules-v3 »)
1. **Vue d'ensemble** (`selection/topics.py`) :
   - vocabulaire de la vidéo (TF-IDF, racines françaises) ;
   - **sujets** détectés par cohésion lexicale (méthode TextTiling) ;
   - repérage des phrases creuses et des formules répétées.
2. **Propositions** : pour chaque début de phrase, la meilleure fin entre 20 et 60 s.
   - **Type de moment** : histoire, conseil, question-réponse, opinion, humour, réaction.
   - Pénalités pour les hésitations, le bavardage et la réplique annexe en fin de clip.
   - Bonus pour la densité d'information et un vocabulaire propre au passage.
3. **Découpage** :
   - début et fin sur des phrases complètes, avec une marge sur la phrase voisine ;
   - les hésitations d'ouverture (« Euh, bon, alors ») sont retirées.
4. **Sélection diversifiée** (méthode MMR) :
   - on choisit, à chaque tour, la meilleure note pondérée par la nouveauté ;
   - un clip trop semblable à un clip déjà retenu est écarté ;
   - un même sujet est pénalisé à chaque nouveau clip ;
   - la note minimale de qualité (60/100) s'applique toujours.
5. **Nombre de clips** :
   - « jusqu'à N » (3, 5, 7, 10), ou **Auto** : environ 1 clip pour 6 min de parole, plafonné par l'offre ;
   - jamais plus d'1 clip par minute de parole ;
   - jamais de remplissage, et une explication claire quand le nombre n'est pas atteint.
6. **Montage** :
   - une ligne par clip, avec son état réel : en montage, prêt ou échec ;
   - plusieurs montages en parallèle selon les **vraies** limites du conteneur (processeur et mémoire) ;
   - un clip en échec est **retenté seul à la fin**, avec un cadrage centré ;
   - le message d'erreur exact est conservé ;
   - un échec n'arrête jamais les autres clips ;
   - une **archive ZIP** de tous les clips est créée.

### Nombre maximal réellement disponible
**10 clips par vidéo** pour Starter, Pro et Ultimate, **5** pour Free. Les prix, les identifiants Stripe et les
quotas de vidéos et de minutes sont **inchangés**.

## B. Page d'accueil

### Direction artistique retenue
J'ai comparé cinq directions :
- éditoriale premium ;
- technologique immersive ;
- minimaliste haut de gamme ;
- centrée sur les résultats vidéo ;
- démonstration et récit.

Retenue : **démonstration produit éditoriale**. Signature : la **timeline de montage**, avec des sections numérotées
comme des chapitres et leur timecode (« 03 · 05:10 · Le moteur »). Le violet est réservé à ce que le moteur
sélectionne et aux appels à l'action. Le reste est en noirs et gris, avec une typographie très affirmée.

Rejetées :
- l'immersive, trop d'effets et lourde ;
- la « résultats vidéo » pure, faute de vraies vidéos de clients publiables ;
- la minimaliste seule, pas assez démonstrative.

### Nouvelle structure (8 sections)
1. Hero : « Une vidéo longue. Jusqu'à 10 clips prêts à publier. »
   - **Démonstration interactive** : on choisit Auto, 3, 5, 7 ou 10 et la frise de la vidéo, les sujets et les
     clips se mettent à jour.
   - Elle est signalée « Démonstration · données d'exemple ».
2. 01 Le problème : les gestes « à la main » face à ceux avec Clipera, et un temps **mesuré sur un vrai
   traitement** (28 min analysées et montées en 5 clips en environ 2 min).
3. 02 Fonctionnement en 3 étapes, avec les vrais éléments d'interface.
4. 03 Le moteur : les 4 règles, et un tableau d'exemple des passages retenus et écartés, avec la raison.
5. 04 Le rendu : 4 styles de sous-titres et 3 modes de cadrage, en schémas signalés comme indicatifs.
6. 05 Pour qui : podcasteurs, YouTube, interviews et coachs, campagnes de clipping, avec des liens vers les pages
   SEO.
7. 06 Tarifs : prix lus en base, réassurance.
8. 07 FAQ : 11 objections traitées, dont la vitesse, la qualité, la modification, YouTube et les quotas. Puis
   l'appel à l'action final.

### Crédibilité
- Aucun faux avis, aucun faux chiffre, aucun faux logo.
- Les limites sont dites clairement :
  - pas d'éditeur intégré ;
  - pas de jugement fin de l'humour ;
  - aucune garantie de vues ;
  - YouTube passe par YouTube Studio.

### SEO, performance et accessibilité
- Lighthouse en local, version de production :
  - **mobile** : 94 performance, 100 accessibilité, 100 bonnes pratiques, 100 SEO ;
  - **ordinateur** : 100 partout ;
  - aucun décalage de mise en page.
- Un seul H1 et huit H2, données structurées Organization, WebSite, SoftwareApplication et **FAQPage**, adresse
  canonique, liens internes vers les 5 pages de solutions et le blog.
- Contraste rendu conforme sur tout le site :
  - le gris secondaire passe de #6E6E84 à #80809A ;
  - les boutons à texte blanc passent sur #7C4EF0, une nuance de la marque ;
  - le violet #8B5CF6 est inchangé partout ailleurs.
- Pas d'image lourde : la démonstration est en HTML et CSS. Les animations au défilement sont désactivées quand
  l'utilisateur demande moins d'animations.

## C. Technique

### Fichiers principaux
- **Worker** : `selection/topics.py` (nouveau), `selection/select.py`, `selection/heuristic.py`,
  `selection/scoring.py`, `selection/models.py`, `jobs/clip_job.py`.
- **Base** : `supabase/migrations/20261124000100_multiclips.sql`.
  - Les offres payantes passent à 10 clips ;
  - nouvelle fonction `delete_my_clip`.
- **Site, génération** :
  - `generate-form.tsx` : le choix Auto, 3, 5, 7 ou 10 ;
  - `clip-progress.tsx` et `delete-clip.tsx` (nouveaux) ;
  - `projets/[id]/page.tsx` et `actions.ts` ;
  - `lib/clips.ts` (`signZip`) et `lib/storage-admin.ts` (`deleteKeys`).
- **Site, accueil** : `app/page.tsx`, `components/landing/` (`engine-demo`, `chapter`, `craft`, `reveal`),
  `site-header.tsx`, `globals.css`. L'ancien `visuals.tsx` est supprimé.

### Dépendances ajoutées
Aucune.

### Tests réellement exécutés
| Test | Résultat |
|---|---|
| Worker, suite complète | ✅ 243 réussis, 1 ignoré |
| Sélection sur un podcast de test de 73 min (20 sujets plus du bavardage) | ✅ 10 clips sur 10 sujets différents, sans chevauchement |
| 3, 5, 7 et 10 clips demandés | ✅ |
| Mode Auto sur 15 min | ✅ 2 à 3 clips |
| Vidéo de 4 min, 10 clips demandés | ✅ 3 clips au plus, avec explication |
| 30 min de bavardage | ✅ 0 clip |
| Génération bout en bout sur 1 h, avec FFmpeg réel | ✅ 10 clips en 96 s, archive ZIP, aucune durée faussée |
| Échec d'un clip | ✅ les autres sont livrés |
| Crash en plein montage | ✅ rien n'est livré à moitié, la reprise réussit |
| Clip tué sous charge | ✅ réussit au 2e essai, seul |
| Base de données | ✅ 93/93 (limites, suppression d'un clip, isolation entre utilisateurs) |
| Navigateur, génération | ✅ 6/6 (sélecteur, suivi par clip, archive ZIP, suppression, mobile) |
| Navigateur, accueil | ✅ 11/11 (SEO, liens, démonstration, FAQ, tarifs, mobile, animations réduites) |
| Production | ✅ ta génération réelle tourne sur le nouveau moteur (rules-v3) |

Build, TypeScript et linter : ✅.

### Non testé, honnêtement
- Une vraie vidéo d'une heure en production : le test d'une heure utilise une transcription de test.
- Le nombre de montages simultanés réel sur Railway : il dépend des limites que Railway expose. S'il n'en expose
  aucune, les clips sont montés un par un.

### Bugs restants et risques
- La sélection reste **sans IA de compréhension**. Elle repère la forme, les sujets et la redondance, mais ne
  juge pas si une histoire est drôle ou captivante. L'interface le dit.
- L'archive ZIP disparaît si l'on supprime un clip. Les téléchargements un par un restent disponibles.
- Le bouton « Relancer ce clip » n'existe pas encore : le 2e essai est automatique, sinon il faut relancer une
  génération.

## D. Les 5 prochaines améliorations
1. **Une IA de compréhension pour noter les passages.** Le code de consigne est prêt : il manque le branchement
   et une clé. C'est le plus gros gain de qualité, avec un coût estimé à quelques centimes par heure de vidéo, à
   valider avant toute dépense.
2. **De vrais exemples sur la page d'accueil** : 3 ou 4 clips générés à partir de tes propres vidéos, avec ton
   accord. Rien ne convainc plus qu'un vrai résultat.
3. **« Relancer ce clip »** et une retouche simple des bornes (début et fin) directement dans Clipera.
4. **Un e-mail « tes clips sont prêts »** : il demande une adresse e-mail de contact et un service d'envoi.
5. **« Connecter ma chaîne YouTube »** via l'API officielle Data Portability de Google (voir `IMPORT_YOUTUBE.md`).
