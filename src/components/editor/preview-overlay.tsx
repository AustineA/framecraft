"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { isDark } from "@/lib/color";
import { exportDevice, localeName } from "@/lib/editor-data";
import { resolveText } from "@/lib/localize";
import {
  useEditor,
  useEditorDispatch,
} from "@/lib/editor-store";

import { AppScreen, appScreenBackground } from "./app-screens";
import { DeviceFrame, frameMetrics } from "./device-frame";

/** Marks the gap a dragged slide would drop into. */
function DropLine({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden
      className="absolute inset-y-2 z-10 w-[3px] rounded-full bg-[var(--purple)]"
      style={side === "left" ? { left: -11 } : { right: -11 }}
    />
  );
}

export function PreviewOverlay() {
  const { screens, selectedScreenId, canvasDeviceId, media, locale } =
    useEditor();
  const dispatch = useEditorDispatch();
  const cardRefs = useRef(new Map<string, HTMLLIElement>());
  /** Id being dragged, and the gap it would drop into. */
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);

  const endDrag = () => {
    setDragId(null);
    setDropAt(null);
  };

  /**
   * Which gap the pointer is nearest, given the card it is over.
   *
   * Cards are wide, so the midpoint decides whether the slide lands before
   * or after the one under the cursor.
   */
  const gapFor = (index: number, event: { clientX: number }, node: Element) => {
    const rect = node.getBoundingClientRect();
    return event.clientX < rect.left + rect.width / 2 ? index : index + 1;
  };

  const drop = () => {
    if (!dragId || dropAt === null) return endDrag();
    const from = screens.findIndex((s) => s.id === dragId);
    // The gap index counts the dragged card, so close it up when moving right.
    const toIndex = dropAt > from ? dropAt - 1 : dropAt;
    dispatch({ type: "moveScreen", id: dragId, toIndex });
    endDrag();
  };

  const device = exportDevice(canvasDeviceId);
  const deviceName = device.name;
  /** Preview cards mirror the artboard's aspect at a 262 px width. */
  const cardHeight = Math.round((262 * device.height) / device.width);

  const close = () => dispatch({ type: "setPreviewOpen", open: false });

  // Arrow keys walk the set; Escape leaves preview.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch({ type: "setPreviewOpen", open: false });
        return;
      }
      const step =
        event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const index = screens.findIndex((s) => s.id === selectedScreenId);
      const next = screens[Math.min(screens.length - 1, Math.max(0, index + step))];
      if (next) dispatch({ type: "selectScreen", id: next.id });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screens, selectedScreenId, dispatch]);

  useEffect(() => {
    cardRefs.current.get(selectedScreenId)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedScreenId]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="App Store preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000052] px-[72px] py-16"
      onClick={close}
    >
      <div
        className="flex h-full max-h-[896px] w-full max-w-[1296px] flex-col overflow-hidden rounded-[18px] bg-[var(--soft)] shadow-[0_25px_70px_#00000055]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-b-[var(--hairline)] bg-[var(--chrome-topbar)] px-5">
          <div className="flex flex-col gap-[2px]">
            <p className="text-[15px] font-[650] text-[var(--ink)]">
              App Store preview
            </p>
            <p className="text-[10px] text-[var(--muted)]">
              {deviceName} · {localeName(locale)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close preview"
            onClick={close}
            className="flex size-[30px] items-center justify-center rounded-full bg-[#E7E7EA] text-[var(--ink)] transition-colors hover:bg-[#DCDCE0]"
          >
            <X className="size-[14px]" />
          </button>
        </div>

        <ul
          className="flex flex-1 items-center gap-5 overflow-x-auto bg-[#E9E9EC] px-[34px] py-[42px]"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            drop();
          }}
        >
          {screens.map((screen, index) => {
            const dark = isDark(screen.bg);
            const isSelected = screen.id === selectedScreenId;
            const dragging = dragId === screen.id;
            return (
              <li
                key={screen.id}
                ref={(node) => {
                  if (node) cardRefs.current.set(screen.id, node);
                  else cardRefs.current.delete(screen.id);
                }}
                onDragOver={(event) => {
                  if (!dragId) return;
                  event.preventDefault();
                  setDropAt(gapFor(index, event, event.currentTarget));
                }}
                className={`relative shrink-0 transition-opacity ${
                  dragging ? "opacity-40" : "opacity-100"
                }`}
              >
                {/*
                  One marker per gap: the line sits before this card, and
                  only the last card also owns the gap after it.
                */}
                {dragId && dropAt === index ? <DropLine side="left" /> : null}
                {dragId &&
                index === screens.length - 1 &&
                dropAt === screens.length ? (
                  <DropLine side="right" />
                ) : null}

                <button
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    setDragId(screen.id);
                    setDropAt(index);
                    event.dataTransfer.effectAllowed = "move";
                    // Firefox needs data set or the drag never starts.
                    event.dataTransfer.setData("text/plain", screen.id);
                  }}
                  onDragEnd={endDrag}
                  onClick={() =>
                    dispatch({ type: "selectScreen", id: screen.id })
                  }
                  aria-current={isSelected ? "true" : undefined}
                  className={`flex w-[262px] cursor-grab flex-col items-center gap-[10px] overflow-hidden rounded-[4px] px-[15px] pt-9 shadow-[0_8px_20px_#00000022] transition-[outline] active:cursor-grabbing ${
                    isSelected
                      ? "outline-2 outline-offset-2 outline-[var(--purple)]"
                      : "outline-0"
                  }`}
                  style={{ backgroundColor: screen.bg, height: cardHeight }}
                >
                  <span
                    className={`w-full shrink-0 text-center text-[20px] leading-none font-bold tracking-[-0.5px] whitespace-pre-line ${
                      dark ? "text-white" : "text-[var(--ink)]"
                    }`}
                  >
                    {resolveText(screen, locale).headline}
                  </span>

                  <DeviceFrame
                    metrics={frameMetrics(screen.deviceFrame, 262, cardHeight)}
                    color={screen.deviceColor}
                    screenBackground={appScreenBackground(
                      screen.app,
                      frameMetrics(screen.deviceFrame, 262, cardHeight).kind,
                    )}
                    chrome={screen.deviceChrome}
                    fillScreen={Boolean(
                      media.find((asset) => asset.id === screen.mediaId),
                    )}
                    className="drop-shadow-[0_10px_20px_#00000033]"
                  >
                    <AppScreen
                      kind={screen.app}
                      deviceKind={
                        frameMetrics(screen.deviceFrame, 262, cardHeight).kind
                      }
                      screenWidth={
                        frameMetrics(screen.deviceFrame, 262, cardHeight)
                          .screenWidth
                      }
                      imageUrl={
                        media.find((asset) => asset.id === screen.mediaId)
                          ?.dataUrl
                      }
                    />
                  </DeviceFrame>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex h-[62px] shrink-0 items-center justify-between border-t border-t-[var(--hairline)] bg-[var(--chrome-topbar)] px-5">
          <p className="text-[11px] text-[var(--muted)]">
            Use ← → to review the full set
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={close}
              className="flex h-[34px] items-center rounded-[8px] border border-[#0000001A] bg-white px-[14px] text-[11px] font-semibold text-[var(--ink)] transition-colors hover:bg-[#F5F5F7]"
            >
              Back to edit
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "setPreviewOpen", open: false });
                dispatch({ type: "setExportOpen", open: true });
              }}
              className="flex h-[34px] items-center rounded-[8px] bg-[var(--purple)] px-[14px] text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Export set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
