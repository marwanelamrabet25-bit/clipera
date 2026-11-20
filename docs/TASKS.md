# CLIPERA — Suivi des tâches

Dernière mise à jour : 2026-11-20

## Terminé
- [x] Phase 0 — Audit de l'environnement (dossier vide, outils présents, comptes connectés vérifiés)
- [x] Phase 0 — Benchmark FFmpeg réel (voir COST_MODEL.md)
- [x] Phase 0 — Architecture proposée (ARCHITECTURE.md) et modèle de coûts initial (COST_MODEL.md)

## Bloqué (en attente du fondateur)
- [ ] Validation de l'architecture et des choix (R2, file Postgres, worker Python)
- [ ] Dépôt GitHub pour sauvegarder le code (la session cloud est éphémère)
- [ ] Fichiers sources du logo (SVG/PNG haute résolution)
- [ ] Choix du modèle d'analyse après test sur corpus (Opus 5.5 par défaut)

## À faire — premier jalon (« Premier clip réel »)
- [ ] Initialiser le monorepo (apps/web, apps/worker, supabase/)
- [ ] Design system de base (tokens, boutons, cartes, champs, états)
- [ ] Supabase : migrations initiales + RLS + tests de permissions
- [ ] Auth (e-mail magique + Google)
- [ ] Upload multipart vers R2 + validation ffprobe
- [ ] Worker : réservation de job, transcription, analyse, sélection, rendu 9:16
- [ ] Pages : nouveau projet, suivi du traitement, résultats, téléchargement
- [ ] Corpus de test (7 vidéos) + grille d'évaluation
