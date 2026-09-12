"use client";

import { useRef, useState, type PointerEvent } from "react";
import { fontStack } from "@/lib/editor-data";
import type { Layer, MediaAsset } from "@/lib/editor-types";

export function ArtboardLayer({ layer, media, zIndex, selected, interactive, onSelect, onChange }: {
  layer: Layer; media: MediaAsset[]; zIndex: number; selected: boolean; interactive: boolean;
  onSelect?: (id: string) => void; onChange?: (layer: Layer) => void;
}) {
  const drag = useRef<{ x: number; y: number; scale: number; resize: boolean } | null>(null);
  const [resizing, setResizing] = useState(false);
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  if (!layer.visible) return null;
  const image = media.find((asset) => asset.id === layer.mediaId);
  const start = (event: PointerEvent<HTMLDivElement>, resize = false) => {
    if (!interactive) return;
    event.stopPropagation();
    onSelect?.(layer.id);
    if (layer.locked) return;
    event.preventDefault();
    const board = event.currentTarget.closest('[data-artboard]') as HTMLElement;
    setResizing(resize);
    drag.current = { x: event.clientX, y: event.clientY, scale: board.getBoundingClientRect().width / board.offsetWidth, resize };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const offset = (event: PointerEvent) => {
    const initial = drag.current;
    if (!initial) return { x: 0, y: 0 };
    const x = (event.clientX - initial.x) / initial.scale;
    const y = (event.clientY - initial.y) / initial.scale;
    if (!initial.resize) return { x, y };
    const angle = layer.rotation * Math.PI / 180;
    return { x: x * Math.cos(angle) + y * Math.sin(angle), y: -x * Math.sin(angle) + y * Math.cos(angle) };
  };
  return <div
    data-layer-id={layer.id}
    role={interactive ? "button" : undefined}
    aria-label={interactive ? `Select ${layer.name}` : undefined}
    tabIndex={interactive ? 0 : undefined}
    onKeyDown={(event) => {
      if (!interactive) return;
      if (event.key === "Enter") onSelect?.(layer.id);
      if (layer.locked) return;
      const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const direction = directions[event.key];
      if (direction) { event.preventDefault(); onChange?.({ ...layer, x: layer.x + direction[0] * (event.shiftKey ? 10 : 1), y: layer.y + direction[1] * (event.shiftKey ? 10 : 1) }); }
    }}
    onPointerDown={(event) => start(event)}
    onPointerMove={(event) => { if (drag.current) setDelta(offset(event)); }}
    onPointerUp={(event) => {
      if (!drag.current) return;
      const change = offset(event);
      const resize = drag.current.resize;
      drag.current = null;
      setDelta({ x: 0, y: 0 });
      if (change.x || change.y) onChange?.({ ...layer, ...(resize ? { width: Math.max(8, layer.width + change.x), height: Math.max(8, layer.height + change.y) } : { x: layer.x + change.x, y: layer.y + change.y }) });
    }}
    onPointerCancel={() => { drag.current = null; setDelta({ x: 0, y: 0 }); }}
    style={{
      position: "absolute", left: layer.x + (resizing ? 0 : delta.x), top: layer.y + (resizing ? 0 : delta.y),
      width: Math.max(8, layer.width + (resizing ? delta.x : 0)), height: Math.max(8, layer.height + (resizing ? delta.y : 0)),
      transform: `rotate(${layer.rotation}deg)`, transformOrigin: "top left", zIndex,
      opacity: layer.opacity / 100, background: layer.fill, borderRadius: layer.radius,
      filter: layer.shadow ? "drop-shadow(0 8px 12px #00000030)" : undefined,
      outline: selected && interactive ? "2px solid #007AFF" : undefined,
      cursor: interactive ? layer.locked ? "default" : "move" : undefined,
      pointerEvents: interactive ? "auto" : "none", touchAction: "none", userSelect: "none",
    }}>
    <div style={{ width: "100%", height: "100%", borderRadius: "inherit", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {layer.kind === "image" && image && (
        // Local embedded asset; preserve transparency without image optimization.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.dataUrl} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: layer.fit, transform: `scale(${layer.imageScale ?? 1})` }} />)}
      {layer.kind === "text" && <span style={{ padding: layer.padding ?? 10, color: layer.color, fontSize: layer.fontSize, fontFamily: layer.fontFamily ? fontStack(layer.fontFamily) : undefined, fontWeight: layer.fontWeight ?? 700, lineHeight: layer.lineHeight ?? 1.1, letterSpacing: layer.letterSpacing, textAlign: "center", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{layer.text}</span>}
    </div>
    {selected && interactive && !layer.locked && <div aria-label="Resize layer" onPointerDown={(event) => start(event, true)} style={{ position: "absolute", right: -5, bottom: -5, width: 10, height: 10, border: "2px solid #007AFF", background: "white", cursor: "nwse-resize" }} />}
  </div>;
}
