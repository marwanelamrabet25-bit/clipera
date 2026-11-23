"""Vue d'ensemble de la vidéo, sans IA : vocabulaire, sujets (chapitres) et ressemblance entre passages.

- Vocabulaire : mots « pleins » (sans mots outils ni hésitations), ramenés à une racine simple pour que
  « entreprise » et « entreprises » comptent ensemble.
- Sujets : découpage par cohésion lexicale (méthode TextTiling, Hearst 1997). On compare le vocabulaire juste avant
  et juste après chaque frontière de phrase ; une chute nette de ressemblance marque un changement de sujet.
- Ressemblance : cosinus TF-IDF entre deux passages. Sert à écarter des clips qui racontent la même chose.

Ces mesures ne « comprennent » pas le sens : elles repèrent les changements et répétitions de vocabulaire, ce qui
suffit à éviter 10 clips sur le même sujet. L'IA (optionnelle) affine ensuite l'intérêt réel.
"""

from __future__ import annotations

import math
import re
import unicodedata
from collections import Counter
from dataclasses import dataclass

from .models import Sentence

_STOP_TEXT = """
a à ai aie aient aies ait alors as au aucun aucune aujourd aussi autre autres aux avais avait avant avec avez avoir
avons ayant bah ben bien bon bref c ça car ce ceci cela celle celles celui cependant certain certaine certains ces cet
cette ceux chaque chez ci comme comment d dans de des déjà depuis donc dont du elle elles en encore enfin entre es est
et étaient était étais été être eu eux fait faire fais faut fois font hein hum il ils j je jusqu l la là le les leur
leurs lui m ma mais me même mes moi moins mon n ne ni non nos notre nous o oh ok on ont ou où par parce pas peu peut
peux plus plutôt pour pourquoi qu quand que quel quelle quelles quels qui quoi s sa sans se ses si sien soi soit son
sont sous suis sur t ta te tes toi ton tous tout toute toutes très tu un une va vais vas voilà vont vos votre vous vu
y euh heu hm mh ouais oui genre truc trucs chose choses vraiment juste fin enfin voila ah eh beaucoup tellement
aller allez allons dire dit dis disait avait avoir été être fait faire faut falloir peut pouvoir veux vouloir
attends attend regarde regarder sais sait savais vois voit voir carrément marrant trop quoi
"""
STOPWORDS = frozenset(_STOP_TEXT.split())

FILLERS = frozenset({"euh", "heu", "hum", "hm", "bah", "ben", "genre", "voilà", "voila", "bref", "enfin", "ouais"})

_WORD = re.compile(r"[a-zà-öø-ÿœæ]+", re.IGNORECASE)


def _strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def stem(word: str) -> str:
    """Racine grossière (sans dépendance) : minuscules, sans accents, pluriels et terminaisons courantes."""
    w = _strip_accents(word.lower())
    for suf in ("issements", "issement", "ations", "ation", "ements", "ement", "ments", "ment", "euses", "euse",
                "ables", "able", "istes", "iste", "ances", "ance", "ences", "ence", "eurs", "eur", "ions", "ees",
                "ee", "es", "s", "x", "e"):
        if len(w) - len(suf) >= 4 and w.endswith(suf):
            return w[: -len(suf)]
    return w


def content_terms(text: str) -> list[str]:
    out = []
    for raw in _WORD.findall(text.lower().replace("’", "'")):
        if len(raw) < 3 or raw in STOPWORDS or _strip_accents(raw) in STOPWORDS:
            continue
        out.append(stem(raw))
    return out


def substance(text: str) -> int:
    """Nombre de mots porteurs de sens : 0 ou 1 pour « Ouais, ouais, c'est ça. » ou « Attends, je bois de l'eau. »"""
    return len(set(content_terms(text)))


def filler_ratio(text: str) -> float:
    words = _WORD.findall(text.lower())
    return sum(1 for w in words if w in FILLERS) / max(len(words), 1)


@dataclass(frozen=True)
class Topic:
    index: int
    first_sentence: int
    last_sentence: int
    start: float
    end: float
    keywords: tuple[str, ...]  # mots les plus caractéristiques (forme d'origine la plus fréquente)


def _norm(text: str) -> str:
    return " ".join(_WORD.findall(_strip_accents(text.lower())))


class Vocabulary:
    """Fréquences documentaires calculées sur les phrases de la vidéo (pour le TF-IDF)."""

    def __init__(self, sentences: list[Sentence]):
        self.n = max(len(sentences), 1)
        self.df: Counter[str] = Counter()
        self.surface: dict[str, Counter[str]] = {}
        # Phrases répétées à l'identique dans la vidéo (« Ouais, c'est clair. », « Attends, je regarde l'heure. »).
        self.repeats: Counter[str] = Counter(_norm(s.text) for s in sentences)
        for s in sentences:
            if self.repeats[_norm(s.text)] >= 3 and len(_WORD.findall(s.text)) <= 14:
                continue  # les formules répétées ne disent rien du sujet
            terms = content_terms(s.text)
            self.df.update(set(terms))
            for raw in _WORD.findall(s.text.lower()):
                if len(raw) >= 3 and raw not in STOPWORDS:
                    self.surface.setdefault(stem(raw), Counter())[raw] += 1

    def hollow(self, text: str) -> bool:
        """Phrase creuse : sans contenu, ou formule qui revient à l'identique au moins 3 fois dans la vidéo."""
        return substance(text) < 2 or (len(_WORD.findall(text)) <= 14 and self.repeats.get(_norm(text), 0) >= 3)

    def idf(self, term: str) -> float:
        df = self.df.get(term, 0)
        if self.n >= 20 and df / self.n > 0.5:
            return 0.0  # mot présent dans plus de la moitié de la vidéo : ne dit rien du sujet d'un passage
        return math.log((1 + self.n) / (1 + df)) + 1

    def vector(self, text: str) -> dict[str, float]:
        tf = Counter(content_terms(text))
        vec = {t: (1 + math.log(c)) * self.idf(t) for t, c in tf.items()}
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        return {t: v / norm for t, v in vec.items()}

    def label(self, term: str) -> str:
        forms = self.surface.get(term)
        return forms.most_common(1)[0][0] if forms else term


def cosine(a: dict[str, float], b: dict[str, float]) -> float:
    if len(a) > len(b):
        a, b = b, a
    return sum(v * b.get(t, 0.0) for t, v in a.items())


def segment_topics(sentences: list[Sentence], vocab: Vocabulary | None = None, *, block_s: float = 45.0,
                   min_topic_s: float = 90.0) -> list[Topic]:
    """Découpe la vidéo en sujets successifs (TextTiling simplifié, frontières sur des phrases)."""
    if not sentences:
        return []
    vocab = vocab or Vocabulary(sentences)
    vecs = [Counter() if vocab.hollow(s.text) else Counter(content_terms(s.text)) for s in sentences]

    def bag(i: int, j: int) -> Counter[str]:
        out: Counter[str] = Counter()
        for k in range(max(i, 0), min(j, len(sentences))):
            out.update(vecs[k])
        return out

    def window_back(i: int) -> int:  # première phrase des ~block_s secondes avant la frontière i
        k = i
        while k > 0 and sentences[i - 1].end - sentences[k - 1].start <= block_s:
            k -= 1
        return k

    def window_fwd(i: int) -> int:
        k = i
        while k < len(sentences) and sentences[k].end - sentences[i].start <= block_s:
            k += 1
        return k

    def sim(x: Counter[str], y: Counter[str]) -> float:
        wx = {t: c * vocab.idf(t) for t, c in x.items()}
        wy = {t: c * vocab.idf(t) for t, c in y.items()}
        nx = math.sqrt(sum(v * v for v in wx.values())) or 1.0
        ny = math.sqrt(sum(v * v for v in wy.values())) or 1.0
        return sum(v * wy.get(t, 0.0) for t, v in wx.items()) / (nx * ny)

    # Ressemblance de part et d'autre de chaque frontière (entre la phrase i-1 et la phrase i).
    gaps = {i: sim(bag(window_back(i), i), bag(i, window_fwd(i))) for i in range(1, len(sentences))}
    # Profondeur de la « vallée » : de combien la ressemblance remonte à gauche et à droite.
    order = sorted(gaps)
    depth: dict[int, float] = {}
    for idx, i in enumerate(order):
        left = max([gaps[order[k]] for k in range(max(0, idx - 8), idx + 1)])
        right = max([gaps[order[k]] for k in range(idx, min(len(order), idx + 9))])
        depth[i] = (left - gaps[i]) + (right - gaps[i])
    if depth:
        values = list(depth.values())
        mean = sum(values) / len(values)
        std = math.sqrt(sum((v - mean) ** 2 for v in values) / len(values))
        cutoff = mean + 0.5 * std
    else:
        cutoff = math.inf

    boundaries: list[int] = []
    for i in sorted(depth, key=lambda k: -depth[k]):
        if depth[i] < cutoff or depth[i] <= 0.05:
            break
        start_i = i
        # Respecte une durée minimale de sujet de chaque côté des frontières déjà retenues.
        edges = [0, *sorted(boundaries), len(sentences)]
        pos = next(k for k, e in enumerate(edges) if e > start_i)
        lo, hi = edges[pos - 1], edges[pos]
        if (sentences[start_i - 1].end - sentences[lo].start >= min_topic_s
                and sentences[hi - 1].end - sentences[start_i].start >= min_topic_s):
            boundaries.append(start_i)

    edges = [0, *sorted(boundaries), len(sentences)]
    topics: list[Topic] = []
    for k in range(len(edges) - 1):
        a, b = edges[k], edges[k + 1] - 1
        tf = Counter()
        for k2 in range(a, b + 1):
            tf.update(vecs[k2])
        scored = sorted(tf, key=lambda t: (-tf[t] * vocab.idf(t), t))
        keywords = tuple(vocab.label(t) for t in scored if tf[t] >= 2)[:4] or tuple(vocab.label(t) for t in scored[:3])
        topics.append(Topic(k, sentences[a].id, sentences[b].id, sentences[a].start, sentences[b].end, keywords))
    return topics


def topic_of(topics: list[Topic], sentence_id: int) -> Topic | None:
    for t in topics:
        if t.first_sentence <= sentence_id <= t.last_sentence:
            return t
    return None
