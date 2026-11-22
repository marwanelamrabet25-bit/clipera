import type { ContentSection } from "@/components/marketing/content-page";

/**
 * Articles du blog. Contenu de fond, sans chiffres invérifiables : les conseils s'appuient sur le fonctionnement
 * réel des plateformes et de Clipera. Mettre à jour `modified` à chaque révision.
 */
export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  published: string; // AAAA-MM-JJ
  modified: string;
  readingMinutes: number;
  intro: string[];
  sections: ContentSection[];
  related: string[];
};

const podcastMethod: BlogPost = {
  slug: "transformer-un-podcast-en-clips-methode",
  title: "Transformer un podcast en clips courts : la méthode complète",
  metaTitle: "Transformer un podcast en clips : la méthode complète",
  description:
    "Repérer les bons moments d'un épisode, les découper, les recadrer en vertical et les sous-titrer pour TikTok, Reels et Shorts : la méthode pas à pas.",
  published: "2026-11-22",
  modified: "2026-11-22",
  readingMinutes: 7,
  intro: [
    "Un épisode de podcast filmé d'une heure contient souvent plusieurs passages capables de faire découvrir ton émission à de nouvelles personnes. Encore faut-il les trouver, et les transformer en vidéos courtes qui donnent envie d'écouter la suite.",
    "Voici la méthode complète, étape par étape, que tu fasses tout à la main ou avec un outil comme Clipera.",
  ],
  sections: [
    {
      title: "1. Repérer les moments qui tiennent debout seuls",
      paragraphs: [
        "Un bon clip de podcast doit être compris par quelqu'un qui n'a jamais entendu parler de ton émission. C'est le critère le plus important, et le plus souvent oublié.",
        "Pendant l'écoute, note les passages qui contiennent au moins un de ces éléments :",
      ],
      list: [
        "une anecdote avec un début, un problème et une issue ;",
        "un conseil concret, applicable tout de suite ;",
        "une opinion tranchée ou contre-intuitive ;",
        "une question directe suivie d'une réponse franche ;",
        "un chiffre ou un fait surprenant, expliqué.",
      ],
    },
    {
      title: "2. Choisir le bon début et la bonne fin",
      paragraphs: [
        "Les premières secondes décident si la personne reste. Commence directement sur l'accroche : la question, l'affirmation forte, le début de l'histoire. Coupe les « alors », « du coup » et les phrases d'introduction qui ne servent qu'à l'épisode complet.",
        "La fin compte autant. Termine sur une phrase complète : une conclusion, une chute, une leçon. Un clip coupé au milieu d'une idée donne une impression de travail bâclé.",
        "Vise une durée d'environ 25 à 60 secondes. Plus long, le clip doit être vraiment captivant ; plus court, il manque souvent de contexte.",
      ],
    },
    {
      title: "3. Passer au format vertical sans couper les visages",
      paragraphs: [
        "La plupart des podcasts sont filmés en horizontal (16:9). Pour TikTok, Reels et Shorts, il faut passer en vertical (9:16), ce qui supprime plus de la moitié de la largeur de l'image.",
        "Garde dans le cadre la personne qui parle, la tête entière, et évite les mouvements de cadre trop fréquents : un cadre qui bouge sans arrêt fatigue. Si les deux invités doivent rester visibles, une alternative est de placer l'image entière au centre, sur un fond flouté.",
      ],
    },
    {
      title: "4. Ajouter des sous-titres lisibles",
      paragraphs: [
        "Beaucoup de personnes regardent les vidéos courtes sans le son, dans les transports ou au travail. Des sous-titres permettent de suivre dès la première seconde, et rendent ta vidéo accessible.",
        "Préfère des lignes courtes (quelques mots), un texte contrasté et une position au-dessus du bas de l'écran, qui est couvert par les boutons des applications. Relis-les : un nom propre mal écrit se remarque tout de suite.",
      ],
    },
    {
      title: "5. Soigner le son",
      paragraphs: [
        "Un clip trop faible ou qui sature est abandonné en quelques secondes. Harmonise le volume pour qu'il soit au niveau des autres vidéos des plateformes, et ajoute un très court fondu au début et à la fin pour éviter le « clic » de coupe.",
      ],
    },
    {
      title: "6. Publier et relier à l'épisode complet",
      paragraphs: [
        "Le clip est une porte d'entrée. Dans la description, indique le nom de l'émission et où écouter l'épisode complet. Publie régulièrement, et observe quels sujets retiennent le plus ton public pour orienter tes prochains épisodes.",
      ],
    },
    {
      title: "La méthode automatique avec Clipera",
      paragraphs: [
        "Faire tout cela à la main prend du temps pour chaque épisode. Clipera automatise les étapes 1 à 5 : il transcrit l'épisode, note chaque passage possible (accroche, cohérence, fin, énergie de la voix), recadre en vertical en suivant la personne qui parle, ajoute les sous-titres et harmonise le son.",
        "Tu gardes le dernier mot : tu regardes les clips proposés, leur note expliquée, et tu choisis ceux que tu publies. Si un épisode ne contient que deux vrais bons moments, Clipera t'en propose deux, pas dix.",
      ],
    },
  ],
  related: ["/transformer-podcast-en-clips", "/recadrage-vertical-automatique", "/sous-titres-automatiques"],
};

const captionsGuide: BlogPost = {
  slug: "sous-titres-videos-courtes-guide",
  title: "Sous-titres sur TikTok, Reels et Shorts : le guide pour des vidéos lisibles",
  metaTitle: "Sous-titres TikTok, Reels et Shorts : guide pratique",
  description:
    "Pourquoi sous-titrer tes vidéos courtes, quel style choisir, où placer le texte et quelles erreurs éviter : le guide des sous-titres lisibles sur mobile.",
  published: "2026-11-22",
  modified: "2026-11-22",
  readingMinutes: 6,
  intro: [
    "Les sous-titres sont devenus un réflexe sur les vidéos courtes. Bien faits, ils retiennent l'attention et rendent ta vidéo accessible. Mal faits, ils cachent l'image, arrivent en retard ou fourmillent de fautes.",
    "Voici les règles simples pour des sous-titres vraiment lisibles sur un téléphone.",
  ],
  sections: [
    {
      title: "Pourquoi sous-titrer ses vidéos courtes",
      list: [
        "Une partie importante du public regarde sans le son : sans sous-titres, ton message est perdu.",
        "Le texte aide à comprendre dès la première seconde, avant même que la personne n'active le son.",
        "Les personnes sourdes ou malentendantes peuvent suivre ta vidéo.",
        "Le texte affiché renforce les mots importants de ton propos.",
      ],
    },
    {
      title: "Des lignes courtes, synchronisées avec la voix",
      paragraphs: [
        "Sur un écran de téléphone, deux lignes de quelques mots se lisent d'un coup d'œil ; un paragraphe entier, non. Découpe le texte en petits groupes de mots qui suivent le rythme de la parole.",
        "La synchronisation est essentielle : un sous-titre qui arrive en retard donne l'impression d'une vidéo mal montée. L'idéal est un affichage calé sur le moment où chaque mot est prononcé.",
      ],
    },
    {
      title: "Où placer les sous-titres",
      paragraphs: [
        "Sur TikTok, Instagram Reels et YouTube Shorts, le bas de l'écran est occupé par le nom du compte, la description et les boutons. Un sous-titre placé tout en bas sera en partie caché.",
        "Place le texte nettement au-dessus de cette zone, sans couvrir le visage de la personne qui parle. Une position dans le tiers inférieur, mais pas collée au bord, convient à la plupart des vidéos.",
      ],
    },
    {
      title: "Choisir un style",
      paragraphs: [
        "Le style doit servir le contenu, pas le concurrencer. Quelques repères :",
      ],
      list: [
        "Classique (texte blanc, contour sombre) : lisible partout, adapté à presque toutes les vidéos.",
        "Mot surligné : le mot prononcé est mis en valeur ; dynamique, idéal pour les contenus énergiques.",
        "Majuscules : très visible, à réserver aux phrases courtes et percutantes.",
        "Minimal : discret, quand l'image doit rester au premier plan.",
      ],
    },
    {
      title: "Les erreurs à éviter",
      list: [
        "Des fautes ou des noms propres mal orthographiés : relis toujours.",
        "Un texte trop petit, ou sans contraste sur un fond clair.",
        "Trop d'effets : couleurs qui changent à chaque mot, animations permanentes.",
        "Oublier la typographie française : espace avant « ? », « ! », « : » et « ; ».",
      ],
    },
    {
      title: "Automatiser sans perdre en qualité",
      paragraphs: [
        "Clipera génère des sous-titres synchronisés au mot à partir de la transcription de ta vidéo, en 4 styles, placés au-dessus de la zone des boutons et en respectant la typographie française. Ils sont intégrés directement dans le fichier MP4 : rien à refaire dans l'application de publication.",
      ],
    },
  ],
  related: ["/sous-titres-automatiques", "/youtube-shorts-tiktok-reels", "/generateur-clips-ia"],
};

const reframeGuide: BlogPost = {
  slug: "recadrer-une-video-horizontale-en-vertical",
  title: "Recadrer une vidéo horizontale en vertical (16:9 vers 9:16) sans couper les visages",
  metaTitle: "Recadrer une vidéo horizontale en vertical 9:16",
  description:
    "Passer une vidéo 16:9 en vertical 9:16 pour TikTok, Reels et Shorts : les trois méthodes de cadrage et comment éviter les têtes coupées.",
  published: "2026-11-22",
  modified: "2026-11-22",
  readingMinutes: 6,
  intro: [
    "Tu as filmé en horizontal, et tu veux publier sur TikTok, Reels ou Shorts. Le passage du 16:9 au 9:16 garde moins de la moitié de la largeur de l'image : le choix de ce que tu gardes fait toute la différence.",
    "Voici les trois grandes méthodes, et comment choisir la bonne selon ta vidéo.",
  ],
  sections: [
    {
      title: "Ce qui se passe quand on passe en vertical",
      paragraphs: [
        "Une image 16:9 est beaucoup plus large que haute. Pour obtenir une image 9:16 de la même hauteur, on ne garde qu'une bande verticale d'environ un tiers de la largeur d'origine. Tout le reste disparaît.",
        "Si la personne qui parle se déplace, ou si deux personnes sont à l'image, une bande fixe au centre ne suffit plus : il faut décider où placer le cadre, et quand le déplacer.",
      ],
    },
    {
      title: "Méthode 1 : un cadre posé sur la personne principale",
      paragraphs: [
        "Le cadre se place sur la personne qui parle et reste immobile le plus longtemps possible. Il ne change de personne que lorsqu'un nouvel intervenant parle vraiment, pas pour un simple « oui ».",
        "C'est la méthode la plus agréable à regarder pour les podcasts et interviews : elle ressemble à un vrai montage, sans mouvements inutiles.",
      ],
    },
    {
      title: "Méthode 2 : suivre la personne qui parle",
      paragraphs: [
        "Le cadre passe rapidement d'une personne à l'autre au fil de la conversation. C'est utile pour les échanges très rythmés, mais il faut éviter les allers-retours permanents, qui deviennent vite fatigants.",
      ],
    },
    {
      title: "Méthode 3 : garder toute la scène sur un fond flouté",
      paragraphs: [
        "L'image entière est réduite et centrée dans le format vertical, avec au-dessus et en dessous une version agrandie et floutée de la même image. Rien n'est coupé et rien ne bouge.",
        "C'est le bon choix quand plusieurs personnes doivent rester visibles en même temps, ou quand l'action se passe sur toute la largeur de l'image.",
      ],
    },
    {
      title: "Les règles pour un recadrage propre",
      list: [
        "Garder la tête entière dans le cadre, pas seulement le visage.",
        "Limiter la vitesse des mouvements du cadre.",
        "Respecter les changements de caméra de la vidéo d'origine : couper net plutôt que glisser.",
        "Ne jamais agrandir une vidéo au-delà de sa résolution d'origine : l'image deviendrait floue.",
      ],
    },
    {
      title: "Le faire automatiquement",
      paragraphs: [
        "Clipera propose ces trois méthodes sous la forme de trois modes : Stable (méthode 1, recommandée), Suivi de l'intervenant (méthode 2) et Large (méthode 3). Les visages sont détectés automatiquement, la personne qui parle est repérée grâce au mouvement des lèvres, et les règles ci-dessus sont appliquées à chaque clip.",
      ],
    },
  ],
  related: ["/recadrage-vertical-automatique", "/transformer-podcast-en-clips", "/youtube-shorts-tiktok-reels"],
};

export const POSTS: BlogPost[] = [podcastMethod, captionsGuide, reframeGuide];
export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);

/** « 2026-11-22 » → « 22 novembre 2026 ». */
export const longDate = (d: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(d));
