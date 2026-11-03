"""Shared helpers for the Tusenbruk publishing scripts.

Standalone: stdlib plus Pillow. Every function that touches the repo takes a
`root` argument so tests can run against a temporary tree.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PLATES = ["photography", "watches", "motoring", "writing", "carry", "travel"]
PLATE_NAMES = {
    "photography": "PL. I — PHOTOGRAPHY",
    "watches": "PL. II — WATCHES",
    "motoring": "PL. III — MOTORING",
    "writing": "PL. IV — WRITING",
    "carry": "PL. V — CARRY",
    "travel": "PL. VI — TRAVEL",
}

DEFAULT_CONFIG = {
    "instagram": {
        "default_hashtags": ["tusenbruk", "thepleasureofuse"],
        "max_hashtags": 5,
        "drive_sync_folder": "",
    },
    "defaults": {"caption_style": "opening_line", "image_quality": 85},
}


def load_config(root: Path = ROOT) -> dict:
    """config/social.json merged over the defaults; a missing file is fine."""
    config = json.loads(json.dumps(DEFAULT_CONFIG))
    path = root / "config" / "social.json"
    if path.exists():
        user = json.loads(path.read_text())
        for section, values in user.items():
            config.setdefault(section, {}).update(values)
    return config


def split_frontmatter(raw: str) -> tuple[dict[str, str], str]:
    """Top-level `key: value` pairs and the body. Nested YAML is ignored."""
    match = re.match(r"(?s)^---\n(.*?)\n---\n?(.*)$", raw)
    if not match:
        return {}, raw
    data: dict[str, str] = {}
    for line in match.group(1).splitlines():
        value = re.match(r"([A-Za-z_]\w*):\s*(.*)$", line)
        if value:
            data[value.group(1)] = value.group(2).strip().strip('"')
    return data, match.group(2)


def find_piece(slug: str, root: Path = ROOT) -> Path | None:
    for plate in PLATES:
        directory = root / "content" / plate
        if not directory.is_dir():
            continue
        for path in sorted(directory.glob("*.md")):
            data, _ = split_frontmatter(path.read_text())
            if data.get("slug", path.stem) == slug:
                return path
    return None


def queue_status(slug: str, root: Path = ROOT) -> dict | None:
    """The social/queue.json entry for a slug, or None if it has none."""
    path = root / "social" / "queue.json"
    if not path.exists():
        return None
    for item in json.loads(path.read_text()).get("posts", []):
        if item.get("slug") == slug:
            return item
    return None
