"use client";

import { useEffect } from "react";

import { useEditor, useProjects } from "@/lib/editor-store";

import { CanvasArea } from "./canvas-area";
import { ExportSheet } from "./export-sheet";
import { InspectorPanel } from "./inspector-panel";
import { LeftPanel } from "./panels/left-panel";
import { PreviewOverlay } from "./preview-overlay";
import { StartScreen } from "./start-screen";
import { ToolRail } from "./tool-rail";
import { TopBar } from "./top-bar";

export function ScreenshotEditor() {
  const { previewOpen, exportOpen, hydrated } = useEditor();
  const { view } = useProjects();

  // A file dropped anywhere but a real drop target makes the browser open it,
  // navigating away from the editor. Swallow those misses instead.
  useEffect(() => {
    const swallow = (event: DragEvent) => event.preventDefault();
    window.addEventListener("dragover", swallow);
    window.addEventListener("drop", swallow);
    return () => {
      window.removeEventListener("dragover", swallow);
      window.removeEventListener("drop", swallow);
    };
  }, []);

  // Nothing is known until the project store has been read.
  if (!hydrated) return <div className="h-full w-full bg-[var(--soft)]" />;
  if (view === "start") return <StartScreen />;

  return (
    <div className="flex h-full w-full flex-col bg-[var(--soft)]">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <ToolRail />
        <LeftPanel />
        <CanvasArea />
        <InspectorPanel />
      </div>
      {previewOpen ? <PreviewOverlay /> : null}
      {exportOpen ? <ExportSheet /> : null}
    </div>
  );
}
