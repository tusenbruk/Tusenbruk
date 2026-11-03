import tempfile
import unittest
from pathlib import Path

from PIL import Image

from tests.helpers import make_photo
import instagram_crop as ic


class CropTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())

    def test_variant_sizes_and_names(self):
        photo = make_photo(self.tmp / "a.jpg")
        written = ic.build_variants([photo], "my-piece", "watches", self.tmp / "out")
        names = sorted(p.name for p in written)
        self.assertEqual(names, ["my-piece_portrait_01.jpg", "my-piece_square_01.jpg", "my-piece_story_01.jpg"])
        sizes = {p.name.split("_")[1]: Image.open(p).size for p in written}
        self.assertEqual(sizes, {"square": (1080, 1080), "portrait": (1080, 1350), "story": (1080, 1920)})

    def test_numbering_follows_source_order(self):
        a, b = make_photo(self.tmp / "a.jpg"), make_photo(self.tmp / "b.jpg")
        written = ic.build_variants([a, b], "s", "carry", self.tmp / "out")
        self.assertIn("s_square_02.jpg", {p.name for p in written})

    def test_crop_window_clamped_inside_frame(self):
        left, top, right, bottom = ic.crop_box((2000, 1500), ic.SQUARE, (0.99, 0.5))
        self.assertGreaterEqual(left, 0)
        self.assertLessEqual(right, 2000)
        self.assertAlmostEqual(right - left, bottom - top)

    def test_focal_point_finds_off_centre_object(self):
        image = Image.open(make_photo(self.tmp / "a.jpg", object_at=(0.7, 0.5)))
        fx, fy = ic.focal_point(image)
        self.assertGreater(fx, 0.55)
        self.assertAlmostEqual(fy, 0.5, delta=0.1)

    def test_object_stays_in_square_crop(self):
        image = Image.open(make_photo(self.tmp / "a.jpg", object_at=(0.85, 0.5)))
        left, _, right, _ = ic.crop_box(image.size, ic.SQUARE, ic.focal_point(image))
        self.assertTrue(left <= 0.85 * image.width <= right)

    def test_explicit_focal_overrides(self):
        left, _, _, _ = ic.crop_box((2000, 1500), ic.SQUARE, (0.0, 0.5))
        self.assertEqual(left, 0)

    def test_no_exif_in_output(self):
        photo = make_photo(self.tmp / "a.jpg", with_exif=True)
        self.assertTrue(Image.open(photo).getexif())
        for path in ic.build_variants([photo], "s", "watches", self.tmp / "out"):
            self.assertFalse(Image.open(path).getexif(), path.name)

    def test_story_band_carries_plate_label(self):
        photo = make_photo(self.tmp / "a.jpg")
        out = ic.build_variants([photo], "s", "watches", self.tmp / "out")
        story = Image.open([p for p in out if "story" in p.name][0])
        band = story.crop((0, 1920 - ic.STORY_BAND, 1080, 1920))
        colours = {c for _, c in band.getcolors(maxcolors=100000)}
        self.assertTrue(any(abs(c[0] - 178) < 25 and c[1] < 90 for c in colours), "red swatch missing")
        self.assertGreater(len(colours), 3, "label text missing")

    def test_portrait_source_to_story(self):
        photo = make_photo(self.tmp / "tall.jpg", size=(1200, 1800), object_at=(0.5, 0.3))
        out = ic.build_variants([photo], "s", "motoring", self.tmp / "out")
        self.assertEqual(len(out), 3)


if __name__ == "__main__":
    unittest.main()
