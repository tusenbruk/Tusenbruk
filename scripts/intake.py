#!/usr/bin/env python3
"""Scaffold a new Tusenbruk piece from photographs and notes.

Resizes the photographs into public/photos/, and writes a draft to
content/<plate>/<slug>.md carrying the frontmatter and an interview brief. The
notes you supply are copied in verbatim under "Source notes". Nothing is
written into the prose: the piece is drafted later, from those notes alone.
The draft is always `draft: true`; an existing piece or photograph is never
overwritten.

    python3 scripts/intake.py --title "The case that was never polished" \\
        --plate watches --object "Rolex GMT-Master II 116710LN" \\
        --subject "A Sydney builder" --place "Sydney, Australia" \\
        --photos photos/gmt/ --notes notes.txt
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow required: pip3 install Pillow")

sys.path.insert(0, str(Path(__file__).resolve().parent))
from social_common import PLATES, ROOT, find_piece  # noqa: E402

PHOTO_SUFFIXES = {".jpg", ".jpeg", ".png", ".heic", ".tif", ".tiff"}
WEB_WIDTH = 1600
WEB_QUALITY = 78

BRIEF_MARKER = "Draft brief — not for publication."
NOTES_MARKER = "## Source notes (verbatim)"

BRIEF = f"""> **{BRIEF_MARKER}** Fill the prompts with real, specific detail. If a prompt has no
> true answer, leave it blank. Nothing gets invented.

## The person

- Who are they, and what do their days look like?
- Why do we care about them before we care about the object?

## History

- When did it arrive, and what was happening in their life after?
- What has it been through since? Places, trips, incidents, seasons. Name them.

## The unique detail

- One thing that happened to THIS object that could not belong to anyone else's.
  The scratch, the repair, the day it failed. Without it the draft fails.

## Use

- How is it used, how often, and where?
"""


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower().replace("’", "").replace("'", "")).strip("-")
    if not slug:
        raise SystemExit("cannot make a slug from that title")
    return slug


def gather_photos(inputs: list[Path]) -> list[Path]:
    found: list[Path] = []
    for item in inputs:
        if item.is_dir():
            found.extend(sorted(p for p in item.iterdir() if p.suffix.lower() in PHOTO_SUFFIXES))
        elif item.is_file():
            found.append(item)
        else:
            raise SystemExit(f"no such photo or folder: {item}")
    return found


def resize_photo(source: Path, target: Path) -> None:
    """1600px wide JPEG at q78, orientation applied, no metadata."""
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
    if image.width > WEB_WIDTH:
        image = image.resize((WEB_WIDTH, round(image.height * WEB_WIDTH / image.width)), Image.Resampling.LANCZOS)
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, "JPEG", quality=WEB_QUALITY, optimize=True)


def q(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def render_draft(args: argparse.Namespace, slug: str, web_paths: list[str], notes: str) -> str:
    lines = [
        "---",
        f"title: {q(args.title)}",
        f"slug: {slug}",
        f"object: {q(args.object)}",
        f"plate: {args.plate}",
        f"date: {args.date}",
        'summary: ""',
    ]
    if web_paths:
        lines += [f"photo: {web_paths[0]}", 'photoAlt: ""', 'photoCaption: ""']
    lines += [f"subject: {q(args.subject)}"]
    if args.place:
        lines.append(f"place: {q(args.place)}")
    lines += ["draft: true", "---", "", BRIEF.rstrip(), ""]
    if len(web_paths) > 1:
        lines += ["## Photographs on file", ""] + [f"- {p}" for p in web_paths] + [""]
    if notes.strip():
        lines += [NOTES_MARKER, "", notes.rstrip(), ""]
    return "\n".join(lines)


def intake(args: argparse.Namespace, root: Path = ROOT) -> Path:
    slug = args.slug or slugify(args.title)
    if find_piece(slug, root):
        raise SystemExit(f"a piece with slug '{slug}' already exists; nothing written")
    target = root / "content" / args.plate / f"{slug}.md"

    photos = gather_photos(args.photos or [])
    web_paths = [f"/photos/{slug}-{i:02d}.jpg" if len(photos) > 1 else f"/photos/{slug}.jpg" for i in range(1, len(photos) + 1)]
    for web in web_paths:
        if (root / "public" / web.lstrip("/")).exists():
            raise SystemExit(f"{web} already exists; nothing written")

    notes = ""
    if args.notes:
        notes = sys.stdin.read() if str(args.notes) == "-" else args.notes.read_text()

    draft = render_draft(args, slug, web_paths, notes)
    if args.dry_run:
        print(f"[dry run] would write {target.relative_to(root)}")
        for source, web in zip(photos, web_paths):
            print(f"[dry run] would resize {source} -> public{web}")
        return target

    for source, web in zip(photos, web_paths):
        resize_photo(source, root / "public" / web.lstrip("/"))
        print(f"photo: public{web}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(draft)
    print(f"draft: {target.relative_to(root)}")
    return target


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--title", required=True)
    parser.add_argument("--plate", required=True, choices=PLATES)
    parser.add_argument("--object", required=True, help="catalogue name; reuse the exact string for the same object")
    parser.add_argument("--subject", required=True, help="a consented name, initials or a descriptive identity")
    parser.add_argument("--place", default="")
    parser.add_argument("--slug", help="defaults to the title, hyphenated")
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--photos", nargs="*", type=Path, help="files or folders; the first is the lead")
    parser.add_argument("--notes", type=Path, help="notes or transcript, copied in verbatim; '-' reads stdin")
    parser.add_argument("--dry-run", action="store_true", help="show what would be written, write nothing")
    return parser


def main() -> int:
    intake(build_parser().parse_args())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
