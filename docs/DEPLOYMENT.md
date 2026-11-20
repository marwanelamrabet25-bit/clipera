# CLIPERA — Déploiement

## Application web — Vercel
| Élément | Valeur |
|---|---|
| Équipe | `clipera1` |
| Projet | `clipera` (`prj_Vwvvl9ww723VfvBWFARL9vmpZLmr`) |
| Dépôt | `marwanelamrabet25-bit/clipera`, branche `main` |
| Dossier | `apps/web` (Next.js) |
| Région des fonctions | `cdg1` (Paris), proche de Supabase `eu-west-3` (réglage `functionDefaultRegions`) |
| Node.js | 22.x |
| Adresse de production | https://clipera-clipera1.vercel.app |
| Offre | Hobby (gratuite) — **interdit l'usage commercial** : passer en Pro avant de vendre |

Variables (publiques, non secrètes) : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
`NEXT_PUBLIC_SITE_URL` = `https://clipera-clipera1.vercel.app` (production) — à changer avec le nom de domaine définitif.
Elle sert d'adresse de retour des liens de connexion : elle doit aussi figurer dans les *Redirect URLs* de Supabase.

Protection : les adresses `*.vercel.app` sont réservées aux membres de l'équipe Vercel (Vercel Authentication).
À ouvrir au public au lancement, avec un nom de domaine.

Mise à jour : chaque envoi sur `main` redéploie automatiquement la production (une fois le dépôt relié dans
*Settings → Git*).

## Base de données — Supabase
Projet `clipera-dev` (`bxejlqxvrgmbaganxxqb`), Paris. Migrations : `supabase/migrations/`.
Réglages Auth à faire dans le tableau de bord : voir SETUP_ACCOUNTS.md §2b.

## Worker vidéo
Pas encore déployé (nécessite R2 et le service de transcription). Image : `apps/worker/Dockerfile`.
