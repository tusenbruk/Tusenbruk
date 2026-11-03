#!/usr/bin/env python3
"""Take a draft piece through the full publish workflow.

    python3 scripts/publish.py <slug> [--feature] [--dry-run] [--no-commit] [--skip-build] [--yes]

Steps, in order:
  1. Preflight the draft: no TODO markers, no draft banner, required fields for its kind, photo files
     present, no bold, no exclamation marks, no synthetic-prose markers.
  2. Flip it live (remove `draft: true`); with --feature, move `featured: true` onto it.
  3. Add a social/queue.json entry as `hold` if none exists (a hard stop until Ryan approves copy).
  4. Run: validate:content, make_cards.py, social:assets, validate:social, validate:metadata, build.
  5. Commit only the files this piece touched, then ask before pushing (a push to main deploys).

If any step fails, the piece and the queue are restored exactly as they were. Nothing is pushed
without confirmation, and `hold` queue items are never changed.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("PyYAML required: pip3 install pyyaml")

ROOT = Path(__file__).resolve().parent.parent
PLATES = ["photography", "watches", "motoring", "writing", "carry", "travel"]
QUEUE = ROOT / "social" / "queue.json"
BANNER_BLOCK = re.compile(r"<!-- DRAFT-SOURCE-START -->.*?<!-- DRAFT-SOURCE-END -->", re.S)
SYNTHETIC = [
    (r"^##\s+What stays\s*$", 'template heading "What stays"'),
    (r"^##\s+What grates\s*$", 'template heading "What grates"'),
    (r"^##\s+(?:The\s+)?thousand uses\s*$", 'template heading "The thousand uses"'),
    (r"\b(?:that|this) is the (?:whole )?point\b", 'generic conclusion "that is the point"'),
    (r"\bin the truest sense\b", 'generic conclusion "in the truest sense"'),
]


def split_front(raw: str) -> tuple[str, str]:
    m = re.match(r"(?s)^---\n(.*?)\n---\n?(.*)$", raw)
    if not m:
        sys.exit("error: no frontmatter found")
    return m.group(1), m.group(2)


def find_piece(ident: str) -> Path:
    p = Path(ident)
    if p.suffix == ".md" and p.is_file():
        return p.resolve()
    hits = [h for h in ROOT.glob(f"content/*/{ident}.md") if h.parent.name in PLATES]
    if len(hits) != 1:
        sys.exit(f"error: expected one content/<plate>/{ident}.md, found {len(hits)}")
    return hits[0]


def preflight(path: Path, data: dict, body: str) -> list[str]:
    errs: list[str] = []
    kind = data.get("kind", "portrait")
    if data.get("draft") is not True:
        errs.append("piece is not marked draft: true")
    if kind not in {"portrait", "field-note", "essay"}:
        errs.append(f"kind {kind!r} cannot be published (studies stay draft)")
    if data.get("plate") != path.parent.name or data.get("plate") not in PLATES:
        errs.append(f"plate must be one of {PLATES} and match the folder ({path.parent.name})")
    for key in ("title", "slug", "date", "summary", "place"):
        if not data.get(key):
            errs.append(f"missing {key}")
    if data.get("slug") and data["slug"] != path.stem:
        errs.append(f"slug {data['slug']!r} does not match filename {path.stem!r}")
    if kind != "essay":
        for key in ("object",) + (("subject",) if kind == "portrait" else ()):
            if not data.get(key):
                errs.append(f"{kind} requires {key}")
    if data.get("photo"):
        if not data.get("photoAlt"):
            errs.append("photo present but photoAlt missing")
        if not (ROOT / "public" / str(data["photo"]).lstrip("/")).is_file():
            errs.append(f"lead photo not found in public/: {data['photo']}")
    for key, value in data.items():
        if isinstance(value, str) and "TODO" in value:
            errs.append(f"unfilled placeholder in {key}: {value}")
    if BANNER_BLOCK.search(body) or "DRAFT-SOURCE" in body or "Draft brief" in body:
        errs.append("draft source block or brief banner still in the body")
    text = BANNER_BLOCK.sub("", body)
    if re.search(r"\bTODO\b", text):
        errs.append("TODO left in the body")
    if len(text.strip()) < 200:
        errs.append("body is empty or too short to be a finished piece")
    if "**" in text or re.search(r"(?<!\w)__\w", text):
        errs.append("bold text in body (no bold anywhere)")
    if "!" in re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text):
        errs.append("exclamation mark in body")
    for pattern, label in SYNTHETIC:
        if re.search(pattern, text, re.I | re.M):
            errs.append(f"synthetic prose marker: {label}")
    for img in re.findall(r"!\[[^\]]*\]\((/[^)\s]+)\)", text):
        if not (ROOT / "public" / img.lstrip("/")).is_file():
            errs.append(f"missing body image {img}")
    return errs


def set_featured(front: str, on: bool) -> str:
    front = re.sub(r"^featured:.*\n?", "", front + "\n", flags=re.M).rstrip("\n")
    return front + "\nfeatured: true" if on else front


def run(cmd: list[str], label: str) -> None:
    print(f"\n$ {' '.join(cmd)}")
    if subprocess.run(cmd, cwd=ROOT).returncode:
        raise RuntimeError(f"{label} failed")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("piece", help="slug, or path to the .md file")
    ap.add_argument("--feature", action="store_true", help="make this the featured portrait (unfeatures the current one)")
    ap.add_argument("--dry-run", action="store_true", help="preflight only; change nothing")
    ap.add_argument("--skip-build", action="store_true", help="skip npm run build")
    ap.add_argument("--no-commit", action="store_true", help="run every check, then stop before committing")
    ap.add_argument("--yes", action="store_true", help="push without asking")
    args = ap.parse_args()

    path = find_piece(args.piece)
    raw = path.read_text(encoding="utf-8")
    front, body = split_front(raw)
    data = yaml.safe_load(front) or {}
    problems = preflight(path, data, body)
    if args.feature and data.get("kind", "portrait") != "portrait":
        problems.append("only a portrait can be featured")
    rel = path.relative_to(ROOT)
    if problems:
        print(f"Not ready to publish: {rel}")
        for p in problems:
            print(f"  - {p}")
        return 1
    print(f"preflight ok: {rel}")
    if args.dry_run:
        return 0

    slug = data["slug"]
    backups: dict[Path, str | None] = {path: raw, QUEUE: QUEUE.read_text(encoding="utf-8")}
    touched = [path, QUEUE]
    try:
        if args.feature:
            for other in ROOT.glob("content/*/*.md"):
                if other == path or other.parent.name in {"notes", "pages"}:
                    continue
                o_raw = other.read_text(encoding="utf-8")
                if re.search(r"^featured:\s*true\s*$", o_raw, re.M):
                    backups[other] = o_raw
                    of, ob = split_front(o_raw)
                    other.write_text(f"---\n{set_featured(of, False)}\n---\n{ob}", encoding="utf-8")
                    touched.append(other)
                    print(f"unfeatured: {other.relative_to(ROOT)}")
        new_front = re.sub(r"^draft:.*\n?", "", front + "\n", flags=re.M).rstrip("\n")
        if args.feature:
            new_front = set_featured(new_front, True)
        path.write_text(f"---\n{new_front}\n---\n{body}", encoding="utf-8")

        queue = json.loads(backups[QUEUE])
        if not any(item["slug"] == slug for item in queue["posts"]):
            queue["posts"].append({
                "slug": slug, "status": "hold",
                "reason": "Caption and alt text not yet written or approved.",
                "hook": "", "caption": "", "alt": data.get("photoAlt", ""), "focal_point": [0.5, 0.5],
            })
            QUEUE.write_text(json.dumps(queue, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"queued: {slug} as hold (approve the social copy in social/queue.json to release it)")

        run(["npm", "run", "validate:content"], "content validation")
        run([sys.executable, "scripts/make_cards.py"], "share cards")
        run(["npm", "run", "social:assets"], "social assets")
        run(["npm", "run", "validate:social"], "social validation")
        run(["npm", "run", "validate:metadata"], "metadata check")
        if not args.skip_build:
            run(["npm", "run", "build"], "build")
    except (RuntimeError, KeyboardInterrupt) as exc:
        for file, original in backups.items():
            file.write_text(original, encoding="utf-8")
        print(f"\n{exc}. Piece and queue restored; generated files may remain (git status will show them).")
        return 1

    if args.no_commit:
        print("\nAll checks passed. Stopped before commit (--no-commit); changes are in the working tree.")
        return 0
    git = lambda *a: subprocess.run(["git", *a], cwd=ROOT, check=True)  # noqa: E731
    stage = [str(f.relative_to(ROOT)) for f in touched]
    stage += ["public/cards", "social/output", "public/og.png"]
    if (ROOT / "public" / "photos" / slug).is_dir():
        stage.append(f"public/photos/{slug}")
    git("add", "--", *stage)
    git("commit", "-m", f"Publish: {data['title']}")
    branch = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    print(f"\ncommitted on {branch}.")
    if branch != "main":
        print("Not on main: Vercel deploys main only. Merge or push as appropriate.")
    try:
        answer = "y" if args.yes else input(f"Push {branch} to origin (main deploys to tusenbruk.com)? [y/N] ")
    except EOFError:
        answer = "n"
    if answer.strip().lower() != "y":
        print(f"Not pushed. When ready: git push -u origin {branch}")
        return 0
    git("push", "-u", "origin", branch)
    print("pushed. Check Vercel's latest deployment SHA against origin/main (see DECISIONS.md, 2026-08-17).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
