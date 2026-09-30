"""Bundle small local copies of Steam Library artwork for the background wall."""
from __future__ import annotations

import base64
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "assets" / "covers"
# These titles are in the cleaned 2010–2023 game catalog.
GAMES = [
    ("Baldur's Gate 3", 1086940), ("Red Dead Redemption 2", 1174180),
    ("Sekiro: Shadows Die Twice", 814380), ("Control", 870780),
    ("Subnautica", 264710), ("Outer Wilds", 753640),
    ("A Short Hike", 1055540), ("Undertale", 391540),
    ("Death Stranding", 1190460), ("Monster Hunter: World", 582010),
    ("Persona 5 Royal", 1687950), ("Stray", 1332010),
    ("Ori and the Blind Forest", 261570), ("Resident Evil 4", 2050650),
    ("Hogwarts Legacy", 990080), ("Horizon Zero Dawn", 1151640),
    ("God of War", 1593500), ("Spiritfarer", 972660),
]

def main():
    ART.mkdir(parents=True, exist_ok=True)
    out = {}
    for title, app in GAMES:
        source = f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app}/library_600x900.jpg"
        with urlopen(Request(source, headers={"User-Agent": "Mozilla/5.0"}), timeout=18) as resp:
            raw = resp.read()
        with Image.open(io.BytesIO(raw)) as image:
            image = image.convert("RGB")
            image.thumbnail((192, 288), Image.Resampling.LANCZOS)
            encoded = io.BytesIO()
            image.save(encoded, format="JPEG", quality=67, optimize=True, progressive=True)
        out[app] = "data:image/jpeg;base64," + base64.b64encode(encoded.getvalue()).decode("ascii")
        print(title, app, len(encoded.getvalue()), "bytes")
    for i in range(3):
        chunk = dict(list(out.items())[i*6:(i+1)*6])
        (ART / f"extra-{i+1}.js").write_text("Object.assign(window.extraCoverData, " + json.dumps(chunk, separators=(",", ":")) + ");\n", encoding="utf-8")

if __name__ == "__main__":
    main()
