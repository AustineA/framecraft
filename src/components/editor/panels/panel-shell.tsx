"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import { useEditor, useEditorDispatch } from "@/lib/editor-store";

/** The 244px left column, shared by every tool panel. */
export function PanelShell({
  gapClass = "gap-[14px]",
  children,
}: {
  gapClass?: string;
  children: ReactNode;
}) {
  const { screens } = useEditor();
  const dispatch = useEditorDispatch();

  return (
    <aside
      className={`flex w-[244px] shrink-0 flex-col ${gapClass} overflow-hidden border-r border-r-[var(--hairline)] bg-[var(--chrome-panel)] px-3 py-[18px] backdrop-blur-xl`}
    >
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex flex-col gap-[3px]">
          <h2 className="text-[18px] font-bold tracking-[-0.3px] text-[var(--ink)]">
            Screens
          </h2>
          <p className="text-[11px] text-[var(--muted)]">
            {screens.length} screenshots
          </p>
        </div>
        <button
          type="button"
          aria-label="Add screen"
          onClick={() => dispatch({ type: "addScreen" })}
          className="flex size-[30px] items-center justify-center rounded-[7px] bg-[#E9E9ED] text-[var(--ink)] transition-colors hover:bg-[#DEDEE3]"
        >
          <Plus className="size-[16px]" />
        </button>
      </div>
      {children}
    </aside>
  );
}

export function PanelSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="shrink-0 text-[9px] font-bold tracking-[0.8px] text-[var(--muted)]">
      {children}
    </p>
  );
}

export function PanelDivider() {
  return <hr className="h-px shrink-0 border-0 bg-[#00000012]" />;
}
