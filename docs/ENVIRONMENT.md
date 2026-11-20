# CLIPERA — Variables d'environnement

Aucune valeur secrète n'est jamais écrite dans le code, la documentation, Git ou le chat.
Les secrets se saisissent uniquement dans les tableaux de bord des hébergeurs (Vercel, hébergeur du worker)
ou via un formulaire sécurisé.

Légende : 🔒 secret · 🌐 public (visible dans le navigateur) · ⚙️ réglage non secret

## Application web (`apps/web`, hébergée sur Vercel)

| Variable | Type | Rôle |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ⚙️ | URL publique du site (ex. `https://clipera.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | 🌐 | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 🌐 | Clé publique Supabase (protégée par la RLS) |
| `SUPABASE_SECRET_KEY` | 🔒 | Clé serveur Supabase — **uniquement côté serveur**, jamais préfixée `NEXT_PUBLIC_` |
| `R2_ACCOUNT_ID` | ⚙️ | Identifiant du compte Cloudflare |
| `R2_ACCESS_KEY_ID` | 🔒 | Clé d'accès R2 (droits limités au bucket Clipera) |
| `R2_SECRET_ACCESS_KEY` | 🔒 | Secret R2 |
| `R2_BUCKET` | ⚙️ | Nom du bucket privé (ex. `clipera-media`) |
| `S3_ENDPOINT` | ⚙️ | **Tests uniquement** : adresse d'un faux S3 local (moto). Ne jamais définir en production |
| `STRIPE_SECRET_KEY` | 🔒 | Phase 13 |
| `STRIPE_WEBHOOK_SECRET` | 🔒 | Phase 13 |

## Worker vidéo (`apps/worker`)

| Variable | Type | Rôle |
|---|---|---|
| `CLIPERA_DATABASE_URL` | 🔒 | Connexion Postgres directe (Supabase → *Connect* → *Session pooler*) |
| `CLIPERA_STORAGE_BACKEND` | ⚙️ | `r2` (production) ou `local` (tests hors ligne) |
| `CLIPERA_LOCAL_STORAGE_DIR` | ⚙️ | Dossier utilisé si `local` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | 🔒/⚙️ | Comme ci-dessus |
| `TRANSCRIPTION_PROVIDER` | ⚙️ | `deepgram` ou `assemblyai` (choix après comparatif) |
| `DEEPGRAM_API_KEY` / `ASSEMBLYAI_API_KEY` | 🔒 | Selon le fournisseur retenu |
| `ANTHROPIC_API_KEY` | 🔒 | Analyse des transcriptions |
| `CLIPERA_ANALYSIS_MODEL` | ⚙️ | `claude-opus-5-5` par défaut ; changeable après comparatif |
| `S3_ENDPOINT` | ⚙️ | Tests uniquement (faux S3 local) |
| `CLIPERA_WORKER_ID` | ⚙️ | Nom du worker dans les journaux (facultatif) |
| `CLIPERA_POLL_INTERVAL_S` | ⚙️ | Attente entre deux vérifications de la file (défaut 2) |
| `CLIPERA_HEARTBEAT_INTERVAL_S` | ⚙️ | Fréquence du battement de cœur (défaut 20) |
| `CLIPERA_WORK_DIR` | ⚙️ | Dossier temporaire (défaut `/tmp/clipera-work`) |

## Tests

| Variable | Rôle |
|---|---|
| `CLIPERA_TEST_DB_ADMIN_URL` | Connexion superutilisateur à un Postgres **de test** local (jamais la production) |

Fichiers modèles : `apps/web/.env.example`, `apps/worker/.env.example`.
