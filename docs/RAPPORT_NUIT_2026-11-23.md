# Rapport de la mission de nuit — 23 novembre 2026

Tout le travail est sur la branche **`amelioration-nuit`** (6 commits, 21 fichiers). **Rien n'a été mis en production** :
ni le site, ni la base, ni le serveur des clips.

## A. État initial

**Bugs réels trouvés**
1. 🔴 **Liens de clips qui expirent au bout d'une heure** : sur une page restée ouverte, l'aperçu et le bouton « Télécharger » ne marchaient plus.
2. 🔴 **Tableau de bord** : la carte « Derniers clips » affichait toujours « Aucun clip », même avec 11 clips. Les derniers projets n'étaient pas cliquables.
3. 🟠 **Quota épuisé** : aucun lien vers les offres (vente perdue au pire moment).
4. 🟠 **Messages obsolètes** : « pendant l'accès anticipé ».
5. 🟠 **« Mot de passe oublié »** introuvable : la solution existait, mais elle était cachée sous un autre libellé.
6. 🟠 **Impossible de supprimer un projet** : seule la suppression du compte entier effaçait une vidéo.
7. 🟡 **Menu mobile** : « Abonnement » et « Parrainage » étaient invisibles sans faire défiler, et rien ne l'indiquait.

**Journaux de production (7 jours)**
- Plus de 500 erreurs « Date.now() » sur l'espace client, **déjà corrigées le 22/11** (aucune depuis).
- ⚠️ **Un vrai utilisateur a essayé de payer Starter le 22/11 à 12h19**, pendant la bascule Stripe (prix réels en base, clé encore en test). Son paiement a échoué. **À recontacter** : Supabase → Authentication → Users, identifiant commençant par `c6a37ee0`.
- Erreurs de webhook liées aux comptes de test supprimés : sans conséquence.

**Contrôle Supabase** : aucune faille grave. Une fonction interne était exposée inutilement, 14 règles d'accès étaient lentes à grande échelle, et 4 index manquaient.

## B. Travail effectué

**Bugs corrigés**
- **Liens de clips permanents** : une nouvelle route serveur `/api/clips/[id]/[kind]` vérifie la session, lit le clip sous la RLS, puis redirige vers un lien signé tout neuf. Les pages projet et Bibliothèque se chargent aussi plus vite (plus de signature au rendu).
- **Tableau de bord réparé** : vrais derniers clips (miniatures), projets cliquables avec leur statut.
- **Messages « accès anticipé »** remplacés.

**Nouveautés**
- **Guide « Bien démarrer »** (3 étapes cochées automatiquement) pour les nouveaux inscrits, tant qu'ils n'ont aucun clip.
- **Liens vers les offres** quand le quota est épuisé : tableau de bord, nouveau projet, génération refusée.
- **Suppression d'un projet** : confirmation en deux temps, refus pendant un traitement, quota consommé non rendu (anti-abus). Les fichiers sont effacés en premier : si cet effacement échoue, rien n'est supprimé.
- **Bibliothèque** : bouton de téléchargement direct sur chaque clip, et état vide avec bouton d'action.
- **Connexion** : « Mot de passe oublié ? » visible, avec un rappel pour changer le mot de passe dans Paramètres.
- **Menu mobile** : fondu sur le bord, et l'onglet courant toujours visible.
- **Encart parrainage** sur le tableau de bord.

**Technique et sécurité**
- Migration **non destructive** `20261123000100` : règles d'accès optimisées (mêmes conditions), 4 index, fonction interne fermée.
- Migration `20261123000200` : fonction `delete_my_project`.
- Code d'effacement du stockage partagé (`lib/storage-admin.ts`).
- Revue des 9 routes API : toutes vérifient l'identité. Seules des variables publiques sont exposées au navigateur.

**Vérifié et laissé tel quel (déjà bon)**
- **Sous-titres** : mesurés sur une vraie transcription, aucune ligne n'est affichée moins de 0,8 s.
- **Envoi de fichiers** : nouveaux essais automatiques, avertissement avant de quitter la page, annulation propre.

## C. Résultats des tests

| Test | Résultat |
|---|---|
| TypeScript + linter | ✅ |
| Build de production | ✅ |
| Serveur vidéo (worker) | ✅ 233 réussis, 1 ignoré |
| Base de données | ✅ 89/89 (dont 2 nouveaux : suppression de projet) |
| Import + génération avec la nouvelle migration | ✅ 24/24 |
| Navigateur : tableau de bord, liens, sécurité, bibliothèque, mobile | ✅ 10/10 |
| Navigateur : tarifs et récapitulatif | ✅ 11/11 |
| Navigateur : suppression (confirmation, annulation, « rien n'est supprimé si échec ») | ✅ 2/2 |

**Non testé, honnêtement :**
- La suppression complète d'un vrai projet : il faut d'abord appliquer la migration en production.
- L'affichage réel des miniatures et des vidéos : en local, le stockage était factice.
- Un vrai paiement complet, avec le crédit de parrainage versé.
- L'envoi d'une vraie vidéo et le traitement de bout en bout sur Railway pendant cette session.

Les comptes de test créés pour ces vérifications ont été supprimés.

## D. Fichiers modifiés (principaux)

- `apps/web/src/app/api/clips/[id]/[kind]/route.ts` (nouveau)
- `apps/web/src/lib/clips.ts`
- `apps/web/src/app/app/page.tsx` (tableau de bord)
- `apps/web/src/app/app/projets/[id]/page.tsx`, `actions.ts` et `delete-project.tsx` (nouveau)
- `apps/web/src/app/app/projets/page.tsx`, `bibliotheque/page.tsx`, `nouveau/page.tsx`
- `apps/web/src/components/app/generate-form.tsx`, `sidebar.tsx`
- `apps/web/src/app/connexion/*`, `apps/web/src/lib/storage-admin.ts` (nouveau), `app/api/account/delete/route.ts`
- `supabase/migrations/20261123000100_rls_perf_and_hardening.sql` et `20261123000200_delete_project.sql` (nouveaux)
- Tests : `supabase/tests/test_database.py`, `apps/web/e2e/night.e2e.cjs` (nouveau), `apps/web/e2e/auth.e2e.cjs`

## E. Points restants

- **Adresse e-mail de contact** : obligatoire. Les CGV affichent encore « à compléter ».
- **Hébergement du serveur des clips** : l'essai Railway se termine vers le 21/12.
- **Protection des mots de passe compromis** (Supabase) : réglage désactivé. Il n'est peut-être disponible qu'avec une offre payante de Supabase, à vérifier.
- **Idées utiles, non faites cette nuit** car trop lourdes ou risquées :
  - suppression des silences dans les clips ;
  - correction d'un clip sans relancer toute l'analyse ;
  - e-mail « tes clips sont prêts » (demande un service d'envoi d'e-mails).

## F. Bilan

**Ce qui est réellement meilleur**
- Les clips restent téléchargeables à tout moment.
- Le tableau de bord montre enfin les clips.
- Les nouveaux inscrits sont guidés vers leur premier clip.
- Les clients bloqués par leur quota voient les offres.
- Ils peuvent supprimer leurs projets.
- La base est plus rapide à grande échelle et un peu mieux protégée.

**Pour mettre en ligne (dans cet ordre)**
1. Appliquer les 2 migrations sur Supabase.
2. Fusionner la branche `amelioration-nuit` dans `main`.
3. Redéployer le site sur Vercel.

**Les 3 prochaines améliorations les plus importantes**
1. Héberger durablement le serveur des clips, avant le 21/12.
2. Une adresse e-mail de contact, plus un e-mail automatique « tes clips sont prêts ».
3. La suppression des silences dans les clips, pour un rythme plus pro.
