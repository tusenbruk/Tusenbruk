#!/usr/bin/env python3
"""Scaffold a new Tusenbruk piece from a folder of photos and a notes file.

    python3 scripts/intake.py <photos-dir> <notes-file> --plate watches [options]

What it does
  * resizes every photo to 1600px wide, JPEG q78, EXIF/XMP stripped, into public/photos/
    (originals are never copied; nothing is written outside public/photos and content/)
  * writes content/<plate>/<slug>.md as a DRAFT (draft: true, never featured) holding the
    frontmatter it could fill from what you supplied, your notes verbatim, a photo table, and a
    checklist of what is still missing
  * prints the same checklist, plus the next commands to run

What it never does
  * write prose. The body is your notes, untouched. Drafting happens afterwards, from those
    notes, in the house voice (editorial/tusenbruk-editorial-voice/SKILL.md).
  * invent a subject, place, caption, alt text, title or summary. Anything you did not supply is
    left empty and listed as missing.
  * publish, feature, or touch social/queue.json.

Notes file
  Free text or markdown. Optionally begins with a simple `key: value` block between `---` lines:

      ---
      object: Rolex GMT-Master II 116710LN
      subject: A Sydney builder
      place: Sydney, Australia
      title: The case that was never polished
      summary: One or two sentences.
      lead: IMG_0042.jpg
      ---

  Photo captions and alt text go in a `## Photos` section, one line per photo:

      ## Photos
      - IMG_0042.jpg: Pentecost River, 6.40am. Leica M6, Portra 400. | alt: A scratched clasp on a bench edge.

  Recognised keys: plate, kind, title, slug, object, subject, place, summary, date, lead.
  Command-line options override the notes file.
"""
from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:  # pragma: no cover
    sys.exit("Pillow required: pip3 install Pillow")

ROOT = Path(__file__).resolve().parent.parent
PHOTO_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
WEB_WIDTH = 1600
WEB_QUALITY = 78
KINDS = {"portrait", "field-note", "essay"}
MIN_NOTE_WORDS = 150  # below this the draft will almost certainly fail test two
META_KEYS = {"plate", "kind", "title", "slug", "object", "subject", "place", "summary", "date", "lead"}


class IntakeError(Exception):
    pass


# --------------------------------------------------------------------------- helpers


def plate_keys(root: Path) -> list[str]:
    """The plate keys, read from lib/plates.ts so this script cannot drift from the site."""
    text = (root / "lib" / "plates.ts").read_text()
    keys = re.findall(r'\{\s*key:\s*"([a-z]+)"', text)
    if not keys:
        raise IntakeError("could not read plate keys from lib/plates.ts")
    return keys


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"['\u2019]", "", text.lower())
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def yaml_str(value: str) -> str:
    """Double-quoted YAML scalar. Escapes only what YAML needs, so UTF-8 stays readable."""
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ") + '"'


def existing_slugs(root: Path) -> dict[str, Path]:
    slugs: dict[str, Path] = {}
    for path in (root / "content").glob("*/*.md"):
        match = re.search(r"^slug:\s*[\"']?([^\"'\n]+?)[\"']?\s*$", path.read_text(), re.M)
        slugs[match.group(1) if match else path.stem] = path
        slugs.setdefault(path.stem, path)
    return slugs


# --------------------------------------------------------------------------- notes


@dataclass
class PhotoNote:
    caption: str = ""
    alt: str = ""


@dataclass
class Notes:
    raw: str
    meta: dict[str, str] = field(default_factory=dict)
    photos: dict[str, PhotoNote] = field(default_factory=dict)

    @property
    def body(self) -> str:
        return strip_meta_block(self.raw)

    @property
    def words(self) -> int:
        body = re.sub(r"^## Photos\b.*?(?=^## |\Z)", "", self.body, flags=re.S | re.M)
        return len(body.split())


def strip_meta_block(raw: str) -> str:
    match = re.match(r"\A---\s*\n.*?\n---\s*\n?", raw, re.S)
    return raw[match.end():] if match else raw


def parse_notes(raw: str) -> Notes:
    notes = Notes(raw=raw)
    block = re.match(r"\A---\s*\n(.*?)\n---\s*\n?", raw, re.S)
    if block:
        for line in block.group(1).splitlines():
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            key, sep, value = line.partition(":")
            key = key.strip().lower()
            if not sep or key not in META_KEYS:
                raise IntakeError(f"notes front block: unrecognised line {line!r} (keys: {', '.join(sorted(META_KEYS))})")
            notes.meta[key] = value.strip().strip("\"'")
    section = re.search(r"^##\s+Photos\s*\n(.*?)(?=^##\s|\Z)", raw, re.S | re.M)
    if section:
        for line in section.group(1).splitlines():
            match = re.match(r"\s*[-*]\s*([^:]+?):\s*(.*)$", line)
            if not match:
                continue
            caption, _, alt = match.group(2).partition("| alt:")
            notes.photos[match.group(1).strip()] = PhotoNote(caption.strip(), alt.strip())
    return notes


# --------------------------------------------------------------------------- photos


@dataclass
class Photo:
    source: Path
    name: str  # filename in public/photos
    caption: str
    alt: str
    warnings: list[str] = field(default_factory=list)

    @property
    def web_path(self) -> str:
        return f"/photos/{self.name}"


def looks_like_white_background(image: Image.Image) -> bool:
    """Photography rule: never on white. Flags a frame whose whole border is near-white."""
    small = ImageOps.exif_transpose(image).convert("L")
    small.thumbnail((200, 200))
    w, h = small.size
    px = small.load()
    border = [px[x, y] for x in range(w) for y in (0, 1, h - 2, h - 1)] + [
        px[x, y] for y in range(h) for x in (0, 1, w - 2, w - 1)
    ]
    return sum(v > 240 for v in border) / len(border) > 0.9


def collect_photos(folder: Path, slug: str, notes: Notes) -> list[Photo]:
    files = sorted(p for p in folder.iterdir() if p.suffix.lower() in PHOTO_EXTS and not p.name.startswith("."))
    skipped = sorted(p.name for p in folder.iterdir() if p.is_file() and p.suffix.lower() not in PHOTO_EXTS and not p.name.startswith("."))
    if skipped:
        print(f"skipped (not a supported photo type): {', '.join(skipped)}", file=sys.stderr)
    by_lower = {name.lower(): note for name, note in notes.photos.items()}
    unknown = [n for n in notes.photos if n.lower() not in {f.name.lower() for f in files}]
    if unknown:
        raise IntakeError(f"notes describe photos that are not in {folder}: {', '.join(unknown)}")
    photos = []
    for index, source in enumerate(files, start=1):
        note = by_lower.get(source.name.lower(), PhotoNote())
        photos.append(Photo(source, f"{slug}-{index:02d}.jpg", note.caption, note.alt))
    return photos


def write_web_copy(photo: Photo, dest_dir: Path) -> None:
    with Image.open(photo.source) as image:
        if looks_like_white_background(image):
            photo.warnings.append("border is almost entirely white; house rule is never on white")
        image = ImageOps.exif_transpose(image)
        if image.mode != "RGB":
            image = image.convert("RGB")
        if image.width > WEB_WIDTH:
            image = image.resize((WEB_WIDTH, round(image.height * WEB_WIDTH / image.width)), Image.LANCZOS)
        # No exif= / icc_profile= argument: Pillow writes none, so location and serial numbers stay behind.
        image.save(dest_dir / photo.name, "JPEG", quality=WEB_QUALITY, optimize=True)


# --------------------------------------------------------------------------- the draft


def missing_items(meta: dict[str, str], photos: list[Photo], lead: Photo | None, notes: Notes) -> list[str]:
    todo = []
    if not meta.get("title_supplied"):
        todo.append("title: working title is the object name; write the real one")
    if not meta.get("subject") and meta["kind"] == "portrait":
        todo.append("subject: required for every published portrait (consented name, initials or a descriptive identity)")
    if not meta.get("object") and meta["kind"] != "essay":
        todo.append("object: required; reuse the exact catalogue string if the object already appears in /register")
    if not meta.get("place"):
        todo.append("place: not supplied")
    if not meta.get("summary"):
        todo.append("summary: write it last, from the finished piece")
    if not photos:
        todo.append("photographs: none supplied; a published portrait needs one real, unarranged photo from use")
    if lead and not lead.alt:
        todo.append(f"photoAlt for {lead.name}: required whenever photo is present; describe what is visible, not the story")
    if lead and not lead.caption:
        todo.append(f"photoCaption for {lead.name}: place, time, camera, film")
    for p in photos:
        if p is not lead and not p.alt:
            todo.append(f"alt text for {p.name}")
    if notes.words < MIN_NOTE_WORDS:
        todo.append(
            f"notes are {notes.words} words; fewer than {MIN_NOTE_WORDS} rarely holds a detail only this person could give. "
            "Add to the notes, or the draft will have to stop and say what is missing."
        )
    return todo


def fence_for(text: str) -> str:
    longest = max((len(m) for m in re.findall(r"`+", text)), default=0)
    return "`" * max(3, longest + 1)


def render(meta: dict[str, str], photos: list[Photo], lead: Photo | None, notes: Notes, todo: list[str]) -> str:
    fm = ["---", f"title: {yaml_str(meta['title'])}", f"slug: {meta['slug']}"]
    if meta["kind"] != "portrait":
        fm.append(f"kind: {meta['kind']}")
    if meta.get("object"):
        fm.append(f"object: {yaml_str(meta['object'])}")
    fm.append(f"plate: {meta['plate']}")
    fm.append(f"date: {meta['date']}")
    fm.append(f"summary: {yaml_str(meta.get('summary', ''))}")
    if lead:
        fm.append(f"photo: {lead.web_path}")
        fm.append(f"photoAlt: {yaml_str(lead.alt)}")
        fm.append(f"photoCaption: {yaml_str(lead.caption)}")
    fm.append(f"subject: {yaml_str(meta.get('subject', ''))}")
    fm.append(f"place: {yaml_str(meta.get('place', ''))}")
    fm.append("draft: true")
    fm.append("---")

    body_notes = notes.raw.strip("\n")
    fence = fence_for(body_notes)
    out = [
        "\n".join(fm),
        "",
        "> **Draft scaffold: not for publication.** Written by `scripts/intake.py`. Nothing below the source",
        "> notes is prose; drafting happens from those notes, in the house voice, and only from them.",
        "> Delete this block, the source notes and the checklists when the piece is finished.",
        "",
        "## Source notes (verbatim)",
        "",
        f"{fence}text",
        body_notes,
        fence,
        "",
        "## Photographs",
        "",
    ]
    if photos:
        out += ["| File | Original | Caption | Alt |", "|---|---|---|---|"]
        for p in photos:
            tag = " (lead)" if p is lead else ""
            out.append(f"| `{p.web_path}`{tag} | {p.source.name} | {p.caption or '—'} | {p.alt or '—'} |")
    else:
        out.append("None supplied.")
    out += ["", "## Still needed", ""]
    out += [f"- [ ] {item}" for item in todo] or ["- Nothing missing from the intake."]
    out += [
        "",
        "## Before it publishes",
        "",
        "- [ ] Person cannot be removed (test one)",
        "- [ ] A detail only this person could have supplied (test two)",
        "- [ ] The ending earns its silence (test three)",
        "- [ ] Writer's own complicity appears once if the piece claims the object holds a life or memory",
        "- [ ] Every sentence traces to the notes above; unsupported lived detail deleted",
        "- [ ] `draft: true` removed; `npm run validate:content` passes",
        "",
    ]
    return "\n".join(out)


# --------------------------------------------------------------------------- main


def build_meta(args: argparse.Namespace, notes: Notes, plates: list[str]) -> dict[str, str]:
    pick = lambda key: (getattr(args, key, None) or notes.meta.get(key) or "").strip()  # noqa: E731
    meta = {key: pick(key) for key in ("plate", "kind", "title", "slug", "object", "subject", "place", "summary", "date", "lead")}
    meta["kind"] = meta["kind"] or "portrait"
    if meta["kind"] not in KINDS:
        raise IntakeError(f"kind must be one of {', '.join(sorted(KINDS))}; studies are draft-only research, not scaffolded here")
    if not meta["plate"]:
        raise IntakeError(f"plate is required (--plate or `plate:` in the notes): {', '.join(plates)}")
    if meta["plate"] not in plates:
        raise IntakeError(f"unknown plate {meta['plate']!r}; choose from {', '.join(plates)}")
    meta["title_supplied"] = "yes" if meta["title"] else ""
    meta["title"] = meta["title"] or meta["object"]
    if not (meta["title"] or meta["slug"]):
        raise IntakeError("need a --title, --slug or --object so the piece has a file name")
    meta["slug"] = slugify(meta["slug"] or meta["title"])
    meta["date"] = meta["date"] or date.today().isoformat()
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", meta["date"]):
        raise IntakeError(f"date must be YYYY-MM-DD, got {meta['date']!r}")
    return meta


def intake(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    photos_dir, notes_file = Path(args.photos_dir), Path(args.notes_file)
    if not photos_dir.is_dir():
        raise IntakeError(f"not a folder: {photos_dir}")
    if not notes_file.is_file():
        raise IntakeError(f"not a file: {notes_file}")
    try:
        if photos_dir.resolve().is_relative_to(root / "public") or photos_dir.resolve().is_relative_to(root / "content"):
            raise IntakeError("photos folder must be your originals (photos/), not public/ or content/")
    except AttributeError:  # pragma: no cover  (Python < 3.9)
        pass

    notes = parse_notes(notes_file.read_text(encoding="utf-8"))
    if not notes.body.strip():
        raise IntakeError("the notes file is empty; there is nothing to draft from")
    meta = build_meta(args, notes, plate_keys(root))

    target = root / "content" / meta["plate"] / f"{meta['slug']}.md"
    taken = existing_slugs(root)
    if meta["slug"] in taken and not args.force:
        raise IntakeError(f"slug {meta['slug']!r} already exists at {taken[meta['slug']].relative_to(root)}; use --slug or --force")

    photos = collect_photos(photos_dir, meta["slug"], notes)
    lead = None
    if photos:
        wanted = meta["lead"]
        lead = next((p for p in photos if wanted and p.source.name.lower() == wanted.lower()), None)
        if wanted and not lead:
            raise IntakeError(f"lead photo {wanted!r} is not in {photos_dir}")
        lead = lead or photos[0]

    photo_dir = root / "public" / "photos"
    clashes = [p.name for p in photos if (photo_dir / p.name).exists()]
    if clashes and not args.force:
        raise IntakeError(f"would overwrite existing web photos: {', '.join(clashes)}; use --force")

    if not args.dry_run:
        photo_dir.mkdir(parents=True, exist_ok=True)
        for photo in photos:
            write_web_copy(photo, photo_dir)
    else:
        for photo in photos:
            with Image.open(photo.source) as image:
                if looks_like_white_background(image):
                    photo.warnings.append("border is almost entirely white; house rule is never on white")

    todo = missing_items(meta, photos, lead, notes)
    text = render(meta, photos, lead, notes, todo)

    rel = target.relative_to(root)
    if args.dry_run:
        print(f"[dry run] would write {rel} and {len(photos)} photo(s) to public/photos/\n")
        print(text)
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")
        print(f"wrote {rel} (draft: true)")
        for photo in photos:
            print(f"wrote public/photos/{photo.name}  <- {photo.source.name}" + ("  [lead]" if photo is lead else ""))

    for photo in photos:
        for warning in photo.warnings:
            print(f"warning: {photo.source.name}: {warning}", file=sys.stderr)
    print("\nstill needed:")
    for item in todo or ["nothing"]:
        print(f"  - {item}")
    print(
        f"\nnext:\n  1. fill the gaps in {rel} (or add to the notes)\n"
        "  2. ask a Claude Code session to draft it from the source notes, per the voice skill\n"
        "  3. remove `draft: true`, then: npm run validate:content && python3 scripts/make_cards.py\n"
        "     && npm run social:assets && npm run validate:social && npm run validate:metadata"
    )
    return 0


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("photos_dir", help="folder of original photographs")
    p.add_argument("notes_file", help="notes, transcript or voice-memo text (.md or .txt)")
    p.add_argument("--plate", help="photography | watches | motoring | writing | carry | travel")
    p.add_argument("--kind", help="portrait (default) | field-note | essay")
    p.add_argument("--title")
    p.add_argument("--slug")
    p.add_argument("--object", help="catalogue name; reuse the exact string for an object already in /register")
    p.add_argument("--subject")
    p.add_argument("--place")
    p.add_argument("--summary")
    p.add_argument("--date", help="YYYY-MM-DD (default: today)")
    p.add_argument("--lead", help="filename of the lead photo (default: first alphabetically)")
    p.add_argument("--dry-run", action="store_true", help="print the draft; write nothing")
    p.add_argument("--force", action="store_true", help="overwrite an existing draft or web photos")
    p.add_argument("--root", default=str(ROOT), help=argparse.SUPPRESS)
    return p


def main(argv: list[str] | None = None) -> int:
    try:
        return intake(parser().parse_args(argv))
    except IntakeError as err:
        print(f"intake: {err}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
