# CLIPERA

**Transforme tes vidéos. Multiplie tes opportunités.**
SaaS qui transforme des vidéos longues en clips courts grâce à l'IA.

## État du projet
Phase 0 terminée (audit + architecture proposée). **Aucun code applicatif pour l'instant** —
la structure sera créée après validation du fondateur.

## Documentation
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — architecture proposée
- [docs/COST_MODEL.md](docs/COST_MODEL.md) — coûts mesurés et estimés, scénarios de quotas
- [docs/TASKS.md](docs/TASKS.md) — suivi des tâches
- `brand/reference/fiche-branding.webp` — fiche d'identité visuelle validée

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
