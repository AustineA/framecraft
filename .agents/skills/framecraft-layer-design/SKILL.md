---
name: framecraft-layer-design
description: Create or revise high-production App Store screenshot sets with Framecraft layers, including spanning artwork, pulled-out UI cards, generated cutouts, custom typography, locale-aware layer copy, and exact-size exports. Use for layered screenshot composition and template work; do not use for ordinary editor UI development that does not produce screenshot artwork.
---

# Framecraft Layer Design

Produce a polished, editable Framecraft project, exact-size App Store PNG exports, and the source assets or generator code needed to reproduce them.

## Ground the work in this repository

- Read [`docs/LAYERS.md`](../../../docs/LAYERS.md) before authoring layers.
- Treat [`src/lib/editor-types.ts`](../../../src/lib/editor-types.ts) as the schema source of truth.
- Use [`src/lib/itemlist-template.ts`](../../../src/lib/itemlist-template.ts), [`scripts/package-itemlist.mjs`](../../../scripts/package-itemlist.mjs), and [`scripts/assemble-itemlist.mjs`](../../../scripts/assemble-itemlist.mjs) as the canonical in-repo example of a layered template, portable project, and presentation board.
- Use the scripts in this skill's `scripts/` directory as starting points for external app screenshot sets. Copy and customize them in the target app; do not edit the skill copies for a one-off project.
- Never hand-edit a generated `framecraft.json` containing embedded data URLs. Change its source builder and regenerate it.

## Workflow

1. Establish the app category, brand palette, exact marketing copy, target devices, and available app captures. Preserve user-provided wording and line breaks.
2. Run `framecraft status`. In this repository, run `npm run build:cli` when CLI source changed. Compare `.next-framecraft/BUILD_ID` with `src/components/editor/artboard.tsx`; delete only the stale render cache when the source is newer.
3. Capture real app screens at native resolution when an app is available. Record element bounds for any UI fragments that will be pulled outside the device.
4. Build supporting assets intentionally: crop real UI cards with `scripts/crop_cards.py`; create transparent cutouts with `scripts/gen_assets.py` or the available image-generation tool; keep simple UI and geometric details as SVG or Framecraft shapes.
5. Author the composition in code. Keep app captures pixel-sharp, use layers for depth, and limit each screen to a clear hierarchy of roughly three focal elements.
6. Generate the portable project, export with Framecraft, assemble a contact sheet or board, inspect it visually, and correct clipping, overlap, wrapping, and contrast.
7. Verify every exported file's dimensions. Run the repository's relevant lint, type, and build checks when repository code changed.

For exact canvas geometry, z-order, headline pills, card placement, and visual review, read [references/layout-and-rendering.md](references/layout-and-rendering.md).

For locale-aware text layers and multilingual exports, read [references/localization.md](references/localization.md).

## Delivery contract

Report the editable project path, export directory, review-board path, target dimensions, generated-asset provenance, and the command that regenerates the set. Keep rendered output unstaged unless the user asks to version it. Stage only the source, skill, and project assets requested by the user.
