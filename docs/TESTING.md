# CLIPERA — Tests

## Lancer les tests

Worker + base de données (Postgres local requis pour les tests base de données) :
```bash
cd apps/worker
CLIPERA_TEST_DB_ADMIN_URL="host=/tmp port=54329 user=postgres dbname=postgres" uv run pytest
```
Sans la variable, les tests base de données sont ignorés et seuls les tests vidéo tournent.

Application web :
```bash
cd apps/web
pnpm exec tsc --noEmit && pnpm exec eslint . && pnpm build
```

## Couverture actuelle (63 tests, tous au vert)

| Domaine | Ce qui est vérifié |
|---|---|
| Permissions | Isolation entre utilisateurs sur toutes les tables ; anonymes limités aux offres publiques ; impossible de changer son offre, valider sa vidéo, s'ajouter du quota, se rendre admin, lire le journal d'audit, appeler les fonctions du worker |
| Quotas | Vidéos, minutes, durée max, clips par vidéo, jobs simultanés ; **course de 10 requêtes simultanées** ; idempotence |
| Remboursements | Échec sans clip → remboursé une seule fois ; échec partiel → non remboursé ; annulation → remboursé |
| File | Deux workers ne prennent jamais le même job ; priorité ; job abandonné → remis en file puis échec ; annulation transmise au worker |
| Vérification vidéo | MP4, MOV, rotation téléphone, sans son, trop courte, trop longue, corrompue, faux fichier |
| Rendu | Dimensions par format et par offre, pas d'agrandissement 720p→1080p, **synchronisation son/image ≤ 1 image**, **coupe précise à l'image**, sous-titres visibles au bon moment, filigrane, cadrage mobile, bornes invalides |
| Sous-titres | Format ASS, découpage des lignes, mot surligné, injection de balises impossible, taille modérée |
| Bout en bout | Vidéo importée → job → worker → vidéo validée/refusée avec raison, nettoyage des fichiers temporaires, reprise sur erreur imprévue |

Chaque test vérifie un **résultat observable** (luminosité d'une zone de l'image, instant d'un bip, dimensions
du fichier…), pas seulement l'absence d'erreur. Vérification de pertinence : en retirant volontairement le verrou
de quota, le test de course échoue (8 jobs créés au lieu de 4).

## Corpus d'évaluation (à constituer avec le fondateur)
Podcast solo · interview à deux · plusieurs intervenants · musique de fond · silences · mauvais son · changements de scène.

### Protocole Sonnet vs Opus (et Deepgram vs AssemblyAI)
1. Même transcription et même consigne pour les deux modèles, sur les 7 vidéos.
2. Évaluation **à l'aveugle** par le fondateur (modèle masqué), grille : accroche, intérêt, contexte complet,
   début et fin naturels, doublons, cohérence — note de 1 à 5.
3. Mesure automatique : clips coupés en milieu de phrase, chevauchements, durée, coût réel en tokens.
4. Décision documentée dans COST_MODEL.md. Budget estimé de l'expérience : < 5 $ d'API.

## Test de bout en bout : connexion et espace /app (15 vérifications, toutes réussies)
Script : `apps/web/e2e/auth.e2e.cjs`, exécuté dans un vrai navigateur (Chromium) contre la **vraie base Supabase**.

Vérifié : redirection des visiteurs vers /connexion (en gardant la page demandée), e-mail invalide refusé,
lien expiré ou falsifié refusé avec un message, **aucune redirection vers un site externe**, dashboard alimenté
par les vraies données (quota Free 3 vidéos / 30 min), redirection d'un utilisateur déjà connecté, modification
du nom affiché, page Abonnement, toutes les pages /app, **isolation : B ne voit pas le projet de A**, déconnexion
effective, affichage mobile sans défilement horizontal.

Déroulé : deux comptes temporaires (mot de passe aléatoire) sont créés en SQL, le test s'exécute, puis les comptes
sont supprimés (la suppression efface en cascade profil, abonnement et projets — vérifié).
Le lien magique ne pouvant pas être lu ici, la session est ouverte par mot de passe avec la même bibliothèque
et les mêmes cookies que l'application.

```bash
cd apps/web && pnpm build && PORT=3100 pnpm start &
E2E_A_EMAIL=… E2E_A_PASSWORD=… E2E_B_EMAIL=… E2E_B_PASSWORD=… pnpm e2e
```
Dans les sessions cloud Claude, ajouter `NODE_USE_ENV_PROXY=1` (Node doit passer par le proxy réseau).
