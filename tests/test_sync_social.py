import tempfile
import unittest
from pathlib import Path

import sync_social


class SyncTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.dest = Path(tempfile.mkdtemp())
        pkg = self.root / "social/instagram/a"
        pkg.mkdir(parents=True)
        (pkg / "caption.txt").write_text("hello\n")
        (pkg / "a_square_01.jpg").write_bytes(b"jpg")

    def test_dry_run_is_default_and_copies_nothing(self):
        counts = sync_social.sync(self.root, self.dest, [])
        self.assertEqual(counts["copied"], 2)
        self.assertEqual(list(self.dest.iterdir()), [])

    def test_apply_copies(self):
        sync_social.sync(self.root, self.dest, [], apply=True)
        self.assertEqual((self.dest / "a/caption.txt").read_text(), "hello\n")

    def test_existing_differing_file_kept_without_overwrite(self):
        (self.dest / "a").mkdir()
        (self.dest / "a/caption.txt").write_text("edited on phone\n")
        counts = sync_social.sync(self.root, self.dest, [], apply=True)
        self.assertEqual(counts["skipped"], 1)
        self.assertEqual((self.dest / "a/caption.txt").read_text(), "edited on phone\n")
        sync_social.sync(self.root, self.dest, [], apply=True, overwrite=True)
        self.assertEqual((self.dest / "a/caption.txt").read_text(), "hello\n")

    def test_identical_files_unchanged_and_nothing_deleted(self):
        sync_social.sync(self.root, self.dest, [], apply=True)
        (self.dest / "a/extra.txt").write_text("keep")
        counts = sync_social.sync(self.root, self.dest, [], apply=True)
        self.assertEqual(counts["unchanged"], 2)
        self.assertTrue((self.dest / "a/extra.txt").exists())

    def test_no_destination_only_lists(self):
        counts = sync_social.sync(self.root, None, [], apply=True)
        self.assertEqual(counts["copied"], 0)

    def test_unknown_slug_errors(self):
        with self.assertRaises(SystemExit):
            sync_social.sync(self.root, self.dest, ["nope"])


if __name__ == "__main__":
    unittest.main()
