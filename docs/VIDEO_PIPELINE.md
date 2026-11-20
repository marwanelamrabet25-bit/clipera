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

## 6. Rendu — ✅ (moteur) / 🔜 (branché au pipeline)
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
- **Contrôle qualité automatique** après chaque rendu : dimensions, durée (±0,15 s), son présent, codec.

Performances mesurées (4 vCPU) : 60 s de clip 1080×1920 sous-titré ≈ 16,5 s de calcul.

## 7. Recadrage intelligent (visages) — ⏳ Phase 10
Détection de visages échantillonnée, trajectoire lissée sans à-coups, repli au centre si la détection est incertaine,
correction manuelle possible.

## 8. Options — ⏳
Suppression des silences, zooms légers (style Dynamique), musique autorisée avec mixage et fondus.
