# CLIPERA — Suivi des tâches

Dernière mise à jour : 2026-11-20

## Terminé
- [x] Phase 0 — Audit, architecture validée par le fondateur (R2, Postgres comme file, worker Python, Next.js, sans Redis)
- [x] Logo : icône d'application, favicons, symbole versions claire et sombre
- [x] Base de données : 11 tables, RLS, quotas atomiques, idempotence, remboursements, file de jobs — 28 tests
- [x] Worker : vérification FFprobe, extraction audio, moteur de rendu (formats, sous-titres, filigrane, son, contrôle qualité), boucle avec signal de vie — 35 tests
- [x] Application web : Next.js 16, design system (tokens, boutons, badges, champs, interrupteurs, alertes, états vides, chargement, suivi du traitement), Inter auto-hébergée, page d'attente
- [x] Comparatif tarifaire Deepgram / AssemblyAI (COST_MODEL.md §7)
- [x] Connexion par lien magique (Supabase Auth), `proxy.ts`, protection de /app, anti-redirection externe
- [x] Espace /app : navigation, Dashboard, Nouveau projet, Mes projets, Bibliothèque, Abonnement, Paramètres — vraies données, 15 tests E2E
- [x] Connexion par e-mail + mot de passe (lien e-mail en option), inscription, changement de mot de passe — 20 tests E2E
- [x] Import de vidéo : envoi direct multipart, contrôles SQL, page projet avec suivi — 11 tests E2E (stockage de test)
- [x] Maintenance automatique horaire (pg_cron) : envois abandonnés, vidéos expirées, traitements bloqués — 2 tests
- [x] Pages légales (mentions, confidentialité, CGU) rédigées à partir du fonctionnement réel, pied de page, acceptation à l'inscription — identité de l'éditeur à compléter
- [x] Suppression de compte en libre-service (fichiers du stockage puis données en cascade) — 2 tests base + 5 tests E2E
- [x] Page d'accueil : accroche, avant/après, 3 étapes, fonctionnalités, qualité du montage, tarifs lus en base, FAQ, appel à l'action ; robots.txt, sitemap, image de partage ; honnête sur l'accès anticipé, visuels marqués « Illustration »
- [x] Environnement cloud « clipera » (accès Supabase + installation automatique)
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
- [x] Site déployé sur Vercel : https://clipera-clipera1.vercel.app (région Paris)
- [ ] Réglages Supabase Auth : URL du site, modèle d'e-mail, SMTP personnalisé (voir SETUP_ACCOUNTS.md §2b)
- [ ] Connexion Google (optionnelle)
- [ ] Activer l'import en production : clés R2 dans Vercel + CORS (SETUP_ACCOUNTS.md §3)
- [ ] Héberger le worker (nécessite la chaîne de connexion Postgres de Supabase, saisie chez l'hébergeur)
- [ ] Compléter l'identité de l'éditeur dans `apps/web/src/content/legal.ts` (nom/raison sociale, statut, adresse, SIRET, directeur de publication, e-mail, médiateur de la consommation) + relecture juridique
- [ ] Transcription (fournisseur choisi après comparatif)
- [ ] Analyse et sélection des passages (comparatif Sonnet / Opus sur le corpus)
- [ ] Job `clip_generation` : rendu + export + enregistrement des clips
- [ ] Écrans : suivi en direct, résultats, prévisualisation, téléchargement
