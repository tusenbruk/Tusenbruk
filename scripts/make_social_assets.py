#!/usr/bin/env python3
"""Generate reviewable Instagram carousel, story and profile assets.

Nothing is posted. Copy and approval live in social/queue.json; generated JPEGs
contain no EXIF/IPTC/XMP metadata.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow required: pip3 install Pillow")


ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
PUBLIC = ROOT / "public"
SOCIAL = ROOT / "social"
OUT = SOCIAL / "output"
BRAND = SOCIAL / "brand"
QUEUE = SOCIAL / "queue.json"

FEED = (1080, 1350)
STORY = (1080, 1920)
AVATAR = (1080, 1080)

PLATE = (247, 245, 239)
ULTRA = (22, 48, 107)
RED = (178, 38, 44)
INK = (26, 24, 20)
MUTED = (85, 82, 75)
RULE = (216, 212, 204)

FONT_PATHS = [
    Path("/System/Library/Fonts/Helvetica.ttc"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
]
FONT_PATH = next((path for path in FONT_PATHS if path.exists()), None)
if FONT_PATH is None:
    sys.exit("No supported local font found")

PLATE_NAMES = {
    "photography": "PL. I — PHOTOGRAPHY",
    "watches": "PL. II — WATCHES",
    "motoring": "PL. III — MOTORING",
    "writing": "PL. IV — WRITING",
    "carry": "PL. V — CARRY",
    "travel": "PL. VI — TRAVEL",
}


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_PATH), size)


def frontmatter(raw: str) -> dict[str, str]:
    match = re.match(r"(?s)^---\n(.*?)\n---", raw)
    data: dict[str, str] = {}
    if not match:
        return data
    for line in match.group(1).splitlines():
        value = re.match(r"(\w+):\s*(.*)$", line.strip())
        if value:
            data[value.group(1)] = value.group(2).strip().strip('"')
    return data


def posts_by_slug() -> dict[str, dict[str, str]]:
    posts: dict[str, dict[str, str]] = {}
    for path in CONTENT.glob("*/*.md"):
        if path.parent.name in {"notes", "pages"}:
            continue
        data = frontmatter(path.read_text())
        if data.get("draft") == "true":
            continue
        slug = data.get("slug", path.stem)
        posts[slug] = data
    return posts


def text_width(draw: ImageDraw.ImageDraw, value: str, face: ImageFont.FreeTypeFont) -> float:
    return draw.textlength(value, font=face)


def wrap(draw: ImageDraw.ImageDraw, value: str, face: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in value.split():
        candidate = f"{current} {word}".strip()
        if not current or text_width(draw, candidate, face) <= width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def fit_lines(
    draw: ImageDraw.ImageDraw,
    value: str,
    width: int,
    max_lines: int,
    start: int,
    minimum: int,
) -> tuple[ImageFont.FreeTypeFont, list[str]]:
    for size in range(start, minimum - 1, -2):
        face = font(size)
        lines = wrap(draw, value, face, width)
        if len(lines) <= max_lines:
            return face, lines
    face = font(minimum)
    return face, wrap(draw, value, face, width)[:max_lines]


def centred_lines(
    draw: ImageDraw.ImageDraw,
    lines: list[str],
    face: ImageFont.FreeTypeFont,
    y: int,
    fill: tuple[int, int, int],
    spacing: int,
) -> int:
    box = draw.textbbox((0, 0), "Ag", font=face)
    line_height = box[3] - box[1]
    for line in lines:
        width = text_width(draw, line, face)
        draw.text(((draw._image.size[0] - width) / 2, y), line, font=face, fill=fill)
        y += line_height + spacing
    return y


def brand(draw: ImageDraw.ImageDraw, width: int, y: int, inverse: bool = False) -> None:
    label = "T U S E N B R U K"
    face = font(22)
    label_width = text_width(draw, label, face)
    total = 28 + 18 + label_width
    x = (width - total) / 2
    draw.rectangle((x, y + 5, x + 28, y + 33), fill=RED)
    draw.text((x + 46, y), label, font=face, fill=PLATE if inverse else MUTED)


def save_jpeg(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(path, "JPEG", quality=92, optimize=True)


def contained_photo(source: Path, box: tuple[int, int, int, int]) -> tuple[Image.Image, tuple[int, int]]:
    image = Image.open(source).convert("RGB")
    x1, y1, x2, y2 = box
    available = (x2 - x1, y2 - y1)
    image.thumbnail(available, Image.Resampling.LANCZOS)
    return image, (x1 + (available[0] - image.width) // 2, y1 + (available[1] - image.height) // 2)


def feed_photo(post: dict[str, str], source: Path, target: Path) -> None:
    canvas = Image.new("RGB", FEED, PLATE)
    draw = ImageDraw.Draw(canvas)
    image, pos = contained_photo(source, (70, 78, 1010, 940))
    canvas.paste(image, pos)
    draw.rectangle((69, 77, 1010, 941), outline=RULE, width=2)
    plate = PLATE_NAMES.get(post.get("plate", ""), "")
    draw.text((70, 1000), plate, font=font(22), fill=MUTED)
    title_face, title_lines = fit_lines(draw, post.get("title", ""), 940, 2, 50, 34)
    y = 1050
    for line in title_lines:
        draw.text((70, y), line, font=title_face, fill=ULTRA)
        y += 62
    draw.rectangle((70, 1260, 1010, 1262), fill=ULTRA)
    brand(draw, FEED[0], 1280)
    save_jpeg(canvas, target)


def detail_card(post: dict[str, str], hook: str, target: Path) -> None:
    canvas = Image.new("RGB", FEED, PLATE)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((90, 150, 990, 152), fill=ULTRA)
    draw.text((90, 205), PLATE_NAMES.get(post.get("plate", ""), "TUSENBRUK"), font=font(22), fill=MUTED)
    face, lines = fit_lines(draw, hook, 850, 7, 58, 38)
    line_box = draw.textbbox((0, 0), "Ag", font=face)
    line_height = line_box[3] - line_box[1] + 22
    block_height = len(lines) * line_height
    y = max(340, (FEED[1] - block_height) // 2 - 30)
    for line in lines:
        draw.text((90, y), line, font=face, fill=INK)
        y += line_height
    draw.rectangle((90, 1165, 990, 1167), fill=ULTRA)
    brand(draw, FEED[0], 1225)
    save_jpeg(canvas, target)


def read_card(post: dict[str, str], target: Path) -> None:
    canvas = Image.new("RGB", FEED, ULTRA)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((90, 150, 990, 152), fill=PLATE)
    draw.text((90, 215), "READ", font=font(22), fill=PLATE)
    face, lines = fit_lines(draw, post.get("title", ""), 850, 4, 72, 44)
    y = 390
    for line in lines:
        draw.text((90, y), line, font=face, fill=PLATE)
        y += 92
    subject = post.get("subject", "")
    if subject:
        draw.text((90, min(y + 35, 970)), f"PORTRAIT — {subject.upper()}", font=font(20), fill=(200, 204, 217))
    draw.text((90, 1135), "TUSENBRUK.COM", font=font(28), fill=PLATE)
    brand(draw, FEED[0], 1240, inverse=True)
    save_jpeg(canvas, target)


def story_card(post: dict[str, str], source: Path, target: Path) -> None:
    canvas = Image.new("RGB", STORY, ULTRA)
    draw = ImageDraw.Draw(canvas)
    image, pos = contained_photo(source, (70, 170, 1010, 1120))
    canvas.paste(image, pos)
    draw.rectangle((69, 169, 1010, 1121), outline=PLATE, width=2)
    draw.text((70, 100), PLATE_NAMES.get(post.get("plate", ""), "TUSENBRUK"), font=font(22), fill=PLATE)
    face, lines = fit_lines(draw, post.get("title", ""), 940, 3, 66, 42)
    y = 1240
    for line in lines:
        draw.text((70, y), line, font=face, fill=PLATE)
        y += 84
    draw.rectangle((70, 1640, 1010, 1642), fill=PLATE)
    draw.text((70, 1705), "READ AT TUSENBRUK.COM", font=font(28), fill=PLATE)
    brand(draw, STORY[0], 1810, inverse=True)
    save_jpeg(canvas, target)


def manifesto_card(kicker: str, copy: str, target: Path, inverse: bool) -> None:
    bg, fg, quiet = (ULTRA, PLATE, (200, 204, 217)) if inverse else (PLATE, INK, MUTED)
    canvas = Image.new("RGB", FEED, bg)
    draw = ImageDraw.Draw(canvas)
    rule = PLATE if inverse else ULTRA
    draw.rectangle((90, 155, 990, 157), fill=rule)
    draw.text((90, 220), kicker, font=font(22), fill=quiet)
    face, lines = fit_lines(draw, copy, 850, 6, 68, 42)
    y = 430
    for line in lines:
        draw.text((90, y), line, font=face, fill=fg)
        y += 88
    draw.rectangle((90, 1165, 990, 1167), fill=rule)
    brand(draw, FEED[0], 1230, inverse=inverse)
    save_jpeg(canvas, target)


def avatar(target: Path) -> None:
    canvas = Image.new("RGB", AVATAR, ULTRA)
    draw = ImageDraw.Draw(canvas)
    face = font(500)
    tbox = draw.textbbox((0, 0), "T", font=face)
    tx = (AVATAR[0] - (tbox[2] - tbox[0])) / 2
    draw.text((tx, 190), "T", font=face, fill=PLATE)
    draw.rectangle((515, 770, 565, 820), fill=RED)
    save_jpeg(canvas, target)


def expected_assets(queue: dict, posts: dict[str, dict[str, str]]) -> list[tuple[Path, tuple[int, int] | None]]:
    expected: list[tuple[Path, tuple[int, int] | None]] = [(BRAND / "tusenbruk-avatar.jpg", AVATAR)]
    for index, _slide in enumerate(queue["manifesto"]["slides"], start=1):
        expected.append((OUT / "manifesto" / f"{index:02d}.jpg", FEED))
    expected.append((OUT / "manifesto" / "caption.txt", None))
    for item in queue["posts"]:
        if item["status"] == "hold":
            continue
        post = posts.get(item["slug"])
        if not post or not post.get("photo"):
            continue
        folder = OUT / item["slug"]
        expected.extend(
            [
                (folder / "01-photo.jpg", FEED),
                (folder / "02-detail.jpg", FEED),
                (folder / "03-read.jpg", FEED),
                (folder / "story.jpg", STORY),
                (folder / "caption.txt", None),
                (folder / "alt.txt", None),
            ]
        )
    return expected


def check(queue: dict, posts: dict[str, dict[str, str]]) -> int:
    errors = 0
    for path, dimensions in expected_assets(queue, posts):
        if not path.exists():
            print(f"missing: {path.relative_to(ROOT)}")
            errors += 1
            continue
        if dimensions:
            with Image.open(path) as image:
                if image.size != dimensions:
                    print(f"wrong dimensions: {path.relative_to(ROOT)} {image.size}, expected {dimensions}")
                    errors += 1
    if errors:
        return 1
    print("social assets: clean")
    return 0


def generate(queue: dict, posts: dict[str, dict[str, str]]) -> None:
    avatar(BRAND / "tusenbruk-avatar.jpg")

    manifesto = queue["manifesto"]
    manifest_dir = OUT / "manifesto"
    for index, (kicker, copy) in enumerate(manifesto["slides"], start=1):
        manifesto_card(kicker, copy, manifest_dir / f"{index:02d}.jpg", inverse=index % 2 == 1)
    manifest_dir.mkdir(parents=True, exist_ok=True)
    (manifest_dir / "caption.txt").write_text(manifesto["caption"].rstrip() + "\n")

    for item in queue["posts"]:
        slug = item["slug"]
        if item["status"] == "hold":
            print(f"hold: {slug} — {item.get('reason', '')}")
            continue
        post = posts.get(slug)
        if post is None:
            raise SystemExit(f"queue references unknown published post: {slug}")
        photo = post.get("photo")
        if not photo:
            raise SystemExit(f"queue item has no documentary photo: {slug}")
        source = PUBLIC / photo.lstrip("/")
        if not source.exists():
            raise SystemExit(f"missing source photograph: {source}")

        folder = OUT / slug
        feed_photo(post, source, folder / "01-photo.jpg")
        detail_card(post, item["hook"], folder / "02-detail.jpg")
        read_card(post, folder / "03-read.jpg")
        story_card(post, source, folder / "story.jpg")
        (folder / "caption.txt").write_text(item["caption"].rstrip() + "\n")
        (folder / "alt.txt").write_text(item["alt"].rstrip() + "\n")
        print(f"social pack: {slug}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    queue = json.loads(QUEUE.read_text())
    posts = posts_by_slug()
    if args.check:
        return check(queue, posts)
    generate(queue, posts)
    return check(queue, posts)


if __name__ == "__main__":
    raise SystemExit(main())
