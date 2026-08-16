#!/usr/bin/env python3
"""Remove EXIF/XMP/IPTC/comment JPEG segments without recompressing image data."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import tempfile


REMOVED_MARKERS = {0xE1, 0xED, 0xFE}  # APP1 (EXIF/XMP), APP13 (IPTC), COM
STANDALONE_MARKERS = {0x01, *range(0xD0, 0xDA)}


def strip_jpeg(data: bytes) -> tuple[bytes, int]:
    if not data.startswith(b"\xff\xd8"):
        raise ValueError("not a JPEG")

    output = bytearray(data[:2])
    index = 2
    removed = 0

    while index < len(data):
        if data[index] != 0xFF:
            raise ValueError(f"invalid JPEG marker at byte {index}")

        marker_start = index
        while index < len(data) and data[index] == 0xFF:
            index += 1
        if index >= len(data):
            raise ValueError("truncated JPEG marker")

        marker = data[index]
        index += 1

        if marker == 0xDA:  # Start of scan: metadata headers are over; preserve compressed data.
            output.extend(data[marker_start:])
            break
        if marker in STANDALONE_MARKERS:
            output.extend(data[marker_start:index])
            continue
        if index + 2 > len(data):
            raise ValueError("truncated JPEG segment length")

        length = int.from_bytes(data[index:index + 2], "big")
        segment_end = index + length
        if length < 2 or segment_end > len(data):
            raise ValueError("invalid JPEG segment length")

        if marker in REMOVED_MARKERS:
            removed += 1
        else:
            output.extend(data[marker_start:segment_end])
        index = segment_end

    return bytes(output), removed


def process(path: Path, check: bool) -> int:
    original = path.read_bytes()
    cleaned, removed = strip_jpeg(original)
    if check:
        if removed:
            print(f"metadata present: {path} ({removed} segment{'s' if removed != 1 else ''})")
        return removed
    if not removed:
        return 0

    mode = path.stat().st_mode
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=f".{path.name}.", delete=False) as handle:
        temporary = Path(handle.name)
        handle.write(cleaned)
    os.chmod(temporary, mode)
    os.replace(temporary, path)
    print(f"stripped: {path} ({removed} segment{'s' if removed != 1 else ''})")
    return removed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--check", action="store_true", help="report metadata and exit non-zero without changing files")
    args = parser.parse_args()

    found = 0
    for candidate in args.paths:
        if candidate.is_dir():
            files = sorted(candidate.rglob("*.jpg"))
        elif candidate.exists():
            files = [candidate]
        else:
            continue
        for path in files:
            found += process(path, args.check)
    return 1 if args.check and found else 0


if __name__ == "__main__":
    raise SystemExit(main())
