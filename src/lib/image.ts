/** Long edge of a stored screenshot. Keeps data URLs inside storage quota. */
const MAX_EDGE = 1000;
const QUALITY = 0.82;

/**
 * Reads an image file into a downscaled data URL.
 *
 * Data URLs (rather than object URLs) so an uploaded screenshot survives a
 * reload and can be rasterised by the exporter; downscaled because a handful
 * of full-resolution captures would blow past local storage.
 */
export async function readScaledImage(file: File): Promise<string> {
  const source = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not read that image");
  context.drawImage(source, 0, 0, width, height);
  source.close();

  // PNG keeps transparency; everything else compresses far better as JPEG.
  return file.type === "image/png"
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", QUALITY);
}
