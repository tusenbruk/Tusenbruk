import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from tests.helpers import make_photo
import publish
from social_common import DEFAULT_CONFIG, split_frontmatter

PIECE = """---
title: "The case that was never polished"
slug: the-case
object: "Rolex GMT-Master II 116710LN"
plate: watches
date: 2026-11-03
summary: "A builder and the clasp he never had refinished."
photo: /photos/the-case.jpg
photoAlt: "A scratched steel clasp against a workbench edge."
subject: "A Sydney builder"
{extra}---

He tightens the screw every few months. The watch has been on his wrist since the year his son was born.

![The bracelet, open](/photos/the-case-02.jpg)

A second paragraph.
"""


class PublishTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        make_photo(self.root / "public/photos/the-case.jpg")
        make_photo(self.root / "public/photos/the-case-02.jpg", size=(1200, 1800))
        (self.root / "social").mkdir()
        self.write_queue([])

    def write_piece(self, extra="", text=None):
        path = self.root / "content/watches/the-case.md"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text if text is not None else PIECE.format(extra=extra))
        return path

    def write_queue(self, posts):
        (self.root / "social/queue.json").write_text(json.dumps({"manifesto": {}, "posts": posts}))

    # ── caption ──
    def test_opening_line_is_verbatim_from_the_piece(self):
        _, body = split_frontmatter(PIECE.format(extra=""))
        self.assertEqual(publish.opening_line(body), "He tightens the screw every few months. The watch has been on his wrist since the year his son was born.")

    def test_long_first_sentence_stands_alone(self):
        body = "The screw on the sixth link backs itself out every few months. He tightens it.\n"
        self.assertEqual(publish.opening_line(body), "The screw on the sixth link backs itself out every few months.")

    def test_short_first_sentence_takes_the_second(self):
        self.assertEqual(publish.opening_line("It is old. It still runs every day.\n"), "It is old. It still runs every day.")

    def test_opening_line_skips_headings_and_images(self):
        body = "## A heading\n\n![x](/photos/a.jpg)\n\n> quote\n\nThe real opening sentence arrives here, in full.\n"
        self.assertEqual(publish.opening_line(body), "The real opening sentence arrives here, in full.")

    def test_markdown_stripped_from_opening(self):
        self.assertEqual(publish.opening_line("He *never* [polished](http://x.com) the case, not once in nine years.\n"),
                         "He never polished the case, not once in nine years.")

    def test_object_hashtag_drops_reference_numbers(self):
        self.assertEqual(publish.object_hashtag("Rolex GMT-Master II 116710LN"), "RolexGMTMasterII")
        self.assertEqual(publish.object_hashtag("Leica Q2"), "LeicaQ2")

    def test_hashtags_respect_max_and_dedupe(self):
        config = json.loads(json.dumps(DEFAULT_CONFIG))
        data = {"object": "Tusenbruk"}
        self.assertEqual(publish.hashtags(data, config), ["#tusenbruk", "#thepleasureofuse"])
        config["instagram"]["max_hashtags"] = 1
        self.assertEqual(publish.hashtags({"object": "Rolex"}, config), ["#tusenbruk"])

    def test_caption_order_and_voice(self):
        data, body = split_frontmatter(PIECE.format(extra=""))
        caption = publish.build_caption(data, body, DEFAULT_CONFIG)
        parts = caption.strip().split("\n\n")
        self.assertEqual(parts[0], "He tightens the screw every few months. The watch has been on his wrist since the year his son was born.")
        self.assertEqual(parts[1], "A builder and the clasp he never had refinished.")
        self.assertEqual(parts[2], "Read “The case that was never polished” at the link in bio.")
        self.assertTrue(parts[3].startswith("#tusenbruk"))
        self.assertNotIn("!", caption)

    # ── validation ──
    def test_valid_piece_passes(self):
        data, body = split_frontmatter(PIECE.format(extra=""))
        self.assertEqual(publish.validate_piece(data, body, self.root), [])

    def test_draft_is_refused(self):
        self.write_piece(extra="draft: true\n")
        with self.assertRaises(SystemExit) as ctx:
            publish.prepare("the-case", self.root)
        self.assertIn("draft", str(ctx.exception))

    def test_leftover_brief_refused(self):
        text = PIECE.format(extra="") + f"\n> **{publish.BRIEF_MARKER}**\n"
        data, body = split_frontmatter(text)
        self.assertTrue(any("brief" in e for e in publish.validate_piece(data, body, self.root)))

    def test_voice_rules_flagged(self):
        data, body = split_frontmatter(PIECE.format(extra="") + "\nIt is **superb**! \n")
        errors = " ".join(publish.validate_piece(data, body, self.root))
        self.assertIn("bold", errors)
        self.assertIn("exclamation", errors)

    def test_missing_alt_and_photo_flagged(self):
        data, body = split_frontmatter(PIECE.format(extra="").replace("photoAlt: ", "photoAltX: "))
        self.assertTrue(any("alt text" in e for e in publish.validate_piece(data, body, self.root)))
        (self.root / "public/photos/the-case-02.jpg").unlink()
        self.assertTrue(any("missing photograph" in e for e in publish.validate_piece(data, body, self.root)))

    # ── hold ──
    def test_hold_is_a_hard_stop(self):
        self.write_piece()
        self.write_queue([{"slug": "the-case", "status": "hold", "reason": "awaiting consent"}])
        with self.assertRaises(publish.Held) as ctx:
            publish.build_package("the-case", self.root)
        self.assertIn("awaiting consent", str(ctx.exception))
        self.assertFalse((self.root / "social/instagram").exists())

    def test_hold_checked_before_validation(self):
        self.write_piece(extra="draft: true\n")
        self.write_queue([{"slug": "the-case", "status": "hold"}])
        with self.assertRaises(publish.Held):
            publish.prepare("the-case", self.root)

    def test_hold_even_for_dry_run(self):
        self.write_piece()
        self.write_queue([{"slug": "the-case", "status": "hold"}])
        with self.assertRaises(publish.Held):
            publish.build_package("the-case", self.root, dry_run=True)

    # ── package ──
    def test_package_written_and_verified(self):
        self.write_piece()
        out = publish.build_package("the-case", self.root)
        self.assertEqual(out, self.root / "social/instagram/the-case")
        self.assertEqual(publish.verify_package("the-case", out, 2), [])
        names = {p.name for p in out.iterdir()}
        self.assertIn("the-case_story_02.jpg", names)
        self.assertIn("caption.txt", names)
        self.assertEqual((out / "alt.txt").read_text().splitlines()[1], "02 — The bracelet, open")

    def test_dry_run_writes_nothing(self):
        self.write_piece()
        publish.build_package("the-case", self.root, dry_run=True)
        self.assertFalse((self.root / "social/instagram").exists())

    def test_ten_image_cap(self):
        extra = "".join(f"\n![alt {i}](/photos/p{i}.jpg)\n" for i in range(12))
        data, body = split_frontmatter(PIECE.format(extra="") + extra)
        self.assertEqual(len(publish.photographs(data, body)[: publish.MAX_IMAGES]), 10)

    def test_verify_catches_wrong_size(self):
        self.write_piece()
        out = publish.build_package("the-case", self.root)
        Image.new("RGB", (100, 100)).save(out / "the-case_square_01.jpg")
        self.assertTrue(any("expected" in p for p in publish.verify_package("the-case", out, 2)))


if __name__ == "__main__":
    unittest.main()
