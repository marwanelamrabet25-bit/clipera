# CLIPERA — Pipeline vidéo

Légende : ✅ implémenté et testé · 🔜 prochaine étape · ⏳ plus tard

## 1. Import (navigateur → R2) — 🔜
Upload multipart signé directement vers R2, avec reprise. Le serveur web ne voit jamais les octets.
Case obligatoire « Je détiens les droits sur cette vidéo » (`rights_confirmed_at`).

## 2. Vérification (`probe`) — ✅
Le worker télécharge le fichier et l'analyse avec FFprobe :
durée, dimensions **d'affichage** (rotation des vidéos de téléphone prise en compte), images/s, codecs, son.
Refus avec un message clair si : fichier illisible, pas de vidéo, **pas de son**, < 20 s, trop long pour l'offre,
résolution < 240p ou > 4K, codec non pris en charge, fichier trop lourd.

## 3. Extraction audio — ✅
Mono 16 kHz Opus 24 kb/s (≈ 17 Mo/heure) : léger à envoyer au service de transcription.

## 4. Transcription — 🔜
Fournisseur choisi après comparatif Deepgram / AssemblyAI sur le corpus (voir COST_MODEL.md).
On conserve : mots horodatés, segments, langue, locuteurs.

## 5. Analyse et sélection — 🔜
Découpage de la transcription en blocs avec chevauchement, analyse par Claude (sorties JSON validées),
fusion, déduplication, notation sur critères explicites, classement global. Jamais de faux passages pour
remplir un quota.

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
