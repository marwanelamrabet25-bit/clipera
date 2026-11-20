# CLIPERA — Suivi des tâches

Dernière mise à jour : 2026-11-20

## Terminé
- [x] Phase 0 — Audit, architecture validée par le fondateur (R2, Postgres comme file, worker Python, Next.js, sans Redis)
- [x] Logo : icône d'application, favicons, symbole versions claire et sombre
- [x] Base de données : 11 tables, RLS, quotas atomiques, idempotence, remboursements, file de jobs — 28 tests
- [x] Worker : vérification FFprobe, extraction audio, moteur de rendu (formats, sous-titres, filigrane, son, contrôle qualité), boucle avec signal de vie — 35 tests
- [x] Application web : Next.js 16, design system (tokens, boutons, badges, champs, interrupteurs, alertes, états vides, chargement, suivi du traitement), Inter auto-hébergée, page d'attente
- [x] Comparatif tarifaire Deepgram / AssemblyAI (COST_MODEL.md §7)
- [x] Documentation : ARCHITECTURE, DATABASE, VIDEO_PIPELINE, ENVIRONMENT, TESTING, COST_MODEL, SETUP_ACCOUNTS

## Bloqué (en attente du fondateur)
- [x] Code sauvegardé sur GitHub : marwanelamrabet25-bit/clipera (public, choix du fondateur)
- [x] Projet Supabase `clipera-dev` créé (Paris, Free), migrations appliquées et vérifiées
- [ ] Comptes Cloudflare R2, Deepgram, AssemblyAI, Anthropic (voir SETUP_ACCOUNTS.md)
- [ ] 7 vidéos de test dont tu détiens les droits
- [ ] Validation des allocations de minutes (COST_MODEL.md §4)
- [ ] Fichier vectoriel (SVG) du logo pour l'impression et les très grandes tailles

## À vérifier
- [ ] Build de l'image Docker du worker : impossible dans cette session (réseau vers Debian bloqué) ; à valider sur l'hébergeur ou en CI

## À faire — premier jalon « Premier clip réel »
- [ ] Authentification Supabase (e-mail + Google), `proxy.ts`, pages connexion/inscription
- [ ] Navigation de l'application (Dashboard, Nouveau projet, Mes projets, Bibliothèque, Abonnement, Paramètres)
- [ ] Upload multipart navigateur → R2 + confirmation des droits + job de vérification
- [ ] Transcription (fournisseur choisi après comparatif)
- [ ] Analyse et sélection des passages (comparatif Sonnet / Opus sur le corpus)
- [ ] Job `clip_generation` : rendu + export + enregistrement des clips
- [ ] Écrans : suivi en direct, résultats, prévisualisation, téléchargement
