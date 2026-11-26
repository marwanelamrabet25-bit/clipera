# Checklists de publication

Aucun de ces outils n'est configuré à ce jour : ces listes décrivent ce qu'il reste à faire.

## 1. Avant la mise en ligne

### Contenus et informations
- [ ] Relire tous les textes (accueil, services, à propos, FAQ, articles) et valider chaque formulation.
- [ ] Compléter `src/config/legal.ts` : identité de l'exploitant, statut, SIREN/SIRET, immatriculation, TVA, adresse, directeur de publication, hébergeur, date de mise à jour.
- [ ] Compléter dans la politique de confidentialité : prestataires (hébergeur, envoi d'emails) et durée de conservation retenue.
- [ ] Confirmer le code postal (25510) dans `src/config/site.ts`.
- [ ] Renseigner les URL des réseaux sociaux (Instagram, Facebook, TikTok) dans `src/config/site.ts`, ou les laisser vides.
- [ ] Valider la grille tarifaire (`src/config/offers.ts`) : mention TVA (`vatNote`), quantités réseaux sociaux, conditions d'engagement, statut de WEBPRO CARE.
- [ ] Rédiger les conditions générales de vente.
- [ ] Définir le processus de traitement des demandes de maquette gratuite.
- [ ] Valider l'engagement du formulaire (« ni cédées ni utilisées à d'autres fins »).
- [ ] Fournir le logo en SVG si disponible et remplacer les fichiers de `public/brand/`.

### Technique
- [ ] Acheter / choisir le nom de domaine ; définir `NEXT_PUBLIC_SITE_URL`.
- [ ] Configurer Resend (domaine vérifié) et les variables `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` (et `LEADS_WEBHOOK_URL` si un tableur ou CRM est utilisé).
- [ ] Envoyer une demande de test réelle depuis **chaque** formulaire (contact, maquette gratuite) et vérifier la réception (et la réponse via « Répondre »).
- [ ] Déployer, vérifier HTTPS et la redirection www / sans www vers une seule adresse.
- [ ] Vérifier `https://domaine/robots.txt` (doit autoriser l'indexation en production) et `https://domaine/sitemap.xml` (URLs avec le bon domaine).
- [ ] Lancer `scripts/qa.mjs` et `scripts/e2e.cjs` sur l'URL de production.
- [ ] Tester sur un vrai iPhone et un vrai Android (menu, formulaire, appel en un toucher).
- [ ] Tester l'aperçu de partage d'une page (envoi du lien dans une messagerie).
- [ ] Contrôler les données structurées avec l'outil de test des résultats enrichis de Google et le validateur schema.org.

## 2. Google Search Console
- [ ] Se connecter sur search.google.com/search-console avec le compte Google de l'agence.
- [ ] Ajouter une propriété **Domaine** (validation par enregistrement DNS TXT chez le registrar) — recommandé, couvre http/https et www.
- [ ] Envoyer le sitemap : `https://domaine/sitemap.xml`.
- [ ] Inspecter l'URL de l'accueil et demander l'indexation ; idem pour les deux pages services, `/tarifs` et `/maquette-gratuite`.
- [ ] Vérifier après quelques jours : pages indexées, ergonomie mobile, Core Web Vitals, absence d'erreurs.
- [ ] Ajouter un second utilisateur propriétaire (sécurité d'accès).
- [ ] Suivi mensuel : rapport « Performances » filtré sur les requêtes contenant « Doubs », « Pierrefontaine », les noms des bassins ; repérer les pages en position 8–20 à enrichir.
- [ ] Bing Webmaster Tools : importer la propriété depuis Search Console, envoyer le même sitemap.

## 3. Google Business Profile (fiche d'établissement)
> Important : si l'agence travaille depuis une adresse privée et **ne reçoit pas de clients** à cette adresse, il faut créer la fiche comme **établissement de zone de service** et **masquer l'adresse**. Ne jamais publier une fausse vitrine, une adresse fictive ou une domiciliation non autorisée par les règles de Google (voir l'aide « Règles concernant la représentation de votre établissement »).

- [ ] Vérifier l'éligibilité selon les règles Google en vigueur au moment de la création.
- [ ] Créer la fiche sur business.google.com avec le nom exact « WEBPRO AGENCY » (sans ajouter de mots-clés au nom).
- [ ] Catégorie principale pertinente (par ex. « Concepteur de sites Web » ou « Agence de marketing » selon la liste proposée), catégories secondaires seulement si justifiées.
- [ ] Zone desservie : le Doubs et/ou les principales communes (sans limiter artificiellement).
- [ ] Téléphone `07 68 35 50 56`, site internet, horaires réels (ou « sur rendez-vous »).
- [ ] Description fidèle (750 caractères max.), reprenant l'ancrage Pierrefontaine-les-Varans et le Doubs.
- [ ] Logo, photo de couverture, quelques visuels réels (pas d'exemples fictifs présentés comme des réalisations clients).
- [ ] Valider la fiche (procédure de validation imposée par Google).
- [ ] Demander des avis **uniquement** à de vrais clients, après une prestation ; répondre à chaque avis.
- [ ] Publier régulièrement des actualités sur la fiche (nouvelle réalisation, article de conseil).
- [ ] Vérifier que nom, téléphone et site sont strictement identiques sur le site, la fiche, les réseaux et les annuaires.

## 4. Après la mise en ligne (premier trimestre)
- [ ] Inscription dans quelques annuaires pertinents (Pages Jaunes, CCI, annuaires communaux / intercommunaux).
- [ ] Liens depuis les réseaux sociaux de l'agence vers le site.
- [ ] Première vraie réalisation publiée (avec accord écrit du client) : recréer alors une page réalisations.
- [ ] Bilan Search Console à 4 et 8 semaines : ajuster titles et contenus selon les requêtes réelles.
- [ ] Mettre à jour `docs/SEO-LOCAL.md` avec les données réelles (impressions, clics, requêtes).
