"""Réduit le poids des captures PNG (quantification légère, sans perte visible). Usage : python3 optimize-images.py <dossier>"""
import sys, pathlib
from PIL import Image

root = pathlib.Path(sys.argv[1])
for p in root.rglob("*.png"):
    im = Image.open(p).convert("RGB")
    # Limite la hauteur des captures pleine page pour rester raisonnable.
    if p.stem == "full" and im.height > 6000:
        im = im.crop((0, 0, im.width, 6000))
    before = p.stat().st_size
    im.save(p, optimize=True)
    print(f"{p.relative_to(root)}: {before//1024} Ko → {p.stat().st_size//1024} Ko")
