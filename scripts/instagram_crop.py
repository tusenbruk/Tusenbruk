#!/usr/bin/env python3
"""Crop photographs to Instagram formats. Standalone, and imported by publish.py.

    python3 scripts/instagram_crop.py public/photos/a.jpg public/photos/b.jpg \\
        --out social/instagram/my-slug --plate watches
    python3 scripts/instagram_crop.py a.jpg --formats story --plate carry --focal 0.6,0.4

Formats:
    square    1080x1080  carousel          carousel-NN.jpg
    portrait  1080x1350  alternative feed  portrait-NN.jpg
    story     1080x1920  plate label       story-NN.jpg

Crops are centre-weighted: the frame is centred on the focal point (default
0.5,0.5, the middle of the photograph) and pulled back inside the image, so a
crop never runs off an edge. Nothing is stretched, arranged or retouched. The
plate label on stories is the only addition, and it sits clear of the area
Instagram's own interface covers. Output JPEGs carry no EXIF/IPTC/XMP.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageOps
except ImportError:
    sys.exit("Pillow required: pip3 install Pillow")

SQUARE = (1080, 1080)
PORTRAIT = (1080, 1350)
STORY = (1080, 1920)

FORMATS = {
    "square": ("carousel", SQUARE),
    "portrait": ("portrait", PORTRAIT),
    "story": ("story", STORY),
}

PLATE = (247, 245, 239)
RED = (178, 38, 44)
GREEN = (46, 107, 94)
MUTED = (85, 82, 75)

PLATES = {
    "photography": ("PL. I — PHOTOGRAPHY", RED),
    "watches": ("PL. II — WATCHES", GREEN),
    "motoring": ("PL. III — MOTORING", GREEN),
    "writing": ("PL. IV — WRITING", RED),
    "carry": ("PL. V — CARRY", GREEN),
    "travel": ("PL. VI — TRAVEL", RED),
}

FONT_PATHS = [
    Path("/System/Library/Fonts/Helvetica.ttc"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
]

# Instagram's own chrome covers roughly the top and bottom 250px of a story.
STORY_SAFE_BOTTOM = 250
# Warn when a crop has to enlarge the source by more than this.
UPSCALE_WARN = 1.3


def font(size: int) -> ImageFont.FreeTypeFont:
    path = next((p for p in FONT_PATHS if p.exists()), None)
    if path is None:
        sys.exit("No supported local font found")
    return ImageFont.truetype(str(path), size)


def plate_label(plate: str) -> tuple[str, tuple[int, int, int]]:
    return PLATES.get(plate, ("TUSENBRUK", RED))


def parse_focal(value: str | tuple[float, float] | list[float] | None) -> tuple[float, float]:
    if value is None:
        return (0.5, 0.5)
    if isinstance(value, str):
        parts = [float(p) for p in value.split(",")]
    else:
        parts = [float(p) for p in value]
    if len(parts) != 2 or not all(0.0 <= p <= 1.0 for p in parts):
        raise ValueError("focal point must be two numbers between 0 and 1, e.g. 0.5,0.5")
    return (parts[0], parts[1])


def load(path: Path) -> Image.Image:
    with Image.open(path) as opened:
        image = ImageOps.exif_transpose(opened)
        return image.convert("RGB")


def crop_cover(
    image: Image.Image, size: tuple[int, int], focal: tuple[float, float] = (0.5, 0.5)
) -> tuple[Image.Image, float]:
    """Fill `size` exactly. Returns the crop and the scale applied to the source."""
    tw, th = size
    scale = max(tw / image.width, th / image.height)
    resized = image.resize(
        (max(tw, round(image.width * scale)), max(th, round(image.height * scale))),
        Image.Resampling.LANCZOS,
    )
    left = round(focal[0] * resized.width - tw / 2)
    top = round(focal[1] * resized.height - th / 2)
    left = min(max(left, 0), resized.width - tw)
    top = min(max(top, 0), resized.height - th)
    return resized.crop((left, top, left + tw, top + th)), scale


def tracked_width(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, tracking: int) -> float:
    return sum(draw.textlength(c, font=face) for c in text) + tracking * max(0, len(text) - 1)


def draw_tracked(
    draw: ImageDraw.ImageDraw, x: float, y: float, text: str, face: ImageFont.FreeTypeFont,
    tracking: int, fill: tuple[int, int, int],
) -> None:
    for char in text:
        draw.text((x, y), char, font=face, fill=fill)
        x += draw.textlength(char, font=face) + tracking


def overlay_plate_label(story: Image.Image, plate: str) -> Image.Image:
    """A plate-white tab, bottom left, clear of Instagram's reply bar: the plate
    colour square, the plate name in tracked capitals. No bold, no gradient."""
    label, colour = plate_label(plate)
    canvas = story.copy()
    draw = ImageDraw.Draw(canvas)
    face = font(24)
    tracking = 5
    pad_x, pad_y, square, gap = 28, 22, 14, 18
    text_w = tracked_width(draw, label, face, tracking)
    box_w = pad_x * 2 + square + gap + text_w
    box_h = 24 + pad_y * 2
    left = 70
    bottom = STORY[1] - STORY_SAFE_BOTTOM - 40
    top = bottom - box_h
    draw.rectangle((left, top, left + box_w, bottom), fill=PLATE)
    sq_top = top + (box_h - square) / 2
    draw.rectangle((left + pad_x, sq_top, left + pad_x + square, sq_top + square), fill=colour)
    draw_tracked(draw, left + pad_x + square + gap, top + pad_y - 2, label, face, tracking, MUTED)
    return canvas


def save_jpeg(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(path, "JPEG", quality=92, optimize=True)  # no exif passed: none written


def crop_one(
    source: Path, fmt: str, target: Path, plate: str = "", focal: tuple[float, float] = (0.5, 0.5)
) -> float:
    """Write one crop; returns the upscale factor applied to the source."""
    _prefix, size = FORMATS[fmt]
    image, scale = crop_cover(load(source), size, focal)
    if fmt == "story":
        image = overlay_plate_label(image, plate)
    save_jpeg(image, target)
    return scale


def crop_set(
    sources: list[Path], out_dir: Path, formats: list[str], plate: str = "",
    focal: tuple[float, float] = (0.5, 0.5),
) -> list[tuple[Path, str, Path, float]]:
    """Crop every source into every format. Returns (target, format, source, scale)."""
    results = []
    for fmt in formats:
        prefix, _size = FORMATS[fmt]
        for index, source in enumerate(sources, start=1):
            target = out_dir / f"{prefix}-{index:02d}.jpg"
            scale = crop_one(source, fmt, target, plate, focal)
            results.append((target, fmt, source, scale))
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("images", nargs="+", type=Path)
    parser.add_argument("--out", type=Path, required=True, help="output directory")
    parser.add_argument("--formats", default="square,portrait,story",
                        help="comma list of: square, portrait, story (default: all)")
    parser.add_argument("--plate", default="", choices=[""] + sorted(PLATES), help="plate key for the story label")
    parser.add_argument("--focal", default="0.5,0.5", help="focal point as x,y in 0..1 (default 0.5,0.5)")
    args = parser.parse_args()

    formats = [f.strip() for f in args.formats.split(",") if f.strip()]
    unknown = [f for f in formats if f not in FORMATS]
    if unknown:
        parser.error(f"unknown format: {', '.join(unknown)}")
    missing = [str(p) for p in args.images if not p.exists()]
    if missing:
        parser.error(f"missing image: {', '.join(missing)}")
    try:
        focal = parse_focal(args.focal)
    except ValueError as err:
        parser.error(str(err))

    for target, fmt, source, scale in crop_set(args.images, args.out, formats, args.plate, focal):
        note = f"  (source enlarged {scale:.2f}x)" if scale > UPSCALE_WARN else ""
        print(f"{fmt:8} {target}  <- {source.name}{note}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
