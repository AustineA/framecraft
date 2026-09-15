import type { Layer } from "./editor-types";

export function createLayer(kind: Layer["kind"], patch: Partial<Layer> = {}): Layer {
  return {
    id: crypto.randomUUID(), name: kind === "text" ? "Text callout" : kind === "image" ? "Image" : "Shape",
    kind, x: 76, y: 330, width: 240, height: kind === "text" ? 70 : 240,
    rotation: 0, opacity: 100, visible: true, locked: false, plane: "front",
    text: "Your next big thing", translations: {}, fontSize: 24, color: "#1D1D1F", fill: kind === "image" ? "transparent" : "#FFFFFF",
    radius: 18, shadow: true, mediaId: null, fit: "contain", ...patch,
  };
}
