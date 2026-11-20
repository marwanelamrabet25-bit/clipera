# CLIPERA — Architecture

> **Statut : VALIDÉE par le fondateur le 2026-11-20.** Démarrage sans Redis : la file de traitements est dans Postgres.

## 1. Vue d'ensemble

```
 Navigateur (Next.js)                          Worker vidéo (Python, Docker)
 ┌──────────────────────┐                      ┌──────────────────────────────┐
 │ Landing, App, Auth   │                      │ boucle : réserve un job       │
 │ Upload multipart ────┼──── PUT signés ────► │  (SELECT … FOR UPDATE         │
 │  (reprise possible)  │        ▼             │   SKIP LOCKED)                │
 └─────────┬────────────┘   ┌──────────┐       │ ffprobe → audio → transcript  │
           │ API routes     │ R2 (S3)  │◄─────►│ → analyse LLM → sélection     │
           │ (serveur)      │ privé    │       │ → rendu FFmpeg → upload clips │
           ▼                └──────────┘       │ → MAJ statut + usage          │
 ┌──────────────────────┐                      └──────────────┬───────────────┘
 │ Supabase             │◄────────── connexion Postgres ──────┘
 │ Auth · Postgres+RLS  │
 │ Realtime (progression)│──► le navigateur reçoit les changements de statut
 └──────────────────────┘
 Services externes : transcription (Deepgram ou AssemblyAI), Claude API, Stripe (Phase 13)
```

## 2. Choix techniques

| Domaine | Choix | Pourquoi |
|---|---|---|
| Frontend + API | Next.js (App Router) + TypeScript | Un seul projet pour landing, app et routes serveur ; SEO ; hébergement Vercel. |
| UI | Tailwind CSS + composants maison (primitives Radix) | Design system Clipera sur mesure, accessible, pas de « look template ». |
| Auth / DB | Supabase (Auth + Postgres + RLS + Realtime) | Demandé dans le brief, adapté. RLS = sécurité au niveau des lignes. |
| Stockage vidéo | Cloudflare R2 (compatible S3), buckets privés | Sortie (egress) gratuite : crucial pour des vidéos téléchargées et relues par le worker. Le plan gratuit Supabase limite les fichiers à 50 Mo. |
| Upload | Multipart S3 signé côté serveur, envoyé directement du navigateur vers R2 (Uppy) | Les vidéos ne transitent pas par le serveur web ; reprise après coupure. |
| File d'attente | Table `processing_jobs` dans Postgres + `FOR UPDATE SKIP LOCKED` | Pas de Redis à héberger. Création du projet + du job dans la même transaction → idempotence. Redis/BullMQ seulement si le volume l'exige un jour. |
| Worker | Python 3.12 + FFmpeg/FFprobe, conteneur Docker | Écosystème vidéo/vision (MediaPipe, OpenCV, PySceneDetect) en Python. Indépendant du frontend. |
| Transcription | API managée avec horodatage par mot + locuteurs | Qualité et coût prévisibles ; Whisper auto-hébergé envisagé plus tard si GPU. |
| Analyse | Claude API (sorties structurées JSON validées) | Compréhension du contexte, pas de simple mots-clés. |
| Sous-titres | Fichiers ASS + libass (incrusté par FFmpeg) | libass confirmé dans FFmpeg 6.1 ; contrôle fin des styles/surlignage mot à mot. |
| Recadrage | Détection de visages échantillonnée + lissage de trajectoire | Cadrage 9:16 sans à-coups ; repli centré si incertain. |
| Paiement | Stripe Billing + webhooks signés et idempotents | Phase 13. |
| Observabilité | Logs JSON structurés + Sentry (plan gratuit) | Erreurs front + worker ; coût estimé stocké par job. |

## 3. Cycle de vie d'un job

`queued → transcribing → analyzing → selecting → rendering → completed`
(+ `failed`, `cancelled`). L'upload a lieu **avant** la création du job : le job n'est créé que quand le fichier est complet et validé par ffprobe.

Règles :
- Clé d'idempotence par projet : rafraîchir la page ne relance jamais un traitement.
- Le quota est **réservé** atomiquement à la création du job (transaction SQL), **consommé** à la fin, **restitué** en cas d'échec technique.
- Chaque étape est rejouable (résultats intermédiaires sauvegardés : transcript, candidats).
- Timeouts par étape, limite de jobs simultanés par utilisateur et par worker.
- Nettoyage : fichiers temporaires du worker supprimés à la fin ; vidéos sources supprimées après N jours (configurable).

## 4. Sécurité
- Buckets privés, URLs signées courtes.
- Toute route sensible revérifie l'utilisateur côté serveur ; les IDs venant du navigateur ne sont jamais crus sans contrôle d'appartenance.
- RLS sur toutes les tables ; le worker utilise une clé de service, jamais exposée au navigateur.
- Case obligatoire : « Je détiens les droits sur cette vidéo ». Pas d'import par URL de plateformes tierces.
