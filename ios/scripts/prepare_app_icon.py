from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
target = root / "ios/App/App/Assets.xcassets/AppIcon.appiconset"
sizes = {
    "AppIcon-512@2x.png": 1024,
    "icon-180.png": 180,
    "icon-167.png": 167,
    "icon-120.png": 120,
    "icon-80.png": 80,
    "icon-60.png": 60,
    "icon-40.png": 40,
    "icon-20.png": 20,
}
for name, size in sizes.items():
    source = root / name
    if not source.is_file():
        raise FileNotFoundError(f"Missing uploaded icon: {source}")
    with Image.open(source) as img:
        rgba = img.convert("RGBA")
        if rgba.size != (size, size):
            raise ValueError(f"{name}: expected {size}x{size}, got {rgba.size}")
        white = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
        white.alpha_composite(rgba)
        white.convert("RGB").save(target / name, "PNG")
    print(f"Prepared opaque icon: {target / name}")
