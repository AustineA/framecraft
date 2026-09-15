"""
Cut "pulled-out" UI cards from full-resolution simulator captures.

Each card is trimmed to content, padded with white, and given rounded corners in PIL —
framecraft image layers only clip to `radius`, they do not inset, so bake the padding here.

Boxes are pixel coords in the capture (1320x2868 on a 6.9" simulator). Derive them from the
argent describe tree: x*1320, y*2868. Use autotrim=True when the crop is a whole card sitting
on the page background (the corner pixel is the page colour); use autotrim=False for rows
that live inside a bigger white card and cut the row box exactly.

Usage: python3 crop_cards.py   (edit CUTS)
"""
import os
from PIL import Image, ImageChops, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
CAPS, OUT = os.path.join(HERE, "caps"), os.path.join(HERE, "crops")
os.makedirs(OUT, exist_ok=True)

def trim(img, tol=18):
    bg = Image.new(img.mode, img.size, img.getpixel((2, 2)))
    diff = ImageChops.difference(img, bg).convert("L").point(lambda p: 255 if p > tol else 0)
    box = diff.getbbox()
    return img.crop(box) if box else img

def card(img, pad=40, radius=48, fill=(255, 255, 255, 255)):
    w, h = img.width + 2 * pad, img.height + 2 * pad
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius, fill=255)
    base = Image.new("RGBA", (w, h), fill)
    base.paste(img, (pad, pad), img)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(base, (0, 0), mask)
    return out

def cut(src, name, box, autotrim=True, pad=40, radius=48):
    im = Image.open(os.path.join(CAPS, src)).convert("RGBA").crop(box)
    if autotrim:
        im = trim(im)
    im = card(im, pad, radius)
    im.save(os.path.join(OUT, name + ".png"))
    print(name, im.size)

# (capture, card name, (left, top, right, bottom), autotrim, pad, radius) — EDIT ME
CUTS = [
    ("01-item.png", "stats", (15, 1000, 1305, 1440), True, 48, 48),
    ("02-items.png", "lowstock", (670, 720, 1310, 1045), True, 48, 48),
    ("03-transactions.png", "deducted", (60, 516, 1260, 694), False, 32, 40),
]
for src, name, box, auto, pad, radius in CUTS:
    cut(src, name, box, auto, pad, radius)
