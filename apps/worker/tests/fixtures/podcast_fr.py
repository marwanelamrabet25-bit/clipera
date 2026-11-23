"""Podcast de test (français), écrit à la main : 20 sujets distincts + bavardage sans intérêt entre les sujets.

Sert à vérifier la sélection sur des vidéos longues : diversité des sujets, absence de clips tirés du bavardage,
nombre de clips adapté à la durée. Horodatages synthétiques mais réalistes (2,6 mots/s, pauses entre phrases,
pause plus longue au changement d'intervenant). A = animateur, B = invité.
"""

# ruff: noqa: E501 — texte de test (phrases longues volontaires)
from __future__ import annotations

from clipera_worker.selection import Transcript, TWord

TOPICS: list[tuple[str, list[tuple[str, str]]]] = [
    ("premier client", [
        ("A", "Comment est-ce que tu as trouvé ton tout premier client ?"),
        ("B", "Honnêtement, par accident, dans une boulangerie de mon quartier à Lyon."),
        ("B", "J'attendais mon pain et le patron se plaignait que son site internet ne marchait plus depuis trois semaines."),
        ("B", "Je lui ai proposé de regarder le soir même, gratuitement, juste pour voir ce qui clochait."),
        ("B", "Le lendemain, son formulaire de commande fonctionnait et il m'a demandé combien il me devait."),
        ("B", "J'ai dit cent cinquante euros parce que je n'avais aucune idée des prix du marché."),
        ("B", "Trois mois plus tard, il m'avait recommandé à six commerçants de la rue."),
        ("B", "La leçon c'est simple : ton premier client est souvent à dix mètres de chez toi, pas sur une plateforme."),
    ]),
    ("publicité facebook", [
        ("A", "Tu m'avais parlé d'une campagne de publicité qui avait très mal tourné."),
        ("B", "Oui, j'ai brûlé huit mille euros en publicité Facebook en seulement quatre semaines."),
        ("B", "Je ciblais toute la France, entre dix-huit et soixante-cinq ans, avec une seule vidéo."),
        ("B", "Les clics arrivaient, le tableau de bord était magnifique, mais personne n'achetait."),
        ("B", "J'avais oublié de vérifier que le paiement fonctionnait sur téléphone."),
        ("B", "Soixante-dix pour cent des visiteurs arrivaient sur mobile et tombaient sur une page blanche au moment de payer."),
        ("B", "Depuis, avant de dépenser un seul euro en publicité, je passe moi-même une commande depuis mon téléphone."),
    ]),
    ("routine du matin", [
        ("A", "Est-ce que tu as une routine du matin, comme tous ces gourous sur Instagram ?"),
        ("B", "J'ai longtemps essayé de me lever à cinq heures parce que tout le monde disait que c'était le secret."),
        ("B", "Résultat, j'étais épuisé à quinze heures et je prenais des décisions catastrophiques l'après-midi."),
        ("B", "Mon médecin m'a fait faire un bilan de sommeil et j'étais en dette de presque deux heures par nuit."),
        ("B", "Aujourd'hui je me réveille sans réveil vers sept heures et demie, et je travaille mieux en six heures qu'avant en dix."),
        ("B", "Mon conseil : copie les résultats des gens, pas leurs horaires."),
    ]),
    ("recruter son premier salarié", [
        ("A", "Quand est-ce que tu as su qu'il fallait recruter quelqu'un ?"),
        ("B", "Le jour où j'ai raté l'anniversaire de ma fille parce que je répondais à des devis à vingt-deux heures."),
        ("B", "J'ai recruté une assistante administrative en contrat de vingt-quatre heures par semaine."),
        ("B", "Je pensais que ça me coûterait de l'argent, mais elle a récupéré onze factures impayées dès le premier mois."),
        ("B", "Ces factures représentaient plus que son salaire annuel."),
        ("B", "Il faut arrêter de voir un recrutement comme une dépense : c'est du temps que tu rachètes."),
    ]),
    ("négocier ses prix", [
        ("A", "Comment tu réponds quand un prospect te dit que c'est trop cher ?"),
        ("B", "Avant, je baissais mon tarif immédiatement, et c'était la pire chose à faire."),
        ("B", "Maintenant je pose une seule question : trop cher par rapport à quoi ?"),
        ("B", "La plupart du temps, la personne compare avec un service qui n'a rien à voir."),
        ("B", "Une fois, un restaurateur comparait mon site sur mesure avec un abonnement à neuf euros par mois."),
        ("B", "Je lui ai montré combien de réservations il perdait chaque semaine, et il a signé le jour même au tarif plein."),
        ("B", "Ne baisse jamais ton prix, retire plutôt une partie du travail si le budget ne suit pas."),
    ]),
    ("burn-out", [
        ("A", "Tu as accepté de parler de ton burn-out, ce n'est pas un sujet facile."),
        ("B", "Je me souviens très précisément du matin où je n'ai pas réussi à ouvrir mon ordinateur."),
        ("B", "Je regardais l'écran éteint et j'avais les mains qui tremblaient."),
        ("B", "Ça faisait dix-huit mois que je travaillais sept jours sur sept sans vraies vacances."),
        ("B", "Il m'a fallu quatre mois d'arrêt et l'aide d'une psychologue pour reprendre doucement."),
        ("B", "Si tu ne te souviens plus de ton dernier week-end sans travail, ce n'est pas de la motivation, c'est un signal d'alarme."),
    ]),
    ("algorithme tiktok", [
        ("A", "Beaucoup de créateurs pensent que l'algorithme de TikTok est une loterie. Tu en penses quoi ?"),
        ("B", "Je pense surtout que les gens publient des vidéos que personne ne regarde au-delà de deux secondes."),
        ("B", "J'ai analysé nos cent dernières vidéos avec mon équipe."),
        ("B", "Celles qui commençaient par une question directe gardaient deux fois plus de spectateurs après trois secondes."),
        ("B", "Celles qui commençaient par bonjour, je m'appelle, perdaient la moitié de l'audience immédiatement."),
        ("B", "Ta première phrase doit donner une raison de rester, pas une présentation."),
    ]),
    ("banque et financement", [
        ("A", "Est-ce que tu as levé des fonds ou est-ce que tu as tout financé toi-même ?"),
        ("B", "J'ai essuyé quatre refus de banque avant d'obtenir un prêt de trente mille euros."),
        ("B", "La cinquième banque m'a dit oui pour une raison toute bête : j'avais apporté un prévisionnel sur trois scénarios."),
        ("B", "Un scénario optimiste, un réaliste et un catastrophe, avec ce que je faisais dans chaque cas."),
        ("B", "Le conseiller m'a avoué que personne ne lui montrait jamais le scénario catastrophe."),
        ("B", "Un banquier ne finance pas ton rêve, il finance ta capacité à survivre au pire."),
    ]),
    ("échec d'une application", [
        ("A", "Parle-nous de l'application qui n'a jamais marché."),
        ("B", "On a passé onze mois à développer une application de covoiturage pour les festivals de musique."),
        ("B", "Elle était magnifique, rapide, avec des animations partout."),
        ("B", "Le jour du lancement, on a eu quarante-deux téléchargements, dont la moitié venait de nos familles."),
        ("B", "On n'avait jamais demandé à un seul festivalier s'il avait vraiment ce problème."),
        ("B", "Aujourd'hui je refuse d'écrire une ligne de code avant d'avoir parlé à vingt clients potentiels."),
    ]),
    ("livres", [
        ("A", "Quel livre a vraiment changé ta façon de travailler ?"),
        ("B", "Pas un livre de business, étonnamment, mais un livre sur les pilotes d'avion et leurs check-lists."),
        ("B", "Les pilotes les plus expérimentés suivent une liste écrite avant chaque décollage, même après vingt ans de carrière."),
        ("B", "J'ai appliqué ça à mon entreprise : une check-list pour chaque livraison client."),
        ("B", "Nos erreurs de livraison ont chuté de quatre-vingts pour cent en deux mois."),
        ("B", "L'expérience ne remplace jamais une bonne liste."),
    ]),
    ("voyage au japon", [
        ("A", "Il paraît que tu as une histoire incroyable au Japon."),
        ("B", "Haha, oui, je suis parti à Tokyo pour rencontrer un fournisseur de céramique."),
        ("B", "J'avais préparé ma présentation pendant des semaines, traduite en japonais par une agence."),
        ("B", "Au bout de cinq minutes, tout le monde dans la salle se retenait de rire."),
        ("B", "L'agence avait traduit le nom de ma marque par un mot qui veut dire chaussette mouillée."),
        ("B", "Le fournisseur a trouvé ça tellement drôle qu'il a signé avec nous, et on a gardé la blague dans notre catalogue."),
    ]),
    ("gestion des emails", [
        ("A", "Combien d'emails tu reçois par jour ?"),
        ("B", "Environ deux cents, et pendant des années je les lisais dès qu'ils arrivaient."),
        ("B", "J'ai mesuré : je changeais de tâche toutes les quatre minutes en moyenne."),
        ("B", "Maintenant je consulte ma boîte de réception deux fois par jour, à onze heures et à seize heures."),
        ("B", "J'ai prévenu mes clients, et personne ne s'en est jamais plaint."),
        ("B", "L'urgence des autres n'est pas automatiquement ton urgence."),
    ]),
    ("famille", [
        ("A", "Comment ta famille a réagi quand tu as quitté ton CDI ?"),
        ("B", "Mon père ne m'a pas parlé pendant presque trois semaines."),
        ("B", "Pour lui, quitter un poste d'ingénieur dans l'aéronautique, c'était une folie."),
        ("B", "Je lui ai proposé un marché : si au bout d'un an je ne gagnais pas le SMIC, je retournais chercher un emploi."),
        ("B", "Au dixième mois, je l'ai invité au restaurant avec mon premier vrai salaire."),
        ("B", "Il ne m'a jamais dit qu'il était fier, mais il a gardé l'addition dans son portefeuille."),
    ]),
    ("comptabilité et impôts", [
        ("A", "Quelle est l'erreur administrative qui t'a coûté le plus cher ?"),
        ("B", "La TVA, sans hésiter, pendant ma deuxième année d'activité."),
        ("B", "J'avais dépassé le seuil de la franchise sans m'en rendre compte."),
        ("B", "J'ai dû reverser la TVA sur six mois de factures, soit presque quatorze mille euros, que je n'avais pas facturés à mes clients."),
        ("B", "Depuis, j'ai un expert-comptable, et je vérifie mon chiffre d'affaires cumulé chaque premier du mois."),
        ("B", "Un expert-comptable coûte cher seulement jusqu'au jour où tu n'en as pas."),
    ]),
    ("marathon", [
        ("A", "Tu as couru un marathon l'année dernière, quel rapport avec ton travail ?"),
        ("B", "Je ne savais pas courir dix kilomètres quand je me suis inscrit, neuf mois avant la course."),
        ("B", "Mon entraîneur m'a interdit de regarder la distance totale."),
        ("B", "Chaque semaine, je devais seulement réussir les trois sorties prévues, rien de plus."),
        ("B", "Le jour de la course, j'ai fini en quatre heures douze, sans jamais m'être senti dépassé."),
        ("B", "C'est exactement comme ça que je gère mes gros projets maintenant : je ne regarde que la semaine en cours."),
    ]),
    ("intelligence artificielle", [
        ("A", "Est-ce que l'intelligence artificielle a changé ton quotidien ?"),
        ("B", "Oui, mais pas comme je l'imaginais au départ."),
        ("B", "Je pensais qu'elle allait écrire mes contenus à ma place, et le résultat était fade."),
        ("B", "Par contre, pour résumer des appels clients ou préparer un premier brouillon de devis, je gagne environ cinq heures par semaine."),
        ("B", "Je l'utilise comme un stagiaire très rapide, jamais comme un expert."),
        ("B", "Tout ce qui sort de l'outil est relu par un humain avant d'arriver chez un client."),
    ]),
    ("matériel de podcast", [
        ("A", "Quel matériel tu conseilles à quelqu'un qui veut lancer son podcast ?"),
        ("B", "Surtout pas une caméra à deux mille euros au départ."),
        ("B", "Le public pardonne une image moyenne, mais il zappe immédiatement si le son est mauvais."),
        ("B", "Un micro dynamique à environ cent euros et une pièce avec des rideaux font déjà quatre-vingt-dix pour cent du travail."),
        ("B", "Enregistre dix épisodes avant d'acheter quoi que ce soit d'autre."),
        ("B", "Tu sauras alors exactement ce qui te manque, au lieu de le deviner."),
    ]),
    ("clients qui ne paient pas", [
        ("A", "Comment tu gères les clients qui ne paient pas ?"),
        ("B", "J'ai eu un client qui me devait neuf mille euros et qui ne répondait plus au téléphone."),
        ("B", "Au lieu de le relancer pour la dixième fois, je lui ai envoyé une mise en demeure par lettre recommandée."),
        ("B", "Il a payé l'intégralité en quarante-huit heures."),
        ("B", "Depuis, je demande un acompte de trente pour cent avant de commencer chaque mission."),
        ("B", "Un client qui refuse de verser un acompte t'annonce déjà comment il paiera la suite."),
    ]),
    ("prise de parole", [
        ("A", "Tu étais très timide plus jeune, comment tu fais maintenant pour parler devant des centaines de personnes ?"),
        ("B", "Ma première conférence a été un désastre : j'ai lu mes notes pendant vingt minutes sans lever les yeux."),
        ("B", "Une spectatrice est venue me voir après et m'a dit qu'elle n'avait rien retenu."),
        ("B", "J'ai alors pris des cours de théâtre d'improvisation tous les jeudis pendant un an."),
        ("B", "On n'y apprend pas à être drôle, on y apprend à ne plus avoir peur de l'imprévu."),
        ("B", "La confiance ne vient pas avant l'action, elle vient après des dizaines de répétitions."),
    ]),
    ("conseil aux jeunes", [
        ("A", "Si tu devais donner un seul conseil à quelqu'un de vingt ans qui veut se lancer ?"),
        ("B", "Vends quelque chose avant de créer ton entreprise."),
        ("B", "Même un petit service, même à cinquante euros, à quelqu'un qui n'est pas ta famille."),
        ("B", "Cette première vente t'apprendra plus que six mois de formations en ligne."),
        ("B", "Tu découvriras si les gens sont prêts à payer, combien, et pourquoi."),
        ("B", "Tout le reste, le logo, les statuts, le site, peut attendre la deuxième semaine."),
    ]),
]

CHATTER = [
    ("A", "Ouais, ouais, c'est ça."),
    ("B", "Euh, attends, je regarde l'heure."),
    ("A", "Bon, on reprend, hein."),
    ("B", "Ouais, enfin, tu vois ce que je veux dire."),
    ("A", "Ah oui, carrément, euh, voilà."),
    ("B", "Bref, euh, je sais plus trop où on en était."),
    ("A", "C'est marrant, ouais."),
    ("B", "Euh, ouais, enfin, bon, voilà quoi."),
    ("A", "On en parlait tout à l'heure, euh, avant de commencer."),
    ("B", "Ouais, ouais, enfin bon, c'est un peu tout ça, euh."),
    ("A", "Attends, je bois un peu d'eau."),
    ("B", "Hm, ouais, bon, euh, ben voilà."),
]


def _chatter(seconds: float, seed: int) -> list[tuple[str, str]]:
    out, t, k = [], 0.0, seed
    while t < seconds:
        spk, text = CHATTER[k % len(CHATTER)]
        out.append((spk, text))
        t += len(text.split()) / 2.6 + 0.9
        k += 5
    return out


def podcast(n_topics: int = 20, chatter_s: float = 75.0, *, wps: float = 2.6) -> tuple[Transcript, list[tuple]]:
    """Transcription : bavardage, sujet 1, bavardage, sujet 2… Renvoie aussi (sujet, début, fin) pour les tests."""
    script: list[tuple[str, str]] = []
    marks: list[tuple[str, int, int]] = []
    for i, (name, lines) in enumerate(TOPICS[:n_topics]):
        script += _chatter(chatter_s, i)
        marks.append((name, len(script), len(script) + len(lines)))
        script += lines
    script += _chatter(chatter_s, 99)
    words: list[TWord] = []
    bounds: list[tuple[float, float]] = []
    t, prev = 0.5, None
    for spk, text in script:
        t += 0.9 if prev not in (None, spk) else 0.35
        s0 = t
        for w in text.split():
            dur = 0.12 + 0.045 * len(w)
            words.append(TWord(w, round(t, 3), round(t + dur, 3), spk, 0.95))
            t += dur + 1 / wps - 0.2
        bounds.append((s0, t))
        prev = spk
    topics = [(name, bounds[a][0], bounds[b - 1][1]) for name, a, b in marks]
    return Transcript(tuple(words)), topics


def chatter_only(seconds: float) -> Transcript:
    words, t, prev = [], 0.5, None
    for spk, text in _chatter(seconds, 3):
        t += 0.9 if prev not in (None, spk) else 0.35
        for w in text.split():
            words.append(TWord(w, round(t, 3), round(t + 0.3, 3), spk, 0.95))
            t += 0.4
        prev = spk
    return Transcript(tuple(words))
