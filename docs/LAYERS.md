# Composing with layers

Open **Layers** in the tool rail to add text, image cutouts, and shapes to the selected screenshot. Upload a transparent PNG or WebP with **+ Image** to place it outside the phone. The Media tool continues to insert screenshots inside the phone.

Select an object in the list or on the canvas. Drag to move it and drag its bottom-right handle to resize. Arrow keys nudge a focused object by one authored pixel; Shift + arrow nudges by ten. Numeric controls provide precise position, dimensions, rotation, opacity, and corner radius. Text has editable copy, size and color. Image layers can fit entirely or crop to fill their box. Set a shape's corner radius to half its size for a circle, or use a short height for a line.

Each screenshot has two layer groups: behind the phone and headline, and above them. Within a group, higher rows are in front; use the arrow buttons to change stacking. Hide, lock, duplicate, or delete individual objects. Locking prevents canvas transforms and property editing. Layer changes and image uploads support undo/redo and are saved with the project.

For an illustration spanning screenshots, make the image wide enough to extend beyond the right edge, then choose **Continue onto next screen**. This copies it to the following screenshot at X minus 392, preserving alignment across the export boundary. The copy is independent: finish sizing and positioning the original before continuing it, or update both copies afterward. Artboard clipping produces each individual App Store image.

## Project format

`Screen.layers` is optional; old projects render unchanged. Each entry is a `Layer` (see `src/lib/editor-types.ts`). Coordinates and font sizes use the renderer's authored pixels, with a 392-pixel-wide canvas. Rotation is clockwise in degrees about the top-left corner. Opacity is 0–100. Arrays are ordered back to front within each `plane` (`back` or `front`). Image `mediaId` values reference the project's embedded media library.

The editor, previews, browser exports, and CLI exports share the same layer renderer. Selection outlines and handles appear only in the editing canvas. CLI users can author `layers` in project JSON; dedicated layer CLI commands are not yet provided. Layer text currently uses the same copy for every locale.
