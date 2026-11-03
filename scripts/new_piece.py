#!/usr/bin/env python3
"""Scaffold a draft piece from a notes file and a set of photographs.

    python3 scripts/new_piece.py notes.txt --plate watches \
        --object "Rolex GMT-Master II 116710LN" --subject "A Sydney builder" \
        --place "Sydney, Australia" --photos photos/rolex/*.JPG

The notes file may be plain text, a voice-memo transcript or rough bullets. Optional header lines
at the very top (`title:`, `object:`, `plate:`, `subject:`, `place:`, `date:`, `slug:`) are read as
metadata; command-line flags override them. Everything else is source material and is copied into
the body verbatim, under a draft banner. Nothing is written beyond what the notes supply: fields
the notes cannot answer are marked TODO, and publish.py refuses to publish while any remain.

Photographs are resized to 1600px wide, JPEG quality 78 (sips where available, Pillow otherwise),
stripped of EXIF/XMP, and written to public/photos/<slug>/. Originals are never copied.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from strip_metadata import strip_jpeg  # noqa: E402

PLATES = ["photography", "watches", "motoring", "writing", "carry", "travel"]
HEADER_KEYS = {"title", "object", "plate", "subject", "place", "date", "slug", "kind"}
PHOTO_EXT = {".jpg", ".jpeg", ".png", ".heic", ".tif", ".tiff"}
TODO = "TODO"
BANNER = "Draft: source material, not prose. Rewrite in the house voice before publishing."
BANNER_START, BANNER_END = "<!-- DRAFT-SOURCE-START -->", "<!-- DRAFT-SOURCE-END -->"


def fail(message: str) -> int:
    print(f"error: {message}", file=sys.stderr)
    return 1


def slugify(text: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", text.lower().replace("&", " and ")).strip("-")
    return re.sub(r"-{2,}", "-", text)


def parse_notes(raw: str) -> tuple[dict[str, str], str]:
    """Split optional leading `key: value` lines from the source material."""
    meta: dict[str, str] = {}
    lines = raw.replace("\r\n", "\n").split("\n")
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    start = i
    while i < len(lines):
        m = re.match(r"^\s*(\w+)\s*:\s*(.+?)\s*$", lines[i])
        if m and m.group(1).lower() in HEADER_KEYS:
            meta[m.group(1).lower()] = m.group(2).strip().strip('"')
            i += 1
        else:
            break
    body = "\n".join(lines[i:] if meta else lines[start:]).strip()
    if "title" not in meta and body:
        # A leading markdown heading is the title and is not repeated in the body.
        first, _, rest = body.partition("\n")
        m = re.match(r"^#\s+(.+)$", first)
        if m:
            meta["title"] = m.group(1).strip()
            body = rest.strip()
    return meta, body


def guess_title(body: str) -> str | None:
    """Last resort: the first sentence of the notes, capped at ten words. Always worth a human edit."""
    for line in body.splitlines():
        line = re.sub(r"^[\s>*\-•\d.)]+", "", line).strip()
        if line:
            first = re.split(r"(?<=[.!?])\s", line, maxsplit=1)[0].rstrip(".")
            return " ".join(first.split()[:10])
    return None


def expand_photos(paths: list[str]) -> list[Path]:
    found: list[Path] = []
    for p in paths:
        path = Path(p).expanduser()
        if path.is_dir():
            found += sorted(f for f in path.iterdir() if f.suffix.lower() in PHOTO_EXT)
        elif path.is_file():
            found.append(path)
        else:
            print(f"warning: photo not found, skipped: {p}", file=sys.stderr)
    return found


def resize_photo(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if shutil.which("sips"):
        subprocess.run(
            ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "78",
             "--resampleWidth", "1600", str(src), "--out", str(dest)],
            check=True, capture_output=True,
        )
    else:
        from PIL import Image, ImageOps

        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            if im.width > 1600:
                im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
            im.save(dest, "JPEG", quality=78, optimize=True)
    # sips keeps EXIF; the site must not publish camera metadata.
    cleaned, _ = strip_jpeg(dest.read_bytes())
    dest.write_bytes(cleaned)


def q(value: str) -> str:
    """Quote for frontmatter: valid YAML, and single-line for the repo's regex-based parsers."""
    return json.dumps(value, ensure_ascii=False)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("notes", type=Path, help="notes file: plain text, transcript or rough bullets")
    ap.add_argument("--plate", choices=PLATES)
    ap.add_argument("--title")
    ap.add_argument("--slug")
    ap.add_argument("--object", dest="obj", help="catalogue name; reuse the exact string for the same object")
    ap.add_argument("--subject", help="consented name, initials or descriptive identity")
    ap.add_argument("--place")
    ap.add_argument("--date", help="YYYY-MM-DD (default: today)")
    ap.add_argument("--kind", choices=["portrait", "field-note", "essay"])
    ap.add_argument("--photos", nargs="*", default=[], help="photo files or directories; the first is the lead")
    ap.add_argument("--force", action="store_true", help="overwrite an existing piece with the same slug")
    args = ap.parse_args()

    if not args.notes.is_file():
        return fail(f"notes file not found: {args.notes}")
    meta, body = parse_notes(args.notes.read_text(encoding="utf-8"))

    def pick(flag: str | None, key: str) -> str | None:
        return flag or meta.get(key)

    plate = pick(args.plate, "plate")
    if plate not in PLATES:
        return fail(f"plate required, one of {', '.join(PLATES)}")
    title = pick(args.title, "title") or guess_title(body)
    if not title:
        return fail("no title in the notes and none given with --title")
    slug = slugify(pick(args.slug, "slug") or title)
    date = pick(args.date, "date") or dt.date.today().isoformat()
    kind = pick(args.kind, "kind") or "portrait"
    if kind not in {"portrait", "field-note", "essay"}:
        return fail(f"unsupported kind {kind}")
    obj, subject, place = pick(args.obj, "object"), pick(args.subject, "subject"), pick(args.place, "place")

    existing = list(ROOT.glob(f"content/*/{slug}.md"))
    if existing and not args.force:
        return fail(f"{existing[0].relative_to(ROOT)} exists (use --force to overwrite)")
    for old in existing:
        old.unlink()
    target = ROOT / "content" / plate / f"{slug}.md"
    target.parent.mkdir(parents=True, exist_ok=True)

    web: list[str] = []
    names: set[str] = set()
    for src in expand_photos(args.photos):
        name = slugify(src.stem) or "photo"
        while name in names:
            name += "-2"
        names.add(name)
        resize_photo(src, ROOT / "public" / "photos" / slug / f"{name}.jpg")
        web.append(f"/photos/{slug}/{name}.jpg")

    essay = kind == "essay"
    fm = ["---", f"title: {q(title)}", f"slug: {slug}", f"kind: {kind}"]
    if not essay:
        fm.append(f"object: {q(obj or f'{TODO}: catalogue name')}")
    fm += [f"plate: {plate}", f"date: {date}", f"summary: {q(f'{TODO}: one or two sentences')}"]
    if web:
        fm += [f"photo: {web[0]}",
               f"photoAlt: {q(f'{TODO}: describe what the lead photograph shows')}",
               f"photoCaption: {q(f'{TODO}: place, time, camera, film')}"]
    if not essay:
        fm.append(f"subject: {q(subject or f'{TODO}: consented name, initials or description')}")
    fm += [f"place: {q(place or f'{TODO}: place')}", "draft: true", "---", ""]

    out = ["\n".join(fm), BANNER_START, f"> **{BANNER}**", ">",
           f"> Source: `{args.notes.name}`. Nothing below is publishable text. Use only what is here;",
           "> if the notes hold no detail only this person could give, the piece does not pass the Three Tests.",
           "", body or "(notes file was empty)", "", BANNER_END, ""]
    if len(web) > 1:
        out += ["<!-- Additional photographs, place in the body as needed:",
                *[f"![{TODO} alt]({p})" for p in web[1:]], "-->", ""]
    target.write_text("\n".join(out), encoding="utf-8")

    unfilled = [k for k, v in (("object", obj), ("subject", subject)) if not v and not essay]
    print(f"created  {target.relative_to(ROOT)}  (draft: true)")
    for p in web:
        print(f"photo    public{p}")
    print("\nNeeds human review before publish.py will accept it:")
    print(f"  - summary, plus {' and '.join(unfilled)} marked {TODO}" if unfilled else "  - summary (marked TODO)")
    if not place:
        print(f"  - place (marked {TODO})")
    if web:
        print("  - photoAlt and photoCaption (marked TODO); confirm the lead photo shows the object in use")
    else:
        print("  - no photos supplied: add photo, photoAlt and photoCaption if the piece has a lead image")
    if not (pick(args.title, "title")):
        print("  - title was inferred from the notes; replace it if it is not the one you want")
    print("  - the body: rewrite the source material in the house voice, then delete the draft block")
    print("  - consent for the subject, and that nothing was added the notes do not say")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
