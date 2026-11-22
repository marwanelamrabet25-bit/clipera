# Guide : créer et connecter les comptes

Règles :
- **Ne colle jamais une clé dans le chat.** Les clés se saisissent uniquement dans les tableaux de bord
  (Vercel, hébergeur du worker) ou dans le formulaire sécurisé que je t'ouvrirai.
- Tout ce qui suit est **gratuit**. Aucune carte bancaire n'est nécessaire, sauf mention contraire, et dans ce cas
  je te préviens avant.

## 1. GitHub — sauvegarder le code (priorité absolue)
Pourquoi : la session de travail est temporaire ; sans dépôt, le code disparaît à sa fermeture.
1. Sur claude.ai : **Paramètres → Connecteurs → GitHub → Connecter**, puis autorise l'accès.
2. Sur github.com : **New repository** → nom `clipera` → **Private** → ne coche rien d'autre → *Create*.
3. Donne-moi le nom complet (ex. `ton-pseudo/clipera`). Je pousserai le code.

## 2. Supabase — base de données et comptes utilisateurs
Ton organisation Supabase est déjà connectée à cette session. Avec ton accord, **je crée moi-même** un projet
`clipera-dev` en offre **Free** (0 €), région Europe (Francfort ou Paris, conformité RGPD), et j'applique
les migrations. Rien à faire de ton côté, réponds simplement « OK Supabase ».

## 2b. Réglages Supabase pour la connexion (à faire avant d'inviter des utilisateurs)
Dans le tableau de bord Supabase, projet `clipera-dev` :
1. **Authentication → URL Configuration** : *Site URL* = l'adresse du site une fois déployé ; ajouter
   `https://<ton-domaine>/auth/confirm` dans *Redirect URLs*. (En local, `http://localhost:3000` fonctionne déjà.)
2. **Authentication → Emails → Magic Link** (recommandé, pour que le lien marche même ouvert sur un autre appareil) :
   remplacer `{{ .ConfirmationURL }}` par
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&suite=/app`
3. **E-mails réels** : le service d'e-mail intégré de Supabase n'envoie qu'aux membres de ton organisation et avec
   un débit très limité. Avant d'ouvrir aux utilisateurs, il faudra un service d'envoi (ex. Resend, offre gratuite)
   configuré dans *Authentication → SMTP Settings*. Je te guiderai.

## 3. Cloudflare R2 — stockage des vidéos
1. Crée un compte sur dash.cloudflare.com.
2. Menu **R2 Object Storage** → active R2. ⚠️ Cloudflare demande un moyen de paiement pour activer R2, même pour
   l'offre gratuite (10 Go, sortie illimitée). Tant qu'on reste sous 10 Go, **rien n'est facturé**.
   Dis-moi avant de valider si tu préfères attendre.
3. **Create bucket** → nom `clipera-media` → emplacement *Europe (EU)* → *Create*.
4. Dans le bucket → **Settings → CORS Policy → Edit**, colle exactement ceci (remplace l'adresse si le domaine change) :
   ```json
   [
     {
       "AllowedOrigins": ["https://clipera.fr", "https://clipera-clipera1.vercel.app", "http://localhost:3000"],
       "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
   Sans `ExposeHeaders: ETag`, le navigateur ne peut pas terminer l'envoi des vidéos.
5. Dans le bucket → **Settings → Object Lifecycle Rules → Add rule**, crée ces deux règles :
   - « envois-abandonnes » : *Abort incomplete multipart uploads* après **1 jour** (tout le bucket).
   - « sources-30-jours » : préfixe `sources/`, *Delete objects* après **30 jours**.
   La base de données est alignée automatiquement chaque heure (fonction `run_maintenance`).
6. **R2 → Manage API Tokens → Create API Token** : permission *Object Read & Write*, limité au bucket
   `clipera-media`. Cloudflare affiche *Access Key ID* et *Secret Access Key* **une seule fois**.
7. Saisis-les **directement dans Vercel** (projet `clipera` → *Settings → Environment Variables*), jamais dans le chat :
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` (cocher *Sensitive*), `R2_BUCKET` = `clipera-media`.
   Dis-moi quand c'est fait : je redéploie et l'import s'active automatiquement.

## 4. Transcription — deux comptes gratuits pour le comparatif
- **Deepgram** : console.deepgram.com → inscription (crédit gratuit annoncé : 200 $).
- **AssemblyAI** : assemblyai.com → inscription (crédit gratuit à vérifier).
Ne copie pas les clés : quand on lancera le comparatif, je t'ouvrirai un formulaire sécurisé pour chacune.

## 5. API Claude (Anthropic) — analyse des vidéos
1. platform.claude.com → crée un compte → **Billing** : ajoute un crédit (5 $ suffisent pour le comparatif
   Sonnet/Opus) et **fixe une limite de dépense mensuelle** (ex. 20 $).
   ⚠️ C'est la seule dépense de cette étape : à toi de décider quand.
2. Comme pour la transcription, la clé sera saisie via le formulaire sécurisé.

## 6. Vercel — hébergement du site
L'équipe `clipera1` existe déjà. Pour que je puisse y créer le projet, il faudra autoriser cette session sur
l'équipe (je t'enverrai le lien le moment venu). Offre Hobby gratuite pendant le développement ; l'offre Pro
(20 $/mois) ne sera nécessaire qu'au lancement commercial.

## 7. Vidéos de test
Rassemble 7 vidéos dont tu détiens les droits (10–20 min idéalement) :
podcast solo, interview à deux, plusieurs intervenants, musique de fond, silences, son de mauvaise qualité,
changements de scène. On les déposera dans le bucket R2, jamais dans Git.

## 7. Railway — hébergement du worker (validé par le fondateur, 5 $/mois)
1. railway.com → **Login with GitHub** → offre **Hobby** (5 $/mois, 5 $ de consommation inclus) → carte bancaire.
2. **Plafond de dépense** : Workspace → Usage → *Usage limits* → limite stricte (ex. 10 $). Au-delà, le service
   s'arrête au lieu de facturer.
3. New Project → *Deploy from GitHub repo* → `clipera` → service : **Root Directory = `apps/worker`**
   (Railway lit `railway.json` et construit le `Dockerfile`). Région : Europe (Amsterdam).
4. Variables (onglet *Variables*, jamais dans le chat) :
   - `CLIPERA_DATABASE_URL` : Supabase → *Connect* → **Session pooler** (port 5432, compatible IPv4), avec le mot de passe de la base
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET=clipera-media`
   - `DEEPGRAM_API_KEY` : clé dédiée à la production (rôle *Member*)
5. Aucun domaine public nécessaire : le worker ne reçoit aucune requête, il lit la file de jobs.

> Railway refuse les cartes Revolut (classées « prépayées ») et Koyeb n'accepte plus que l'offre Pro (≥ 29 $/mois)
> pour les nouveaux comptes : **le worker est hébergé chez Hetzner** (décision du fondateur).

## 8. Hetzner Cloud — hébergement du worker (≈ 7,20 €/mois TTC)
1. hetzner.com → *Cloud* → créer un compte ; paiement **prélèvement SEPA** (IBAN Revolut accepté).
   Hetzner peut demander une vérification d'identité.
2. Console Cloud → nouveau projet `clipera` → *Add Server* :
   - Emplacement : Falkenstein ou Nuremberg (Allemagne) ; image **Ubuntu 24.04** ; type **CX23** (2 vCPU, 4 Go) ;
   - Réseau : IPv4 + IPv6 ; pas de clé SSH nécessaire ;
   - **Cloud config** : coller `deploy/hetzner/cloud-init.yaml` après avoir remplacé les 4 valeurs `A_REMPLACER`
     (adresse *Session pooler* Supabase avec le mot de passe, clés R2, clé Deepgram dédiée).
3. Le serveur s'installe seul (~5 min) : Docker, construction du worker, lancement, relance automatique,
   **mise à jour automatique depuis GitHub toutes les 15 min**, accès SSH fermé.
4. Vérification : un job de test passe de « en attente » à « terminé » sur clipera.fr.
   Journaux : console web Hetzner → `journalctl -u clipera-worker -n 50`.

## 9. Stripe — paiements (mode TEST d'abord)
Déjà fait (via l'API, mode test) : prix mensuels existants conservés, prix annuels créés (99,90 / 199,90 / 399,90 €,
facturés une fois par an, `lookup_key` `clipera_<offre>_annual`), Price ID enregistrés dans `plans`, portail client
(factures, carte, changement d'offre, résiliation en fin de période) et point de webhook
`https://clipera.fr/api/stripe/webhook` (6 événements).

Variables à ajouter dans Vercel (Production, cocher *Sensitive*) — jamais dans le chat :
- `STRIPE_SECRET_KEY` : clé secrète **de test** (`sk_test_…`).
- `STRIPE_WEBHOOK_SECRET` : Stripe (mode test) → Développeurs → Webhooks → point `clipera.fr/api/stripe/webhook`
  → Clé secrète de signature → Révéler (`whsec_…`).
- `SUPABASE_SECRET_KEY` : Supabase → Project Settings → API Keys → Secret keys (`sb_secret_…`). Clé très puissante :
  uniquement côté serveur (webhooks).
Passage au réel : recréer les prix et le webhook en mode live, remplacer les 3 variables et les Price ID en base,
après identité légale + CGV + médiateur.

### Stripe — mode réel (22/11/2026)
- Compte réel activé (particulier, France). Clé `sk_live` et secret de webhook saisis par le fondateur dans Vercel.
- Prix réels (TTC) : Starter `price_1UeZfo99DbnxVXrBfbTdfZwW` / `price_1UeZfo99DbnxVXrBLmuEiIy1`,
  Pro `price_1UeZfo99DbnxVXrBxKhzX9Bs` / `price_1UeZfo99DbnxVXrBByTmrUsl`,
  Ultimate `price_1UeZfp99DbnxVXrBzBIynuw4` / `price_1UeZfp99DbnxVXrBLZ301u00` (mensuel / annuel), enregistrés dans `plans`.
- Portail client réel `bpc_1UeZg099DbnxVXrBNqiollhu` (résiliation en fin de période), webhook réel `we_1UeZqx99DbnxVXrBHvZWTTca`.
- Les identifiants de test ont été retirés de la base ; l'Ultimate du fondateur est offert sans Stripe (jusqu'en 2099).
