"use client";

import { Heading1, Heading2, Pilcrow, type LucideIcon } from "lucide-react";

import { TEXT_STYLES } from "@/lib/editor-data";
import { useEditor, useEditorDispatch } from "@/lib/editor-store";

import { PanelDivider, PanelSectionTitle, PanelShell } from "./panel-shell";

const ADD_ACTIONS: { styleId: string; label: string; icon: LucideIcon }[] = [
  { styleId: "headline", label: "Add heading", icon: Heading1 },
  { styleId: "subheadline", label: "Add subheading", icon: Heading2 },
  { styleId: "body", label: "Add body text", icon: Pilcrow },
];

/** Preview type sizes for the saved-style rows, as drawn in the design. */
const STYLE_PREVIEW: Record<string, string> = {
  display: "text-[24px] font-bold tracking-[-0.5px]",
  headline: "text-[19px] font-bold",
  subheadline: "text-[15px] font-semibold",
  body: "text-[13px]",
  caption: "text-[11px] font-medium",
};

export function TextPanel() {
  const { activeTextStyleId } = useEditor();
  const dispatch = useEditorDispatch();

  return (
    <PanelShell gapClass="gap-4">
      <div className="flex shrink-0 flex-col gap-2">
        {ADD_ACTIONS.map(({ styleId, label, icon: Icon }) => (
          <button
            key={styleId}
            type="button"
            onClick={() => dispatch({ type: "applyTextStyle", styleId })}
            className="flex h-[42px] items-center gap-[9px] rounded-[9px] border border-[#00000018] bg-white px-[11px] transition-colors hover:bg-[#F5F5F7]"
          >
            <Icon className="size-[15px] text-[var(--ink)]" />
            <span className="text-[11px] font-semibold text-[var(--ink)]">
              {label}
            </span>
          </button>
        ))}
      </div>

      <PanelDivider />
      <PanelSectionTitle>TEXT STYLES</PanelSectionTitle>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {TEXT_STYLES.map((style) => {
          const isActive = style.id === activeTextStyleId;
          return (
            <button
              key={style.id}
              type="button"
              aria-pressed={isActive}
              onClick={() =>
                dispatch({ type: "applyTextStyle", styleId: style.id })
              }
              className={`flex h-[58px] shrink-0 items-center rounded-[9px] border px-[11px] text-left transition-colors ${
                isActive
                  ? "border-[var(--purple)] bg-[#007AFF10]"
                  : "border-[#00000014] bg-white hover:bg-[#F7F7F9]"
              }`}
            >
              <span className="flex flex-col gap-[3px]">
                <span
                  className={`text-[var(--ink)] ${STYLE_PREVIEW[style.id]}`}
                >
                  {style.name}
                </span>
                <span className="text-[8px] text-[var(--muted)]">
                  {style.meta}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </PanelShell>
  );
}
