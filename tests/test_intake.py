import tempfile
import unittest
from pathlib import Path

from PIL import Image

from tests.helpers import make_photo
import intake
from social_common import split_frontmatter


def args_for(root, **over):
    base = ["--title", "The case that was never polished", "--plate", "watches",
            "--object", "Rolex GMT-Master II 116710LN", "--subject", "A Sydney builder",
            "--place", "Sydney, Australia", "--date", "2026-11-03"]
    for key, value in over.items():
        base += [f"--{key}", *([value] if not isinstance(value, list) else [str(v) for v in value])]
    return intake.build_parser().parse_args(base)


class IntakeTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.photo = make_photo(self.root / "src" / "a.jpg", size=(3000, 2000), with_exif=True)
        self.notes = self.root / "notes.txt"
        self.notes.write_text("He tightens the screw every few months.\nThe clasp is scratched.")

    def run_intake(self, **over):
        return intake.intake(args_for(self.root, **over), self.root)

    def test_slugify(self):
        self.assertEqual(intake.slugify("The Rolex you’ve got!"), "the-rolex-youve-got")

    def test_writes_draft_with_frontmatter(self):
        path = self.run_intake(photos=[self.photo], notes=str(self.notes))
        self.assertEqual(path, self.root / "content/watches/the-case-that-was-never-polished.md")
        data, body = split_frontmatter(path.read_text())
        self.assertEqual(data["draft"], "true")
        self.assertEqual(data["plate"], "watches")
        self.assertEqual(data["subject"], "A Sydney builder")
        self.assertEqual(data["photo"], "/photos/the-case-that-was-never-polished.jpg")
        self.assertEqual(data["photoAlt"], "")

    def test_notes_copied_verbatim_and_prose_not_invented(self):
        path = self.run_intake(photos=[self.photo], notes=str(self.notes))
        text = path.read_text()
        self.assertIn(intake.NOTES_MARKER, text)
        self.assertIn("He tightens the screw every few months.\nThe clasp is scratched.", text)
        self.assertIn(intake.BRIEF_MARKER, text)

    def test_photo_resized_and_stripped(self):
        self.run_intake(photos=[self.photo])
        out = self.root / "public/photos/the-case-that-was-never-polished.jpg"
        with Image.open(out) as image:
            self.assertEqual(image.width, 1600)
            self.assertFalse(image.getexif())

    def test_multiple_photos_numbered_lead_first(self):
        second = make_photo(self.root / "src" / "b.jpg")
        path = self.run_intake(photos=[self.photo, second])
        data, body = split_frontmatter(path.read_text())
        self.assertEqual(data["photo"], "/photos/the-case-that-was-never-polished-01.jpg")
        self.assertIn("/photos/the-case-that-was-never-polished-02.jpg", body)

    def test_folder_input(self):
        make_photo(self.root / "src" / "b.jpg")
        path = self.run_intake(photos=[self.root / "src"])
        self.assertTrue((self.root / "public/photos/the-case-that-was-never-polished-02.jpg").exists())
        self.assertTrue(path.exists())

    def test_refuses_to_overwrite_existing_piece(self):
        path = self.run_intake()
        before = path.read_text()
        with self.assertRaises(SystemExit):
            self.run_intake()
        self.assertEqual(path.read_text(), before)

    def test_refuses_existing_photo_and_writes_nothing(self):
        existing = self.root / "public/photos/the-case-that-was-never-polished.jpg"
        existing.parent.mkdir(parents=True)
        existing.write_bytes(b"x")
        with self.assertRaises(SystemExit):
            self.run_intake(photos=[self.photo])
        self.assertEqual(existing.read_bytes(), b"x")
        self.assertFalse((self.root / "content").exists())

    def test_dry_run_writes_nothing(self):
        args = args_for(self.root, photos=[self.photo])
        args.dry_run = True
        intake.intake(args, self.root)
        self.assertFalse((self.root / "content").exists())
        self.assertFalse((self.root / "public").exists())


if __name__ == "__main__":
    unittest.main()
