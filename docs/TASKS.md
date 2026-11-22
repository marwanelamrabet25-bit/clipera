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
- [x] Moteur de sélection des passages (phrases, fenêtres, consigne IA par numéros de phrases, score explicable, contrôles objectifs, aucun remplissage) — 30 tests
- [x] Import vidéo activé en ligne (R2) et vérifié avec une vraie vidéo
- [x] Environnement cloud « clipera » (accès Supabase + installation automatique)
- [x] Documentation : ARCHITECTURE, DATABASE, VIDEO_PIPELINE, ENVIRONMENT, TESTING, COST_MODEL, SETUP_ACCOUNTS

## Fait le 21/11 (autonomie)
- [x] Qualité d'image : couleurs HDR iPhone corrigées (mesuré), étiquetage BT.709, débit plafonné, contrôle qualité
  renforcé (synchro son/image, couleurs, image noire comparée à la source)
- [x] Cadrage : modes Stable (défaut) / Suivi de l'intervenant / Large, changements de caméra, aucune tête coupée,
  vitesse plafonnée, préférence mémorisée — testés et vérifiés visuellement
- [x] Adresse officielle du site (`NEXT_PUBLIC_SITE_URL`) passée de clipera-clipera1.vercel.app (protégée) à clipera.fr

## En attente du fondateur
- [x] Vercel : STRIPE_SECRET_KEY (test), STRIPE_WEBHOOK_SECRET, SUPABASE_SECRET_KEY (clé sb_secret_, corrigée le 22/11)
- [x] Supabase → Authentication → URL Configuration : Site URL = https://clipera.fr, ajouter https://clipera.fr/** aux
  Redirect URLs (liens de confirmation par e-mail)
- [ ] Vidéos réelles (podcast / interview, 1–3 min) pour valider le cadrage sur de vraies images
- [ ] Identité légale, CGV, médiateur avant tout paiement réel ; hébergement durable du worker (fin d'essai Railway)

## Prochaines étapes techniques (gratuites)
- [ ] Sous-titres : durée minimale d'affichage par mot, placement qui évite les visages
- [ ] Style de montage (Naturel / Dynamique / Minimaliste), suppression des silences
- [ ] Combinaison des locuteurs de la transcription avec l'analyse des bouches
- [ ] Correction d'un clip sans relancer l'analyse (transcription déjà enregistrée)

## Bloqué (en attente du fondateur)
- [x] Code sauvegardé sur GitHub : marwanelamrabet25-bit/clipera (public, choix du fondateur)
- [x] Projet Supabase `clipera-dev` créé (Paris, Free), migrations appliquées et vérifiées
- [x] Comptes Cloudflare R2 et Deepgram
- [x] Compte AssemblyAI
- [ ] Compte Anthropic (voir SETUP_ACCOUNTS.md)
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
- [x] Transcription Deepgram branchée et testée avec la vraie API (dialogue français, 2 locuteurs) — 13 tests
- [x] Premier comparatif Deepgram / AssemblyAI (même audio, COST_MODEL.md §7) : Deepgram retenu provisoirement
- [ ] Confirmer le comparatif sur de vraies vidéos (corpus)
- [x] Worker hébergé sur Railway (essai gratuit 30 jours, sans carte) — premiers clips réels en ligne
- [x] Import par lien Google Drive / Dropbox + guides (YouTube Studio, campagne de clipping) — 36 tests + 6 E2E
- [ ] Validation réelle Drive / Dropbox sur le serveur avec un lien du fondateur
- [ ] Import YouTube direct : prêt mais masqué (blocage YouTube ; nécessiterait un service payant de connexions résidentielles)
- [x] Page tarifs mensuel / annuel (2 mois offerts) + récapitulatif avant paiement — 11 vérifications navigateur
- [x] Paiement Stripe en mode test : vérifié en réel sur clipera.fr le 22/11 (Pro mensuel → annuel → résiliation → Free,
  webhook signé reçu, base à jour, données de test supprimées)
- [x] DNS IONOS : clipera.fr (A 216.198.79.1) et www (CNAME Vercel) reliés
- [x] Paiement réel ouvert le 22/11 : compte Stripe réel activé (particulier, FR), 6 prix réels créés et vérifiés
  (sessions ouvertes puis expirées), portail client réel, webhook réel (6 événements), CGV + consentement L221-25
- [ ] Encore manquants (choix du fondateur, risques signalés) : SIRET, adresse e-mail de contact (obligatoire,
  affichée « à compléter »), médiateur de la consommation (obligatoire, payant)
- [ ] Hébergement durable du worker avant la fin de l'essai Railway (carte bancaire classique, ou autre hébergeur)
- [ ] Analyse et sélection des passages (comparatif Sonnet / Opus sur le corpus)
- [x] Sélection de base sans IA (règles, gratuite) — 8 tests
- [x] Job `clip_generation` : transcription + sélection + rendu + enregistrement des clips — 5 tests de bout en bout + essai réel Deepgram
- [x] Écrans : lancement (options), suivi en direct, annulation, résultats, aperçu, note expliquée, téléchargement, bibliothèque — 13 tests E2E
