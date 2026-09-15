"""
framecraft layer builder — template.

Generates a framecraft.json (v1 project file) whose screens are fully authored as layers:
real capture inside the device frame, pulled-out UI cards, transparent 3D/photo cutouts,
and a two-line headline where line 2 is a rotated pill.

Usage:
  ASSETS_DIR=./assets OUT=./framecraft.json DEV_SCALE=106 DEV_Y=132 python3 build.py
  python3 build.py probe      # one screen, phone only — measure phone geometry

ASSETS_DIR layout:  caps/<capture>.png   crops/<card>.png   gen/<object>.png
                    fonts/Inter-ExtraBold.ttf  fonts/Inter-Bold.ttf   (for pill widths)
Canvas: 392 x 852 authored px for iphone-69 (export scale 1320/392 = 3.367).
"""
import base64, json, os, sys
from PIL import Image, ImageFont

S = os.environ.get("ASSETS_DIR", os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get("OUT", os.path.join(os.path.dirname(os.path.abspath(__file__)), "framecraft.json"))
DEV_SCALE = int(os.environ.get("DEV_SCALE", "106"))
DEV_Y = int(os.environ.get("DEV_Y", "132"))
CANVAS_W = 392

# ---- brand -------------------------------------------------------------------------------
BRAND = "#E1FF69"      # saturated brand colour: pills, circles, accents only
PASTEL = "#E2F5C4"     # light derivative used as a full background
CREAM = "#F4F1E8"
INK = "#111111"
WHITE = "#FFFFFF"
FONT = "Inter"         # bundled in framecraft; measured below with the matching TTF

# ---- locale ------------------------------------------------------------------------------
# Framecraft supports `translations` on text layers. This template can still build one
# project per locale when each script needs independent auto-fit geometry. For one portable
# multilingual project, put locale overrides in each text layer's `translations` map.
LOCALE = os.environ.get("LOCALE", "en-US")
# Render family (must be installed for Chrome) + local file used only to measure widths.
SCRIPT_FONTS = {
    "ja-JP": ("Hiragino Sans", "/System/Library/Fonts/Hiragino Sans GB.ttc"),
    "zh-Hans": ("PingFang SC", "/System/Library/Fonts/Hiragino Sans GB.ttc"),
    "zh-Hant": ("PingFang TC", "/System/Library/Fonts/Hiragino Sans GB.ttc"),
    "ko-KR": ("Apple SD Gothic Neo", "/System/Library/Fonts/AppleSDGothicNeo.ttc"),
    "ar-SA": ("Geeza Pro", "/System/Library/Fonts/GeezaPro.ttc"),
    "hi-IN": ("Kohinoor Devanagari", "/System/Library/Fonts/Kohinoor.ttc"),
}
LATIN = LOCALE not in SCRIPT_FONTS
FONT = SCRIPT_FONTS.get(LOCALE, (FONT, None))[0]
TALL = LOCALE in ("hi-IN", "ar-SA")      # marks/ascenders need a taller line box

# (line 1, line 2) per screen, per locale. Uppercase for Latin scripts. EDIT ME.
HEADLINES = {
    "en-US": [("LINE ONE", "LINE TWO")],
}
HEADLINES.setdefault("en-GB", HEADLINES["en-US"])
COPY = HEADLINES.get(LOCALE, HEADLINES["en-US"])

_fonts = {}
def _font(weight):
    if weight not in _fonts:
        if LATIN:
            name = "Inter-ExtraBold.ttf" if weight >= 800 else "Inter-Bold.ttf"
            path = os.path.join(S, "fonts", name)
        else:
            path = SCRIPT_FONTS[LOCALE][1]
        _fonts[weight] = ImageFont.truetype(path, 100)
    return _fonts[weight]

# Chrome's bold Arabic face runs ~30% wider than Geeza Pro measured in PIL; pad the estimate.
WIDTH_FACTOR = {"ar-SA": 1.3}.get(LOCALE, 1.0)

def text_w(t, size, ls=0, weight=800):
    return _font(weight).getlength(t) * size / 100 * WIDTH_FACTOR + ls * (len(t) - 1)

def fit_size(l1, l2, size=46, ls=-1.6):
    """Shared headline size: shrink until line 1 fits 356px and the pill (text + 32) fits 372px."""
    ls = ls if LATIN else 0
    for _ in range(40):
        if text_w(l1, size, ls * size / 46) <= 356 and text_w(l2, size, ls * size / 46) + 32 <= 372:
            break
        size -= 1
    return size

# ---- media ---------------------------------------------------------------------------------
media, sizes = [], {}
def asset(path):
    aid = "a-" + os.path.splitext(os.path.basename(path))[0]
    if aid not in sizes:
        sizes[aid] = Image.open(path).size
        with open(path, "rb") as f:
            media.append({"id": aid, "name": aid,
                          "dataUrl": "data:image/png;base64," + base64.b64encode(f.read()).decode()})
    return aid

# ---- layer primitives ----------------------------------------------------------------------
_n = [0]
def L(kind, x, y, w, h, **p):
    _n[0] += 1
    d = {"id": f"l{_n[0]}", "name": p.pop("name", f"{kind} {_n[0]}"), "kind": kind,
         "x": x, "y": y, "width": w, "height": h, "rotation": 0, "opacity": 100,
         "visible": True, "locked": False, "plane": "front", "text": "", "translations": {}, "fontSize": 24,
         "color": INK, "fill": "transparent", "radius": 0, "shadow": False, "mediaId": None,
         "fit": "contain", "fontFamily": FONT, "fontWeight": 800, "lineHeight": 1,
         "letterSpacing": 0, "padding": 0}
    d.update(p)
    return d

def headline(t, y, color=INK, size=46):
    ls = -1.6 * size / 46 if LATIN else 0
    return L("text", 10, y - 8, CANVAS_W - 20, size * (1.55 if TALL else 1.4), text=t, fontSize=size,
             color=color, letterSpacing=ls, lineHeight=1.1, name="Headline " + t)

def head(i, c1, fill, c2, rot=-2, y1=44, y2=100):
    """Localised two-line headline for screen i: plain line 1 + pill line 2, auto-fitted."""
    l1, l2 = COPY[i]
    size = fit_size(l1, l2)
    ls = -1.6 * size / 46 if LATIN else 0
    return [headline(l1, y1, c1, size),
            pill(l2, y2 + (46 - size) * 0.6, fill, c2, rot=rot, size=size, ls=ls, pady=10 if TALL else 4)]

def pill(t, y, fill, color, rot=-2, size=46, padx=16, pady=4, x=None, ls=-1.6, radius=16,
         weight=800, shadow=False):
    w = text_w(t, size, ls, weight) + 2 * padx
    h = size * 1.12 + 2 * pady
    x = (CANVAS_W - w) / 2 if x is None else x
    return L("text", x, y, w, h, text=t, fontSize=size, color=color, fill=fill, radius=radius,
             rotation=rot, letterSpacing=ls, fontWeight=weight, lineHeight=1.12, shadow=shadow,
             name="Pill " + t)

def chip(t, x, y, fill, color, rot=4):
    return pill(t, y, fill, color, rot=rot, size=14, padx=12, pady=6, x=x, ls=-0.2, radius=999,
                weight=700, shadow=True)

def img(path, x, y, w, rot=0, shadow=False, plane="front", opacity=100):
    aid = asset(path); iw, ih = sizes[aid]
    return L("image", x, y, w, w * ih / iw, mediaId=aid, rotation=rot, shadow=shadow,
             plane=plane, opacity=opacity, name=aid)

def card(name, x, y, w, rot=0):          # pulled-out UI crop (already padded + rounded)
    return img(os.path.join(S, "crops", name + ".png"), x, y, w, rot, shadow=True)

def obj(name, x, y, w, rot=0, shadow=False):   # transparent 3D object / photo cutout
    return img(os.path.join(S, "gen", name + ".png"), x, y, w, rot, shadow=shadow)

def circle(x, y, d, fill, opacity=100, plane="back"):
    return L("shape", x, y, d, d, fill=fill, radius=d / 2, opacity=opacity, plane=plane, name="Circle")

def screen(i, name, bg, capture, layers, dark=False, frame="iPhone 17 Pro Max"):
    return {"id": f"screen-{i}", "number": f"{i:02d}", "name": name, "miniTitle": name.upper(),
            "brandChip": "", "brandChipVisible": False, "headline": "", "subhead": "",
            "bg": bg, "backgroundStyle": "solid", "app": "today",
            "mediaId": asset(os.path.join(S, "caps", capture)), "translations": {},
            "fontSize": 72, "subheadSize": 25, "align": "center", "headlineVisible": False,
            "deviceVisible": True, "deviceChrome": False, "deviceFrame": frame,
            "deviceColor": "Black Titanium" if dark else "White Titanium",
            "deviceScale": DEV_SCALE, "deviceX": 0, "deviceY": DEV_Y, "textX": 0, "textY": 0,
            "fontFamily": FONT, "decorations": [], "accentShape": None, "layers": layers}

# ---- screens (EDIT ME) ---------------------------------------------------------------------
probe = len(sys.argv) > 1 and sys.argv[1] == "probe"
HY1, HY2 = 44, 100   # headline line 1 / pill line 2

screens = [
    screen(1, "Opener", INK, "01-first.png", [] if probe else [
        circle(-70, 300, 540, BRAND, opacity=14),
        *head(0, WHITE, BRAND, INK, rot=-2),
        # card("some-card", -18, 452, 256, rot=-8),
        # obj("some-object", 214, 468, 196, rot=10),
    ], dark=True),
    # screen(2, "Second", PASTEL, "02-second.png", [
    #     *head(1, INK, INK, BRAND, rot=2),
    #     card("tile", 232, 254, 152, rot=6), obj("bell", 296, 326, 96, rot=12, shadow=True),
    #     card("row", 6, 566, 292, rot=-5), obj("boxes", 236, 636, 166),
    # ]),
]
if probe:
    screens = screens[:1]

project = {"tool": "layers", "selectedScreenId": screens[0]["id"], "canvasDeviceId": "iphone-69",
           "screens": screens, "media": media, "locale": "en-US", "zoom": 1, "canvasMode": "select",
           "inspectorTab": "design", "mediaTab": "uploads", "activeTextStyleId": "headline",
           "previewOpen": False, "exportOpen": False, "exportDeviceIds": ["iphone-69"],
           "exportFormat": "png", "exportNaming": True}
doc = {"framecraft": 1, "name": os.environ.get("NAME", "App Store set"),
       "updatedAt": "2026-01-01T00:00:00.000Z", "project": project}
with open(OUT, "w") as f:
    json.dump(doc, f)
print("wrote", OUT, round(os.path.getsize(OUT) / 1e6, 1), "MB, screens", len(screens))
