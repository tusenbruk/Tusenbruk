#!/usr/bin/env python3
"""Copy Instagram packages to a Google Drive folder for pickup on your phone.

The folder comes from config/social.json (`instagram.drive_sync_folder`) or
--dest. This is a dry run unless you pass --apply. It only copies: nothing is
ever deleted, and a file that already exists with different contents is left
alone unless you pass --overwrite. With no folder configured it just prints
where the local files are.

    python3 scripts/sync_social.py                 # every package, dry run
    python3 scripts/sync_social.py my-slug --apply
"""

from __future__ import annotations

import argparse
import filecmp
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from social_common import ROOT, load_config  # noqa: E402


def packages(root: Path, slugs: list[str]) -> list[Path]:
    base = root / "social" / "instagram"
    if not base.is_dir():
        return []
    found = sorted(p for p in base.iterdir() if p.is_dir())
    if slugs:
        missing = [s for s in slugs if not (base / s).is_dir()]
        if missing:
            raise SystemExit(f"no package for: {', '.join(missing)}; run scripts/publish.py first")
        found = [p for p in found if p.name in slugs]
    return found


def sync(root: Path, dest: Path | None, slugs: list[str], apply: bool = False, overwrite: bool = False) -> dict[str, int]:
    found = packages(root, slugs)
    counts = {"copied": 0, "unchanged": 0, "skipped": 0}
    if not found:
        print("no Instagram packages; run scripts/publish.py first")
        return counts
    if dest is None:
        print("No drive_sync_folder configured (config/social.json). Local packages:")
        for package in found:
            print(f"  {package}")
        return counts

    verb = "copy" if apply else "would copy"
    for package in found:
        for source in sorted(p for p in package.iterdir() if p.is_file()):
            target = dest / package.name / source.name
            if target.exists():
                if filecmp.cmp(source, target, shallow=False):
                    counts["unchanged"] += 1
                    continue
                if not overwrite:
                    print(f"skip (differs, use --overwrite): {target}")
                    counts["skipped"] += 1
                    continue
            print(f"{verb}: {source.relative_to(root)} -> {target}")
            counts["copied"] += 1
            if apply:
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, target)
    if not apply:
        print("\nDry run. Pass --apply to copy.")
    return counts


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slugs", nargs="*", help="packages to sync; default all")
    parser.add_argument("--dest", type=Path, help="override drive_sync_folder")
    parser.add_argument("--apply", action="store_true", help="actually copy (default is a dry run)")
    parser.add_argument("--overwrite", action="store_true", help="replace files that differ at the destination")
    args = parser.parse_args()

    configured = load_config()["instagram"]["drive_sync_folder"]
    dest = args.dest or (Path(configured).expanduser() if configured else None)
    if dest is not None and not dest.is_dir():
        raise SystemExit(f"destination folder does not exist: {dest}")
    sync(ROOT, dest, args.slugs, apply=args.apply, overwrite=args.overwrite)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
