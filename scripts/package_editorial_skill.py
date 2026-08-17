#!/usr/bin/env python3
"""Sync Claude Code and build the portable .skill archive from canonical source."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "editorial" / "tusenbruk-editorial-voice" / "SKILL.md"
TARGET = ROOT / "editorial" / "tusenbruk-editorial-voice.skill"
CLAUDE_SKILL = ROOT / ".claude" / "skills" / "tusenbruk-editorial-voice" / "SKILL.md"


def main() -> None:
    content = SOURCE.read_bytes()
    CLAUDE_SKILL.parent.mkdir(parents=True, exist_ok=True)
    CLAUDE_SKILL.write_bytes(content)
    entry = ZipInfo("skill/SKILL.md", date_time=(2026, 8, 17, 0, 0, 0))
    entry.compress_type = ZIP_DEFLATED
    entry.external_attr = 0o644 << 16
    with ZipFile(TARGET, "w") as archive:
        archive.writestr(entry, content)
    print(f"synced {CLAUDE_SKILL.relative_to(ROOT)}")
    print(f"built {TARGET.relative_to(ROOT)} from {SOURCE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
