"use client";

import {
  CircleQuestionMark,
  Image as ImageIcon,
  LayoutTemplate,
  Palette,
  Shapes,
  Type,
  type LucideIcon,
} from "lucide-react";

import { useEditor, useEditorDispatch } from "@/lib/editor-store";
import type { ToolId } from "@/lib/editor-types";

const TOOLS: { id: ToolId; label: string; icon: LucideIcon }[] = [
  { id: "screens", label: "Screens", icon: LayoutTemplate },
  { id: "text", label: "Text", icon: Type },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "shapes", label: "Shapes", icon: Shapes },
  { id: "brand", label: "Brand", icon: Palette },
];

export function ToolRail() {
  const { tool } = useEditor();
  const dispatch = useEditorDispatch();

  return (
    <nav
      aria-label="Tools"
      className="flex w-[68px] shrink-0 flex-col items-center gap-[9px] border-r border-r-[var(--hairline)] bg-[var(--chrome-bar)] px-2 py-[14px] backdrop-blur-xl"
    >
      {TOOLS.map(({ id, label, icon: Icon }) => {
        const isActive = id === tool;
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? "true" : undefined}
            onClick={() => dispatch({ type: "setTool", tool: id })}
            className={`flex h-[54px] w-[56px] flex-col items-center justify-center gap-[5px] rounded-[11px] transition-colors ${
              isActive
                ? "bg-[var(--purple)] text-white"
                : "text-[var(--muted)] hover:bg-black/5"
            }`}
          >
            <Icon className="size-[18px]" />
            <span
              className={`text-[9px] ${isActive ? "font-semibold" : "font-medium"}`}
            >
              {label}
            </span>
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        type="button"
        aria-label="Help"
        className="flex size-[42px] items-center justify-center rounded-[10px] text-[var(--muted)] transition-colors hover:bg-black/5"
      >
        <CircleQuestionMark className="size-[19px]" />
      </button>
    </nav>
  );
}
