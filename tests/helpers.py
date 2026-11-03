import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from PIL import Image, ImageDraw  # noqa: E402


def make_photo(path: Path, size=(2000, 1500), object_at=(0.7, 0.5), with_exif=False) -> Path:
    """A flat grey frame with one high-contrast 'object' at a known position."""
    image = Image.new("RGB", size, (120, 120, 120))
    draw = ImageDraw.Draw(image)
    cx, cy = object_at[0] * size[0], object_at[1] * size[1]
    r = min(size) * 0.08
    for i in range(6):
        draw.rectangle((cx - r + i * 6, cy - r + i * 6, cx + r - i * 6, cy + r - i * 6),
                       fill=(250, 250, 250) if i % 2 == 0 else (10, 10, 10))
    path.parent.mkdir(parents=True, exist_ok=True)
    if with_exif:
        exif = Image.Exif()
        exif[0x010F] = "TestCamera"
        image.save(path, "JPEG", exif=exif)
    else:
        image.save(path, "JPEG")
    return path
