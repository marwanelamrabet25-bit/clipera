"""
Typographie française : remplace l'espace avant ? ! ; par une espace fine insécable (U+202F)
et l'espace avant : ainsi qu'à l'intérieur des guillemets « » par une espace insécable (U+00A0).
N'agit que sur le texte JSX et les chaînes entre guillemets doubles d'apparence rédactionnelle.
Usage : python3 scripts/fr-typo.py src
"""
import re, sys, pathlib

NNBSP, NBSP = " ", " "
CODEY = re.compile(r"[=(){}]|&&|\|\||=>|\bclassName\b")

def fix(t: str) -> str:
    t = re.sub(r"(?<=\S) ([?!;])", NNBSP + r"\1", t)
    t = re.sub(r"(?<=\S) :(?=\s|$|\")", NBSP + ":", t)
    t = re.sub(r"« ", "«" + NBSP, t)
    t = re.sub(r" »", NBSP + "»", t)
    return t

def prose(s: str) -> bool:
    return bool(re.search(r"[A-Za-zÀ-ÿ]{2,} [A-Za-zÀ-ÿ]{2,}", s)) and not CODEY.search(s)

def process(src: str) -> str:
    # Texte JSX entre balises
    def jsx(m):
        inner = m.group(1)
        return ">" + (fix(inner) if prose(inner) else inner) + "<"
    src = re.sub(r">([^<>{}\n]*[^<>{}\s][^<>{}]*)<", jsx, src)
    # Lignes de texte JSX sur plusieurs lignes (sans balise sur la ligne)
    out = []
    for line in src.split("\n"):
        s = line.strip()
        if s and not re.search(r"[<>{}=;\"'`]|^//|^\*|^/\*|^import |^export ", s.replace("&apos;", "")) and prose(s):
            line = fix(line)
        out.append(line)
    src = "\n".join(out)
    # Chaînes entre guillemets doubles
    def dq(m):
        inner = m.group(1)
        return '"' + (fix(inner) if prose(inner) and len(inner) > 8 else inner) + '"'
    src = re.sub(r'"((?:[^"\\\n]|\\.)*)"', dq, src)
    return src

root = pathlib.Path(sys.argv[1])
changed = 0
for p in list(root.rglob("*.tsx")) + list(root.rglob("*.ts")):
    s = p.read_text()
    n = process(s)
    if n != s:
        p.write_text(n)
        changed += 1
        print("modifié :", p)
print(changed, "fichier(s)")
