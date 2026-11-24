import type { ContentPageData } from "@/components/marketing/content-page";

/**
 * Pages de contenu stratégiques. Chaque page répond à UNE intention de recherche différente.
 * Tout ce qui est écrit ici doit correspondre à ce que Clipera fait réellement aujourd'hui.
 */

const generateur: ContentPageData = {
  path: "/generateur-clips-ia",
  name: "Générateur de clips IA",
  metaTitle: "Générateur de clips IA : vidéo longue en clips courts",
  metaDescription:
    "Générateur de clips IA en français : Clipera transcrit ta vidéo, choisit les meilleurs passages, les recadre en vertical et les sous-titre. Offre gratuite.",
  eyebrow: "Générateur de clips IA",
  h1: "Un générateur de clips IA qui garde les moments qui comptent",
  intro: [
    "Clipera transforme une vidéo longue (podcast, interview, live, formation) en plusieurs clips courts, recadrés et sous-titrés. Tu importes ta vidéo, tu choisis le format, et tu récupères des fichiers MP4 prêts à publier.",
    "Contrairement à un simple découpage toutes les 60 secondes, chaque clip est choisi pour tenir debout seul : il commence par une accroche et se termine sur une phrase complète.",
  ],
  sections: [
    {
      title: "Ce que fait le générateur, étape par étape",
      steps: [
        {
          title: "Transcription par IA, au mot près",
          text: "La parole est convertie en texte avec l'horodatage de chaque mot et l'identification des différentes voix. C'est la base des coupes et des sous-titres.",
        },
        {
          title: "Sélection des meilleurs passages",
          text: "Clipera note chaque passage possible selon l'accroche, la cohérence, la conclusion, le contexte et l'énergie de la voix. Seuls les passages au-dessus du seuil de qualité sont gardés.",
        },
        {
          title: "Recadrage automatique",
          text: "Les visages sont détectés par un réseau de neurones. Le cadre se place sur la personne qui parle, sans à-coups et sans jamais couper une tête.",
        },
        {
          title: "Sous-titres et son",
          text: "Sous-titres synchronisés au mot, en 4 styles. Le volume est harmonisé pour les réseaux sociaux, avec un léger fondu au début et à la fin.",
        },
        {
          title: "Contrôle automatique du fichier",
          text: "Avant de te livrer un clip, Clipera vérifie les dimensions, la durée, le son, la synchronisation image/son et les couleurs. Un clip défectueux n'est jamais livré.",
        },
      ],
    },
    {
      title: "Pourquoi « moins de clips, mais meilleurs »",
      paragraphs: [
        "Beaucoup d'outils promettent des dizaines de clips par vidéo. En pratique, une heure de conversation contient rarement plus de quelques vrais moments forts. Clipera applique une règle simple : si ta vidéo ne contient que 3 bons passages, tu obtiens 3 clips, pas 10 clips médiocres.",
        "Chaque clip est accompagné d'un Clip Score expliqué (accroche, intérêt, cohérence, fin), pour t'aider à choisir lequel publier en premier. C'est une aide au choix, pas une prédiction de vues.",
      ],
    },
    {
      title: "Les réglages disponibles",
      list: [
        "Trois formats : vertical 9:16 (TikTok, Reels, Shorts), carré 1:1 et horizontal 16:9.",
        "Trois cadrages : Stable (recommandé), Suivi de l'intervenant, ou Large (toute la scène sur fond flouté).",
        "Sous-titres activables, en 4 styles : Classique, Mot surligné, Moderne (majuscules) et Minimal.",
        "Jusqu'à 10 clips par vidéo avec les offres payantes (5 avec l'offre gratuite), sur des sujets différents, d'environ 25 à 60 secondes chacun.",
        "Export jusqu'en 1080p selon l'offre, sans jamais agrandir artificiellement une vidéo de plus basse qualité.",
      ],
    },
    {
      title: "Pour quelles vidéos ?",
      paragraphs: [
        "Clipera est fait pour les vidéos où l'on parle : podcasts filmés, interviews, lives, conférences, formations, vlogs face caméra. Le traitement est aujourd'hui optimisé pour le français.",
        "Tu importes un fichier MP4, MOV, M4V, MKV ou WEBM depuis ton ordinateur, ou un lien de partage Google Drive ou Dropbox. Tu dois détenir les droits sur la vidéo (tu en es l'auteur ou tu as l'autorisation de l'exploiter).",
      ],
    },
  ],
  questions: [
    {
      q: "Le générateur de clips IA est-il gratuit ?",
      a: "Il existe une offre gratuite, sans carte bancaire : 3 vidéos et 30 minutes par mois, export en 720p avec un filigrane Clipera. Les offres payantes retirent le filigrane et passent en 1080p.",
    },
    {
      q: "Combien de temps faut-il pour obtenir mes clips ?",
      a: "Cela dépend de la durée de ta vidéo. Tu suis l'avancement réel à l'écran (import, transcription, sélection, montage) et tu peux fermer la page pendant le traitement.",
    },
    {
      q: "Que se passe-t-il si aucun bon passage n'est trouvé ?",
      a: "Clipera ne livre pas de clip médiocre pour remplir. Si aucun clip n'est produit, ton quota du mois t'est restitué automatiquement.",
    },
  ],
  related: ["/transformer-podcast-en-clips", "/youtube-shorts-tiktok-reels", "/sous-titres-automatiques", "/tarifs"],
  cta: {
    title: "Génère tes premiers clips gratuitement",
    text: "Crée ton compte, importe une vidéo et récupère tes clips. Aucune compétence de montage n'est nécessaire.",
  },
};

const podcast: ContentPageData = {
  path: "/transformer-podcast-en-clips",
  name: "Transformer un podcast en clips",
  metaTitle: "Transformer un podcast en clips courts (TikTok, Reels)",
  metaDescription:
    "Transforme chaque épisode de ton podcast filmé en clips courts sous-titrés : Clipera repère les meilleurs échanges et cadre la personne qui parle.",
  eyebrow: "Pour les podcasteurs",
  h1: "Transformer un podcast en clips courts, épisode après épisode",
  intro: [
    "Ton podcast contient des dizaines de moments qui pourraient attirer de nouveaux auditeurs : une anecdote, un conseil, une réponse franche. Le problème, c'est le temps qu'il faut pour les retrouver, les découper, les recadrer et les sous-titrer.",
    "Clipera fait ce travail à partir de ton épisode filmé : il repère les échanges qui tiennent debout seuls et te livre des clips verticaux prêts pour TikTok, Instagram Reels et YouTube Shorts.",
  ],
  sections: [
    {
      title: "Pensé pour les conversations à plusieurs voix",
      paragraphs: [
        "Un podcast, ce sont souvent deux personnes ou plus, filmées en plan large ou avec plusieurs caméras. Clipera distingue les différentes voix dans la transcription, détecte les visages à l'image et repère qui parle en observant le mouvement des lèvres.",
        "Tu choisis ensuite comment cadrer. En mode Stable (recommandé), le cadre reste posé et ne change de personne que lorsque c'est vraiment justifié. En mode Suivi de l'intervenant, il passe plus rapidement à la personne qui parle. En mode Large, les deux invités restent visibles, sur un fond flouté.",
        "Quand ta vidéo alterne entre plusieurs caméras, les changements de plan sont détectés : la coupe du clip suit le montage d'origine au lieu de glisser bizarrement d'une image à l'autre.",
      ],
    },
    {
      title: "Ce qui fait un bon clip de podcast",
      list: [
        "Une accroche dès la première phrase : une question, une affirmation forte, un chiffre.",
        "Assez de contexte pour être compris sans avoir écouté l'épisode.",
        "Une fin nette : une conclusion, une chute, une phrase complète.",
        "Une durée courte, autour de 25 à 60 secondes.",
        "Des sous-titres lisibles, car beaucoup de vidéos sont regardées sans le son.",
      ],
      paragraphs: [
        "C'est exactement ce que Clipera évalue pour chaque passage. Chaque clip livré est accompagné d'une note expliquée sur ces critères.",
      ],
    },
    {
      title: "Ta méthode en 4 étapes",
      steps: [
        {
          title: "Exporte ton épisode filmé",
          text: "Le fichier vidéo de ton enregistrement (MP4 ou MOV), ou un lien de partage Google Drive ou Dropbox.",
        },
        {
          title: "Importe-le dans Clipera",
          text: "Choisis le nombre de clips souhaité, le format vertical 9:16 et le cadrage Stable pour commencer.",
        },
        {
          title: "Relis les clips proposés",
          text: "Regarde l'aperçu, lis l'extrait de transcription et le Clip Score de chaque clip.",
        },
        {
          title: "Publie et réutilise",
          text: "Télécharge les MP4 et publie-les sur tes réseaux, en renvoyant vers l'épisode complet.",
        },
      ],
    },
    {
      title: "Et pour un podcast audio seulement ?",
      paragraphs: [
        "Clipera travaille à partir d'une vidéo : il a besoin d'images pour cadrer et produire un clip vertical. Si ton podcast est uniquement audio, il faut d'abord une version vidéo (par exemple un enregistrement face caméra). Nous préférons te le dire clairement plutôt que de te promettre un résultat que l'outil ne donne pas.",
      ],
    },
  ],
  questions: [
    {
      q: "Mon podcast dure plus d'une heure, est-ce possible ?",
      a: "Oui, selon l'offre : jusqu'à 15 minutes par vidéo en gratuit, 1 heure avec Starter, 2 heures avec Pro et 3 heures avec Ultimate.",
    },
    {
      q: "Puis-je faire des clips du podcast d'un autre créateur ?",
      a: "Seulement si tu as son autorisation. Clipera est réservé aux vidéos dont tu détiens les droits.",
    },
    {
      q: "Les sous-titres respectent-ils le français ?",
      a: "Oui : la transcription est faite en français, et la typographie française est respectée (espace avant « ? », « ! », « : » et « ; »).",
    },
  ],
  related: ["/generateur-clips-ia", "/recadrage-vertical-automatique", "/blog/transformer-un-podcast-en-clips-methode", "/tarifs"],
  cta: {
    title: "Fais travailler chaque épisode plus longtemps",
    text: "Importe ton dernier épisode filmé et découvre les clips que Clipera y trouve. L'offre gratuite suffit pour essayer.",
  },
};

const shorts: ContentPageData = {
  path: "/youtube-shorts-tiktok-reels",
  name: "Shorts, TikTok et Reels",
  metaTitle: "Créer des Shorts, TikTok et Reels depuis une vidéo longue",
  metaDescription:
    "Crée des Shorts YouTube, des TikTok et des Reels à partir de tes vidéos longues : format 9:16, sous-titres et cadrage automatiques avec Clipera.",
  eyebrow: "Vidéos courtes",
  h1: "Créer des Shorts, TikTok et Reels à partir de tes vidéos longues",
  intro: [
    "YouTube Shorts, TikTok et Instagram Reels utilisent tous le même format : une vidéo verticale, courte, qui doit capter l'attention dès la première seconde. Une seule vidéo longue peut alimenter les trois plateformes.",
    "Clipera produit un fichier MP4 vertical que tu publies où tu veux. Tu gardes la main : rien n'est publié automatiquement sur tes comptes.",
  ],
  sections: [
    {
      title: "Un seul format pour les trois plateformes",
      paragraphs: [
        "Le format vertical 9:16 (1080 × 1920 pixels en haute définition) est le format naturel des trois applications. Clipera recadre ta vidéo horizontale dans ce format en suivant les visages, puis exporte en 1080p avec les offres payantes (720p avec l'offre gratuite).",
        "Les durées maximales autorisées changent régulièrement selon les plateformes : vérifie-les dans chaque application avant de publier. Les clips de Clipera durent en général entre 25 et 60 secondes, une durée qui convient aux trois.",
      ],
    },
    {
      title: "Les différences à garder en tête",
      list: [
        "YouTube Shorts : idéal pour faire découvrir ta chaîne. Ajoute un lien vers la vidéo complète depuis le Short.",
        "TikTok : l'accroche des premières secondes compte énormément. Choisis en priorité les clips avec un bon score d'accroche.",
        "Instagram Reels : pense à la couverture du Reel. Clipera fournit une miniature pour chaque clip.",
        "Sur les trois, le bas de l'écran est couvert par les boutons et la description : les sous-titres de Clipera sont placés plus haut pour rester lisibles.",
      ],
    },
    {
      title: "Et les vidéos déjà publiées sur YouTube ?",
      paragraphs: [
        "Clipera ne télécharge pas de vidéos depuis YouTube. Si la vidéo est à toi, tu peux télécharger ton propre fichier depuis YouTube Studio, puis l'importer dans Clipera. Un guide pas à pas est disponible dans l'application, au moment de l'import.",
        "Tu peux aussi partager un lien Google Drive ou Dropbox vers ton fichier : Clipera le récupère directement, sans que tu aies à le télécharger sur ton ordinateur.",
      ],
    },
    {
      title: "Publier régulièrement sans y passer ses soirées",
      paragraphs: [
        "La régularité compte sur les plateformes de vidéos courtes. Avec Clipera, une vidéo longue par semaine peut suffire à préparer plusieurs clips. Tu choisis les meilleurs grâce au Clip Score et tu les programmes à ton rythme dans chaque application.",
      ],
    },
  ],
  questions: [
    {
      q: "Clipera publie-t-il directement sur mes comptes ?",
      a: "Non. Tu télécharges des fichiers MP4 et tu les publies toi-même, où tu veux. Clipera ne demande aucun accès à tes comptes TikTok, YouTube ou Instagram.",
    },
    {
      q: "Puis-je faire du carré ou de l'horizontal ?",
      a: "Oui : en plus du vertical 9:16, Clipera exporte en carré 1:1 et en horizontal 16:9.",
    },
    {
      q: "Est-ce que Clipera garantit des vues ?",
      a: "Non. Personne ne peut garantir des vues ou la viralité. Clipera t'aide à produire plus vite des clips propres ; le reste dépend de ton contenu et de chaque plateforme.",
    },
  ],
  related: ["/generateur-clips-ia", "/sous-titres-automatiques", "/recadrage-vertical-automatique", "/blog/recadrer-une-video-horizontale-en-vertical"],
  cta: {
    title: "Une vidéo longue, des clips pour toutes tes plateformes",
    text: "Essaie Clipera gratuitement sur l'une de tes vidéos et publie tes premiers Shorts, TikTok et Reels.",
  },
};

const captions: ContentPageData = {
  path: "/sous-titres-automatiques",
  name: "Sous-titres automatiques",
  metaTitle: "Sous-titres automatiques en français pour vidéos courtes",
  metaDescription:
    "Des sous-titres automatiques synchronisés au mot pour tes vidéos courtes : 4 styles, typographie française, lisibles sur TikTok, Reels et Shorts.",
  eyebrow: "Sous-titres",
  h1: "Des sous-titres automatiques en français, synchronisés au mot",
  intro: [
    "Sur les réseaux sociaux, une grande partie des vidéos est regardée sans le son. Des sous-titres lisibles permettent de suivre ton propos dès la première seconde, et rendent tes vidéos accessibles aux personnes sourdes ou malentendantes.",
    "Clipera génère les sous-titres de chaque clip à partir de la transcription de ta vidéo, mot par mot, et les intègre directement dans le fichier MP4.",
  ],
  sections: [
    {
      title: "Synchronisés au mot près",
      paragraphs: [
        "La transcription donne le moment exact où chaque mot est prononcé. Les sous-titres apparaissent donc au bon moment, sans décalage, et avancent au rythme de la parole.",
        "Les phrases sont découpées en courtes lignes faciles à lire sur un téléphone, plutôt qu'en longs pavés de texte.",
      ],
    },
    {
      title: "Quatre styles au choix",
      list: [
        "Classique : texte blanc sobre, lisible sur tous les fonds.",
        "Mot surligné : le mot prononcé est mis en valeur, pour un effet dynamique.",
        "Moderne : texte en majuscules, très visible.",
        "Minimal : discret, pour les vidéos où l'image doit primer.",
      ],
    },
    {
      title: "La typographie française respectée",
      paragraphs: [
        "Les outils pensés pour l'anglais oublient souvent les règles du français. Clipera ajoute l'espace avant les signes « ? », « ! », « : » et « ; », et garde les nombres tels qu'ils sont prononcés (« huit mille euros » plutôt qu'une conversion approximative).",
      ],
    },
    {
      title: "Placés là où ils restent lisibles",
      paragraphs: [
        "Sur TikTok, Reels et Shorts, le bas de l'écran est couvert par la description et les boutons. Les sous-titres de Clipera sont placés au-dessus de cette zone pour ne jamais être masqués.",
      ],
    },
  ],
  questions: [
    {
      q: "Puis-je désactiver les sous-titres ?",
      a: "Oui, les sous-titres sont une option que tu actives ou désactives avant chaque génération.",
    },
    {
      q: "Les sous-titres sont-ils inclus dans l'offre gratuite ?",
      a: "Oui. Les sous-titres et leurs 4 styles sont disponibles dans toutes les offres.",
    },
    {
      q: "Quelles langues sont prises en charge ?",
      a: "Aujourd'hui, Clipera est optimisé pour les vidéos en français.",
    },
  ],
  related: ["/generateur-clips-ia", "/youtube-shorts-tiktok-reels", "/blog/sous-titres-videos-courtes-guide", "/tarifs"],
  cta: {
    title: "Des clips sous-titrés, sans rien taper",
    text: "Importe une vidéo et récupère des clips sous-titrés automatiquement, dans le style de ton choix.",
  },
};

const reframe: ContentPageData = {
  path: "/recadrage-vertical-automatique",
  name: "Recadrage vertical automatique",
  metaTitle: "Recadrage vertical automatique : 16:9 en 9:16",
  metaDescription:
    "Passe une vidéo horizontale en vertical 9:16 : Clipera détecte les visages, suit la personne qui parle et ne coupe jamais une tête. Trois modes.",
  eyebrow: "Recadrage",
  h1: "Recadrer automatiquement une vidéo horizontale en vertical",
  intro: [
    "Une vidéo filmée en 16:9 perd plus de la moitié de sa largeur en passant au format vertical 9:16. Tout l'enjeu est de garder la bonne partie de l'image : la personne qui parle, en entier, sans mouvement de caméra désagréable.",
    "Clipera s'en charge automatiquement, avec trois modes au choix selon ta vidéo.",
  ],
  sections: [
    {
      title: "Comment Clipera choisit le cadre",
      steps: [
        {
          title: "Détection des visages",
          text: "Un réseau de neurones repère les visages plusieurs fois par seconde, même quand les personnes bougent.",
        },
        {
          title: "Identification de la personne qui parle",
          text: "Le mouvement des lèvres est analysé pour savoir qui parle, y compris dans une conversation à deux.",
        },
        {
          title: "Un cadre qui ne coupe jamais une tête",
          text: "Le cadre est calculé pour garder la tête entière dans l'image, pas seulement le visage.",
        },
        {
          title: "Des mouvements limités et doux",
          text: "La vitesse du cadre est plafonnée et les changements de plan de la vidéo d'origine sont respectés, pour éviter l'effet « caméra qui flotte ».",
        },
      ],
    },
    {
      title: "Trois modes selon ta vidéo",
      list: [
        "Stable (recommandé) : un cadrage posé, qui ne change de personne que lorsque c'est justifié. Idéal pour la plupart des podcasts et interviews.",
        "Suivi de l'intervenant : le cadre passe plus vite à la personne qui parle. Utile pour les échanges rapides.",
        "Large : toute la scène reste visible, centrée sur un fond flouté de la même image. Aucun mouvement, rien n'est coupé.",
      ],
      paragraphs: ["Clipera mémorise le dernier mode choisi pour tes prochaines générations."],
    },
    {
      title: "Une image fidèle à l'original",
      paragraphs: [
        "Les couleurs sont conservées, y compris pour les vidéos HDR filmées avec un iPhone, qui sont converties correctement pour les réseaux sociaux. La résolution d'origine est respectée : une vidéo n'est jamais agrandie artificiellement.",
      ],
    },
  ],
  questions: [
    {
      q: "Et s'il n'y a aucun visage à l'image ?",
      a: "Le cadre reste centré sur l'image. Pour une vidéo sans personne à l'écran, le mode Large est souvent le meilleur choix.",
    },
    {
      q: "Le recadrage fonctionne-t-il en carré 1:1 ?",
      a: "Oui, le même recadrage intelligent est utilisé pour le format carré. En horizontal 16:9, l'image est gardée telle quelle.",
    },
    {
      q: "Puis-je corriger le cadrage à la main ?",
      a: "Pas encore. Tu peux en revanche choisir l'un des trois modes avant la génération.",
    },
  ],
  related: ["/transformer-podcast-en-clips", "/youtube-shorts-tiktok-reels", "/blog/recadrer-une-video-horizontale-en-vertical", "/generateur-clips-ia"],
  cta: {
    title: "Passe tes vidéos en vertical sans effort",
    text: "Importe une vidéo horizontale et compare les trois modes de cadrage sur tes propres images.",
  },
};

export const SOLUTIONS: Record<string, ContentPageData> = Object.fromEntries(
  [generateur, podcast, shorts, captions, reframe].map((p) => [p.path, p]),
);
