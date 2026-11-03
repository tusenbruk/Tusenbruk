#!/usr/bin/env python3
"""Tests for scripts/intake.py.  python3 scripts/test_intake.py"""
import shutil
import tempfile
import unittest
from pathlib import Path

from PIL import Image

import intake

REPO = Path(__file__).resolve().parent.parent
NOTES = """---
object: Leica Q2
subject: A New York photographer
---
Text of the notes.

## Photos
- a.jpg: Caption one. | alt: What is visible.
"""


class IntakeTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.root = self.tmp / "root"
        (self.root / "lib").mkdir(parents=True)
        (self.root / "content" / "photography").mkdir(parents=True)
        shutil.copy(REPO / "lib" / "plates.ts", self.root / "lib" / "plates.ts")
        self.orig = self.tmp / "orig"
        self.orig.mkdir()
        Image.new("RGB", (3200, 2000), (50, 40, 30)).save(self.orig / "a.jpg")
        self.notes = self.tmp / "notes.md"
        self.notes.write_text(NOTES)

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def run_intake(self, *extra):
        return intake.main([str(self.orig), str(self.notes), "--root", str(self.root), *extra])

    def test_scaffolds_a_draft_and_resizes_photos(self):
        self.assertEqual(self.run_intake("--plate", "photography", "--title", "A title"), 0)
        text = (self.root / "content/photography/a-title.md").read_text()
        self.assertIn("draft: true", text)
        self.assertNotIn("featured", text)
        self.assertIn('photoAlt: "What is visible."', text)
        self.assertIn("Text of the notes.", text)
        self.assertEqual(Image.open(self.root / "public/photos/a-title-01.jpg").size, (1600, 1000))

    def test_does_not_invent_missing_fields(self):
        self.run_intake("--plate", "photography")
        text = (self.root / "content/photography/leica-q2.md").read_text()
        self.assertIn('summary: ""', text)
        self.assertIn('place: ""', text)

    def test_refuses_duplicate_slug_and_bad_plate(self):
        self.assertEqual(self.run_intake("--plate", "photography"), 0)
        self.assertEqual(self.run_intake("--plate", "photography"), 1)
        self.assertEqual(self.run_intake("--plate", "nope", "--slug", "x"), 1)

    def test_dry_run_writes_nothing(self):
        self.assertEqual(self.run_intake("--plate", "photography", "--dry-run"), 0)
        self.assertFalse((self.root / "public").exists())
        self.assertEqual(list((self.root / "content/photography").iterdir()), [])


if __name__ == "__main__":
    unittest.main()
