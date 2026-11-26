/**
 * ARTICLES (conseils)
 * Règle éditoriale : ne publier que des articles utiles, vérifiés et sourcés.
 * Pour ajouter un article : ajouter un objet ci-dessous (le sitemap et la page /blog se mettent à jour).
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "ul"; items: string[] }
  | { type: "note"; title: string; text: string }
  | { type: "table"; head: string[]; rows: string[][] };

export type Article = {
  slug: string;
  title: string;
  /** Title SEO (≤ 60 caractères avec le suffixe). */
  metaTitle: string;
  description: string;
  excerpt: string;
  published: string; // ISO
  updated?: string;
  readingMinutes: number;
  tags: string[];
  body: Block[];
  sources: { label: string; url: string }[];
  /** Pages du site liées (maillage interne). */
  related: { label: string; href: string }[];
};

export const articles: Article[] = [
  {
    slug: "visibilite-locale-google-entreprise-doubs",
    title: "Visibilité locale sur Google : les bases pour une entreprise du Doubs",
    metaTitle: "Visibilité locale sur Google : les bases",
    description:
      "Fiche d'établissement, cohérence des coordonnées, contenus, avis, vitesse : les leviers concrets pour être mieux trouvé sur Google par les clients du Doubs.",
    excerpt:
      "Quand un client cherche « menuisier près de chez moi », Google affiche une carte et quelques entreprises. Voici ce qui compte vraiment pour y apparaître.",
    published: "2026-11-26",
    readingMinutes: 6,
    tags: ["Référencement local", "Google"],
    body: [
      {
        type: "p",
        text: "Quand quelqu'un cherche « coiffeur Pontarlier », « menuisier près de chez moi » ou « restaurant Valdahon », Google affiche généralement une carte accompagnée de quelques entreprises, puis les résultats classiques. Pour une entreprise locale, apparaître dans ces résultats peut faire une vraie différence. Bonne nouvelle : plusieurs leviers sont entre vos mains.",
      },
      { type: "h2", id: "criteres", text: "Comment Google choisit les résultats locaux" },
      {
        type: "p",
        text: "Selon l'aide officielle de Google, les résultats locaux reposent principalement sur trois critères : la pertinence (votre fiche correspond-elle à ce que la personne cherche ?), la distance (à quelle distance êtes-vous du lieu de la recherche ?) et la notoriété (votre entreprise est-elle connue, citée, recommandée ?). Vous ne pouvez pas changer la distance, mais vous pouvez agir sur la pertinence et, avec le temps, sur la notoriété.",
      },
      { type: "h2", id: "fiche", text: "1. Créer et compléter sa fiche d'établissement Google" },
      {
        type: "p",
        text: "La fiche d'établissement (Google Business Profile) est gratuite. C'est elle qui apparaît sur la carte. Une fiche complète est plus facile à comprendre pour Google comme pour vos clients :",
      },
      {
        type: "ul",
        items: [
          "la bonne catégorie principale, puis des catégories secondaires si elles sont justifiées ;",
          "des horaires à jour, y compris les fermetures exceptionnelles ;",
          "une description claire de votre activité et de vos services ;",
          "des photos réelles : votre travail, vos produits, votre lieu, votre équipe ;",
          "le lien vers votre site internet.",
        ],
      },
      {
        type: "note",
        title: "Vous ne recevez pas de clients à votre adresse ?",
        text: "C'est souvent le cas des artisans qui se déplacent ou des activités exercées depuis le domicile. Google prévoit ce cas : vous pouvez masquer votre adresse et indiquer une zone desservie. N'inventez jamais d'adresse ou de local : c'est contraire aux règles de Google et cela peut entraîner la suspension de la fiche.",
      },
      { type: "h2", id: "coordonnees", text: "2. Garder des coordonnées identiques partout" },
      {
        type: "p",
        text: "Nom de l'entreprise, téléphone, adresse ou zone d'intervention : ces informations doivent être identiques sur votre site, votre fiche Google, vos réseaux sociaux et les annuaires où vous êtes inscrit. Des coordonnées contradictoires sèment le doute, chez les clients comme chez les moteurs de recherche.",
      },
      { type: "h2", id: "site", text: "3. Un site qui parle de votre métier… et de votre territoire" },
      {
        type: "p",
        text: "Votre site renforce la pertinence de votre entreprise. Une page claire pour chaque service, une explication de votre zone d'intervention, des réalisations présentées avec le lieu et le type de travaux : ce sont des contenus utiles pour vos visiteurs, et des indices précieux pour Google.",
      },
      {
        type: "p",
        text: "Inutile, en revanche, de répéter le nom de dizaines de communes ou de créer des pages identiques où seul le nom de la ville change : ces pratiques n'apportent rien au lecteur et sont considérées comme du contenu de faible qualité.",
      },
      { type: "h2", id: "avis", text: "4. Des avis authentiques, et des réponses" },
      {
        type: "p",
        text: "Les avis comptent dans la notoriété de votre entreprise. Le plus simple est de demander, après une prestation réussie, à vos clients satisfaits s'ils accepteraient de laisser un avis. Répondez aux avis, positifs comme négatifs, avec courtoisie : cela montre que l'entreprise est attentive.",
      },
      {
        type: "note",
        title: "À ne jamais faire",
        text: "Acheter des avis, en rédiger soi-même ou les échanger contre une remise. Les faux avis sont interdits par les règles de Google et constituent une pratique commerciale trompeuse au regard du droit de la consommation.",
      },
      { type: "h2", id: "technique", text: "5. Un site rapide et agréable sur téléphone" },
      {
        type: "p",
        text: "Une grande partie des recherches locales se font sur mobile, souvent au moment où la personne a besoin de vous. Un site lent ou difficile à lire sur petit écran fait fuir. Les « Core Web Vitals » de Google mesurent justement la vitesse d'affichage, la réactivité et la stabilité des pages.",
      },
      { type: "h2", id: "suivi", text: "6. Suivre ses résultats" },
      {
        type: "p",
        text: "Google Search Console, gratuite, indique les recherches pour lesquelles votre site apparaît, le nombre de clics et les éventuels problèmes techniques. Les statistiques de la fiche d'établissement montrent combien de personnes ont appelé, demandé l'itinéraire ou visité votre site. De quoi mesurer les progrès dans la durée.",
      },
      { type: "h2", id: "patience", text: "En résumé : de la méthode et de la patience" },
      {
        type: "p",
        text: "Le référencement local se construit dans le temps. Une fiche complète, des coordonnées cohérentes, un site utile, des avis authentiques et un suivi régulier : rien de spectaculaire, mais une base solide. Méfiez-vous de quiconque vous promet la première place en quelques jours.",
      },
    ],
    sources: [
      { label: "Aide Google — Améliorer votre classement local sur Google", url: "https://support.google.com/business/answer/7091" },
      { label: "Aide Google — Règles concernant la représentation de votre établissement", url: "https://support.google.com/business/answer/3038177" },
      { label: "Google Search Central — Core Web Vitals", url: "https://developers.google.com/search/docs/appearance/core-web-vitals" },
      { label: "Google Search Console", url: "https://search.google.com/search-console/about" },
    ],
    related: [
      { label: "Création de sites internet dans le Doubs", href: "/creation-site-web" },
      { label: "Nous contacter pour un audit de votre présence en ligne", href: "/contact" },
    ],
  },
  {
    slug: "site-internet-ou-reseaux-sociaux",
    title: "Site internet ou réseaux sociaux : faut-il choisir ?",
    metaTitle: "Site internet ou réseaux sociaux ?",
    description:
      "Une page Facebook ou Instagram suffit-elle pour une entreprise locale ? Forces, limites et complémentarité du site internet et des réseaux sociaux.",
    excerpt:
      "Beaucoup d'entreprises démarrent avec une page sur les réseaux sociaux. Est-ce suffisant ? Ce que chacun fait bien, et pourquoi ils fonctionnent mieux ensemble.",
    published: "2026-11-26",
    readingMinutes: 5,
    tags: ["Stratégie", "Réseaux sociaux"],
    body: [
      {
        type: "p",
        text: "Une page Facebook, un compte Instagram : pour beaucoup de commerçants, d'artisans et d'indépendants, c'est la première présence en ligne. C'est rapide, gratuit pour démarrer et cela permet de montrer son activité. Alors, faut-il vraiment un site internet en plus ? La réponse courte : les deux n'ont pas le même rôle.",
      },
      { type: "h2", id: "reseaux-forces", text: "Ce que les réseaux sociaux font bien" },
      {
        type: "ul",
        items: [
          "montrer que l'entreprise est active : nouveautés, coulisses, événements ;",
          "entretenir le lien avec des clients qui vous suivent déjà ;",
          "être partagé facilement, de bouche-à-oreille numérique ;",
          "tester des idées et réagir vite à l'actualité.",
        ],
      },
      { type: "h2", id: "reseaux-limites", text: "Leurs limites" },
      {
        type: "ul",
        items: [
          "la plateforme ne vous appartient pas : ses règles, son affichage et sa portée peuvent changer à tout moment ;",
          "vos publications sont rapidement noyées dans le fil d'actualité ;",
          "les informations durables (services, zone d'intervention, tarifs, mentions légales) y sont difficiles à structurer ;",
          "une partie de votre clientèle n'utilise pas ce réseau, ou pas du tout ;",
          "vos publications ne sont pas pensées pour apparaître dans une recherche Google du type « métier + ville ».",
        ],
      },
      { type: "h2", id: "site-apports", text: "Ce que le site internet apporte" },
      {
        type: "p",
        text: "Le site est votre espace : vous en maîtrisez le contenu, la présentation et l'adresse. Il rassemble les informations qu'un client cherche avant de vous contacter, il peut être trouvé sur Google pour vos services et votre secteur, et il renforce votre crédibilité. C'est aussi là que vous pouvez recevoir des demandes structurées, grâce à un formulaire.",
      },
      {
        type: "table",
        head: ["", "Site internet", "Réseaux sociaux"],
        rows: [
          ["Propriété", "Vous en êtes propriétaire", "Dépend de la plateforme"],
          ["Recherche Google", "Conçu pour être trouvé", "Visibilité limitée"],
          ["Informations durables", "Structurées et faciles à trouver", "Dispersées dans le fil"],
          ["Actualité, coulisses", "Possible, moins naturel", "Idéal"],
          ["Lien avec les clients", "Ponctuel (contact, devis)", "Régulier"],
        ],
      },
      { type: "h2", id: "complementarite", text: "La bonne réponse : chacun son rôle" },
      {
        type: "p",
        text: "Le site est la référence stable : il explique, rassure et convertit. Les réseaux sociaux sont la vitrine vivante : ils montrent, entretiennent le lien et renvoient vers le site quand un client veut aller plus loin. Utilisés ensemble, avec la même identité visuelle et le même ton, ils se renforcent.",
      },
      { type: "h2", id: "commencer", text: "Par où commencer ?" },
      {
        type: "p",
        text: "Tout dépend de votre activité et de votre temps disponible. Un artisan qui travaille surtout sur devis a souvent intérêt à commencer par un site clair, avec ses réalisations et un formulaire. Un commerce ou un restaurant, dont l'actualité change chaque semaine, tire beaucoup parti des réseaux sociaux, à condition de disposer aussi d'un site qui donne les informations pratiques. Dans tous les cas, mieux vaut une présence modeste mais soignée et à jour qu'une présence partout, abandonnée au bout de trois mois.",
      },
    ],
    sources: [],
    related: [
      { label: "Création de sites internet", href: "/creation-site-web" },
      { label: "Gestion des réseaux sociaux", href: "/gestion-reseaux-sociaux" },
    ],
  },
];

export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug);
