"use client";

import { Check } from "lucide-react";

import { BRAND_COLORS } from "@/lib/editor-data";
import { useEditorDispatch, useSelectedScreen } from "@/lib/editor-store";

import { PanelDivider, PanelSectionTitle, PanelShell } from "./panel-shell";

export function BrandPanel() {
  const screen = useSelectedScreen();
  const dispatch = useEditorDispatch();

  return (
    <PanelShell>
      <div className="flex h-[112px] shrink-0 flex-col items-center justify-center gap-2 rounded-[12px] border border-[#00000014] bg-white">
        <span className="flex size-[38px] items-center justify-center rounded-[11px] bg-[linear-gradient(210deg,#0A84FF_0%,#5856D6_100%)]">
          <Check className="size-[19px] text-white" />
        </span>
        <span className="text-[14px] font-bold text-[var(--ink)]">Habitly</span>
      </div>

      <div className="flex shrink-0 flex-col gap-[10px]">
        <PanelSectionTitle>COLORS</PanelSectionTitle>
        <div className="flex gap-2">
          {BRAND_COLORS.map(({ name, hex, swatchClass }) => (
            <button
              key={name}
              type="button"
              onClick={() =>
                dispatch({
                  type: "updateScreen",
                  id: screen.id,
                  patch: { bg: hex },
                })
              }
              className="flex flex-1 flex-col gap-[5px]"
            >
              <span
                className={`h-[42px] rounded-[9px] ${swatchClass} ${
                  screen.bg.toLowerCase() === hex.toLowerCase()
                    ? "ring-2 ring-[var(--ink)] ring-offset-2"
                    : ""
                }`}
              />
              <span className="text-[8px] text-[var(--muted)]">{name}</span>
            </button>
          ))}
        </div>
      </div>

      <PanelDivider />
      <PanelSectionTitle>TYPOGRAPHY</PanelSectionTitle>

      <div className="flex h-[100px] shrink-0 flex-col gap-[6px] rounded-[10px] border border-[#00000014] bg-white p-3">
        <p className="text-[30px] font-bold tracking-[-1px] text-[var(--ink)]">
          Aa
        </p>
        <p className="text-[11px] font-[650] text-[var(--ink)]">Inter</p>
        <p className="text-[8px] text-[var(--muted)]">
          Regular · Medium · Semibold · Bold
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          dispatch({
            type: "applyBrand",
            family: "Inter",
            chip: screen.brandChip,
          })
        }
        className="flex h-[38px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--purple)] text-[10px] font-[650] text-white transition-opacity hover:opacity-90"
      >
        Apply brand to all screens
      </button>
    </PanelShell>
  );
}
