"""Vectorise le blason : assets/brand/blason-source.png (or sur fond transparent) -> public/brand/blason.svg

Seuil sur la transparence, puis tracé en courbes de Bézier (potrace). Les trous (volutes, lettres)
sont gérés par la règle de remplissage evenodd, que SVGLoader de three.js sait lire.

    pip install potracer pillow numpy && python3 scripts/vectorize-blason.py
"""
import numpy as np
import potrace
from PIL import Image, ImageFilter

SRC, OUT, UPSCALE = "assets/brand/blason-source.png", "public/brand/blason.svg", 3

img = Image.open(SRC).convert("RGBA")
w, h = img.size
alpha = img.getchannel("A").resize((w * UPSCALE, h * UPSCALE), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
# potracer trace les pixels à False : on lui passe donc le fond, pas la forme
mask = np.array(alpha) <= 120

paths = potrace.Bitmap(mask).trace(turdsize=40, alphamax=1.0, opticurve=True, opttolerance=0.25)

def fmt(p):
    return f"{p.x / UPSCALE:.2f} {p.y / UPSCALE:.2f}"

d = []
for curve in paths:
    d.append(f"M{fmt(curve.start_point)}")
    for seg in curve.segments:
        if seg.is_corner:
            d.append(f"L{fmt(seg.c)}L{fmt(seg.end_point)}")
        else:
            d.append(f"C{fmt(seg.c1)} {fmt(seg.c2)} {fmt(seg.end_point)}")
    d.append("Z")

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
    f'<path fill="#C9A24B" fill-rule="evenodd" d="{"".join(d)}"/></svg>'
)
open(OUT, "w").write(svg)
print(f"{OUT}: {len(paths)} contours, {len(svg) // 1024} Ko")
