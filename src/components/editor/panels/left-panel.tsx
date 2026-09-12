"use client";

import { useEditor } from "@/lib/editor-store";

import { LayersPanel } from "./layers-panel";
import { BrandPanel } from "./brand-panel";
import { MediaPanel } from "./media-panel";
import { ScreensPanel } from "./screens-panel";
import { ShapesPanel } from "./shapes-panel";
import { TextPanel } from "./text-panel";

const PANELS = {
  screens: ScreensPanel,
  layers: LayersPanel,
  text: TextPanel,
  media: MediaPanel,
  shapes: ShapesPanel,
  brand: BrandPanel,
} as const;

export function LeftPanel() {
  const { tool } = useEditor();
  const Panel = PANELS[tool];
  return <Panel />;
}
