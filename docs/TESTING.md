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
