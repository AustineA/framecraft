"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { FONT_GROUPS, fontStack } from "@/lib/editor-data";

/** The Local Font Access API is Chromium-only and not yet in lib.dom. */
type LocalFont = { family: string };
declare global {
  interface Window {
    queryLocalFonts?: () => Promise<LocalFont[]>;
  }
}

const WIDTH = 236;

type LoadState = "idle" | "loading" | "ready" | "unsupported" | "denied";

export function FontPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [installed, setInstalled] = useState<string[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /**
   * The inspector scrolls, and `overflow-y: auto` clips on both axes — so the
   * list is portalled to the body and positioned from the trigger's rect.
   */
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    // Keep the list pinned to its trigger while the panel scrolls.
    const reposition = () =>
      setAnchor(buttonRef.current?.getBoundingClientRect() ?? null);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  /**
   * Reading installed fonts needs a permission prompt, which the browser only
   * allows from a user gesture — so it runs on open, not on mount.
   */
  const loadInstalled = async () => {
    if (state === "ready" || state === "loading") return;
    if (typeof window.queryLocalFonts !== "function") {
      setState("unsupported");
      return;
    }
    setState("loading");
    try {
      const fonts = await window.queryLocalFonts();
      const families = [...new Set(fonts.map((font) => font.family))].sort(
        (a, b) => a.localeCompare(b),
      );
      setInstalled(families);
      setState("ready");
    } catch {
      // The prompt was dismissed or blocked; curated fonts still work.
      setState("denied");
    }
  };

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const match = (name: string) => name.toLowerCase().includes(needle);
    const curated = FONT_GROUPS.map((group) => ({
      label: group.label,
      fonts: group.fonts.map((font) => font.name).filter(match),
    }));
    const local = installed.filter(match);
    return [
      ...curated,
      ...(local.length ? [{ label: "Installed", fonts: local }] : []),
    ].filter((group) => group.fonts.length > 0);
  }, [query, installed]);

  const hint =
    state === "loading"
      ? "Reading installed fonts…"
      : state === "unsupported"
        ? "This browser cannot list installed fonts."
        : state === "denied"
          ? "Font access was declined."
          : null;

  return (
    <div ref={containerRef} className="relative h-full flex-1">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Font family"
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          setAnchor(buttonRef.current?.getBoundingClientRect() ?? null);
          setOpen(true);
          void loadInstalled();
        }}
        className="flex h-full w-full items-center justify-between rounded-[7px] bg-[#F7F7F9] px-[9px] text-left"
      >
        <span
          className="min-w-0 truncate text-[10px] text-[var(--ink)]"
          style={{ fontFamily: fontStack(value) }}
        >
          {value}
        </span>
        <ChevronDown className="size-[12px] shrink-0 text-[var(--muted)]" />
      </button>

      {open && anchor
        ? createPortal(
            <div
              // Positioned from the trigger because the panel clips overflow.
              style={{
                position: "fixed",
                width: WIDTH,
                left: Math.max(
                  8,
                  Math.min(anchor.right - WIDTH, window.innerWidth - WIDTH - 8),
                ),
                ...(anchor.top > window.innerHeight / 2
                  ? { bottom: window.innerHeight - anchor.top + 6 }
                  : { top: anchor.bottom + 6 }),
              }}
              className="z-[60] overflow-hidden rounded-[10px] border border-[#00000014] bg-white shadow-[0_12px_32px_#00000026]"
            >
              <div className="flex items-center gap-[6px] border-b border-b-[#00000012] px-[10px] py-[8px]">
                <Search className="size-[12px] shrink-0 text-[var(--muted)]" />
                <input
                  autoFocus
                  value={query}
                  placeholder="Search fonts"
                  aria-label="Search fonts"
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent text-[11px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
                />
              </div>

              <div className="max-h-[280px] overflow-y-auto py-1">
                {groups.map((group) => (
                  <div key={group.label}>
                    <p className="px-[10px] pt-[6px] pb-[3px] text-[9px] font-bold tracking-[0.6px] text-[var(--muted)]">
                      {group.label.toUpperCase()}
                    </p>
                    {group.fonts.map((font) => (
                      <button
                        key={`${group.label}-${font}`}
                        type="button"
                        role="option"
                        aria-selected={font === value}
                        onClick={() => {
                          onChange(font);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={`flex w-full items-center px-[10px] py-[6px] text-left transition-colors hover:bg-[#F5F5F7] ${
                          font === value ? "bg-[#007AFF10]" : ""
                        }`}
                      >
                        <span
                          className="min-w-0 truncate text-[12px] text-[var(--ink)]"
                          style={{ fontFamily: fontStack(font) }}
                        >
                          {font}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}

                {groups.length === 0 ? (
                  <p className="px-[10px] py-[10px] text-[11px] text-[var(--muted)]">
                    No fonts match “{query}”.
                  </p>
                ) : null}
              </div>

              {hint ? (
                <p className="border-t border-t-[#00000012] px-[10px] py-[7px] text-[9px] text-[var(--muted)]">
                  {hint}
                </p>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
