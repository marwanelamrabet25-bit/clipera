# CLIPERA — Pipeline vidéo

Légende : ✅ implémenté et testé · 🔜 prochaine étape · ⏳ plus tard

## 1. Import (navigateur → R2) — ✅ (testé contre un S3 de test ; s'active avec les clés R2)
- `create_upload` (SQL) : vérifie droits confirmés, extension, taille max de l'offre, quota restant, ≤ 3 envois
  inachevés ; crée le projet ; **génère la clé** `sources/<user>/<video>/source.<ext>` (contrainte SQL).
- Le navigateur envoie la vidéo **directement au stockage** en morceaux de 16 Mio, 4 en parallèle, URLs signées 1 h,
  4 nouvelles tentatives par morceau avec délai croissant ; progression réelle (octets envoyés) ; annulation.
- Fin : le serveur assemble, **vérifie que la taille stockée = taille annoncée**, puis `complete_upload` met en file
  la vérification (`probe`). Annulation ou échec : morceaux libérés, projet masqué.
- Testé : fichier stocké identique à l'original (MD5), annulation à deux moments, accès refusé sans session ou
  sur la vidéo d'un autre utilisateur.

## 1b. Import par lien Google Drive / Dropbox — ✅ (testé ; validation réelle sur le serveur avec un lien du fondateur)
- `normalize_import_url` (SQL) reconnaît Drive (`/file/d/<id>`, `?id=`) et Dropbox (`/s/…`, `/scl/fi/…?rlkey=`) et
  **reconstruit** un lien canonique ; dossiers, autres sites, espaces et `..` refusés.
- Worker (`media/cloud.py`) : téléchargement direct, **chaque redirection vérifiée** (domaines Google Drive / Dropbox
  uniquement), page de connexion ou HTML → « fichier non partagé » avec la marche à suivre, taille plafonnée pendant
  le téléchargement, nom du fichier repris comme titre du projet, puis vérification habituelle.
- Page « Nouveau projet » : champ lien + guides pas à pas (Drive, Dropbox, YouTube Studio, campagne de clipping).

## 1c. Import par lien YouTube — ✅ code et tests / ⛔ masqué : YouTube bloque les serveurs (test réel 21/11/2026)
- `create_url_import` (SQL) : droits confirmés, lien YouTube reconnu (watch, youtu.be, shorts, live, embed) et
  **reconstruit à partir de l'identifiant seul** (aucune URL libre transmise au worker), quota, ≤ 3 imports inachevés.
- Worker `import_url` (yt-dlp + Deno) : lit d'abord les informations (direct, durée max de l'offre, < 20 s →
  refus **sans téléchargement**), télécharge en MP4 ≤ 1080p, taille max de l'offre, dépose dans le stockage, renomme
  le projet avec le titre de la vidéo puis lance la vérification habituelle.
- Erreurs claires : vidéo privée, réservée aux membres, limite d'âge, indisponible, restriction géographique,
  blocage temporaire de YouTube (1 nouvelle tentative, puis conseil d'importer le fichier).
- YouTube peut bloquer les serveurs d'hébergeurs : à vérifier en conditions réelles.

## 2. Vérification (`probe`) — ✅
Le worker télécharge le fichier et l'analyse avec FFprobe :
durée, dimensions **d'affichage** (rotation des vidéos de téléphone prise en compte), images/s, codecs, son.
Refus avec un message clair si : fichier illisible, pas de vidéo, **pas de son**, < 20 s, trop long pour l'offre,
résolution < 240p ou > 4K, codec non pris en charge, fichier trop lourd.

## 3. Extraction audio — ✅
Mono 16 kHz Opus 32 kb/s (≈ 22 Mo/heure, mesuré). Mesure réelle : à 24 kb/s en mode « voip », Deepgram perdait
des mots (« Tout a été » au lieu de « J'ai tout arrêté ») ; à 32 kb/s le résultat est identique à l'audio non compressé.

## 4. Transcription — ✅ Deepgram branché et testé en réel / 🔜 comparatif AssemblyAI sur vraies vidéos
Code : `apps/worker/src/clipera_worker/transcription/deepgram.py` (aucune dépendance ajoutée).
- Nova-3, langue `fr` (ou détection automatique), ponctuation, **locuteurs**, nombres en toutes lettres
  (« zéro commande » plutôt que « 0 commande » dans les sous-titres), typographie française (« début ? »).
- Sortie : mots horodatés + locuteur + confiance → `Transcript` du moteur de sélection.
- Erreurs : service saturé (429/5xx) ou réseau → 3 nouvelles tentatives puis échec « réessayable » ;
  clé refusée ou audio invalide → échec immédiat ; silence total → transcription vide (pas une erreur).
- Mesure réelle (dialogue français 47,6 s, 2 voix) : **1,8 s** de traitement, locuteurs correctement séparés.
  Limite du test : voix de synthèse ; la qualité sur de vraies vidéos reste à mesurer sur le corpus.

## 5. Analyse et sélection — ✅ moteur (testé) / 🔜 appel à l'IA (clé Anthropic nécessaire)
Code : `apps/worker/src/clipera_worker/selection/`.
1. **Phrases** : la transcription est découpée en phrases numérotées (ponctuation, pause > 1,2 s, changement de
   locuteur, 30 s maximum).
2. **Fenêtres** : ~10 min de phrases entières, recouvrement de 90 s, numéros globaux (vidéos de plusieurs heures
   possibles sans dépasser les limites de l'IA).
3. **Proposition par l'IA** : consigne `SYSTEM_PROMPT`, réponse JSON stricte (`RESPONSE_SCHEMA`). L'IA désigne
   chaque passage par **numéros de phrases** (jamais d'horodatage inventé, jamais de coupe en milieu de phrase)
   et note 6 critères de 0 à 10 avec une justification : accroche, intérêt, contexte, cohérence, conclusion,
   autonomie. Elle propose aussi un titre et une accroche fidèles au contenu.
4. **Validation** : numéros inexistants, bornes inversées ou notes manquantes → proposition rejetée.
5. **Contrôles objectifs** (calculés, pas déclarés par l'IA) : durée (idéal 25–60 s, bornes 15–90 s),
   silences > 2,5 s (−2 cohérence chacun), début par un connecteur « mais/donc/et… » (−3 contexte),
   fin sans ponctuation finale (−3 conclusion). Chaque pénalité est expliquée.
6. **Note totale** /100 = 20 % accroche + 20 % intérêt + 15 % contexte + 15 % cohérence + 10 % conclusion
   + 10 % autonomie + 10 % durée.
7. **Bornes** : début 0,15 s avant le premier mot, fin 0,35 s après le dernier, sans jamais empiéter sur les
   phrases voisines.
8. **Sélection** : seuil 60/100 ; doublons entre fenêtres fusionnés (on garde le mieux noté) ; aucun
   chevauchement > 2 s entre clips livrés ; au plus le nombre demandé ; **jamais de remplissage** — moins de
   clips si moins de bons passages, avec l'explication et la raison de chaque rejet.

## 5b. Sélection de base sans IA — ✅ (mode actuel, gratuit)
Code : `selection/heuristic.py`. Tant que l'IA n'est pas branchée (choix du fondateur : aucune dépense), les
passages sont proposés par **règles** puis passent par **les mêmes contrôles, la même note et la même sélection**
que les propositions de l'IA. Règles : chaque début de phrase plausible (jamais « mais/donc… »), meilleure fin entre
20 et 60 s ; accroche (question, exclamation, mot fort, début de prise de parole), intérêt (chiffres, questions,
mots forts, débit, clarté du son), conclusion explicite (« la leçon », « au final »…), moment complet.
Limite assumée : les règles jugent la forme, pas si l'histoire est vraiment drôle ou passionnante.
Chaque clip enregistre `score_details.method = "rules-v1"` pour l'afficher honnêtement et comparer plus tard.

## 5c. Job `clip_generation` — ✅ (worker) / ✅ écrans (en ligne dès que le worker sera hébergé)
Code : `jobs/clip_job.py`. Étapes visibles : `transcribing` → `selecting` → `rendering` → `completed`.
Vidéo → audio → Deepgram → transcription sauvegardée (`clips/<user>/<job>/transcript.json`) → sélection →
pour chaque passage : sous-titres ASS au mot près, rendu (format, 720p/1080p selon l'offre, filigrane Free),
miniature, envoi au stockage (`clips/<user>/<job>/<rang>.mp4|.jpg`), ligne `clips` (bornes, titre, extrait,
note détaillée, options). Aucun bon passage ou aucune parole → échec expliqué + quota recrédité.
Un clip raté n'annule pas les autres ; annulation ou erreur imprévue → aucun clip à moitié livré.
Mesure réelle (dialogue 47,6 s, Deepgram réel) : transcription 2,1 s, sélection 4 ms, rendu 11,3 s ;
coût 0,0034 $ (crédit gratuit).

## 6. Rendu — ✅ (moteur) / ✅ branché au job
- Découpe **précise à l'image près** (testé).
- Recadrage 9:16, 1:1, 16:9, avec trajectoire de cadrage lissée (images clés → interpolation linéaire, testé).
- **Résolution** : petit côté de sortie = min(limite de l'offre, petit côté de la source).
  Une source 720p sort en 720×1280, jamais présentée comme du 1080p.
  Note : passer du 16:9 au 9:16 implique de recadrer puis d'agrandir la zone conservée ; c'est inhérent au
  format vertical. Nous n'annonçons jamais une qualité supérieure à celle de la source.
- Sous-titres ASS incrustés (libass), 4 styles : Classic, Highlight (mot prononcé en couleur), Modern, Minimal.
  Lignes courtes, taille modérée, placées au-dessus des boutons des applications.
- Filigrane Clipera (offre Free) en haut à droite, semi-transparent.
- Son : fondu de 60 ms en entrée, 180 ms en sortie (pas de « clic »), normalisation à −14 LUFS.
- H.264 High, yuv420p, AAC 160 kb/s, `faststart` (lecture immédiate sur le web), 60 i/s maximum.
- **Couleurs** (mesurées sur une vraie image) : source HDR iPhone (HLG) → conversion directe en SDR BT.709
  (écart 2,2/255 avec l'original ; le « tone mapping » hable assombrissait de 41/255) ; HDR PQ → tone mapping
  mobius ; SD BT.601 → BT.709 ; sortie toujours étiquetée BT.709 (plus de couleurs « devinées » par les lecteurs).
- **Débit plafonné** : 10 Mb/s en 1080p, 6 Mb/s en 720p (source bruitée : −41 % de poids, SSIM 0,914 → 0,908,
  invisible ; source propre : inchangé). Préréglage `veryfast` conservé (mesuré : `medium` = 2× plus lent pour
  +0,001 de SSIM).
- **Contrôle qualité automatique** après chaque rendu : dimensions, durée (±0,15 s), son présent, codec, **son et image de même durée (±0,1 s)**, **couleurs étiquetées BT.709**, **image noire** (seulement si la source ne l'est pas : une scène de nuit n'est pas une erreur).

Performances mesurées (4 vCPU) : 60 s de clip 1080×1920 sous-titré ≈ 16,5 s de calcul.

## 7. Recadrage intelligent (visages) — ✅
Code : `media/reframe.py` (YuNet, modèle libre MIT, 230 Ko ; OpenCV). Appliqué automatiquement en 9:16 et 1:1.
1. Lecture de l'extrait à 5 images/s en 640 px, image par image (mémoire constante : 76 Mo mesurés).
2. Détection des visages + points de repère ; regroupement en personnes (suivi par dernière position connue).
3. **Qui parle ?** Variation de la luminosité moyenne de l'intérieur de la bouche (écart-type sur 1,2 s) :
   robuste aux petits mouvements de tête et au rythme des syllabes (mesuré : ~8 pour celui qui parle, ~1,3 pour
   celui qui écoute).
4. Plans : plan d'ensemble si tout le monde tient dans le cadre ; sinon cadre sur la personne qui parle, **coupe nette**
   au changement, plans ≥ 2 s, l'autre personne doit dominer ≥ 1 s (un « oui » ne fait pas couper), ouverture sur
   celle qui parle au début ; suivi doux (zone morte 5 %) si la personne se déplace.
5. Repli au centre si moins de 40 % des images contiennent un visage, ou en cas d'erreur (le clip est toujours livré).
Mesuré : 1,8 s d'analyse pour un clip de 39 s. Contrôle visuel : podcast à deux sur un vrai dialogue français,
4 instants vérifiés (animateur, invitée, animateur, invitée).

## 7b. Énergie de la voix — ✅
`media/loudness.py` : niveau sonore toutes les 100 ms sur l'audio déjà extrait ; un passage plus animé que la médiane
de la vidéo (rires, montées de ton) gagne jusqu'à +1,5 point d'intérêt, un passage terne perd jusqu'à 1 point,
avec l'explication dans « Pourquoi ce passage ? ». Méthode `rules-v2`.

## 8. Options — ⏳
Suppression des silences, zooms légers (style Dynamique), musique autorisée avec mixage et fondus.
