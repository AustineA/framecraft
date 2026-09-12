"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Lock, Unlock, Trash2 } from "lucide-react";
import { useEditor, useEditorDispatch, useSelectedScreen } from "@/lib/editor-store";
import type { Layer } from "@/lib/editor-types";
import { createLayer } from "@/lib/layers";
import { readScaledImage } from "@/lib/image";
import { EXPORT_BASE_WIDTH } from "@/lib/editor-data";
import { PanelShell } from "./panel-shell";

const control = "min-w-0 w-full rounded-md border border-black/10 bg-white px-2 py-1.5 text-[11px] disabled:opacity-40";

export function LayersPanel() {
  const { selectedLayerId, screens, media } = useEditor();
  const dispatch = useEditorDispatch();
  const screen = useSelectedScreen();
  const layers = screen.layers ?? [];
  const selected = layers.find((layer) => layer.id === selectedLayerId);
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const save = (next: Layer[]) => dispatch({ type: "updateScreen", id: screen.id, patch: { layers: next } });
  const select = (id: string) => dispatch({ type: "selectLayer", id });
  const add = (layer: Layer) => { save([...layers, layer]); select(layer.id); };
  const patch = (value: Partial<Layer>) => save(layers.map((layer) => layer.id === selected?.id ? { ...layer, ...value } : layer));
  const move = (direction: number) => {
    if (!selected) return;
    const next = [...layers];
    const index = next.findIndex((layer) => layer.id === selected.id);
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    save(next);
  };
  const upload = async (files: File[]) => {
    try {
      setError("");
      const assets = await Promise.all(files.map(async (file) => ({ id: crypto.randomUUID(), name: file.name, dataUrl: await readScaledImage(file) })));
      if (!assets.length) return;
      const added = assets.map((asset) => createLayer("image", { mediaId: asset.id, name: asset.name }));
      dispatch({ type: "addLayers", id: screen.id, layers: added, assets });
    } catch { setError("Could not read that image. Try a PNG, JPG or SVG."); }
  };
  const nextScreen = screens[screens.findIndex((item) => item.id === screen.id) + 1];

  return <PanelShell gapClass="gap-3">
    <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Layers</h3><span className="text-[10px] text-[var(--muted)]">{layers.length} objects</span></div>
    <div className="grid grid-cols-3 gap-1">
      <button className={control} onClick={() => add(createLayer("text"))}>+ Text</button>
      <button className={control} onClick={() => input.current?.click()}>+ Image</button>
      <button className={control} onClick={() => add(createLayer("shape"))}>+ Shape</button>
    </div>
    <input ref={input} type="file" accept="image/*" multiple hidden onChange={(event) => { void upload(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <p className="text-[10px] leading-relaxed text-[var(--muted)]">Stack cutouts, stickers and callouts. Drag objects on the canvas. Top rows appear in front within each group.</p>
      {(["front", "back"] as const).map((plane) => <div key={plane}>
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--muted)]">{plane === "front" ? "Above phone & headline" : "Behind phone & headline"}</p>
        {[...layers].reverse().filter((layer) => layer.plane === plane).map((layer) => <div key={layer.id} className={`mb-1 flex items-center gap-1 rounded-lg border p-1 ${selected?.id === layer.id ? "border-blue-500 bg-blue-50" : "border-black/10 bg-white"}`}>
          <button className="min-w-0 flex-1 truncate p-1 text-left text-[11px]" onClick={() => select(layer.id)}>{layer.name}</button>
          <button aria-label={`${layer.visible ? "Hide" : "Show"} ${layer.name}`} className="p-1" onClick={() => save(layers.map((item) => item.id === layer.id ? { ...item, visible: !item.visible } : item))}>{layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button>
          <button aria-label={`${layer.locked ? "Unlock" : "Lock"} ${layer.name}`} className="p-1" onClick={() => save(layers.map((item) => item.id === layer.id ? { ...item, locked: !item.locked } : item))}>{layer.locked ? <Lock size={12} /> : <Unlock size={12} />}</button>
        </div>)}
      </div>)}
      {selected && <div className="space-y-3 border-t border-black/10 pt-3">
        <label className="block text-[10px]">Name<input aria-label="Layer name" className={control} value={selected.name} onChange={(event) => patch({ name: event.target.value })} /></label>
        <div className="flex gap-1">
          <button className={control} aria-label="Bring forward" onClick={() => move(1)}><ArrowUp size={14} /></button>
          <button className={control} aria-label="Send backward" onClick={() => move(-1)}><ArrowDown size={14} /></button>
          <button className={control} aria-label="Duplicate layer" onClick={() => add({ ...selected, id: crypto.randomUUID(), name: `${selected.name} copy`, x: selected.x + 16, y: selected.y + 16 })}><Copy size={14} /></button>
          <button className={control} aria-label="Delete layer" onClick={() => save(layers.filter((layer) => layer.id !== selected.id))}><Trash2 size={14} /></button>
        </div>
        <select aria-label="Layer placement" className={control} value={selected.plane} onChange={(event) => patch({ plane: event.target.value as Layer["plane"] })}><option value="front">Above phone & headline</option><option value="back">Behind phone & headline</option></select>
        <fieldset disabled={selected.locked} className="space-y-3 disabled:opacity-50">
          <div className="grid grid-cols-2 gap-2">
            {([['x', 'X'], ['y', 'Y'], ['width', 'Width'], ['height', 'Height'], ['rotation', 'Rotation °'], ['opacity', 'Opacity %'], ['radius', 'Corner radius']] as const).map(([key, label]) => <label key={key} className="text-[10px]">{label}<input className={control} type="number" aria-label={`Layer ${label}`} value={selected[key]} min={key === "width" || key === "height" ? 1 : key === "opacity" || key === "radius" ? 0 : undefined} max={key === "opacity" ? 100 : undefined} onChange={(event) => {
              const value = Number(event.target.value);
              if (!Number.isFinite(value)) return;
              patch({ [key]: key === "opacity" ? Math.max(0, Math.min(100, value)) : key === "width" || key === "height" ? Math.max(1, value) : key === "radius" ? Math.max(0, value) : value });
            }} /></label>)}
          </div>
          {selected.kind === "text" && <>
            <select aria-label="Layer font family" className={control} value={selected.fontFamily ?? ""} onChange={(event) => patch({ fontFamily: event.target.value || undefined })}>
              <option value="">Use screen font</option><option value="Arial">Arial</option><option value="Inter">Inter</option><option value="Georgia">Georgia</option>
            </select>
            <select aria-label="Layer font weight" className={control} value={selected.fontWeight ?? 700} onChange={(event) => patch({ fontWeight: Number(event.target.value) })}>
              <option value={400}>Regular</option><option value={600}>Semibold</option><option value={700}>Bold</option><option value={800}>Extra bold</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px]">Line height<input className={control} type="number" step="0.05" min="0.5" value={selected.lineHeight ?? 1.1} onChange={(event) => patch({ lineHeight: Math.max(.5, Number(event.target.value)) })} /></label>
              <label className="text-[10px]">Letter spacing<input className={control} type="number" step="0.1" value={selected.letterSpacing ?? 0} onChange={(event) => patch({ letterSpacing: Number(event.target.value) })} /></label>
            </div>
            <textarea aria-label="Layer text" className={control} rows={3} value={selected.text} onChange={(event) => patch({ text: event.target.value })} />
            <label className="block text-[10px]">Font size<input aria-label="Layer font size" type="number" min={1} className={control} value={selected.fontSize} onChange={(event) => patch({ fontSize: Math.max(1, Number(event.target.value)) })} /></label>
            <label className="flex items-center justify-between text-[10px]">Text color<input aria-label="Layer text color" type="color" value={selected.color} onChange={(event) => patch({ color: event.target.value })} /></label>
          </>}
          {selected.kind === "image" && <>
            <select className={control} aria-label="Layer image" value={selected.mediaId ?? ""} onChange={(event) => patch({ mediaId: event.target.value })}>{media.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select>
            <label className="text-[10px]">Image zoom<input aria-label="Image zoom" className={control} type="number" min="1" max="5" step="0.05" value={selected.imageScale ?? 1} onChange={(event) => patch({ imageScale: Math.min(5, Math.max(1, Number(event.target.value))) })} /></label>
            <select className={control} aria-label="Image fit" value={selected.fit} onChange={(event) => patch({ fit: event.target.value as Layer["fit"] })}><option value="contain">Fit whole image</option><option value="cover">Crop to fill</option></select>
          </>}
          <label className="flex items-center justify-between text-[10px]">Fill<input aria-label="Layer fill" type="color" value={selected.fill === "transparent" ? "#FFFFFF" : selected.fill} onChange={(event) => patch({ fill: event.target.value })} /></label>
          <label className="flex gap-2 text-[10px]"><input type="checkbox" checked={selected.fill === "transparent"} onChange={(event) => patch({ fill: event.target.checked ? "transparent" : "#FFFFFF" })} />Transparent background</label>
          <label className="flex gap-2 text-[10px]"><input type="checkbox" checked={selected.shadow} onChange={(event) => patch({ shadow: event.target.checked })} />Drop shadow</label>
        </fieldset>
        <button className={control} disabled={!nextScreen} onClick={() => {
          if (!nextScreen) return;
          dispatch({ type: "updateScreen", id: nextScreen.id, patch: { layers: [...(nextScreen.layers ?? []), { ...selected, id: crypto.randomUUID(), x: selected.x - EXPORT_BASE_WIDTH }] } });
        }}>Continue onto next screen</button>
        <p className="text-[9px] leading-relaxed text-[var(--muted)]">Creates an independent copy one screen-width to the left on the next slide. Use a wide image that crosses the right edge.</p>
      </div>}
    </div>
  </PanelShell>;
}
