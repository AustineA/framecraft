# Itemlist reference recreation

Four editable screenshot layouts based on the reference provided in the conversation. Open the Itemlist template from Framecraft's start screen, or import `itemlist.framecraft.json`. `/reference/itemlist` presents the 2048×1152 overview and provides PNG/project downloads.

Headlines, bubbles, ratings, phone frames/screenshots, photo, floating search result, and the illustration are separate layers. The same illustration is positioned across three artboards and clipped at their edges. Solid backgrounds and per-layer typography are stored in project JSON.

The reference uses 460×998 panels, 20px gutters, an olive surround, and a teal interior. The four App Store exports use the 1320×2868 device preset. The overview also reconstructs the partial fifth panel visible at the right edge of the supplied image; it is not an invented fifth full screenshot.

Asset provenance:
- Layout/copy: user-supplied Itemlist screenshot reference.
- Illustration: reference-conditioned image generation, with Pixelcut background removal via fal.ai.
- Camera: fal.ai FLUX.2 Klein 9B, seed 1692000219. Generated image: https://v3b.fal.media/files/b/0aaa2c9d/LwqzFCkDekLLRwEDk9W2E_chKn93AH.png
- Phone interfaces, rating star, and floating result: locally authored SVG recreations.
- Itemlist identification was confirmed at https://www.getitemlist.app/press/ . Current press screenshots differ from the provided design and were not included.

This is a layout recreation; generated illustration/photo and vector interface details are approximations, not original source artwork. Layer text is currently shared between locales.

Repackage after editing template data/assets:

```
npm run build:cli
node scripts/package-itemlist.mjs
```
