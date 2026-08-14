#!/usr/bin/env python3
"""Per-post share cards, 1200x630: lead photo over a plate-white band carrying
the title. Helvetica fallback is spec-blessed. Run after adding a post, commit
the output; Vercel never runs Python.

    python3 scripts/make_cards.py
"""
import os, re, sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow required: pip3 install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "content")
PUBLIC = os.path.join(ROOT, "public")
OUT = os.path.join(PUBLIC, "cards")
os.makedirs(OUT, exist_ok=True)

W, H, BAND = 1200, 630, 150
ULTRA = (22, 48, 107)
RED = (178, 38, 44)
MUTED = (85, 82, 75)
HELV = "/System/Library/Fonts/Helvetica.ttc"

PLATE_NAMES = {
    "photography": "PL. I — PHOTOGRAPHY", "watches": "PL. II — WATCHES",
    "motoring": "PL. III — MOTORING", "writing": "PL. IV — WRITING",
    "carry": "PL. V — CARRY", "travel": "PL. VI — TRAVEL",
}

def tracked(draw, xy, text, font, tracking, fill, centre_x=None):
    widths = [draw.textlength(c, font=font) for c in text]
    total = sum(widths) + tracking * max(0, len(text) - 1)
    x, y = xy
    if centre_x is not None:
        x = centre_x - total / 2
    for c, w in zip(text, widths):
        draw.text((x, y), c, font=font, fill=fill)
        x += w + tracking
    return total

def fm(raw):
    m = re.match(r"(?s)^---\n(.*?)\n---", raw)
    d = {}
    if m:
        for line in m.group(1).splitlines():
            kv = re.match(r"(\w+):\s*(.*)$", line.strip())
            if kv:
                d[kv.group(1)] = kv.group(2).strip().strip('"')
    return d

made = 0
for plate_dir in sorted(os.listdir(CONTENT)):
    full = os.path.join(CONTENT, plate_dir)
    if not os.path.isdir(full) or plate_dir in ("notes", "pages"):
        continue
    for f in sorted(os.listdir(full)):
        if not f.endswith(".md"):
            continue
        d = fm(open(os.path.join(full, f)).read())
        if d.get("draft") == "true":
            continue
        slug, title = d.get("slug", f[:-3]), d.get("title", "Untitled")
        card = Image.new("RGB", (W, H), (255, 255, 255))
        photo_path = d.get("photo")
        if photo_path:
            src = os.path.join(PUBLIC, photo_path.lstrip("/"))
            if os.path.exists(src):
                img = Image.open(src).convert("RGB")
                # cover-crop into the area above the band
                tw, th = W, H - BAND
                scale = max(tw / img.width, th / img.height)
                img = img.resize((round(img.width * scale), round(img.height * scale)))
                x0 = (img.width - tw) // 2
                y0 = (img.height - th) // 2
                card.paste(img.crop((x0, y0, x0 + tw, y0 + th)), (0, 0))
        dr = ImageDraw.Draw(card)
        dr.rectangle([0, H - BAND, W, H - BAND + 1], fill=ULTRA)
        title_f = ImageFont.truetype(HELV, 34)
        small_f = ImageFont.truetype(HELV, 15)
        t = title.upper()
        f_try = 34
        while f_try > 20:
            title_f = ImageFont.truetype(HELV, f_try)
            width = sum(dr.textlength(c, font=title_f) for c in t) + 6 * (len(t) - 1)
            if width < W - 160:
                break
            f_try -= 2
        tracked(dr, (0, H - BAND + 34), t, title_f, 6, ULTRA, centre_x=W / 2)
        line2 = "TUSENBRUK"
        plate_label = PLATE_NAMES.get(d.get("plate", ""), "")
        if plate_label:
            line2 = f"TUSENBRUK   ·   {plate_label}"
        sq = 8
        w2 = sum(dr.textlength(c, font=small_f) for c in line2) + 5 * (len(line2) - 1)
        start = (W - (w2 + 16 + sq)) / 2
        dr.rectangle([start, H - 46, start + sq, H - 46 + sq], fill=RED)
        tracked(dr, (start + sq + 16, H - 52), line2, small_f, 5, MUTED)
        card.save(os.path.join(OUT, f"{slug}.jpg"), "JPEG", quality=88)
        made += 1
        print(f"card: {slug}")
print(f"{made} cards")
