# CLIPERA

**Transforme tes vidéos. Multiplie tes opportunités.**
SaaS qui transforme des vidéos longues en clips courts grâce à l'IA.

## État du projet
Fondations en place : base de données sécurisée et testée, moteur vidéo (vérification + rendu) testé,
design system de l'application web. Le premier parcours complet (import → clips) est en cours.
Voir [docs/TASKS.md](docs/TASKS.md).

## Lancer le projet en local
Application web :
```bash
cd apps/web && pnpm install && pnpm dev
```
Puis ouvrir http://localhost:3000 (page d'attente) et http://localhost:3000/design-system.

Worker et tests : voir [docs/TESTING.md](docs/TESTING.md).

## Documentation
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — architecture validée
- [docs/COST_MODEL.md](docs/COST_MODEL.md) — coûts mesurés et estimés, scénarios de quotas
- [docs/TASKS.md](docs/TASKS.md) — suivi des tâches
- [docs/DATABASE.md](docs/DATABASE.md) · [docs/VIDEO_PIPELINE.md](docs/VIDEO_PIPELINE.md) · [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) · [docs/TESTING.md](docs/TESTING.md)
- [docs/SETUP_ACCOUNTS.md](docs/SETUP_ACCOUNTS.md) — guide de création des comptes
- `brand/reference/fiche-branding.webp` — fiche d'identité visuelle validée

## Autre projet du dépôt
- [`apps/webpro/`](apps/webpro/README.md) — site officiel de **WEBPRO AGENCY** (agence digitale, Doubs). Projet Next.js indépendant : dépendances, configuration et déploiement propres.

## Structure prévue
```
clipera/
├── apps/
│   ├── web/        Next.js : landing, application, routes API
│   └── worker/     Python : pipeline vidéo (FFmpeg, transcription, IA, rendu)
├── packages/
│   └── shared/     Types et constantes partagés (plans, statuts de jobs)
├── supabase/
│   ├── migrations/ Schéma SQL versionné + RLS
│   └── tests/      Tests de permissions
├── test-corpus/    Vidéos de test (hors Git) + grille d'évaluation
├── brand/          Logos et fiche de marque
└── docs/           Documentation technique
```
