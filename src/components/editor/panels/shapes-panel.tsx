"use client";

import {
  ArrowRight,
  BadgeCheck,
  Layers,
  MessageSquare,
  Minus,
  Star,
  Sun,
  Triangle,
  type LucideIcon,
} from "lucide-react";

import { useEditorDispatch, useSelectedScreen } from "@/lib/editor-store";

import { PanelDivider, PanelSectionTitle, PanelShell } from "./panel-shell";

const BASIC_SHAPES: { id: string; label: string; icon?: LucideIcon }[] = [
  { id: "rectangle", label: "Rectangle" },
  { id: "circle", label: "Circle" },
  { id: "triangle", label: "Triangle", icon: Triangle },
  { id: "line", label: "Line", icon: Minus },
  { id: "arrow", label: "Arrow", icon: ArrowRight },
  { id: "star", label: "Star", icon: Star },
];

const DECORATIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "badge", label: "App Store badge", icon: BadgeCheck },
  { id: "callout", label: "Feature callout", icon: MessageSquare },
  { id: "glow", label: "Spotlight glow", icon: Sun },
  { id: "shadow", label: "Device shadow", icon: Layers },
];

export function ShapesPanel() {
  const screen = useSelectedScreen();
  const dispatch = useEditorDispatch();

  const toggleShape = (id: string) =>
    dispatch({
      type: "updateScreen",
      id: screen.id,
      patch: { accentShape: screen.accentShape === id ? null : id },
    });

  const toggleDecoration = (id: string) =>
    dispatch({
      type: "updateScreen",
      id: screen.id,
      patch: {
        decorations: screen.decorations.includes(id)
          ? screen.decorations.filter((item) => item !== id)
          : [...screen.decorations, id],
      },
    });

  return (
    <PanelShell>
      <PanelSectionTitle>BASIC</PanelSectionTitle>

      <div className="grid shrink-0 grid-cols-3 gap-2">
        {BASIC_SHAPES.map(({ id, label, icon: Icon }) => {
          const isActive = screen.accentShape === id;
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={isActive}
              onClick={() => toggleShape(id)}
              className={`flex h-[86px] items-center justify-center rounded-[10px] border transition-colors ${
                isActive
                  ? "border-[var(--purple)] bg-[#007AFF10]"
                  : "border-[#00000014] bg-white hover:bg-[#F7F7F9]"
              }`}
            >
              {Icon ? (
                <Icon className="size-[28px] text-[#6E6E73]" />
              ) : id === "circle" ? (
                <span className="size-[28px] rounded-full bg-[#6E6E73]" />
              ) : (
                <span className="h-[24px] w-[30px] rounded-[4px] bg-[#6E6E73]" />
              )}
            </button>
          );
        })}
      </div>

      <PanelDivider />
      <PanelSectionTitle>DECORATIONS</PanelSectionTitle>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {DECORATIONS.map(({ id, label, icon: Icon }) => {
          const isActive = screen.decorations.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => toggleDecoration(id)}
              className={`flex h-[42px] shrink-0 items-center gap-[9px] rounded-[9px] border px-[11px] transition-colors ${
                isActive
                  ? "border-[var(--purple)] bg-[#007AFF10]"
                  : "border-[#00000014] bg-white hover:bg-[#F7F7F9]"
              }`}
            >
              <Icon
                className={`size-[15px] ${isActive ? "text-[var(--purple)]" : "text-[var(--muted)]"}`}
              />
              <span className="text-[10px] font-[550] text-[var(--ink)]">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </PanelShell>
  );
}
