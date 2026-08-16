#!/usr/bin/env python3
"""Per-post share cards, 1200x630: lead photo over a plate-white band carrying
the title. Pieces with no photograph get an intentionally designed text-only
card in the same typography, not an empty photographic layout. Helvetica
fallback is spec-blessed. Run after adding a post, commit the output; Vercel
never runs Python.

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

def line_width(draw, text, font, tracking):
    return sum(draw.textlength(c, font=font) for c in text) + tracking * max(0, len(text) - 1)

def wrap_lines(draw, text, font, tracking, max_width):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if line_width(draw, trial, font, tracking) <= max_width or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

def fit_title(draw, text, tracking, max_width, max_lines, start_size, min_size):
    size = start_size
    while size >= min_size:
        font = ImageFont.truetype(HELV, size)
        lines = wrap_lines(draw, text, font, tracking, max_width)
        if len(lines) <= max_lines and all(
            line_width(draw, ln, font, tracking) <= max_width for ln in lines
        ):
            return font, lines, size
        size -= 2
    font = ImageFont.truetype(HELV, min_size)
    return font, wrap_lines(draw, text, font, tracking, max_width)[:max_lines], min_size

def fm(raw):
    m = re.match(r"(?s)^---\n(.*?)\n---", raw)
    d = {}
    if m:
        for line in m.group(1).splitlines():
            kv = re.match(r"(\w+):\s*(.*)$", line.strip())
            if kv:
                d[kv.group(1)] = kv.group(2).strip().strip('"')
    return d

def draw_photo_card(dr, card, title, plate_label, src):
    img = Image.open(src).convert("RGB")
    # cover-crop into the area above the band
    tw, th = W, H - BAND
    scale = max(tw / img.width, th / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)))
    x0 = (img.width - tw) // 2
    y0 = (img.height - th) // 2
    card.paste(img.crop((x0, y0, x0 + tw, y0 + th)), (0, 0))
    dr.rectangle([0, H - BAND, W, H - BAND + 1], fill=ULTRA)
    t = title.upper()
    title_f, lines, _ = fit_title(dr, t, 6, W - 160, 1, 34, 20)
    tracked(dr, (0, H - BAND + 34), lines[0] if lines else t, title_f, 6, ULTRA, centre_x=W / 2)
    small_f = ImageFont.truetype(HELV, 15)
    line2 = f"TUSENBRUK   ·   {plate_label}" if plate_label else "TUSENBRUK"
    sq = 8
    w2 = line_width(dr, line2, small_f, 5)
    start = (W - (w2 + 16 + sq)) / 2
    dr.rectangle([start, H - 46, start + sq, H - 46 + sq], fill=RED)
    tracked(dr, (start + sq + 16, H - 52), line2, small_f, 5, MUTED)

def draw_text_card(dr, title, plate_label):
    """No photograph on file: a quiet, complete card built from the same
    typography, plate-white, ultramarine, muted ink, rules and red square —
    never an illustration, silhouette or invented object."""
    margin_x = 120
    top_rule, bottom_rule = 150, 480
    dr.rectangle([margin_x, top_rule, W - margin_x, top_rule + 1], fill=ULTRA)
    dr.rectangle([margin_x, bottom_rule, W - margin_x, bottom_rule + 1], fill=ULTRA)

    max_width = W - 2 * margin_x - 40
    label_f = ImageFont.truetype(HELV, 14)
    title_f, lines, size = fit_title(dr, title.upper(), 5, max_width, 2, 44, 24)
    line_height = size * 1.3
    brand_f = ImageFont.truetype(HELV, 15)

    label_h = 20 if plate_label else 0
    gap1 = 26 if plate_label else 0
    title_h = line_height * len(lines)
    gap2 = 30
    brand_h = 20

    block_h = label_h + gap1 + title_h + gap2 + brand_h
    zone_top, zone_bottom = top_rule + 24, bottom_rule - 24
    y = zone_top + max(0, (zone_bottom - zone_top - block_h) / 2)

    if plate_label:
        tracked(dr, (0, y), plate_label, label_f, 5, MUTED, centre_x=W / 2)
        y += label_h + gap1

    for ln in lines:
        tracked(dr, (0, y), ln, title_f, 5, ULTRA, centre_x=W / 2)
        y += line_height
    y += gap2

    brand = "TUSENBRUK"
    sq = 8
    w2 = line_width(dr, brand, brand_f, 5)
    start = (W - (w2 + 16 + sq)) / 2
    dr.rectangle([start, y, start + sq, y + sq], fill=RED)
    tracked(dr, (start + sq + 16, y - 6), brand, brand_f, 5, MUTED)

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
        plate_label = PLATE_NAMES.get(d.get("plate", ""), "")
        card = Image.new("RGB", (W, H), (255, 255, 255))
        dr = ImageDraw.Draw(card)

        photo_path = d.get("photo") or d.get("cardImage")
        src = os.path.join(PUBLIC, photo_path.lstrip("/")) if photo_path else None
        if src and os.path.exists(src):
            draw_photo_card(dr, card, title, plate_label, src)
        else:
            draw_text_card(dr, title, plate_label)

        card.save(os.path.join(OUT, f"{slug}.jpg"), "JPEG", quality=88)
        made += 1
        print(f"card: {slug}")
print(f"{made} cards")
