# Import YouTube : rapport de recherche et de développement (23/11/2026)

Branche : **`import-youtube`**. **Rien n'a été mis en production.**

## En bref

- **Télécharger automatiquement une vidéo YouTube à partir d'un simple lien est interdit par les règles de YouTube**
  pour un service comme Clipera, sauf accord écrit de YouTube. C'est écrit noir sur blanc (preuves ci-dessous).
- Les concurrents qui le proposent ont des pannes publiques et renvoient vers YouTube Studio. Descript a même
  **retiré** la fonction.
- **Une voie officielle existe pour aller plus loin** : l'API Google « Data Portability ». Avec l'accord du
  créateur, elle permet de transférer **ses propres vidéos** (en MP4) vers une application tierce. Elle est réservée
  aux utilisateurs d'Europe (EEE) et du Royaume-Uni, et demande une validation de Clipera par Google. C'est la
  meilleure piste pour une vraie importation automatique et légale.
- **Construit et testé** : un écran « Transforme une vidéo YouTube en clips ». Il reconnaît le lien et affiche le
  titre, la chaîne et la miniature (informations officielles). Il guide ensuite vers le fichier original : 1 clic
  vers YouTube Studio, ou le lien Drive du créateur. Le fichier repart ensuite dans le moteur de clips existant.
- **Supprimé** : l'ancien code de téléchargement par yt-dlp, déjà désactivé en production depuis le 21/11. C'était
  un outil conçu pour passer les protections de YouTube.

## 1. Méthodes étudiées

| # | Méthode | Possible techniquement | Autorisée | Publiques | Privées | Propriétaire obligatoire | OAuth | Accord commercial | Coût | Adaptée à Clipera |
|---|---|---|---|---|---|---|---|---|---|---|
| A1 | YouTube Data API v3 | Infos seulement, **aucun fichier vidéo** | Oui (infos) | Infos | Non | Non | Non (clé API) | Non | Gratuit (quota de 10 000 unités par jour) | Oui pour les infos (durée) |
| A2 | oEmbed YouTube (titre, chaîne, miniature) | Oui, **testé en réel** | Oui (prévu pour l'intégration) | Oui | Non (refus) | Non | Non | Non | Gratuit | ✅ **Utilisé** |
| A3 | Lecteur intégré (iframe) | Lecture seulement | Oui | Oui | Non | Non | Non | Non | Gratuit | Non : lire ≠ récupérer le fichier |
| A4 | `captions.download` (sous-titres) | Oui | Oui, si l'utilisateur peut modifier la vidéo | Oui | Oui | **Oui** | Oui | Non | Gratuit | Partiel : texte seulement, pas d'image |
| B1 | YouTube Studio → Télécharger | Oui, sur ordinateur | **Oui** (fonction de YouTube) | Oui | Oui | **Oui** | Non | Non | Gratuit | ✅ **Utilisé (1 clic depuis Clipera)** |
| B2 | Google Takeout → Google Drive | Oui, manuel, toute la chaîne d'un coup | Oui | Oui | Oui | Oui | Non | Non | Gratuit | Secours (lent, lourd) |
| C1 | Accord écrit de YouTube (formulaire officiel) | — | Seule voie prévue par les règles | ? | ? | ? | ? | **Oui** | Inconnu | Théorique, aucun programme public connu |
| D1 | Fournisseurs tiers de « téléchargement » (Apify, RapidAPI, etc.) | Oui | **Non** : aucune licence YouTube démontrée, et les règles interdisent aussi d'*obtenir* du contenu récupéré ainsi | Oui | Non | Non | Non | — | Payant | ❌ Rejeté |
| D2 | yt-dlp et outils semblables (ancien code Clipera) | Fragile (bloqué depuis nos serveurs le 21/11) | **Non** | — | — | — | — | — | Gratuit | ❌ **Supprimé** |
| E1 | **Google Data Portability API** (`youtube.public_videos`, `unlisted_videos`) | Oui (non testé : demande un projet Google Cloud) | **Oui**, cadre officiel du Digital Markets Act | Oui | Oui (portée « restreinte ») | **Oui** | Oui | Non (validation Google) | Validation : gratuite pour les vidéos publiques et non répertoriées | ✅ **Piste n°1 pour l'avenir** |
| F1 | Google Drive Picker (choisir un fichier dans son Drive) | Oui | Oui | — | — | — | Oui (`drive.file`) | Non | Gratuit | Amélioration utile de l'import Drive |
| G1 | Lien de partage Drive / Dropbox (déjà en place) | Oui, **testé en réel le 21/11** | Oui | — | — | Non | Non | Non | Gratuit | ✅ Déjà en place |

**Ce qui fonctionne réellement aujourd'hui :** A2, B1 et G1. **Ce qui reste théorique :** E1 (à construire après la
validation de Google), C1 et F1.

## 2. Preuves (documents officiels lus le 23/11/2026)

**Règles des développeurs YouTube** ([developer-policies](https://developers.google.com/youtube/terms/developer-policies)),
section *Audiovisual Content* :
> You and your API Clients must not, and must not encourage, enable, or require others to: download, import, backup,
> cache, or store copies of YouTube audiovisual content without YouTube's prior written approval, make content
> available for offline playback […]

Même document, section *Scraping* :
> You and your API Clients must not […] scrape YouTube Applications […] or obtain scraped YouTube data or content.

Les fournisseurs tiers sont donc exclus, même payants. La demande d'accord écrit se fait par
[ce formulaire](https://support.google.com/youtube/contact/yt_api_form). Il n'existe aucun programme public.

**Conditions d'utilisation de YouTube** : elles interdisent de télécharger un contenu, sauf autorisation du service
ou accord écrit, et interdisent les accès automatisés (robots, scrapers).

**YouTube Data API** : aucune méthode ne renvoie le fichier vidéo.
[`captions.download`](https://developers.google.com/youtube/v3/docs/captions/download) :
« This method requires the user to have permission to edit the video ».

**Data Portability API** :
- [Schéma YouTube](https://developers.google.com/data-portability/schema-reference/youtube) : « You can export your
  uploaded video media, including private, unlisted, and public videos ». Objet *video media* : « Videos you've
  uploaded », format « Original format / MP4 ».
- [Portées](https://developers.google.com/data-portability/user-guide/scopes) :
  - `dataportability.youtube.public_videos` : **Sensitive** ;
  - `dataportability.youtube.unlisted_videos` : **Sensitive** ;
  - `dataportability.youtube.private_videos` : **Restricted** (demande un audit de sécurité CASA).
- [Règles](https://developers.google.com/data-portability/policy) :
  - « provides end users in the European Economic Area (EEA) more control over their data » ;
  - cas d'usage autorisé : « move, copy, or transfer user data from one Google service to another platform or service
    for the user's benefit » ;
  - une politique « Limited Use » s'applique ;
  - pour la portée restreinte : « Required security measures for Restricted Scopes include […] CASA ».
- [Fonctionnement](https://developers.google.com/data-portability/user-guide/methods) :
  - l'export est une archive : « An archive request can take several minutes, several hours, or even several days » ;
  - les liens de téléchargement « expire after six hours, and the data is available for 14 days » ;
  - lancer l'archive « within 24 hours of user authorization ».
- [Vue d'ensemble](https://developers.google.com/data-portability/user-guide/overview) :
  - étapes : projet Google Cloud, « Enable billing », vérification de l'application (identité, politique de
    confidentialité, vidéo de démonstration), puis nouvelle vérification **chaque année** ;
  - « does not support access by accounts of users under 18 ».
- [Filtres par date](https://developers.google.com/data-portability/user-guide/time-filter) : disponibles seulement
  pour l'activité, Chrome et Play. **Impossible de demander une seule vidéo** : l'export contient **toutes** les
  vidéos publiques (ou non répertoriées) de la chaîne.
- Royaume-Uni : ouvert volontairement par Google (document de l'autorité britannique CMA, 2025). Suisse : signalé
  par une source non officielle, **non confirmé**.

## 3. Concurrents (informations publiques uniquement)

- **OpusClip** ([sources](https://help.opus.pro/docs/article/what-import-sources-does-opusclip-support.md)) : accepte
  les liens YouTube publics ou non répertoriés ; « Private videos can not be accessed ».
  - Page d'aide « [Resolving YouTube upload issues](https://help.opus.pro/docs/article/resolving-youtube-upload-issues.md) » :
    « due to YouTube's download policy updates. These changes have temporarily increased failure rates ». Solutions
    proposées : envoi du fichier (« You can download your videos from YouTube Studio »), Google Drive, etc.
  - « [Auto Import](https://help.opus.pro/docs/article/auto-import.md) » : connexion du compte YouTube, seulement
    « your own public YouTube videos », publiées après l'activation.
  - Leur méthode interne n'est pas publique. **Nous ne la connaissons pas.**
- **Descript** ([annonce](https://feedback.descript.com/changelog/an-update-on-import-from-youtube)) : import YouTube
  **désactivé**. « YouTube regularly updates its systems to prevent automated downloading ». Ils recommandent
  YouTube Studio, « the most stable, YouTube-compliant way ».
- **Remakeit** : son site annonce « paste a YouTube URL ». Aucune documentation publique sur la méthode, les limites
  ou les autorisations. **Rien à vérifier.**

**Conclusion** : l'expérience « je colle un lien et ça marche toujours » n'est garantie chez personne. Les leaders
reconnaissent publiquement les blocages, et la voie qu'ils recommandent tous est YouTube Studio, celle que Clipera
propose maintenant en 1 clic.

## 4. Architecture recommandée

**Aujourd'hui (construit)**
```
Lien collé → reconnaissance (navigateur + serveur, identifiant de 11 caractères)
  → infos officielles oEmbed (titre, chaîne, miniature) → « Qui a publié cette vidéo ? »
     ├─ Moi → bouton « Ouvrir dans YouTube Studio » (page exacte de la vidéo) → ⋮ Télécharger
     │        → dépôt du fichier → projet nommé avec le titre YouTube → pipeline existant
     └─ Un autre créateur → lien Google Drive / Dropbox (import existant, testé en réel) → pipeline existant
```

**Demain (après validation de Google) : « Connecter ma chaîne YouTube »**
```
OAuth Google (portées youtube.public_videos + unlisted_videos, accès « une fois ») → portabilityArchive.initiate
  → job worker « youtube_archive » : interroge l'état toutes les 5 à 60 min → liens signés Google Cloud Storage
  → téléchargement en flux vers R2 (sans tout garder en mémoire) → extraction de la vidéo choisie
  → source_videos « uploaded » → enqueue_probe_job → pipeline existant (aucun 2e pipeline)
  → archive temporaire supprimée + resetAuthorization
```
- Réutilise la file de jobs, le stockage R2, la vérification (probe), les quotas et la génération.
- Limites à annoncer honnêtement : tes propres vidéos seulement, Europe et Royaume-Uni, 18 ans minimum, de quelques
  minutes à quelques jours d'attente, et **toute la chaîne exportée à chaque fois**. Une chaîne de 300 vidéos peut
  peser des centaines de Go : il faudra une taille maximale et une file d'attente, et faire payer le stockage
  temporaire.
- Jetons OAuth : chiffrés au repos (exigence de Google), jamais envoyés au navigateur.

## 5. Ce qu'il faut obtenir (rien n'a été souscrit)

| Étape | Qui | Coût | Délai |
|---|---|---|---|
| Projet Google Cloud + activation de la Data Portability API | Toi (je te guide) | Gratuit, mais Google exige d'**activer la facturation** (une carte bancaire). Aucun tarif public trouvé pour cette API : à vérifier dans la console **avant** de valider quoi que ce soit | 30 min |
| Écran de consentement OAuth + page « Limited Use » sur clipera.fr | Moi | Gratuit | 1 jour |
| Vérification de l'application par Google (portées « sensibles ») : identité, politique de confidentialité, vidéo de démo | Toi + moi | Gratuit | Quelques jours à quelques semaines (estimation) |
| *(Facultatif)* Vidéos **privées** : portée restreinte → audit CASA | Laboratoire agréé | Payant, chaque année. Ordre de grandeur selon des sources tierces : quelques centaines à plusieurs milliers d'euros (**non vérifié**) | Plusieurs semaines |
| *(Facultatif)* Accord écrit de YouTube pour les liens de n'importe quelle vidéo | YouTube | Inconnu | Inconnu, aucune garantie |
| Clé YouTube Data API (afficher la durée avant l'envoi) | Toi | Gratuit | 10 min |

Prérequis déjà notés ailleurs : **une adresse e-mail de contact**. Google l'exige aussi pour la vérification.

## 6. Modifications effectuées (branche `import-youtube`)

**Site**
- `src/lib/youtube-url.ts` (nouveau) :
  - reconnaît `watch`, `youtu.be`, `shorts`, `live`, `embed`, `m.`, `music.` et `nocookie` ;
  - refuse les playlists, les chaînes, les autres sites et les liens trop longs, avec des messages clairs.
- `src/lib/youtube-meta.ts` (nouveau) : infos via oEmbed.
  - adresse fixe reconstruite depuis l'identifiant (pas de SSRF), redirections refusées, délai de 6 s, réponse
    limitée à 64 Ko ;
  - miniature reconstruite (jamais l'adresse renvoyée telle quelle).
- `src/app/api/youtube/lookup/route.ts` (nouveau) : réservé aux comptes connectés, journal sans donnée personnelle.
- `src/components/app/youtube-import.tsx` (nouveau) : l'écran complet.
  - titre et texte demandés, champ, bouton « Générer mes clips » ;
  - barre de progression en 3 étapes ;
  - miniature, titre et chaîne ;
  - erreurs et « Réessayer » ;
  - vidéo privée, choix « Moi / un autre créateur », lien direct vers YouTube Studio ;
  - « Pourquoi cette étape ? ».
- `src/components/app/import-tabs.tsx` (nouveau) : onglets YouTube / Fichier / Lien. YouTube est ouvert par défaut.
- `src/components/app/uploader.tsx` : le projet reprend le titre YouTube ; libellé du bouton personnalisable.
- `link-import.tsx` et `nouveau/actions.ts` : un lien YouTube collé au mauvais endroit renvoie vers l'onglet
  YouTube. Le réglage `YOUTUBE_IMPORT_ENABLED` est supprimé.

**Serveur de clips (worker)**
- Suppression de `media/youtube.py`, de yt-dlp et de Deno (dépendances, Dockerfile).
- Un job YouTube (ancien job, ou appel direct à la base) est **refusé sans aucun téléchargement**, avec un message
  qui oriente vers YouTube Studio.

**Base de données** : aucune migration. Aucune donnée supprimée. Stripe, abonnements et quotas : inchangés.

## 7. Tests réellement exécutés

**Infos publiques de la vidéo** (distinctes de la récupération du fichier)

| Test | Résultat |
|---|---|
| Reconnaissance des liens : 13 formats valides, 17 cas refusés, lien de 3 000 caractères | ✅ 3/3 |
| **Réel YouTube** : vidéo publique → « Me at the zoo », « jawed », miniature chargée (200) | ✅ |
| **Réel YouTube** : identifiant inexistant ou supprimé → « introuvable » (HTTP 400) | ✅ |
| Simulés : privée (401/403), 404, panne (500/429), réseau coupé, réponse invalide, réponse trop grosse, miniature malveillante, identifiant piégé (aucun appel réseau), adresse appelée et redirections refusées | ✅ 6/6 |

**Navigateur réel** (`e2e/youtube-import.e2e.cjs`, vraie base Supabase, faux stockage local) : ✅ **13/13**
- textes demandés, onglet par défaut ;
- lien incorrect, playlist et chaîne refusés ;
- vidéo supprimée ;
- coupure réseau puis « Réessayer » ;
- vidéo publique réelle ;
- « autre créateur » ;
- lien YouTube Studio exact (nouvel onglet) ;
- **fichier envoyé → projet créé avec le titre « Me at the zoo »** (vérifié en base : fichier `Me at the zoo.mp4`,
  5,8 Mo, statut « uploaded ») ;
- vidéo privée ;
- YouTube indisponible ;
- **5 liens dangereux refusés (SSRF)** ;
- visiteur non connecté → 401 ;
- mobile sans défilement horizontal.

**Serveur de clips** : ✅ 219 tests réussis, 1 ignoré. Dont : un job YouTube est refusé sans téléchargement, et
yt-dlp n'est plus installé.

**Vérifications de code** : TypeScript, linter et build de production ✅.

Le compte de test a été supprimé. Sa vérification avait échoué, comme prévu : le fichier n'existait que dans le faux
stockage local.

**Non testé, honnêtement :**
- une vraie vidéo privée YouTube (le comportement suit la documentation, et il est testé en simulation) ;
- le téléchargement depuis YouTube Studio lui-même (il se fait chez YouTube, sur le compte du créateur) ;
- la Data Portability API (elle demande un projet Google Cloud) ;
- **aucun import YouTube « automatique » n'a été réalisé**, puisque ce n'est pas autorisé.

## 8. Limites restantes

- Le créateur doit faire 1 clic dans YouTube Studio, et **sur ordinateur** : l'application mobile Studio ne propose
  pas le téléchargement.
- La durée de la vidéo n'est pas connue avant l'envoi : il faudrait une clé YouTube Data API, gratuite. La
  vérification habituelle la contrôle après l'envoi.
- Vidéos d'autres créateurs : il faut leur fichier ou leur lien Drive. C'est le fonctionnement normal des campagnes
  de clipping.

## 9. Prochaines étapes, par ordre d'importance

1. **Valider et mettre en ligne cette branche**, avec ton accord. Le serveur de clips se met à jour seul sur Railway
   quand la branche est fusionnée.
2. Créer le projet Google Cloud, puis lancer la vérification de l'application pour la Data Portability API (portées
   publiques et non répertoriées). Il faut d'abord **une adresse e-mail de contact** et vérifier le coût de
   l'activation de la facturation.
3. Construire « Connecter ma chaîne YouTube » (architecture du point 4) dès que Google valide.
4. Clé YouTube Data API gratuite, pour afficher la durée et refuser une vidéo trop longue avant l'envoi.
5. Google Drive Picker : choisir sa vidéo dans son Drive sans créer de lien public.
