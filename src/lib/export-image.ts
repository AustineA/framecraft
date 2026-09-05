import { toBlob } from "html-to-image";
import JSZip from "jszip";

import { EXPORT_BASE_WIDTH, artboardHeightFor } from "./editor-data";
import type { ExportDevice, ExportFormat, Screen } from "./editor-types";

export { EXPORT_BASE_WIDTH, artboardHeightFor as exportHeightFor };

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function fileNameFor(
  screen: Screen,
  device: ExportDevice,
  format: ExportFormat,
  includeDetail: boolean,
): string {
  const extension = format === "png" ? "png" : "jpg";
  return includeDetail
    ? `${screen.number}-${slug(screen.name)}-${slug(device.name)}-en-US.${extension}`
    : `${screen.number}-${slug(device.name)}.${extension}`;
}

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Rasterise one artboard node at the device's real pixel dimensions. */
export async function renderNode(
  node: HTMLElement,
  device: ExportDevice,
  format: ExportFormat,
): Promise<Blob> {
  const blob = await toBlob(node, {
    type: format === "png" ? "image/png" : "image/jpeg",
    quality: format === "png" ? undefined : 0.92,
    // The CSS artboard height is rounded, so scaling alone lands a pixel
    // short. App Store Connect rejects off-by-one sizes, so pin the canvas.
    width: EXPORT_BASE_WIDTH,
    height: artboardHeightFor(device),
    // canvasWidth/Height are multiplied by pixelRatio, so keep the ratio at 1
    // and let the canvas dimensions alone define the output size.
    canvasWidth: device.width,
    canvasHeight: device.height,
    pixelRatio: 1,
    backgroundColor: format === "jpeg" ? "#ffffff" : undefined,
    cacheBust: true,
  });
  if (!blob) throw new Error("The artboard could not be rasterised");
  return blob;
}

/**
 * Browsers block a burst of separate downloads, so a set is delivered as one
 * archive. A single file is handed over directly, which is friendlier.
 */
export async function deliver(
  files: { name: string; blob: Blob }[],
): Promise<void> {
  if (files.length === 0) return;

  if (files.length === 1) {
    download(files[0].blob, files[0].name);
    return;
  }

  const zip = new JSZip();
  for (const file of files) zip.file(file.name, file.blob);
  const archive = await zip.generateAsync({ type: "blob" });
  download(archive, "framecraft-screenshots.zip");
}

/** Fonts must be resolved or the raster falls back to a system face. */
export async function waitForFonts(): Promise<void> {
  try {
    await document.fonts.ready;
  } catch {
    // Font Loading API unavailable — proceed with whatever is painted.
  }
}
