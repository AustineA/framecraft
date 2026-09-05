"use client";

import { Apple, ChevronDown, Trash2 } from "lucide-react";

import { isDark } from "@/lib/color";
import { EXPORT_DEVICES } from "@/lib/editor-data";
import { useEditor, useEditorDispatch } from "@/lib/editor-store";

import { PanelShell } from "./panel-shell";

export function ScreensPanel() {
  const { screens, selectedScreenId, canvasDeviceId } = useEditor();
  const dispatch = useEditorDispatch();

  return (
    <PanelShell>
      {/* Sets the App Store canvas every artboard is drawn and exported at. */}
      <div className="relative flex h-[34px] shrink-0 items-center rounded-[7px] bg-[#EBEBEF] px-[10px] transition-colors hover:bg-[#E3E3E8]">
        <Apple className="pointer-events-none size-[14px] shrink-0 text-[var(--ink)]" />
        <select
          aria-label="Screenshot size"
          value={canvasDeviceId}
          onChange={(event) =>
            dispatch({ type: "setCanvasDevice", id: event.target.value })
          }
          className="w-full cursor-pointer appearance-none bg-transparent pr-4 pl-[7px] text-[12px] font-semibold text-[var(--ink)] outline-none"
        >
          {EXPORT_DEVICES.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-[10px] size-[14px] text-[var(--muted)]" />
      </div>

      <ul className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto">
        {screens.map((screen) => {
          const isSelected = screen.id === selectedScreenId;
          return (
            <li key={screen.id} className="group relative">
              <button
                type="button"
                aria-current={isSelected ? "true" : undefined}
                onClick={() =>
                  dispatch({ type: "selectScreen", id: screen.id })
                }
                className={`flex h-[112px] w-full items-center gap-[10px] p-2 text-left transition-colors ${
                  isSelected
                    ? "rounded-[9px] border border-[var(--purple)] bg-[#007AFF12]"
                    : "rounded-[10px] border border-[#E8E8ED] bg-white hover:border-[#D8D8DE]"
                }`}
              >
                <span
                  className={`flex h-[94px] w-[64px] shrink-0 flex-col items-center gap-1 overflow-hidden px-[5px] pt-2 ${
                    isSelected ? "rounded-[5px]" : "rounded-[6px]"
                  }`}
                  // Thumbnail colour is user-editable screen data.
                  style={{ backgroundColor: screen.bg }}
                >
                  <span
                    className={`text-center text-[7px] leading-none font-bold ${
                      isDark(screen.bg) ? "text-white" : "text-[var(--ink)]"
                    }`}
                  >
                    {screen.miniTitle}
                  </span>
                  <span className="h-[60px] w-[34px] rounded-t-[6px] bg-[#151519]" />
                </span>

                <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
                  <span
                    className={`text-[9px] font-bold ${
                      isSelected ? "text-[var(--purple)]" : "text-[#A0A0AA]"
                    }`}
                  >
                    {screen.number}
                  </span>
                  <span className="truncate text-[11px] font-semibold text-[var(--ink)]">
                    {screen.name}
                  </span>
                </span>
              </button>

              {screens.length > 1 ? (
                <button
                  type="button"
                  aria-label={`Delete ${screen.name}`}
                  onClick={() =>
                    dispatch({ type: "deleteScreen", id: screen.id })
                  }
                  className="absolute top-[6px] right-[6px] flex size-[22px] items-center justify-center rounded-[6px] bg-white/90 text-[var(--muted)] opacity-0 shadow-[0_1px_3px_#00000024] transition group-hover:opacity-100 hover:bg-[#FFECEC] hover:text-[#D0342C] focus-visible:opacity-100"
                >
                  <Trash2 className="size-[12px]" />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </PanelShell>
  );
}
