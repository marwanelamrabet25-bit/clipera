# Rapport — Expérience digitale Clipera 2027 (24/11/2026)

Branche **`experience-2027`**. **Rien n'est en ligne** : la mise en production attend ta validation.
Retour arrière : la branche `main` est intacte.

## 1. Audit initial (site en ligne, captures dans `docs/captures-2027/`)
- **Accueil** (refonte de la veille) :
  - points forts : un vrai récit en chapitres, une démonstration interactive du moteur, des tarifs exacts ;
  - points faibles : tout le site était sombre (aucun rythme), le hero n'avait pas de vrai « visuel produit »,
    et les fonctionnalités étaient présentées en schémas.
- **Bug réel** : à **768 px (tablette), toutes les pages débordaient de 35 px** (navigation trop large).
- **Connexion et inscription** : un petit formulaire seul au centre, sans aucune présence de la marque.
- **Pages solutions et blog** : des cartes numérotées identiques empilées, un halo violet flou. Effet « gabarit ».
- **Contenu périmé** : « Jusqu'à 5 clips par vidéo » sur la page Générateur, alors que c'est 10 avec les offres
  payantes.
- **Tarifs** : logique déjà correcte (prix mensuel, total annuel, équivalent mensuel, économie, montant débité en
  une seule fois). Je l'ai conservée.

## 2. Analyse de Remakeit
Observée **visuellement**, en captures à 1440, 1024, 768 et 390 px, images et vidéos comprises. Accès ouvert avec ton
accord : remakeit.io et leur serveur de médias. Les références complémentaires (Linear, Stripe, OpusClip…) n'ont
**pas** été consultées visuellement, faute d'accès : je ne prétends donc pas les avoir analysées.

| Ce qui fonctionne chez eux | Ce que j'en retiens pour Clipera |
|---|---|
| Hero lisible en 1 seconde : grand titre à gauche, téléphone avec un vrai clip à droite | Hero en deux parties, avec un visuel qui **montre la transformation** (vidéo longue → clips) |
| Alternance de sections sombres et claires : du rythme, le contenu ressort | Une surface « papier » (#F8F9FF, couleur officielle) pour 2 sections clés |
| Grande capture du produit sur un halo violet | Démonstration interactive du moteur, signalée comme telle |
| Onglets pour explorer les fonctionnalités | Onglets accessibles au clavier, avec une mise en scène différente par fonctionnalité |

| Ce qui fonctionne moins | Ce que Clipera fait autrement |
|---|---|
| Chiffres invérifiables (« 1M+ créateurs » à côté de « +50k utilisateurs actifs »), témoignages | Aucun chiffre ni avis inventé ; un seul temps, mesuré sur un vrai traitement |
| Rendus 3D décoratifs (sablier, pièces), promesse « argent » | Visuels qui montrent le produit et ses règles, promesse factuelle |
| Le hero repose sur un champ d'URL YouTube | Hors sujet ici (import YouTube exclu) : le parcours mène à l'inscription |
| Polices et graisses mélangées | Une seule police (Inter), hiérarchie par la taille et la graisse |

## 3. Principes créatifs retenus
**Le monteur précis** : calme, exact, honnête. Le produit est le personnage principal.
1. **Le cadre 9:16** : téléphones et cadres de recadrage, partout où l'on parle du résultat.
2. **La timeline** : sections numérotées comme des chapitres, avec leur timecode (« 03 · 05:10 · Le moteur »),
   et une frise graduée en pied de page.
3. **La tête de lecture violette** : le violet ne marque que ce qui est sélectionné et les actions principales.
4. **Le rythme noir et papier** : du sombre pour l'immersion, du papier pour la clarté (le résultat, le
   fonctionnement).

## 4. Identité visuelle (jetons de design dans `globals.css`)
- Couleurs officielles inchangées.
  - `primary-strong` #7C4EF0 : boutons à texte blanc, contraste 5:1.
  - `subtle` #80809A : texte secondaire, 4,9:1.
- **Thème `.theme-paper`** : une section entière passe en clair sans réécrire ses composants. Contraste vérifié à
  5,2:1 au minimum.
- Mouvement : `ease-out-soft` et `ease-in-out-soft`. Animations : mots des sous-titres, tête de lecture,
  apparitions au défilement. Toutes coupées si « réduire les animations » est activé.

## 5. Pages concernées
Accueil, tarifs, les 5 pages solutions (gabarit commun), blog et articles (gabarit commun), connexion, inscription,
pages légales (en-tête et pied de page). Aucune page supprimée, aucune page vide créée.

## 6. Sections reconstruites (accueil, 10 sections)
1. **Hero** : « Une vidéo longue. Jusqu'à 10 clips prêts à publier. »
   - À droite, la vidéo source et sa frise : une tête de lecture la parcourt, 3 passages sont repérés et
     deviennent 3 téléphones aux sous-titres animés.
   - Signalé « Démonstration ».
2. **01 Le résultat** (papier) : un clip annoté comme une fiche technique, avec 6 règles réelles du rendu.
3. **02 À la main ou avec Clipera** : comparaison honnête en 6 étapes, avec le temps mesuré sur un vrai
   traitement.
4. **03 Le moteur** : la démonstration interactive (Auto, 3, 5, 7, 10), les 4 règles, et un exemple de passages
   retenus et écartés.
5. **04 Fonctionnalités** : 5 onglets, chacun avec sa propre composition : sous-titres (4 styles sur téléphone),
   cadrage (3 modes), formats (9:16, 1:1, 16:9), note expliquée, export (MP4 et ZIP).
6. **05 Fonctionnement** (papier) : 3 étapes sur une frise, avec de vrais éléments d'interface, puis l'appel à
   l'action.
7. **06 Pour qui** : podcasteurs, YouTube, formateurs, interviews, agences et campagnes de clipping, chacun avec
   un lien vers sa page.
8. **07 Tarifs** : les 4 offres réelles, la réassurance et le lien vers le comparatif détaillé.
9. **08 FAQ** : 11 objections, avec le titre qui reste visible au défilement.
10. **Fin** : un dernier appel à l'action, puis le pied de page.

## 7. Copywriting
- Titres courts et concrets : « Voilà ce que tu télécharges. », « Une heure à réécouter pour en garder trois
  minutes. », « Le bon visage au centre. », « Des fichiers, pas un abonnement à une plateforme. »
- Cinq pistes de titre principal évaluées :
  - « Une vidéo longue. Jusqu'à 10 clips prêts à publier. » : **retenue**, c'est la plus claire, chiffrée et honnête ;
  - « Ta vidéo longue cache déjà tes prochains clips. » : réutilisée pour la fin ;
  - « Une heure de vidéo. Dix clips à publier. » : écartée, car 10 clips ne valent que pour les offres payantes ;
  - « Coupe moins. Publie plus. » : écartée, trop vague ;
  - « Tes meilleurs moments, découpés, cadrés, sous-titrés. » : écartée, descriptive mais peu mémorable.
- **Plus aucune promesse d'import par lien YouTube**. Une seule mention reste, honnête : télécharger son fichier
  depuis YouTube Studio puis l'importer. Un test le vérifie.
- Corrigé : « Jusqu'à 5 clips » devient « Jusqu'à 10 clips avec les offres payantes (5 en gratuit) ».

## 8. Composants développés
- `landing/clip-scene.tsx` : image de démonstration d'un clip (plateau de podcast, silhouettes, sous-titres mot
  à mot) et cadre de téléphone.
- `landing/hero-visual.tsx`, `landing/result-spec.tsx`, `landing/feature-tabs.tsx`.
- `landing/waveform.tsx` : l'onde sonore en un seul tracé SVG.
- `marketing/mobile-menu.tsx`.
- Refaits : `marketing/site-header.tsx`, `legal/site-footer.tsx`, `connexion/auth-shell.tsx`,
  `marketing/content-page.tsx`, `pricing/pricing-table.tsx` (carrousel mobile).

## 9. Ordinateur
- Hero en deux colonnes.
- Rythme noir et papier.
- Navigation complète **à partir de 1024 px**, ce qui corrige le débordement en tablette.
- FAQ dont le titre reste visible au défilement.
- Pages solutions : en-tête éditorial et étapes sur une frise.
- Tarifs : en-tête éditorial.

## 10. Mobile
- Menu repliable, fermé par Échap ou en choisissant un lien.
- Bouton « Essayer » toujours visible.
- Hero recomposé : texte, puis visuel.
- **Tarifs en carrousel à faire glisser**, au lieu de 4 cartes empilées.
- Annotations du résultat en liste.
- Onglets défilants, avec un fondu qui indique la suite.
- Connexion : formulaire seul, plein écran.

## 11. SEO
- Un seul H1 par page.
- Ordre des titres corrigé sur les tarifs.
- Données structurées : Organization, WebSite, SoftwareApplication et FAQPage.
- Adresses canoniques inchangées, maillage vers les 5 pages solutions et le blog conservé.
- La connexion reste volontairement hors de Google : c'est la seule « alerte SEO » de Lighthouse.

## 12. Tests réalisés (en local, version de production)
| Test | Résultat |
|---|---|
| 9 pages × 4 largeurs (1440, 1024, 768, 390) : débordement et erreurs JavaScript | ✅ aucun |
| Accueil : SEO, liens internes, ancres, appels à l'action, démonstration, FAQ, tarifs réels, mobile, animations réduites | ✅ 11/11 |
| Menu mobile, onglets au clavier, tarifs annuels exacts (8,33 €/mois → 99,90 €/an, etc.), démonstrations signalées, aucune promesse YouTube, formulaire de connexion intact | ✅ 7/7 |
| Lighthouse accueil | mobile 91 / 100 / 100 / 100 · ordinateur 100 / 100 / 100 / 100 |
| Lighthouse tarifs | mobile 94 / 100 / 100 / 100 · ordinateur 100 partout |
| Lighthouse connexion | 100 en accessibilité ; SEO 66, volontaire (page exclue de Google) |
| TypeScript, linter, build de production | ✅ |

**Non testé** : un vrai paiement (interdit), les vrais iPhone et Android (l'émulation iPhone 13 de Chromium a
servi), et Safari.

## 13. Problèmes restants
- **Pas de vraies images de clips** : toutes les scènes sont des illustrations, honnêtement signalées. C'est la
  principale limite de la présentation du produit.
- Performance mobile à 91 : le plus gros élément affiché est le titre, à 3,0 s sur une connexion 4G simulée et
  lente.
- Pages légales et blog : je n'ai harmonisé que l'en-tête et le pied de page.

## 14. Fichiers modifiés
- **Pages** : `app/page.tsx`, `app/tarifs/page.tsx`, `app/connexion/auth-shell.tsx`, `app/globals.css`.
- **Composants** : `components/landing/*` (clip-scene, hero-visual, result-spec, feature-tabs et waveform sont
  nouveaux ; craft est allégé), `components/marketing/site-header.tsx`, `mobile-menu.tsx` (nouveau),
  `content-page.tsx`, `components/legal/site-footer.tsx`, `components/pricing/pricing-table.tsx`.
- **Contenu** : `content/solutions.ts`.
- **Tests** : `e2e/experience.e2e.cjs` (nouveau).

Rien n'a été modifié côté abonnements, Stripe, quotas, base de données, authentification, import YouTube ou
traitement vidéo.

## 15. Captures avant/après
Dans `docs/captures-2027/` : accueil à 1440 et 390 px, connexion, tarifs, générateur.

## Auto-évaluation (barème du brief, pas une certification)
| Critère | Note | Justification |
|---|---|---|
| Direction artistique | 17/20 | Signatures reconnaissables (cadre 9:16, chapitres et timecodes, tête de lecture, rythme noir et papier). Limitée par l'absence de vraies images |
| Hero | 13/15 | Message compris en une phrase, visuel qui raconte la transformation, deux appels à l'action utiles. Il manque un vrai clip |
| Présentation produit | 12/15 | Démonstration interactive, fiche « résultat », 5 mises en scène. Tout est illustré, rien n'est filmé |
| UX et parcours | 9/10 | Découverte → résultat → comparaison → moteur → fonctionnalités → étapes → tarifs → objections → action |
| Copywriting | 9/10 | Concret, sans promesse exagérée, objections traitées |
| Responsive | 9/10 | Recomposé pour chaque format, zéro débordement sur 36 combinaisons de pages et de largeurs |
| Cohérence de marque | 5/5 | Une police, palette officielle, violet maîtrisé |
| Performance et accessibilité | 9/10 | Accessibilité 100 partout ; performance mobile 91 |
| Qualité technique | 5/5 | Composants réutilisables, aucune dépendance ajoutée, tests automatisés |
| **Total** | **88/100** | Sous les 90 visés : l'écart vient des images, pas de l'exécution (voir ci-dessous) |

**Pour dépasser 90** : remplacer les illustrations par 3 ou 4 **vrais clips générés par Clipera** à partir de
vidéos dont tu as les droits, en vidéo courte et légère, sans lecture automatique sur mobile. Trois passes de
critique ont été faites sur le code et la mise en page ; la marge restante tient à ce contenu, que je ne peux pas
fabriquer honnêtement.
