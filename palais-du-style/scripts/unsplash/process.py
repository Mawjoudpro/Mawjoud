"""
Photos temporaires Unsplash : téléchargement, recadrage, étalonnage, WebP.

Lancé par la GitHub Action « Photos Unsplash » (.github/workflows/unsplash-images.yml) :
le serveur de GitHub télécharge les originaux, ce script les prépare et l'Action enregistre
le résultat dans public/images/placeholder/ (les originaux ne sont pas conservés).

Réglages par photo (PHOTOS) :
  ratio  : (largeur, hauteur) du recadrage ; size : largeur finale en px
  focus  : centre du recadrage dans la photo d'origine, de 0 à 1 (0.5, 0.5 = centré)
  zoom   : > 1 resserre le cadre autour du focus
  masks  : zones à flouter/assombrir (logo, marque lisible), en fractions de l'image FINALE (x0, y0, x1, y1)
"""

import json
import sys
import time
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "images" / "placeholder"
PREVIEW = Path(__file__).resolve().parent / "preview"

PHOTOS = [
    {"file": "campagne", "id": "-Q4W2rAuKsw", "src": "photo-1549699143-b6bf1cde4605", "ratio": (16, 9), "size": 1600, "focus": (0.5, 0.5)},
    {"file": "ambiance", "id": "-dX49A6SU9w", "src": "photo-1541371763992-a9d00e78b865", "ratio": (16, 9), "size": 1600, "focus": (0.5, 0.5)},
    {"file": "sneakers", "id": "zadrrJWgUDQ", "src": "photo-1632497775901-50ba4637399f", "ratio": (4, 5), "size": 900, "focus": (0.5, 0.5)},
    {"file": "doudoune", "id": "uLWk3kDXBgU", "src": "photo-1614031679232-0dae776a72ee", "ratio": (4, 5), "size": 900, "focus": (0.5, 0.5)},
    {"file": "sac", "id": "XwjrPFW7xw0", "src": "photo-1624687943971-e86af76d57de", "ratio": (4, 5), "size": 900, "focus": (0.5, 0.5)},
    {"file": "casquette", "id": "gcZcCqpGEw0", "src": "photo-1656166229825-8bb5c3214111", "ratio": (4, 5), "size": 900, "focus": (0.5, 0.5)},
    {"file": "hoodie", "id": "N6BP12FB_XU", "src": "photo-1611817757591-c3f345024273", "ratio": (4, 5), "size": 900, "focus": (0.5, 0.5)},
]

UA = {"User-Agent": "Mozilla/5.0 (palais-du-style image pipeline)"}


def get(url: str) -> bytes:
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                data = r.read()
                if r.headers.get_content_type().startswith("image/"):
                    return data
                raise ValueError(f"pas une image ({r.headers.get_content_type()})")
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 ** attempt)
    raise RuntimeError(f"{url} : {last}")


def download(p: dict) -> Image.Image:
    # lien de téléchargement officiel d'abord (compte le téléchargement pour le photographe), sinon le CDN
    try:
        data = get(f"https://unsplash.com/photos/{p['id']}/download?force=true&w=2400")
    except Exception as e:  # noqa: BLE001
        print(f"  lien officiel indisponible ({e}), CDN")
        data = get(f"https://images.unsplash.com/{p['src']}?w=2400&q=92&fm=jpg")
    return Image.open(BytesIO(data)).convert("RGB")


def crop(im: Image.Image, ratio, focus, zoom=1.0) -> Image.Image:
    w, h = im.size
    rw, rh = ratio
    cw, ch = (w, w * rh / rw) if w * rh / rw <= h else (h * rw / rh, h)
    cw, ch = cw / zoom, ch / zoom
    cx = min(max(focus[0] * w, cw / 2), w - cw / 2)
    cy = min(max(focus[1] * h, ch / 2), h - ch / 2)
    return im.crop((round(cx - cw / 2), round(cy - ch / 2), round(cx + cw / 2), round(cy + ch / 2)))


def grade(im: Image.Image) -> Image.Image:
    """Même étalonnage léger partout : contraste +5 %, saturation -10 %, un peu de chaleur."""
    im = ImageEnhance.Contrast(im).enhance(1.05)
    im = ImageEnhance.Color(im).enhance(0.90)
    r, g, b = im.split()
    r = r.point(lambda v: min(255, round(v * 1.035 + 2)))
    g = g.point(lambda v: min(255, round(v * 1.01)))
    b = b.point(lambda v: round(v * 0.955))
    return Image.merge("RGB", (r, g, b))


def hide(im: Image.Image, boxes) -> Image.Image:
    """Floute et assombrit discrètement des zones (logo lisible), bords adoucis."""
    if not boxes:
        return im
    w, h = im.size
    soft = im.filter(ImageFilter.GaussianBlur(14))
    soft = ImageEnhance.Brightness(soft).enhance(0.82)
    mask = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(mask)
    for x0, y0, x1, y1 in boxes:
        d.rounded_rectangle((x0 * w, y0 * h, x1 * w, y1 * h), radius=min(w, h) * 0.03, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) * 0.012))
    return Image.composite(soft, im, mask)


def main() -> None:
    only = set(sys.argv[1:])
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    report = {}
    for p in PHOTOS:
        if only and p["file"] not in only:
            continue
        print(p["file"])
        src = download(p)
        # aperçu de l'original entier (pour régler focus / masques), petit et léger
        prev = src.copy()
        prev.thumbnail((700, 700))
        prev.save(PREVIEW / f"{p['file']}.jpg", quality=62)

        rw, rh = p["ratio"]
        size = (p["size"], round(p["size"] * rh / rw))
        im = crop(src, p["ratio"], p.get("focus", (0.5, 0.5)), p.get("zoom", 1.0))
        im = im.resize(size, Image.LANCZOS)
        im = grade(im)
        im = hide(im, p.get("masks"))
        dest = OUT / f"{p['file']}.webp"
        im.save(dest, "WEBP", quality=80, method=6)
        report[p["file"]] = {"source": src.size, "final": size, "ko": round(dest.stat().st_size / 1024)}
        print(" ", report[p["file"]])
    (PREVIEW / "report.json").write_text(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
