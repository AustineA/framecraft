# Layout and rendering reference

Read this when composing or reviewing a layered screenshot set.

## Renderer geometry

| Item | Value |
|---|---|
| Authored width | 392 px |
| iPhone 6.9-inch authored height | 852 px |
| iPhone 6.9-inch export | 1320 × 2868 px |
| Export scale | 1320 / 392 = 3.3673469 |
| Layer ordering | back layers, device, built-in headline, front layers |

The renderer uses authored pixels. Layer arrays retain their order within each `plane`. Text layers center text and preserve newlines. Set `padding: 0` when a text box must align to measured bounds. Image-layer radius clips content; it does not add an inset.

## Composition patterns

- Put one clear marketing promise at the top and let the device or central artwork carry the main evidence.
- Use a pulled-out UI card only when it explains a benefit faster than the full screen does.
- Place cards from roughly y=250 downward when a device header or Dynamic Island must remain legible.
- Let cards bleed slightly beyond an artboard edge when the composition benefits, but keep meaningful text inside the crop.
- Use generated objects as semantic cues. A scanner belongs near a barcode; a watering can belongs near a care task.
- Spanning artwork must use identical global placement on every artboard, offset by the panel's global x position, so clipping creates one continuous subject.
- Avoid redundant decoration. Three focal elements per screen is a useful ceiling.

## Headline pills

A reliable headline treatment uses one plain text layer and one filled, slightly rotated text layer. With Inter ExtraBold around 46 px, measure the text rather than guessing:

1. Measure the string with the actual font file.
2. Add letter spacing for every gap between characters.
3. Add horizontal padding on both sides.
4. Center the resulting layer on the 392 px canvas.
5. Reduce the shared font size if either line exceeds its safe width.

The supplied `scripts/build_template.py` includes measurement, auto-fit, text-layer, pill, chip, image, card, object, circle, and screen helpers.

## Capture and crop

Capture app screens at the export device's native pixel dimensions. Use accessibility bounds rather than estimating crop positions from screenshot pixels. For pulled-out content, crop generously, trim against the surrounding background only when the card is isolated, then bake padding and rounded corners into the PNG. Use fixed crop boxes for rows inside larger white cards.

## Export and review

Run a normal export after generating the project:

```sh
framecraft export framecraft.json --out export --flat --simple-names
```

Then `framecraft preview --dir export` serves the exported PNGs at `http://localhost:4820/` with a locale switcher and headline hover titles — the fastest way to give a person a review link. It shows what is on disk, so export again after every change. For your own inspection create a montage or presentation board and read it at full size. Check headline wrapping, clipped card text, device-header obstruction, transparent-asset edges, cross-panel alignment, and contrast. Two visual passes are normal. Use `magick identify` to verify exact dimensions before delivery.
