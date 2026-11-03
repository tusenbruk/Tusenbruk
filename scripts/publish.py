#!/usr/bin/env python3
"""Publish a drafted piece and prepare its Instagram package. Nothing is posted.

    python3 scripts/publish.py <slug>             # validate, publish, build everything
    python3 scripts/publish.py <slug> --dry-run   # validate and report; change nothing

Steps, in order:
  1. Find the piece; refuse if social/queue.json holds it (a hold is a hard stop).
  2. Validate frontmatter, photographs and alt text. Any error stops the run
     before a single file is touched.
  3. Remove `draft: true` (every other byte of the file is left alone).
  4. Run the content validator; if it fails, the draft flag is put back.
  5. Run make_cards.py for this piece only.
  6. Run `npm run social:assets`, then `npm run validate:social`.
  7. Build social/instagram/<slug>/ via instagram_crop.py: carousel (1080x1080),
     portrait (1080x1350), story (1080x1920, plate label), caption.txt,
     alt_text.txt and post_notes.txt.
  8. Print a summary.

The caption is lifted from the piece itself, never written for it. Review the
package, then post by hand. Push to main when you want the piece live.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import instagram_crop as crop  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
PUBLIC = ROOT / "public"
SOCIAL = ROOT / "social"
QUEUE = SOCIAL / "queue.json"
OUT = SOCIAL / "instagram"
SITE = "https://tusenbruk.com"

PLATE_KEYS = list(crop.PLATES)
KINDS = {"portrait", "field-note", "essay"}
DRAFT_BRIEF = "Draft brief — not for publication"
MAX_CAROUSEL = 10  # Instagram's limit

PLATE_TAG = {
    "photography": "photography", "watches": "watches", "motoring": "motoring",
    "writing": "writing", "carry": "luggage", "travel": "travel",
}
TWO_WORD_BRANDS = {"land rover", "range rover", "alfa romeo", "aston martin", "patek philippe",
                   "audemars piguet", "vacheron constantin", "louis vuitton", "grand seiko"}
ABBREVIATIONS = {"mr", "mrs", "ms", "dr", "st", "no", "vs", "jr", "sr", "approx", "ref", "c", "ca"}
EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-➿️]")


# --------------------------------------------------------------------------- parsing

def split_piece(raw: str) -> tuple[str, str]:
    match = re.match(r"(?s)^---\n(.*?)\n---\n?(.*)$", raw)
    if not match:
        return "", raw
    return match.group(1), match.group(2)


def parse_frontmatter(block: str) -> dict[str, str]:
    """Top-level `key: value` pairs only; quotes stripped. Enough for the fields checked here."""
    data: dict[str, str] = {}
    for line in block.splitlines():
        match = re.match(r"^([A-Za-z]\w*):\s*(.*)$", line)
        if not match:
            continue
        value = match.group(2).strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        data[match.group(1)] = value
    return data


def find_piece(slug: str) -> Path:
    matches = []
    for path in sorted(CONTENT.glob("*/*.md")):
        if path.parent.name in {"notes", "pages"}:
            continue
        data = parse_frontmatter(split_piece(path.read_text())[0])
        if data.get("slug", path.stem) == slug or path.stem == slug:
            matches.append(path)
    if not matches:
        sys.exit(f"no piece with slug '{slug}' under content/")
    if len(matches) > 1:
        sys.exit(f"slug '{slug}' matches more than one file: {', '.join(str(m.relative_to(ROOT)) for m in matches)}")
    return matches[0]


def is_draft(data: dict[str, str]) -> bool:
    return data.get("draft", "").lower() == "true"


def body_images(body: str) -> list[tuple[str, str]]:
    return [(m.group(2), m.group(1).strip()) for m in re.finditer(r"!\[([^\]]*)\]\((/[^)\s]+)\)", body)]


# ------------------------------------------------------------------------ validation

def queue_item(slug: str) -> dict | None:
    if not QUEUE.exists():
        return None
    for item in json.loads(QUEUE.read_text()).get("posts", []):
        if item.get("slug") == slug:
            return item
    return None


def validate(path: Path, data: dict[str, str], body: str) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    slug = data.get("slug", "")
    kind = data.get("kind", "portrait")

    for field in ("title", "slug", "plate", "date", "summary"):
        if not data.get(field):
            errors.append(f"frontmatter: '{field}' is missing or empty")
    if data.get("plate") and data["plate"] not in PLATE_KEYS:
        errors.append(f"frontmatter: plate '{data['plate']}' is not one of {', '.join(PLATE_KEYS)}")
    if data.get("date") and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", data["date"]):
        errors.append(f"frontmatter: date '{data['date']}' is not yyyy-mm-dd")
    if kind not in KINDS:
        errors.append(f"frontmatter: kind '{kind}' cannot be published (allowed: {', '.join(sorted(KINDS))})")
    if kind != "essay" and not data.get("object"):
        errors.append("frontmatter: 'object' is required (essays excepted)")
    if kind == "portrait" and not data.get("subject"):
        errors.append("frontmatter: 'subject' is required for a portrait")

    if not data.get("photo"):
        errors.append("frontmatter: 'photo' is missing — the Instagram package needs the lead photograph")
    else:
        if not (PUBLIC / data["photo"].lstrip("/")).is_file():
            errors.append(f"photo file not found: public{data['photo']}")
        if not data.get("photoAlt"):
            errors.append("frontmatter: 'photoAlt' is empty — a lead photograph needs alt text")
        if not data.get("photoCaption"):
            warnings.append("no 'photoCaption' (place, time, camera, film) on the lead photograph")

    for src, alt in body_images(body):
        if not (PUBLIC / src.lstrip("/")).is_file():
            errors.append(f"body image not found: public{src}")
        if not alt:
            errors.append(f"body image {src} has no alt text")

    if DRAFT_BRIEF in body:
        errors.append("body still contains the interview-brief banner — the piece has not been drafted")
    elif len(re.sub(r"\s+", " ", body).split(" ")) < 80:
        errors.append("body is under 80 words — not a finished piece")
    if re.search(r"\*\*[^*]+\*\*", body):
        errors.append("body contains bold text — no bold anywhere on this site")

    for other in CONTENT.glob("*/*.md"):
        if other == path or other.parent.name in {"notes", "pages"}:
            continue
        other_data = parse_frontmatter(split_piece(other.read_text())[0])
        if other_data.get("slug", other.stem) == slug and not is_draft(other_data):
            errors.append(f"slug '{slug}' is already used by published {other.relative_to(ROOT)}")

    item = queue_item(slug)
    if item and item.get("status") == "hold":
        errors.append(f"social/queue.json holds this piece — {item.get('reason', 'no reason recorded').rstrip('.')}. "
                      "A hold is a hard stop; release it there first.")
    return errors, warnings


# ------------------------------------------------------------------------ draft flag

DRAFT_LINE = re.compile(r"(?m)^draft:[ \t]*[\"']?true[\"']?[ \t]*\n")


def strip_draft_flag(raw: str) -> str:
    """Remove `draft: true` from the frontmatter only; the body and every other line stay byte-identical."""
    match = re.match(r"(?s)^(---\n)(.*?)(\n---)", raw)
    if not match:
        return raw
    block = match.group(2) + "\n"
    block = DRAFT_LINE.sub("", block, count=1)
    return match.group(1) + block[:-1] + match.group(3) + raw[match.end():]


# --------------------------------------------------------------------------- caption

def plain(text: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[*_`]+", "", text)
    return re.sub(r"\s+", " ", text).strip()


def sentences(paragraph: str) -> list[str]:
    parts: list[str] = []
    start = 0
    for match in re.finditer(r"[.!?][\"”’)]*\s+(?=[A-Z“\"‘])", paragraph):
        head = paragraph[start:match.start() + 1]
        last_word = re.findall(r"([A-Za-z]+)\.$", head)
        if last_word and last_word[0].lower() in ABBREVIATIONS:
            continue
        parts.append(paragraph[start:match.end()].strip())
        start = match.end()
    tail = paragraph[start:].strip()
    if tail:
        parts.append(tail)
    return parts


def opening_pull(body: str) -> str:
    for block in re.split(r"\n\s*\n", body.strip()):
        block = block.strip()
        if not block or block.startswith(("#", "!", ">", "---", "|", "-", "*", "<")):
            continue
        text = plain(block)
        parts = sentences(text)
        if not parts:
            continue
        pull = parts[0]
        if len(pull) < 30 and len(parts) > 1:
            pull = f"{pull} {parts[1]}"
        return pull
    return ""


def camel(word: str) -> str:
    word = re.sub(r"[^A-Za-z0-9]", "", word)
    return word if any(c.isupper() for c in word[1:]) or word.isupper() else word.capitalize()


def object_tags(obj: str) -> list[str]:
    obj = re.sub(r"\([^)]*\)", " ", obj)
    words = []
    for token in obj.split():
        bare = re.sub(r"[^A-Za-z0-9-]", "", token)
        if not bare:
            continue
        if re.fullmatch(r"\d{4,}", bare) or (re.search(r"\d", bare) and re.search(r"[A-Za-z]", bare) and len(bare) >= 5):
            continue  # reference numbers: 116710LN, 5711/1A
        words.append(bare)
    if not words:
        return []
    full = "".join(camel(w) for w in words[:3])
    two = " ".join(words[:2]).lower().replace("rovers", "rover")
    brand = "".join(camel(w) for w in two.split()) if two in TWO_WORD_BRANDS else camel(words[0])
    tags = [full] + ([brand] if brand.lower() != full.lower() else [])
    return [t for t in tags if len(t) <= 30]


def hashtags(data: dict[str, str]) -> list[str]:
    tags = ["tusenbruk", "thepleasureofuse"] + object_tags(data.get("object", ""))
    if len(tags) < 4:
        tags.append(PLATE_TAG.get(data.get("plate", ""), "objects"))
    seen: set[str] = set()
    unique = []
    for tag in tags:
        if tag.lower() not in seen:
            seen.add(tag.lower())
            unique.append(tag)
    return [f"#{t}" for t in unique[:5]]


def build_caption(data: dict[str, str], pull: str) -> str:
    return f"{pull}\n\nRead “{data['title']}” at the link in bio.\n\n{' '.join(hashtags(data))}\n"


# ------------------------------------------------------------------------ instagram

def _landscape(path: Path) -> bool:
    with crop.Image.open(path) as image:
        return image.width / image.height > 1.2


def one_line(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def instagram_package(path: Path, data: dict[str, str], body: str, notes: list[str],
                      focal_override: tuple[float, float] | None = None) -> dict:
    slug = data["slug"]
    folder = OUT / slug
    folder.mkdir(parents=True, exist_ok=True)
    for stale in list(folder.glob("carousel-*.jpg")) + list(folder.glob("portrait-*.jpg")) + list(folder.glob("story-*.jpg")):
        stale.unlink()

    photos: list[tuple[str, str]] = [(data["photo"], data["photoAlt"])]
    for src, alt in body_images(body):
        if src not in {p for p, _ in photos}:
            photos.append((src, alt))
    if len(photos) > MAX_CAROUSEL:
        notes.append(f"{len(photos)} photographs found; only the first {MAX_CAROUSEL} fit an Instagram carousel")
        photos = photos[:MAX_CAROUSEL]

    plate = data["plate"]
    item = queue_item(slug)
    lead_focal = focal_override or (
        crop.parse_focal(item.get("focal_point")) if item and item.get("focal_point") else (0.5, 0.5))

    made: list[tuple[Path, str, int]] = []
    worst: dict[str, float] = {}
    for index, (src, _alt) in enumerate(photos):
        source = PUBLIC / src.lstrip("/")
        focal = lead_focal if index == 0 else (0.5, 0.5)
        for fmt in ("square", "portrait", "story"):
            prefix, _size = crop.FORMATS[fmt]
            target = folder / f"{prefix}-{index + 1:02d}.jpg"
            scale = crop.crop_one(source, fmt, target, plate, focal)
            made.append((target, fmt, index))
            worst[source.name] = max(worst.get(source.name, 0.0), scale)
    for name, scale in worst.items():
        if scale > crop.UPSCALE_WARN:
            notes.append(f"{name} is enlarged up to {scale:.2f}x to fill the tallest frame (story); check its crops for softness")
    wide = [src for src, _ in photos if _landscape(PUBLIC / src.lstrip("/"))]
    if wide:
        notes.append("landscape photographs keep only about a third of their width in the story crop; "
                     "check the subject survives, or re-run with --focal x,y")
    notes.append("hashtags are derived from the 'object' field; edit caption.txt if one reads wrongly")

    pull = opening_pull(body)
    if not pull:
        notes.append("no opening line found for the caption; write one by hand")
    elif len(pull) > 240:
        notes.append(f"caption pull is {len(pull)} characters (the piece's first sentence, unaltered); trim by hand if wanted")
    if EMOJI.search(pull):
        notes.append("the opening line contains an emoji; remove it before posting")
    (folder / "caption.txt").write_text(build_caption(data, pull))

    numeral, _, plate_name = crop.plate_label(plate)[0].removeprefix("PL. ").partition(" — ")
    label = f"Pl. {numeral.lower()} — {plate_name.title()}" if plate_name else "Tusenbruk"
    lines = []
    for fmt in ("square", "portrait", "story"):
        prefix, _size = crop.FORMATS[fmt]
        for index, (_src, alt) in enumerate(photos):
            text = one_line(alt)
            if fmt == "story":
                text = f"{text} A Tusenbruk plate label, {label}, sits at the lower left."
            lines.append(f"{prefix}-{index + 1:02d}.jpg: {text}")
    (folder / "alt_text.txt").write_text("\n".join(lines) + "\n")

    url = f"{SITE}/writing/{slug}"
    count = len(photos)
    carousel = ", ".join(f"carousel-{i + 1:02d}.jpg" for i in range(count)) if count <= 3 else \
        f"carousel-01.jpg to carousel-{count:02d}.jpg"
    guide = [
        f"{data['title']}",
        f"{crop.plate_label(plate)[0]}  ·  {url}",
        "",
        "FEED POST",
        f"Carousel, in order: {carousel}." if count > 1 else "Single image: carousel-01.jpg.",
        "The lead photograph comes first, then the photographs in the order they appear in the piece.",
        "Caption: caption.txt. Alt text for each image: alt_text.txt (paste against the matching file).",
        "",
        "4:5 ALTERNATIVE",
        f"portrait-01.jpg{' onwards' if count > 1 else ''} are the same photographs at 1080x1350. Use them in place of the squares,",
        "never alongside them: Instagram crops a carousel to the shape of its first image.",
        "Prefer 4:5 when the photographs are upright or the subject sits near the top or bottom edge.",
        "",
        "STORY",
        "story-01.jpg is the lead photograph with the plate label at the lower left, clear of the reply bar.",
        f"Post it after the feed post, and add a link sticker to {url}.",
        f"Further stories, if wanted: story-02.jpg onwards." if count > 1 else "",
        "",
        "ORDER",
        "1. Feed carousel, with caption.txt.",
        "2. Story, once the feed post is live.",
        "3. In social/queue.json, set the item to published with the date and URL.",
        "",
        "BEFORE POSTING",
        "Hold is a hard stop. If social/queue.json marks this piece hold, do not post.",
        "Push to main first so the link in bio resolves to the live piece.",
    ]
    guide = [g for i, g in enumerate(guide) if g != "" or (i and guide[i - 1] != "")]
    if notes:
        guide += ["", "CHECK"] + [f"- {n}" for n in notes]
    (folder / "post_notes.txt").write_text("\n".join(guide).rstrip() + "\n")

    return {"folder": folder, "photos": len(photos), "made": made, "pull": pull}


# ----------------------------------------------------------------------------- runner

def run(label: str, command: list[str]) -> tuple[int, str]:
    print(f"\n$ {' '.join(command)}")
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    output = (result.stdout + result.stderr).strip()
    if output:
        print(output)
    return result.returncode, output


def npm_script(name: str, fallback: list[str]) -> tuple[int, str]:
    if shutil.which("npm"):
        return run(name, ["npm", "run", "--silent", name])
    print(f"(npm not found; running the script behind `npm run {name}` directly)")
    return run(name, fallback)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slug")
    parser.add_argument("--dry-run", action="store_true", help="validate and report; change nothing")
    parser.add_argument("--focal", help="focal point x,y (0..1) for the lead photograph's crops; "
                                        "defaults to the queue's focal_point, then the centre")
    args = parser.parse_args()

    try:
        focal = crop.parse_focal(args.focal) if args.focal else None
    except ValueError as err:
        parser.error(str(err))
    path = find_piece(args.slug)
    raw = path.read_text()
    block, body = split_piece(raw)
    data = parse_frontmatter(block)
    rel = path.relative_to(ROOT)
    print(f"piece: {rel}")

    errors, warnings = validate(path, data, body)
    for warning in warnings:
        print(f"warning: {warning}")
    if errors:
        print(f"\nvalidation failed ({len(errors)}):")
        for error in errors:
            print(f"  - {error}")
        print("\nNothing was changed.")
        return 1
    print("frontmatter, photographs and alt text: ok")

    if args.dry_run:
        state = "draft: true would be removed" if is_draft(data) else "already published (no draft flag)"
        print(f"dry run: {state}; no files written.")
        return 0

    problems: list[str] = []
    notes: list[str] = list(warnings)

    if is_draft(data):
        path.write_text(strip_draft_flag(raw))
        print(f"removed draft: true from {rel}")
    else:
        print("already published (no draft flag); regenerating assets")

    if (ROOT / "node_modules").is_dir() and shutil.which("npm"):
        code, _ = run("validate:content", ["npm", "run", "--silent", "validate:content"])
        if code != 0:
            path.write_text(raw)
            print(f"\ncontent validation failed; draft flag restored in {rel}. Nothing else was generated.")
            return 1
    else:
        notes.append("content validator not run (node_modules missing); run `npm run validate:content` before pushing")

    code, _ = run("make_cards", [sys.executable, str(ROOT / "scripts" / "make_cards.py"), "--slug", data["slug"]])
    if code != 0:
        problems.append("make_cards.py failed")

    code, _ = npm_script("social:assets", [sys.executable, str(ROOT / "scripts" / "make_social_assets.py")])
    if code != 0:
        problems.append("social:assets failed")
    code, social_out = npm_script("validate:social", [sys.executable, str(ROOT / "scripts" / "make_social_assets.py"), "--check"])
    if code != 0:
        problems.append("validate:social reported issues:\n      " + social_out.replace("\n", "\n      "))
    if queue_item(data["slug"]) is None:
        notes.append("slug is not in social/queue.json, so social:assets built no pack for it; add a queue entry to track approval")

    package = instagram_package(path, data, body, notes, focal)

    folder: Path = package["folder"]
    print("\n" + "=" * 64)
    print(f"published: {data['title']}  ({data['slug']})")
    print(f"  piece         {rel}")
    print(f"  share card    public/cards/{data['slug']}.jpg")
    print(f"  social pack   social/output/{data['slug']}/" + ("" if queue_item(data['slug']) else "  (not queued)"))
    print(f"  instagram     {folder.relative_to(ROOT)}/")
    for fmt, label in (("square", "carousel 1080x1080"), ("portrait", "portrait 1080x1350"), ("story", "story    1080x1920")):
        files = sorted(t.name for t, f, _ in package["made"] if f == fmt)
        print(f"    {label}  {files[0]}{' … ' + files[-1] if len(files) > 1 else ''}  ({len(files)})")
    for name in ("caption.txt", "alt_text.txt", "post_notes.txt"):
        print(f"    {name}")
    print(f"\ncaption:\n{(folder / 'caption.txt').read_text().rstrip()}")
    for note in notes:
        print(f"note: {note}")
    for problem in problems:
        print(f"PROBLEM: {problem}")
    print("\nNext: review the package, then `git add -A && git commit && git push` to deploy the piece.")
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
