"use client";

import { Check, X } from "lucide-react";
import { useRef, useState } from "react";

import { EXPORT_DEVICES } from "@/lib/editor-data";
import { useEditor, useEditorDispatch } from "@/lib/editor-store";
import {
  deliver,
  exportHeightFor,
  fileNameFor,
  renderNode,
  waitForFonts,
} from "@/lib/export-image";

import { ArtboardCard } from "./artboard";

/**
 * Rough PNG weight per rendered pixel, calibrated against real exports of
 * these artboards (~0.72 MB for 1320x2868). Flat gradients compress well.
 */
const BYTES_PER_PIXEL = 0.19;

export function ExportSheet() {
  const { screens, media, exportDeviceIds, exportFormat, exportNaming } =
    useEditor();
  const dispatch = useEditorDispatch();
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Render targets are heavy, so they only mount for the duration of a run.
  const [rendering, setRendering] = useState(false);

  const devices = EXPORT_DEVICES.filter((device) =>
    exportDeviceIds.includes(device.id),
  );
  const total = screens.length * devices.length;
  const megabytes =
    (devices.reduce(
      (sum, device) => sum + device.width * device.height * BYTES_PER_PIXEL,
      0,
    ) *
      screens.length) /
    1_000_000;

  const close = () => dispatch({ type: "setExportOpen", open: false });

  const runExport = async () => {
    if (!total) return;
    setError(null);
    setRendering(true);
    setProgress(0);
    try {
      // Let the off-screen artboards mount before we rasterise them.
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await waitForFonts();
      const files: { name: string; blob: Blob }[] = [];
      let done = 0;
      for (const screen of screens) {
        for (const device of devices) {
          const node = nodeRefs.current.get(`${screen.id}:${device.id}`);
          if (!node) throw new Error(`Missing artboard for ${screen.name}`);
          files.push({
            name: fileNameFor(screen, device, exportFormat, exportNaming),
            blob: await renderNode(node, device, exportFormat),
          });
          done += 1;
          setProgress(done);
        }
      }
      await deliver(files);
      setProgress(null);
      setRendering(false);
      close();
    } catch (cause) {
      setProgress(null);
      setRendering(false);
      setError(cause instanceof Error ? cause.message : "Export failed");
    }
  };

  const isExporting = progress !== null;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Export screenshots"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000045] p-6"
        onClick={close}
      >
        <div
          className="flex h-full max-h-[700px] w-full max-w-[560px] flex-col overflow-hidden rounded-[18px] bg-[#F9F9FA] shadow-[0_24px_64px_#00000055]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-b-[var(--hairline)] px-5">
            <div className="flex flex-col gap-[3px]">
              <p className="text-[17px] font-bold tracking-[-0.2px] text-[var(--ink)]">
                Export screenshots
              </p>
              <p className="text-[11px] text-[var(--muted)]">
                Prepare your set for App Store Connect
              </p>
            </div>
            <button
              type="button"
              aria-label="Close export"
              onClick={close}
              className="flex size-[28px] items-center justify-center rounded-full bg-[#E7E7EA] text-[var(--ink)] transition-colors hover:bg-[#DCDCE0]"
            >
              <X className="size-[13px]" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto p-5">
            <p className="text-[12px] font-[650] text-[var(--ink)]">Devices</p>
            <div className="flex flex-col gap-2">
              {EXPORT_DEVICES.map((device) => {
                const checked = exportDeviceIds.includes(device.id);
                return (
                  <button
                    key={device.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() =>
                      dispatch({ type: "toggleExportDevice", id: device.id })
                    }
                    className="flex h-[50px] items-center justify-between rounded-[10px] border border-[var(--hairline)] bg-white px-3 text-left transition-colors hover:bg-[#F7F7F9]"
                  >
                    <span className="flex flex-col gap-[2px]">
                      <span className="text-[11px] font-semibold text-[var(--ink)]">
                        {device.name}
                      </span>
                      <span className="text-[9px] text-[var(--muted)]">
                        {device.width} × {device.height}
                      </span>
                    </span>
                    <span
                      className={`flex size-[18px] items-center justify-center rounded-[5px] border ${
                        checked
                          ? "border-[var(--purple)] bg-[var(--purple)]"
                          : "border-[#C7C7CC] bg-white"
                      }`}
                    >
                      {checked ? (
                        <Check className="size-[11px] text-white" />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[12px] font-[650] text-[var(--ink)]">Format</p>
            <div className="flex h-[34px] gap-[2px] rounded-[8px] bg-[#E8E8EB] p-[2px]">
              {(["png", "jpeg"] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  aria-pressed={exportFormat === format}
                  onClick={() => dispatch({ type: "setExportFormat", format })}
                  className={`flex h-full flex-1 items-center justify-center rounded-[6px] text-[10px] font-semibold uppercase ${
                    exportFormat === format
                      ? "bg-white text-[var(--ink)] shadow-[0_1px_2px_#00000018]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>

            <div className="flex h-[46px] items-center justify-between rounded-[10px] border border-[var(--hairline)] bg-white px-3">
              <span className="text-[10px] font-medium text-[var(--ink)]">
                Include locale and device in filenames
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={exportNaming}
                aria-label="Include locale and device in filenames"
                onClick={() => dispatch({ type: "toggleExportNaming" })}
                className={`flex h-[18px] w-[32px] items-center rounded-full p-[3px] transition-colors ${
                  exportNaming
                    ? "justify-end bg-[#34C759]"
                    : "justify-start bg-[#C7C7CC]"
                }`}
              >
                <span className="size-[12px] rounded-full bg-white" />
              </button>
            </div>

            <div className="flex h-[54px] items-center justify-between rounded-[10px] bg-[#007AFF0C] px-3">
              <span className="text-[10px] text-[#005BBB]">
                {total} screenshots · {megabytes.toFixed(1)} MB
              </span>
              <span className="text-[10px] font-[650] text-[var(--purple)]">
                {isExporting ? `${progress} of ${total}` : "Ready"}
              </span>
            </div>

            {error ? (
              <p role="alert" className="text-[10px] text-[#C0392B]">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex h-[66px] shrink-0 items-center justify-end gap-2 border-t border-t-[var(--hairline)] px-5">
            <button
              type="button"
              onClick={close}
              className="flex h-[36px] items-center rounded-[8px] border border-[#0000001A] bg-white px-[15px] text-[11px] font-semibold text-[var(--ink)] transition-colors hover:bg-[#F5F5F7]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!total || isExporting}
              onClick={runExport}
              className="flex h-[36px] items-center rounded-[8px] bg-[var(--purple)] px-[15px] text-[11px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isExporting
                ? `Exporting ${progress} of ${total}…`
                : `Export ${total} screenshot${total === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>

      {/* Off-screen render targets, one per screen x device, at export aspect. */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-[-10000px] z-[-1]"
      >
        {rendering &&
          screens.map((screen) =>
          devices.map((device) => (
            <div
              key={`${screen.id}:${device.id}`}
              ref={(node) => {
                const key = `${screen.id}:${device.id}`;
                if (node) nodeRefs.current.set(key, node);
                else nodeRefs.current.delete(key);
              }}
            >
              <ArtboardCard
                screen={screen}
                media={media}
                height={exportHeightFor(device)}
              />
            </div>
            )),
          )}
      </div>
    </>
  );
}
