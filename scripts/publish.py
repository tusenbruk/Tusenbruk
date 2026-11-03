#!/usr/bin/env python3
"""Validate a finished piece and build everything needed to post it.

    python3 scripts/publish.py <slug> [--dry-run]

In order:

1. Refuses if the piece is still a draft, or if social/queue.json holds it.
   A `hold` is a hard stop; nothing below runs.
2. Checks the piece: subject, alt text, photographs on disk, no leftover
   brief or source notes, no bold, no exclamation marks.
3. Regenerates the share cards (scripts/make_cards.py).
4. Builds the Instagram package in social/instagram/<slug>/: square, portrait
   and story crops of every photograph in the piece (lead first, ten at most),
   caption.txt and alt.txt.
5. Runs the existing validators over the result.

The caption is assembled only from text already in the piece: its opening
sentence, its summary, the title and the hashtags. Nothing is written for you.
Posting is by hand, from your phone.
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow required: pip3 install Pillow")

sys.path.insert(0, str(Path(__file__).resolve().parent))
import instagram_crop  # noqa: E402
from intake import BRIEF_MARKER, NOTES_MARKER  # noqa: E402
from social_common import ROOT, find_piece, load_config, queue_status, split_frontmatter  # noqa: E402

MAX_IMAGES = 10  # Instagram's carousel limit
EXPECTED = {"square": (1080, 1080), "portrait": (1080, 1350), "story": (1080, 1920)}
IMAGE_RE = re.compile(r"!\[([^\]]*)\]\((/[^)\s]+)\)")


class Held(Exception):
    """social/queue.json holds this piece."""


# ── checks ────────────────────────────────────────────────────────────────────


def check_queue(slug: str, root: Path = ROOT) -> None:
    item = queue_status(slug, root)
    if item and item.get("status") == "hold":
        raise Held(f"{slug} is on hold in social/queue.json: {item.get('reason', 'no reason recorded')}")


def photographs(data: dict[str, str], body: str) -> list[tuple[str, str]]:
    """(public path, alt text) for the lead photo then each image in the body, deduplicated."""
    found: list[tuple[str, str]] = []
    if data.get("photo"):
        found.append((data["photo"], data.get("photoAlt", "")))
    for alt, path in IMAGE_RE.findall(body):
        if path not in {p for p, _ in found}:
            found.append((path, alt))
    return found


def validate_piece(data: dict[str, str], body: str, root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    if data.get("draft") == "true":
        errors.append("still marked `draft: true`")
    if BRIEF_MARKER in body or NOTES_MARKER in body:
        errors.append("the interview brief or source notes are still in the body")
    if not data.get("title"):
        errors.append("no title")
    if data.get("kind", "portrait") == "portrait" and not data.get("subject"):
        errors.append("portraits require a subject")
    if not data.get("summary"):
        errors.append("no summary")
    if not data.get("photo"):
        errors.append("no lead photograph; the Instagram package needs one")
    if re.search(r"\*\*|__", body):
        errors.append("bold text in the body")
    if "!" in IMAGE_RE.sub("", body).replace("![", ""):
        errors.append("exclamation mark in the body")
    for path, alt in photographs(data, body):
        if not (root / "public" / path.lstrip("/")).exists():
            errors.append(f"missing photograph public{path}")
        if not alt.strip():
            errors.append(f"no alt text for {path}")
    return errors


# ── caption ───────────────────────────────────────────────────────────────────


def plain(text: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"[*_`]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def opening_line(body: str) -> str:
    """The first sentence of the first prose paragraph, verbatim; a second sentence
    joins it when the first is very short."""
    for block in re.split(r"\n\s*\n", body):
        block = block.strip()
        if not block or block[0] in "#>|-" or block.startswith(("![", "<!--")):
            continue
        sentences = re.split(r"(?<=[.?])\s+(?=[A-Z“\"‘'])", plain(block))
        line = sentences[0]
        if len(line) < 45 and len(sentences) > 1:
            line = f"{line} {sentences[1]}"
        return line
    return ""


def object_hashtag(obj: str) -> str:
    words = []
    for token in re.split(r"[^A-Za-z0-9]+", obj):
        if not token or (len(token) >= 5 and any(c.isdigit() for c in token)):
            continue  # reference numbers make poor tags
        words.append(token[0].upper() + token[1:])
    return "".join(words)


def hashtags(data: dict[str, str], config: dict) -> list[str]:
    candidates = list(config["instagram"]["default_hashtags"])
    if data.get("object"):
        candidates.append(object_hashtag(data["object"]))
    seen: set[str] = set()
    tags: list[str] = []
    for tag in candidates:
        tag = re.sub(r"[^A-Za-z0-9]", "", tag)
        if tag and tag.lower() not in seen:
            seen.add(tag.lower())
            tags.append("#" + tag)
    return tags[: config["instagram"]["max_hashtags"]]


def build_caption(data: dict[str, str], body: str, config: dict) -> str:
    opening = opening_line(body)
    parts = [opening]
    summary = data.get("summary", "").strip()
    if summary and summary not in opening:
        parts.append(summary)
    parts.append(f"Read “{data['title']}” at the link in bio.")
    parts.append(" ".join(hashtags(data, config)))
    return "\n\n".join(p for p in parts if p) + "\n"


def build_alt(items: list[tuple[str, str]]) -> str:
    return "\n".join(f"{i:02d} — {alt.strip()}" for i, (_, alt) in enumerate(items, start=1)) + "\n"


# ── package ───────────────────────────────────────────────────────────────────


def prepare(slug: str, root: Path = ROOT) -> tuple[dict[str, str], str]:
    """Hold check, then validation. Raises before anything is generated."""
    path = find_piece(slug, root)
    if path is None:
        raise SystemExit(f"no piece with slug '{slug}'")
    check_queue(slug, root)
    data, body = split_frontmatter(path.read_text())
    errors = validate_piece(data, body, root)
    if errors:
        raise SystemExit("not ready to publish:\n" + "\n".join(f"  - {e}" for e in errors))
    return data, body


def build_package(slug: str, root: Path = ROOT, out_root: Path | None = None, dry_run: bool = False) -> Path:
    data, body = prepare(slug, root)
    config = load_config(root)
    items = photographs(data, body)[:MAX_IMAGES]
    out_dir = (out_root or root / "social" / "instagram") / slug
    caption = build_caption(data, body, config)

    if dry_run:
        print(f"[dry run] {len(items)} photograph(s) -> {len(items) * 3} images in {out_dir}")
        print("[dry run] caption.txt:\n" + caption)
        return out_dir

    out_dir.mkdir(parents=True, exist_ok=True)
    sources = [root / "public" / p.lstrip("/") for p, _ in items]
    instagram_crop.build_variants(
        sources, slug, data.get("plate", ""), out_dir, config["defaults"]["image_quality"]
    )
    (out_dir / "caption.txt").write_text(caption)
    (out_dir / "alt.txt").write_text(build_alt(items))
    return out_dir


def verify_package(slug: str, out_dir: Path, image_count: int) -> list[str]:
    problems: list[str] = []
    for kind, size in EXPECTED.items():
        for i in range(1, image_count + 1):
            image = out_dir / f"{slug}_{kind}_{i:02d}.jpg"
            if not image.exists():
                problems.append(f"missing {image.name}")
                continue
            with Image.open(image) as opened:
                if opened.size != size:
                    problems.append(f"{image.name} is {opened.size}, expected {size}")
                if opened.getexif():
                    problems.append(f"{image.name} carries metadata")
    caption = out_dir / "caption.txt"
    if not caption.exists():
        problems.append("missing caption.txt")
    elif "!" in caption.read_text() or "**" in caption.read_text():
        problems.append("caption has an exclamation mark or bold")
    if not (out_dir / "alt.txt").exists():
        problems.append("missing alt.txt")
    return problems


def run(cmd: list[str], root: Path) -> int:
    print("$ " + " ".join(cmd))
    return subprocess.run(cmd, cwd=root).returncode


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slug")
    parser.add_argument("--dry-run", action="store_true", help="validate and show the caption; write nothing")
    parser.add_argument("--skip-cards", action="store_true", help="do not regenerate share cards")
    parser.add_argument("--out", type=Path, help="package folder (default social/instagram)")
    args = parser.parse_args()

    try:
        data, body = prepare(args.slug)
        if args.dry_run:
            build_package(args.slug, ROOT, args.out, dry_run=True)
            return 0
        if not args.skip_cards and run([sys.executable, "scripts/make_cards.py"], ROOT):
            print("make_cards.py failed")
            return 1
        out_dir = build_package(args.slug, ROOT, args.out)
    except Held as held:
        print(f"HOLD: {held}\nNothing generated.")
        return 3

    count = min(len(photographs(data, body)), MAX_IMAGES)
    problems = verify_package(args.slug, out_dir, count)
    status = 0
    for problem in problems:
        print(f"problem: {problem}")
    status |= 1 if problems else 0

    if (ROOT / "node_modules").exists():
        status |= 1 if run(["node", "scripts/validate_content.mjs"], ROOT) else 0
    else:
        print("skipped validate_content.mjs: run `npm install` first")
    status |= 1 if run([sys.executable, "scripts/make_social_assets.py", "--check"], ROOT) else 0
    status |= 1 if run([sys.executable, "scripts/strip_metadata.py", "--check", str(out_dir)], ROOT) else 0

    queue = queue_status(args.slug)
    print(f"\nPackage: {out_dir.relative_to(ROOT) if out_dir.is_relative_to(ROOT) else out_dir}")
    print("queue:", queue["status"] if queue else "no entry in social/queue.json; add one and mark it `ready` after review")
    print("Review the images and caption.txt, then post by hand from your phone.")
    return status


if __name__ == "__main__":
    raise SystemExit(main())
