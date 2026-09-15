"""
Generate transparent cutout assets with fal.ai (openai/gpt-image-2) for framecraft layers.

Usage:
  FAL_KEY=... python3 gen_assets.py            # every asset in ASSETS
  python3 gen_assets.py boxes folder           # only the named ones (re-run 429 failures)

Writes gen/<name>.png, trimmed to the alpha bounding box. Edit ASSETS per project.
"""
import concurrent.futures as cf, json, os, sys, urllib.request
from PIL import Image

KEY = os.environ["FAL_KEY"]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gen")
os.makedirs(OUT, exist_ok=True)
BRAND_HEX = "#E1FF69"

STYLE = ("Premium 3D render of a single isolated object, centered, slight three-quarter perspective, "
         "soft studio lighting, smooth matte clay surfaces with subtle glossy highlights, crisp edges, "
         "no text, no ground shadow, transparent background. ")
PERSON = ("Photorealistic studio portrait, waist-up, {who}, warm natural light, looking at camera, "
          "isolated, transparent background.")

ASSETS = {
    "scanner": STYLE + f"A handheld barcode scanner gun, matte black with bright {BRAND_HEX} accents, projecting a thin red laser line forward.",
    "boxes": STYLE + f"A neat stack of three kraft cardboard shipping boxes sealed with {BRAND_HEX} packing tape.",
    "bell": STYLE + "A chunky notification bell icon in warm coral orange with a small round red badge on its top-right.",
    "arrow-in": STYLE + "A chunky rounded 3D arrow pointing down-left, fresh green (#34C759).",
    "arrow-out": STYLE + "A chunky rounded 3D arrow pointing up-right, coral red (#FF5A5F).",
    "folder": STYLE + f"A closed file folder icon in {BRAND_HEX} with a darker tab, slightly open showing a white sheet inside.",
    "pin": STYLE + f"A map location pin marker, matte black with a {BRAND_HEX} center dot.",
    "avatar-1": PERSON.format(who="a smiling woman in her 30s wearing a dark green work apron over a white tee, arms crossed"),
    "avatar-2": PERSON.format(who="a smiling man in his 40s with a short beard in a grey hoodie and lanyard, holding a tablet"),
}

def gen(name):
    body = json.dumps({"prompt": ASSETS[name], "image_size": "square_hd", "background": "transparent",
                       "quality": "high", "output_format": "png"}).encode()
    req = urllib.request.Request("https://fal.run/openai/gpt-image-2", data=body,
                                 headers={"Authorization": "Key " + KEY, "Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=600))
        p = os.path.join(OUT, name + ".png")
        urllib.request.urlretrieve(r["images"][0]["url"], p)
        im = Image.open(p).convert("RGBA")
        box = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
        if box: im.crop(box).save(p)
        return name, "ok", Image.open(p).size
    except Exception as e:                      # 429 is common above ~10 concurrent
        return name, "ERR", repr(e)[:200]

names = sys.argv[1:] or list(ASSETS)
with cf.ThreadPoolExecutor(8) as ex:
    for res in ex.map(gen, names):
        print(*res, flush=True)
