#!/usr/bin/env python3
"""Crop photographs to Instagram sizes, keeping the object in frame.

For each source photograph this writes three variants:

    <slug>_square_NN.jpg    1080 x 1080
    <slug>_portrait_NN.jpg  1080 x 1350
    <slug>_story_NN.jpg     1080 x 1920, plate label in a band at the bottom

The crop is centre-weighted. Where the photograph is wider or taller than the
target there is slack, and the window slides toward the part of the frame with
the most detail (the object), never past the edge. A focal point can be given
to override that. Output carries no EXIF, IPTC or XMP.

    python3 scripts/instagram_crop.py photo.jpg --slug my-piece --plate watches --out out/
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
except ImportError:
    sys.exit("Pillow required: pip3 install Pillow")

sys.path.insert(0, str(Path(__file__).resolve().parent))
from social_common import PLATE_NAMES, ROOT, load_config  # noqa: E402

SQUARE = (1080, 1080)
PORTRAIT = (1080, 1350)
STORY = (1080, 1920)
STORY_BAND = 200  # plate-white band at the foot of the story; the photograph sits above it

PLATE = (247, 245, 239)
RED = (178, 38, 44)
MUTED = (85, 82, 75)

FONT_PATHS = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_PATHS:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


def load_image(path: Path) -> Image.Image:
    """Open, honour EXIF orientation, drop to RGB. The returned image has no metadata."""
    with Image.open(path) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
    image.info.clear()
    return image


def focal_point(image: Image.Image) -> tuple[float, float]:
    """Centre of detail, as fractions of width and height, weighted toward the centre.

    Edge energy on a small greyscale copy stands in for "where the object is"; a
    Gaussian centred on the frame stops a busy edge from dragging the crop away.
    """
    small = image.convert("L")
    small.thumbnail((64, 64))
    edges = small.filter(ImageFilter.FIND_EDGES)
    pixels = edges.load()
    width, height = edges.size
    total = sum_x = sum_y = 0.0
    for y in range(height):
        for x in range(width):
            fx, fy = (x + 0.5) / width, (y + 0.5) / height
            weight = pixels[x, y] * math.exp(-(((fx - 0.5) ** 2) + ((fy - 0.5) ** 2)) / (2 * 0.3**2))
            total += weight
            sum_x += weight * fx
            sum_y += weight * fy
    if total == 0:
        return 0.5, 0.5
    return sum_x / total, sum_y / total


def crop_box(
    source: tuple[int, int], target: tuple[int, int], focal: tuple[float, float]
) -> tuple[float, float, float, float]:
    """The largest window of the target's aspect that fits the source, centred on
    the focal point and clamped to the frame."""
    sw, sh = source
    tw, th = target
    scale = max(tw / sw, th / sh)
    cw, ch = tw / scale, th / scale
    left = min(max(focal[0] * sw - cw / 2, 0), sw - cw)
    top = min(max(focal[1] * sh - ch / 2, 0), sh - ch)
    return left, top, left + cw, top + ch


def smart_crop(
    image: Image.Image, target: tuple[int, int], focal: tuple[float, float] | None = None
) -> Image.Image:
    box = crop_box(image.size, target, focal or focal_point(image))
    return image.resize(target, Image.Resampling.LANCZOS, box=box)


def plate_band(width: int, height: int, plate: str) -> Image.Image:
    band = Image.new("RGB", (width, height), PLATE)
    draw = ImageDraw.Draw(band)
    label = " ".join(PLATE_NAMES.get(plate, "TUSENBRUK"))  # letterspaced capitals
    face = font(26)
    box = draw.textbbox((0, 0), label, font=face)
    text_w, text_h = box[2] - box[0], box[3] - box[1]
    gap, swatch = 22, 26
    x = (width - (swatch + gap + text_w)) / 2
    y = (height - text_h) / 2
    draw.rectangle((x, y + text_h / 2 - swatch / 2, x + swatch, y + text_h / 2 + swatch / 2), fill=RED)
    draw.text((x + swatch + gap, y - box[1]), label, font=face, fill=MUTED)
    return band


def square(image: Image.Image, focal: tuple[float, float] | None = None) -> Image.Image:
    return smart_crop(image, SQUARE, focal)


def portrait(image: Image.Image, focal: tuple[float, float] | None = None) -> Image.Image:
    return smart_crop(image, PORTRAIT, focal)


def story(image: Image.Image, plate: str, focal: tuple[float, float] | None = None) -> Image.Image:
    canvas = Image.new("RGB", STORY, PLATE)
    photo = smart_crop(image, (STORY[0], STORY[1] - STORY_BAND), focal)
    canvas.paste(photo, (0, 0))
    canvas.paste(plate_band(STORY[0], STORY_BAND, plate), (0, STORY[1] - STORY_BAND))
    return canvas


def save(image: Image.Image, path: Path, quality: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(path, "JPEG", quality=quality, optimize=True)  # no exif= : nothing carried over


def build_variants(
    sources: list[Path],
    slug: str,
    plate: str,
    out_dir: Path,
    quality: int = 85,
    focals: dict[int, tuple[float, float]] | None = None,
) -> list[Path]:
    """Write square, portrait and story variants for each source, numbered from 01."""
    written: list[Path] = []
    for index, source in enumerate(sources, start=1):
        image = load_image(source)
        focal = (focals or {}).get(index)
        for name, render in (
            ("square", lambda: square(image, focal)),
            ("portrait", lambda: portrait(image, focal)),
            ("story", lambda: story(image, plate, focal)),
        ):
            target = out_dir / f"{slug}_{name}_{index:02d}.jpg"
            save(render(), target, quality)
            written.append(target)
    return written


def parse_focal(value: str) -> tuple[float, float]:
    x, y = (float(part) for part in value.split(","))
    if not (0 <= x <= 1 and 0 <= y <= 1):
        raise argparse.ArgumentTypeError("focal point is two fractions between 0 and 1, e.g. 0.56,0.48")
    return x, y


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("photos", nargs="+", type=Path)
    parser.add_argument("--slug", required=True)
    parser.add_argument("--plate", default="", help="plate key for the story label, e.g. watches")
    parser.add_argument("--out", type=Path, default=ROOT / "social" / "instagram")
    parser.add_argument("--quality", type=int)
    parser.add_argument("--focal", type=parse_focal, help="x,y fractions; applied to every photo")
    args = parser.parse_args()

    quality = args.quality or load_config()["defaults"]["image_quality"]
    focals = {i: args.focal for i in range(1, len(args.photos) + 1)} if args.focal else None
    for path in build_variants(args.photos, args.slug, args.plate, args.out, quality, focals):
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
