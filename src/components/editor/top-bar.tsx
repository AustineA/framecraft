"use client";

import {
  ChevronRight,
  Download,
  Play,
  Redo2,
  Sparkles,
  Undo2,
} from "lucide-react";

import { useEditor, useEditorDispatch, useProjects } from "@/lib/editor-store";

import { ProjectMenu } from "./project-menu";

const WINDOW_DOTS = [
  { label: "Close", className: "bg-[#FF5F57]" },
  { label: "Minimize", className: "bg-[#FEBC2E]" },
  { label: "Expand", className: "bg-[#28C840]" },
];

export function TopBar() {
  const { past, future } = useEditor();
  const dispatch = useEditorDispatch();
  const { goToStart } = useProjects();
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return (
    // `backdrop-blur` creates a stacking context, so the bar needs its own
    // z-index or menus inside it paint beneath the canvas.
    <header className="relative z-30 flex h-[56px] shrink-0 items-center justify-between border-b border-b-[#00000018] bg-[var(--chrome-topbar)] px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {WINDOW_DOTS.map((dot) => (
            <span
              key={dot.label}
              aria-label={dot.label}
              className={`size-[12px] rounded-full border border-[#00000015] ${dot.className}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goToStart}
          title="Save and return to projects"
          aria-label="Save and return to projects"
          className="flex items-center gap-3 rounded-[7px] transition-opacity hover:opacity-80"
        >
          <span className="flex size-[28px] items-center justify-center rounded-[7px] bg-linear-to-b from-[#39A8FF] to-[var(--purple)]">
            <Sparkles className="size-[14px] text-white" />
          </span>
          <span className="text-[15px] font-[650] text-[var(--ink)]">
            Screens
          </span>
        </button>

        <span className="h-[18px] w-px bg-[#0000001C]" />

        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[12px]"
        >
          <span className="text-[#8E8E93]">Framecraft</span>
          <ChevronRight className="size-[14px] text-[#B5B5BE]" />
          <ProjectMenu />
        </nav>
      </div>

      <div className="flex h-[30px] items-center gap-1 rounded-[8px] bg-[#E9E9EC] p-[2px]">
        <button
          type="button"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={() => dispatch({ type: "undo" })}
          className={`flex h-[26px] w-[28px] items-center justify-center rounded-[6px] ${
            canUndo ? "bg-white text-[var(--muted)]" : "text-[#C7C7CE]"
          }`}
        >
          <Undo2 className="size-[15px]" />
        </button>
        <button
          type="button"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={() => dispatch({ type: "redo" })}
          className={`flex h-[26px] w-[28px] items-center justify-center rounded-[6px] ${
            canRedo ? "bg-white text-[var(--muted)]" : "text-[#C7C7CE]"
          }`}
        >
          <Redo2 className="size-[15px]" />
        </button>
      </div>

      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          onClick={() => dispatch({ type: "setPreviewOpen", open: true })}
          className="flex h-[32px] items-center gap-[7px] rounded-[7px] border border-[#0000001A] bg-[#FFFFFFB8] px-3 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:bg-white"
        >
          <Play className="size-[14px]" />
          Preview
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: "setExportOpen", open: true })}
          className="flex h-[32px] items-center gap-[7px] rounded-[7px] bg-[var(--purple)] px-[14px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Download className="size-[14px]" />
          Export
        </button>

        <span className="flex size-[30px] items-center justify-center rounded-full bg-linear-to-b from-[#F6D7C3] to-[#D7A987] text-[11px] font-bold text-[#7A431A]">
          AM
        </span>
      </div>
    </header>
  );
}
