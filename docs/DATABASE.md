# CLIPERA — Base de données

Postgres (Supabase). Migrations versionnées dans `supabase/migrations/`, testées par `supabase/tests/`.

## Tables

| Table | Contenu | Écriture par l'utilisateur |
|---|---|---|
| `plans` | Offres et limites (vidéos, **secondes**, clips/vidéo, durée max, taille max, 720/1080, filigrane, priorité, jobs simultanés) | Non — modifiable par SQL sans toucher au code |
| `profiles` | Profil (créé automatiquement à l'inscription) | `display_name` uniquement |
| `user_settings` | Préférences de montage par défaut | Ses propres réglages |
| `subscriptions` | Offre et période de facturation (Stripe plus tard) | Non (webhooks Stripe uniquement) |
| `projects` | Projets | Renommer uniquement |
| `source_videos` | Vidéo importée + métadonnées FFprobe + confirmation des droits | Non (serveur / worker) |
| `processing_jobs` | File de traitements (types `probe`, `clip_generation`) | Via `create_clip_job` / `cancel_job` |
| `job_events` | Historique de chaque changement de statut | Non |
| `clips` | Clips produits, score, options de rendu | Non (worker) |
| `usage_records` | Registre de consommation : réservations, remboursements, ajustements | Non |
| `audit_log` | Actions sensibles | Invisible pour les utilisateurs |

Chaque ligne appartient à un utilisateur (`user_id` → `auth.users`, suppression en cascade = droit à l'effacement).

## Sécurité (RLS)
- Tout est fermé par défaut ; chaque utilisateur ne **lit** que ses propres lignes.
- Les utilisateurs ne peuvent **écrire** que quelques colonnes inoffensives (nom de projet, préférences).
- Toute action sensible passe par une fonction SQL qui revérifie `auth.uid()` : impossible de tricher en
  envoyant un autre identifiant depuis le navigateur.
- Les fonctions du worker (`claim_next_job`, `heartbeat_job`, `requeue_stale_jobs`, `enqueue_probe_job`) sont
  réservées au rôle service.

## Quotas
- Quota utilisé = somme des `usage_records` de la période en cours.
- Période : celle de l'abonnement payant actif, sinon le mois calendaire (UTC) sur l'offre Free.
- `create_clip_job` vérifie, **dans une seule transaction verrouillée par utilisateur** : propriété de la vidéo,
  vidéo validée, nombre de clips demandé, durée max de l'offre, jobs simultanés, vidéos et minutes restantes ;
  puis crée le job et la réservation. Testé : 10 requêtes simultanées sur un quota de 4 → exactement 4 jobs.
- **Idempotence** : même clé (`idempotency_key`) → même job, aucune double réservation (rafraîchissement, double clic).

## Règles de remboursement
| Situation | Quota |
|---|---|
| Job terminé (`completed`) | Consommé |
| Échec ou annulation **sans aucun clip livré** | Remboursé automatiquement, une seule fois |
| Échec après avoir livré au moins un clip | Consommé (l'utilisateur garde ses clips) |
| Vidéo refusée à la vérification (`probe`) | Rien n'a été réservé |

## File de traitement
- `claim_next_job` utilise `FOR UPDATE SKIP LOCKED` : deux workers ne prennent jamais le même job.
- Ordre : priorité de l'offre, puis ancienneté.
- Battement de cœur toutes les 20 s ; sans signe de vie pendant 5 min → remis en file avec délai croissant,
  puis échec définitif (et remboursement) après `max_attempts`.
- L'annulation par l'utilisateur est immédiate si le job attend, sinon transmise au worker par le battement de cœur.
