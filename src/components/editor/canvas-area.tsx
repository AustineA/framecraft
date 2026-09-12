"use client";

import { useRef } from "react";

import { Hand, Minus, MousePointer2, Plus } from "lucide-react";

import {
  useEditor,
  useEditorDispatch,
  useSelectedScreen,
} from "@/lib/editor-store";

import {
  EXPORT_BASE_WIDTH,
  artboardHeightFor,
  exportDevice,
} from "@/lib/editor-data";

import { ArtboardCard } from "./artboard";

/** The authored artboard render corresponds to the design's 72% zoom. */
const BASE_ZOOM = 72;

export function CanvasArea() {
  const { zoom, canvasMode, canvasDeviceId, media, locale, selectedLayerId, tool } = useEditor();
  const dispatch = useEditorDispatch();
  const screen = useSelectedScreen();
  const scale = zoom / BASE_ZOOM;
  const stageRef = useRef<HTMLDivElement>(null);
  const pan = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  // The canvas matches what the exporter produces, so it stays WYSIWYG.
  const artboardHeight = artboardHeightFor(exportDevice(canvasDeviceId));

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[var(--canvas)]">
      <div className="flex h-[46px] shrink-0 items-center justify-between border-b border-b-[var(--hairline)] bg-[var(--chrome-bar)] px-[14px] backdrop-blur-[22px]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Select"
            aria-pressed={canvasMode === "select"}
            onClick={() => dispatch({ type: "setCanvasMode", mode: "select" })}
            className={`flex size-[32px] items-center justify-center rounded-[7px] border ${
              canvasMode === "select"
                ? "border-[var(--line)] bg-white text-[var(--ink)]"
                : "border-[#F8F8FA] bg-[#F8F8FA] text-[var(--muted)]"
            }`}
          >
            <MousePointer2 className="size-[15px]" />
          </button>
          <button
            type="button"
            aria-label="Pan"
            aria-pressed={canvasMode === "hand"}
            onClick={() => dispatch({ type: "setCanvasMode", mode: "hand" })}
            className={`flex size-[32px] items-center justify-center rounded-[7px] border ${
              canvasMode === "hand"
                ? "border-[var(--line)] bg-white text-[var(--ink)]"
                : "border-[#F8F8FA] bg-[#F8F8FA] text-[var(--muted)]"
            }`}
          >
            <Hand className="size-[15px]" />
          </button>
        </div>

        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => dispatch({ type: "stepZoom", direction: -1 })}
            className="flex size-[30px] items-center justify-center rounded-[7px] border border-[var(--line)] bg-white text-[var(--muted)] transition-colors hover:bg-[#F5F5F7]"
          >
            <Minus className="size-[14px]" />
          </button>
          <button
            type="button"
            aria-label="Reset zoom"
            onClick={() => dispatch({ type: "setZoom", zoom: BASE_ZOOM })}
            className="flex h-[30px] w-[48px] items-center justify-center rounded-[7px] border border-[var(--line)] bg-white text-[10px] font-semibold text-[var(--ink)] transition-colors hover:bg-[#F5F5F7]"
          >
            {zoom}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => dispatch({ type: "stepZoom", direction: 1 })}
            className="flex size-[30px] items-center justify-center rounded-[7px] border border-[var(--line)] bg-white text-[var(--muted)] transition-colors hover:bg-[#F5F5F7]"
          >
            <Plus className="size-[14px]" />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        onPointerDown={(event) => {
          const stage = stageRef.current;
          if (canvasMode !== "hand" || !stage) return;
          event.preventDefault();
          stage.setPointerCapture(event.pointerId);
          pan.current = {
            x: event.clientX,
            y: event.clientY,
            left: stage.scrollLeft,
            top: stage.scrollTop,
          };
        }}
        onPointerMove={(event) => {
          const stage = stageRef.current;
          const start = pan.current;
          if (!stage || !start) return;
          stage.scrollLeft = start.left - (event.clientX - start.x);
          stage.scrollTop = start.top - (event.clientY - start.y);
        }}
        onPointerUp={(event) => {
          pan.current = null;
          stageRef.current?.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          pan.current = null;
        }}
        className={`flex flex-1 items-center justify-center overflow-auto bg-[radial-gradient(ellipse_at_50%_46%,#F2F2F4_0%,#E2E2E5_100%)] p-[28px] ${
          canvasMode === "hand"
            ? "cursor-grab touch-none select-none active:cursor-grabbing"
            : ""
        }`}
      >
        {/* The scaled box reserves real layout space so the stage scrolls. */}
        <div
          className="shrink-0"
          style={{
            width: EXPORT_BASE_WIDTH * scale,
            height: artboardHeight * scale,
          }}
        >
          <div
            className="origin-top-left"
            style={{ transform: `scale(${scale})` }}
          >
            <ArtboardCard
              screen={screen}
              media={media}
              locale={locale}
              height={artboardHeight}
              editable={canvasMode === "select" && tool !== "layers"}
              selectedLayerId={selectedLayerId}
              layersInteractive={canvasMode === "select" && tool === "layers"}
              onSelectLayer={(id) => dispatch({ type: "selectLayer", id })}
              onEdit={(patch) =>
                dispatch({ type: "updateScreen", id: screen.id, patch })
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
