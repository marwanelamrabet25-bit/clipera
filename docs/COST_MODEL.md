# CLIPERA — Modèle de coûts

> **Statut : ESTIMATION INITIALE (Phase 0).** Les chiffres marqués *(mesuré)* viennent d'un test réel ;
> les autres sont des hypothèses à remplacer par les mesures du corpus de test (Phase 8).
> Les allocations de minutes ci-dessous sont des **scénarios à valider**, pas des offres actives.

## 1. Mesures réalisées (machine de dev, 4 vCPU, FFmpeg 6.1.1, libx264)

| Opération (sur 60 s de vidéo 1080p 30 i/s) | Temps |
|---|---|
| Rendu 9:16 1080×1920 + sous-titres, preset `veryfast` | 16,5 s *(mesuré)* |
| Rendu 9:16 1080×1920 + sous-titres, preset `faster` | 20,8 s *(mesuré)* |
| Rendu 9:16 720×1280 (offre Free) | 8,9 s *(mesuré)* |
| Extraction audio Opus mono 16 kHz 32 kb/s | ≈ 0,6 s *(mesuré)* — ≈ 22 Mo / heure |
| Détection de scènes (image réduite) | 3,1 s *(mesuré)* |

Source de test synthétique (bruit visuel, défavorable à l'encodeur) : les vidéos réelles devraient être aussi rapides ou plus.
→ 5 clips de 45 s en 1080p ≈ **1 min 15 s de calcul** sur 4 vCPU.

## 2. Coût variable par minute de vidéo source (hypothèses)

| Poste | Hypothèse | €/min source |
|---|---|---|
| Transcription (mots horodatés + locuteurs) | ~0,004–0,006 $/min (Deepgram / AssemblyAI, tarifs publics à revérifier) | ~0,005 |
| Analyse Claude Opus 5.5 (4 $/20 $ par M tokens) | ~250 tokens/min de transcript, 2 passes, réflexion incluse ≈ 1,2k entrée + 0,8k sortie / min | ~0,020 |
| *(variante)* Claude Sonnet 5.5 (2 $/10 $) | mêmes volumes | ~0,010 |
| Calcul (VPS 8 vCPU ~30 €/mois, amorti) | ~0,3 min CPU par min source | ~0,002 |
| Stockage + sortie R2 | source gardée 3 j, clips 30 j, sortie gratuite | ~0,001 |
| **Total (Opus 5.5)** | | **≈ 0,028 €** |
| **Total (Sonnet 5.5)** | | **≈ 0,018 €** |

## 3. Revenu net par abonnement

Prix affichés TTC → TVA 20 % (France) puis frais Stripe (~1,5 % + 0,25 € carte UE).

| Offre | Prix TTC | HT | Net après Stripe |
|---|---|---|---|
| Starter | 9,99 € | 8,33 € | ~7,93 € |
| Pro | 19,99 € | 16,66 € | ~16,11 € |
| Ultimate | 39,99 € | 33,33 € | ~32,48 € |

## 4. Scénarios d'allocation de minutes (pire cas = quota utilisé à 100 %)

| Offre | Vidéos | Minutes proposées | Coût max Opus | Marge pire cas Opus | Coût max Sonnet | Marge pire cas Sonnet |
|---|---|---|---|---|---|---|
| Free | 3 | 30 (max 15 min/vidéo) | 0,84 € | — (coût d'acquisition) | 0,54 € | — |
| Starter | 10 | 120 | 3,36 € | 58 % | 2,16 € | 73 % |
| Pro | 30 | 300 | 8,40 € | 48 % | 5,40 € | 67 % |
| Ultimate | 80 | 700 | 19,60 € | 40 % | 12,60 € | 61 % |

En pratique, la plupart des abonnés n'utilisent qu'une partie de leur quota ; la marge réelle sera supérieure, mais on dimensionne sur le pire cas.

## 5. Coûts fixes estimés au lancement (pas pendant le développement)

| Service | Dev | Lancement commercial |
|---|---|---|
| Supabase | Free | Pro 25 $/mois (sauvegardes, pas de mise en pause) |
| Vercel | Hobby | Pro 20 $/mois (Hobby interdit l'usage commercial) |
| Worker | machine locale / cette session | VPS ~15–40 €/mois |
| R2 | gratuit < 10 Go | à l'usage |
| Domaine | — | ~12 €/an |
| Sentry | Free | Free au début |
| **Total** | **0 €** | **≈ 70–100 €/mois** |

## 6. Ce qui sera mesuré par job (table `processing_jobs` / `usage_records`)
minutes source, secondes de rendu, tokens entrée/sortie par appel, minutes transcrites, durée de chaque étape, coût estimé total.
Les tarifs unitaires sont stockés en configuration (pas en dur dans le code).

## 7. Comparatif transcription (tarifs publics relevés le 20/11/2026 — à confirmer sur les pages officielles à l'inscription)

| | Deepgram Nova-3 (pré-enregistré) | AssemblyAI Universal-3.5 Pro | AssemblyAI Universal-2 |
|---|---|---|---|
| Prix de base | 0,0043 $/min (0,0052 $ multilingue) | 0,21 $/h = 0,0035 $/min | 0,15 $/h = 0,0025 $/min |
| Locuteurs (diarisation) | annoncée incluse (une source la facture +0,002 $/min) | +0,02 $/h | +0,02 $/h |
| **Total avec locuteurs** | **0,0043 – 0,0063 $/min** | **0,0038 $/min** | **0,0028 $/min** |
| Vidéo de 20 min | 0,09 – 0,13 $ | 0,08 $ | 0,06 $ |
| Mots horodatés | oui | oui | oui |
| Crédit gratuit à l'inscription | 200 $ annoncés | à vérifier | à vérifier |

Conclusion provisoire : l'écart est d'environ **1 à 5 centimes par vidéo de 20 min** — négligeable face au coût
de l'analyse IA. Le choix se fera donc sur la **qualité en français** (mots justes, horodatage précis, locuteurs bien
séparés), mesurée sur notre corpus. Les crédits gratuits couvrent largement ce test : **0 € de dépense**.

Mesuré le 20/11/2026 (compte Deepgram créé, crédit gratuit, **0 € dépensé**) : Nova-3 français, 47,6 s d'audio
transcrites en 1,8 s, facturation à la durée de l'audio → 0,0043 $/min × 0,8 min ≈ **0,003 $** pris sur le crédit
gratuit. La clé utilisée n'a pas le droit de lire la facturation (rôle *Member*, choix de sécurité) : le solde se
consulte sur console.deepgram.com → Billing.

### Premier comparatif réel (20/11/2026, même audio, 0 € dépensé — crédits gratuits)
Dialogue français de 47,6 s, 2 voix (voix de synthèse), audio du worker (Opus 32 kb/s), 117 mots de référence.

| | Mots justes | Erreurs notables | Locuteurs | Délai |
|---|---|---|---|---|
| **Deepgram Nova-3** | **98,3 %** (2 erreurs) | « arle » pour « parle » | ✅ 2 voix bien séparées | 1,8 s (réponse directe) |
| AssemblyAI Universal-3.5 Pro | 97,4 % (3 erreurs) | « Le tout a vêté » pour « J'ai tout arrêté » | ✅ | ~5 s (file d'attente) |
| AssemblyAI Universal-2 | 94,9 % (6 erreurs) | « Tout avait été », « une par eux », « ne l'est venu » | ✅ | ~5 s |

Lecture honnête : sur 117 mots, 1 erreur d'écart n'est **pas significatif**. Les deux premiers sont au coude à coude ;
Universal-2 est nettement en retrait. Décision provisoire : **Deepgram** (meilleur ici, déjà intégré et testé,
réponse directe plus simple). Décision définitive après le test sur de vraies vidéos (accents, bruit, voix qui se
chevauchent), où les écarts apparaissent vraiment.

Sources (secondaires) : cartesia.ai/learn/deepgram-pricing, brasstranscripts.com, gladia.io/blog/deepgram-pricing,
cartesia.ai/learn/assemblyai-pricing, assemblyai.com/blog/speech-to-text-api-pricing.
