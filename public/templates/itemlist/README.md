# PlantPal layered plant-care template

Four editable plant-care screenshot layouts using the supplied reference's composition. Open the PlantPal template from Framecraft's start screen, or import `itemlist.framecraft.json`. `/reference/itemlist` presents `plantpal-reference-2048x1152.png` and provides PNG/project downloads.

Headlines, bubbles, ratings, phone frames/screenshots, photo, floating search result, and the illustration are separate layers. The same illustration is positioned across three artboards and clipped at their edges. Solid backgrounds and per-layer typography are stored in project JSON.

The layout keeps the reference's 460×998 panels, 20px gutters, olive surround, teal interior, layer overlap, typography scale, and partial fifth panel. The four App Store exports use the 1320×2868 device preset.

Asset provenance:
- Layout mechanics: user-supplied screenshot reference.
- Plant-parent illustration: generated from the prior silhouette with OpenAI image generation, then cut out with Pixelcut background removal on fal.ai.
- Monstera photo: generated with OpenAI image generation.
- Plant collection, care schedule, plant details, rating star, and floating task: locally authored SVG artwork.

This is a layout recreation with an original plant-care concept and original generated assets. Layer text supports per-locale overrides.

Repackage after editing template data/assets:

```
npm run build:cli
node scripts/package-itemlist.mjs
```
