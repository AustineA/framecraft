"use client";

import { ArrowUpToLine, Check, X } from "lucide-react";
import { useRef, useState } from "react";

import {
  useEditor,
  useEditorDispatch,
  useSelectedScreen,
} from "@/lib/editor-store";
import { readScaledImage } from "@/lib/image";

import { PanelShell } from "./panel-shell";

export function MediaPanel() {
  const { mediaTab, media, screens } = useEditor();
  const dispatch = useEditorDispatch();
  const screen = useSelectedScreen();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  // Drag events also fire for the zone's own children, so nesting is counted
  // rather than clearing the highlight on the first dragleave.
  const depth = useRef(0);

  const endDrag = () => {
    depth.current = 0;
    setDragging(false);
  };

  const addFiles = async (incoming: File[]) => {
    // A drop can carry folders, text or anything else; keep the images.
    const files = incoming.filter((file) => file.type.startsWith("image/"));
    if (!files.length) {
      if (incoming.length) setError("Drop an image file.");
      return;
    }

    setError(null);
    try {
      const assets = await Promise.all(
        files.map(async (file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          dataUrl: await readScaledImage(file),
        })),
      );
      dispatch({ type: "addMedia", assets });
      // Put the first upload straight into the selected device.
      dispatch({
        type: "updateScreen",
        id: screen.id,
        patch: { mediaId: assets[0].id },
      });
    } catch {
      setError("That file could not be read as an image.");
    }
  };

  return (
    <PanelShell>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          depth.current += 1;
          setDragging(true);
        }}
        // Without preventDefault the browser refuses the drop and opens the
        // file instead, navigating away from the editor.
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={() => {
          depth.current -= 1;
          if (depth.current <= 0) endDrag();
        }}
        onDrop={(event) => {
          event.preventDefault();
          endDrag();
          void addFiles(Array.from(event.dataTransfer.files));
        }}
        className={`flex h-[116px] shrink-0 flex-col items-center justify-center gap-2 rounded-[12px] border transition-colors ${
          dragging
            ? "border-[var(--purple)] bg-[#007AFF1F]"
            : "border-[#007AFF66] bg-[#007AFF08] hover:bg-[#007AFF12]"
        }`}
      >
        <ArrowUpToLine className="size-[20px] text-[#007AFF]" />
        <span className="text-[11px] font-[650] text-[var(--ink)]">
          {dragging ? "Release to add" : "Drop files or browse"}
        </span>
        <span className="text-[9px] text-[var(--muted)]">
          PNG, JPG, SVG up to 20 MB
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          void addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {error ? (
        <p role="alert" className="shrink-0 text-[10px] text-[#D0342C]">
          {error}
        </p>
      ) : null}

      <div className="flex h-[32px] shrink-0 gap-[2px] rounded-[8px] bg-[#E9E9ED] p-[2px]">
        {(
          [
            ["uploads", "Uploads"],
            ["app-screens", "App screens"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mediaTab === id}
            onClick={() => dispatch({ type: "setMediaTab", tab: id })}
            className={`flex h-full flex-1 items-center justify-center rounded-[6px] text-[9px] ${
              mediaTab === id
                ? "bg-white font-semibold text-[var(--ink)]"
                : "font-medium text-[var(--muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mediaTab === "uploads" ? (
        media.length === 0 ? (
          <p className="shrink-0 text-[10px] leading-[1.5] text-[var(--muted)]">
            Upload your own app screenshots — they render inside the device
            frame on the selected screen.
          </p>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto">
            {media.map((asset) => {
              const inUse = screen.mediaId === asset.id;
              return (
                <div key={asset.id} className="group relative">
                  <button
                    type="button"
                    aria-pressed={inUse}
                    title={asset.name}
                    onClick={() =>
                      dispatch({
                        type: "updateScreen",
                        id: screen.id,
                        patch: { mediaId: inUse ? null : asset.id },
                      })
                    }
                    className={`block h-[112px] w-full overflow-hidden rounded-[9px] border-2 bg-[#ECECF0] ${
                      inUse ? "border-[var(--purple)]" : "border-transparent"
                    }`}
                  >
                    {/* Local data URL, so next/image optimisation does not apply. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      className="size-full object-cover"
                    />
                  </button>

                  {inUse ? (
                    <span className="pointer-events-none absolute top-[6px] left-[6px] flex size-[18px] items-center justify-center rounded-full bg-[var(--purple)]">
                      <Check className="size-[11px] text-white" />
                    </span>
                  ) : null}

                  <button
                    type="button"
                    aria-label={`Remove ${asset.name}`}
                    onClick={() =>
                      dispatch({ type: "removeMedia", id: asset.id })
                    }
                    className="absolute top-[6px] right-[6px] flex size-[18px] items-center justify-center rounded-full bg-white/90 text-[var(--muted)] opacity-0 shadow-[0_1px_3px_#00000024] transition group-hover:opacity-100 hover:text-[#D0342C] focus-visible:opacity-100"
                  >
                    <X className="size-[10px]" />
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto">
          {screens.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => dispatch({ type: "selectScreen", id: item.id })}
              className={`flex h-[112px] items-center justify-center rounded-[9px] border-2 ${
                item.id === screen.id
                  ? "border-[var(--purple)]"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: item.bg }}
            >
              <span className="h-[86px] w-[48px] rounded-t-[9px] bg-[#1D1D1F]" />
            </button>
          ))}
        </div>
      )}
    </PanelShell>
  );
}
