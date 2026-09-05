"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Eye,
  EyeOff,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { isValidHex } from "@/lib/color";
import {
  BASE_LOCALE,
  BRIGHT_BACKGROUNDS,
  DEVICE_COLORS,
  EXPORT_DEVICES,
  LOCALES,
  PHONE_FRAMES,
  localeName,
} from "@/lib/editor-data";
import {
  useEditor,
  useEditorDispatch,
  useSelectedScreen,
} from "@/lib/editor-store";
import type { Align } from "@/lib/editor-types";
import { hasTranslation, resolveText, textPatch, translatedCount } from "@/lib/localize";

import { FontPicker } from "./font-picker";

/** Frames grouped by family so the list stays scannable. */
const FRAME_GROUPS = [
  {
    label: "iPhone",
    options: PHONE_FRAMES.filter((p) => p.kind === "iphone").map((p) => p.name),
  },
  {
    label: "iPad",
    options: PHONE_FRAMES.filter((p) => p.kind === "ipad").map((p) => p.name),
  },
];

const ALIGNMENTS: { id: Align; label: string; icon: LucideIcon }[] = [
  { id: "left", label: "Align left", icon: AlignLeft },
  { id: "center", label: "Align center", icon: AlignCenter },
  { id: "right", label: "Align right", icon: AlignRight },
];

/**
 * Text fields whose value must stay editable while it is briefly invalid.
 * Binding straight to state made "#EEEAFE" impossible to retype, because
 * every intermediate keystroke failed validation and snapped back.
 *
 * The draft only exists while the field is focused; the rest of the time the
 * prop is rendered directly, so there is nothing to keep in sync.
 */
function useDraft(value: string) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  return {
    shown: editing ? draft : value,
    draft,
    setDraft,
    begin: () => {
      setDraft(value);
      setEditing(true);
    },
    end: () => setEditing(false),
  };
}

function HexField({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (value: string) => void;
}) {
  const { shown, setDraft, begin, end } = useDraft(value);
  return (
    <input
      aria-label="Background hex"
      value={shown}
      spellCheck={false}
      onFocus={begin}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        if (isValidHex(next)) onCommit(next);
      }}
      onBlur={end}
      className="h-full flex-1 rounded-[8px] border border-[var(--line)] bg-white px-[10px] text-[10px] text-[var(--ink)] outline-none focus:border-[var(--purple)]"
    />
  );
}

function NumberField({
  label,
  min,
  max,
  value,
  onCommit,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onCommit: (value: number) => void;
}) {
  const { shown, draft, setDraft, begin, end } = useDraft(String(value));
  const commit = () => {
    end();
    const parsed = Number(draft);
    if (draft.trim() !== "" && Number.isFinite(parsed)) {
      onCommit(Math.min(max, Math.max(min, Math.round(parsed))));
    }
  };
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={shown}
      onFocus={begin}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      className="w-[30px] bg-transparent text-right text-[10px] text-[var(--ink)] outline-none"
    />
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[12px] font-[650] text-[var(--ink)]">{children}</h3>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold text-[var(--ink)]">
      {children}
    </span>
  );
}

function Divider() {
  return <hr className="h-px w-full shrink-0 border-0 bg-[var(--line)]" />;
}

/** A native select dressed as the design's value row. */
function SelectRow({
  value,
  options,
  groups,
  onChange,
  label,
  className = "h-[38px] rounded-[7px] border border-[var(--line)] bg-white text-[11px]",
}: {
  value: string;
  options?: readonly string[];
  /** Grouped options, e.g. iPhone and iPad frames. */
  groups?: { label: string; options: readonly string[] }[];
  onChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none bg-transparent px-[10px] text-[var(--ink)] outline-none"
      >
        {groups
          ? groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))
          : options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[10px] size-[13px] text-[var(--muted)]" />
    </div>
  );
}

/** A slider paired with its readout, as used by the Device rows. */
function SliderValue({
  label,
  min,
  max,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  format: (value: number) => string;
}) {
  return (
    <span className="flex items-center gap-1">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-[3px] w-[84px] accent-[var(--purple)]"
      />
      <span className="w-[36px] text-right text-[10px] font-semibold text-[var(--ink)]">
        {format(value)}
      </span>
    </span>
  );
}

function ValueRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-[34px] items-center justify-between rounded-[7px] bg-[#F7F7F9] px-[9px]">
      <span className="text-[10px] text-[var(--muted)]">{label}</span>
      {children}
    </div>
  );
}

export function InspectorPanel() {
  const { inspectorTab, canvasDeviceId, locale, screens } = useEditor();
  const dispatch = useEditorDispatch();
  const screen = useSelectedScreen();

  const patch = (value: Partial<typeof screen>) =>
    dispatch({ type: "updateScreen", id: screen.id, patch: value });

  // Slide copy is edited in the active locale; en-US writes the base fields.
  const text = resolveText(screen, locale);
  const setText = (field: "headline" | "subhead" | "brandChip", value: string) =>
    patch(textPatch(screen, locale, field, value));
  const isBase = locale === BASE_LOCALE;
  const translated = translatedCount(screens, locale);

  return (
    <aside className="flex w-[292px] shrink-0 flex-col border-l border-l-[var(--hairline)] bg-[var(--chrome-panel)] backdrop-blur-[24px]">
      <div
        role="tablist"
        className="flex h-[46px] shrink-0 items-center gap-5 border-b border-b-[#00000012] bg-[#F6F6F8A8] px-[14px]"
      >
        {(["design", "animate"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={inspectorTab === tab}
            onClick={() => dispatch({ type: "setInspectorTab", tab })}
            className={`text-[13px] capitalize ${
              inspectorTab === tab
                ? "font-[650] text-[var(--ink)]"
                : "font-medium text-[#8E8E93]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {inspectorTab === "animate" ? (
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <p className="text-[11px] text-[var(--muted)]">
            Animation settings are not part of this design yet.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto p-[14px]">
          <div className="flex h-[44px] shrink-0 items-center gap-[9px] rounded-[9px] bg-[#EAEAEE] px-[10px]">
            <Smartphone className="size-[15px] shrink-0 text-[var(--purple)]" />
            <div className="flex min-w-0 flex-col gap-[2px]">
              <span className="truncate text-[12px] font-semibold text-[var(--ink)]">
                Screenshot {screen.number}
              </span>
              <span className="truncate text-[9px] text-[var(--muted)]">
                App Store artboard
              </span>
            </div>
          </div>

          <section className="flex shrink-0 flex-col gap-3">
            <SectionTitle>Canvas</SectionTitle>

            <div className="flex flex-col gap-[7px]">
              <FieldLabel>Device size</FieldLabel>
              <SelectRow
                label="Device size"
                value={
                  EXPORT_DEVICES.find((d) => d.id === canvasDeviceId)?.name ??
                  EXPORT_DEVICES[0].name
                }
                options={EXPORT_DEVICES.map((d) => d.name)}
                onChange={(name) => {
                  const device = EXPORT_DEVICES.find((d) => d.name === name);
                  if (device)
                    dispatch({ type: "setCanvasDevice", id: device.id });
                }}
              />
            </div>

            <div className="flex flex-col gap-[7px]">
              <FieldLabel>Language</FieldLabel>
              <SelectRow
                label="Slide language"
                value={localeName(locale)}
                options={LOCALES.map((item) => item.name)}
                onChange={(name) => {
                  const next = LOCALES.find((item) => item.name === name);
                  if (next) dispatch({ type: "setLocale", locale: next.id });
                }}
              />
              {!isBase ? (
                <p className="text-[9px] leading-[1.5] text-[var(--muted)]">
                  {translated} of {screens.length} screens translated. Anything
                  left blank falls back to {localeName(BASE_LOCALE)}.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-[7px]">
              <FieldLabel>Background</FieldLabel>
              <div className="flex h-[38px] gap-2">
                <label className="relative h-full w-[42px] shrink-0 overflow-hidden rounded-[8px] border border-[var(--line)]">
                  <span className="sr-only">Background colour</span>
                  <input
                    type="color"
                    value={screen.bg}
                    onChange={(event) => patch({ bg: event.target.value })}
                    className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 bg-transparent p-0"
                  />
                </label>
                <HexField
                  value={screen.bg}
                  onCommit={(bg) => patch({ bg })}
                />
              </div>

              <div className="grid grid-cols-6 gap-[5px]">
                {BRIGHT_BACKGROUNDS.map(({ name, hex }) => {
                  const isActive =
                    screen.bg.toLowerCase() === hex.toLowerCase();
                  return (
                    <button
                      key={hex}
                      type="button"
                      title={name}
                      aria-label={name}
                      aria-pressed={isActive}
                      onClick={() => patch({ bg: hex })}
                      className={`h-[24px] rounded-[6px] border transition-transform hover:scale-[1.08] ${
                        isActive
                          ? "border-[var(--purple)] ring-2 ring-[var(--purple)]"
                          : "border-[#00000014]"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          <Divider />

          <section className="flex shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionTitle>Device</SectionTitle>
              <button
                type="button"
                role="switch"
                aria-checked={screen.deviceVisible}
                aria-label="Show device frame"
                onClick={() => patch({ deviceVisible: !screen.deviceVisible })}
                className={`flex h-[18px] w-[32px] items-center rounded-full p-[3px] transition-colors ${
                  screen.deviceVisible
                    ? "justify-end bg-[#34C759]"
                    : "justify-start bg-[#C7C7CC]"
                }`}
              >
                <span className="size-[12px] rounded-full bg-white" />
              </button>
            </div>

            <ValueRow label="Frame">
              <SelectRow
                label="Device frame"
                value={screen.deviceFrame}
                groups={FRAME_GROUPS}
                onChange={(deviceFrame) => patch({ deviceFrame })}
                className="h-[24px] w-[150px] justify-end text-[10px] font-semibold"
              />
            </ValueRow>

            <ValueRow label="Status bar">
              <button
                type="button"
                role="switch"
                aria-checked={screen.deviceChrome}
                aria-label="Show status bar and indicators"
                onClick={() => patch({ deviceChrome: !screen.deviceChrome })}
                className={`flex h-[18px] w-[32px] items-center rounded-full p-[3px] transition-colors ${
                  screen.deviceChrome
                    ? "justify-end bg-[#34C759]"
                    : "justify-start bg-[#C7C7CC]"
                }`}
              >
                <span className="size-[12px] rounded-full bg-white" />
              </button>
            </ValueRow>

            <ValueRow label="Color">
              <SelectRow
                label="Device colour"
                value={screen.deviceColor}
                options={DEVICE_COLORS}
                onChange={(deviceColor) => patch({ deviceColor })}
                className="h-[24px] w-[150px] justify-end text-[10px] font-semibold"
              />
            </ValueRow>

            <ValueRow label="Scale">
              <SliderValue
                label="Device scale"
                min={40}
                max={120}
                value={screen.deviceScale}
                onChange={(deviceScale) => patch({ deviceScale })}
                format={(value) => `${value}%`}
              />
            </ValueRow>

            <ValueRow label="Position X">
              <SliderValue
                label="Device horizontal position"
                min={-120}
                max={120}
                value={screen.deviceX}
                onChange={(deviceX) => patch({ deviceX })}
                format={(value) => `${value > 0 ? "+" : ""}${value}`}
              />
            </ValueRow>

            <ValueRow label="Position Y">
              <SliderValue
                label="Device vertical position"
                min={-200}
                max={200}
                value={screen.deviceY}
                onChange={(deviceY) => patch({ deviceY })}
                format={(value) => `${value > 0 ? "+" : ""}${value}`}
              />
            </ValueRow>
          </section>

          <Divider />

          <section className="flex shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionTitle>Brand chip</SectionTitle>
              <button
                type="button"
                aria-label="Toggle brand chip"
                aria-pressed={!screen.brandChipVisible}
                onClick={() =>
                  patch({ brandChipVisible: !screen.brandChipVisible })
                }
              >
                {screen.brandChipVisible ? (
                  <Eye className="size-[14px] text-[var(--muted)]" />
                ) : (
                  <EyeOff className="size-[14px] text-[var(--purple)]" />
                )}
              </button>
            </div>

            <input
              aria-label="Brand chip text"
              value={text.brandChip}
              disabled={!screen.brandChipVisible}
              onChange={(event) => setText("brandChip", event.target.value)}
              className="h-[34px] rounded-[7px] border border-[var(--line)] bg-white px-[10px] text-[10px] font-semibold text-[var(--ink)] outline-none focus:border-[var(--purple)] disabled:bg-[#F5F5F7] disabled:text-[var(--muted)]"
            />
          </section>

          <Divider />

          <section className="flex shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionTitle>Headline</SectionTitle>
              <button
                type="button"
                aria-label="Toggle headline visibility"
                aria-pressed={!screen.headlineVisible}
                onClick={() =>
                  patch({ headlineVisible: !screen.headlineVisible })
                }
              >
                {screen.headlineVisible ? (
                  <Eye className="size-[14px] text-[var(--muted)]" />
                ) : (
                  <EyeOff className="size-[14px] text-[var(--purple)]" />
                )}
              </button>
            </div>

            <textarea
              aria-label="Headline text"
              value={text.headline}
              rows={2}
              onChange={(event) => setText("headline", event.target.value)}
              className="h-[62px] resize-none rounded-[7px] border border-[var(--line)] bg-white p-[10px] text-[11px] leading-[1.3] font-semibold text-[var(--ink)] outline-none focus:border-[var(--purple)]"
            />

            <input
              aria-label="Subhead text"
              value={text.subhead}
              onChange={(event) => setText("subhead", event.target.value)}
              className="h-[34px] rounded-[7px] border border-[var(--line)] bg-white px-[10px] text-[10px] text-[var(--ink)] outline-none focus:border-[var(--purple)]"
            />

            <div className="flex h-[36px] gap-2">
              <FontPicker
                value={screen.fontFamily}
                onChange={(fontFamily) => patch({ fontFamily })}
              />
              <div className="flex h-full w-[68px] items-center justify-center gap-1 rounded-[7px] bg-[#F7F7F9]">
                <NumberField
                  label="Font size"
                  min={8}
                  max={160}
                  value={screen.fontSize}
                  onCommit={(fontSize) => patch({ fontSize })}
                />
                <span className="text-[10px] text-[var(--ink)]">px</span>
              </div>
            </div>

            {!isBase && !hasTranslation(screen, locale, "headline") ? (
              <p className="text-[9px] text-[var(--muted)]">
                Showing {localeName(BASE_LOCALE)} — type to translate.
              </p>
            ) : null}

            <ValueRow label="Position X">
              <SliderValue
                label="Headline horizontal position"
                min={-120}
                max={120}
                value={screen.textX}
                onChange={(textX) => patch({ textX })}
                format={(value) => `${value > 0 ? "+" : ""}${value}`}
              />
            </ValueRow>

            <ValueRow label="Position Y">
              <SliderValue
                label="Headline vertical position"
                min={-200}
                max={200}
                value={screen.textY}
                onChange={(textY) => patch({ textY })}
                format={(value) => `${value > 0 ? "+" : ""}${value}`}
              />
            </ValueRow>

            <div className="flex h-[34px] w-fit gap-[2px] rounded-[8px] bg-[#F4F4F7] p-[3px]">
              {ALIGNMENTS.map(({ id, label, icon: Icon }) => {
                const isActive = id === screen.align;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    aria-pressed={isActive}
                    onClick={() => patch({ align: id })}
                    className={`flex h-[28px] w-[36px] items-center justify-center rounded-[6px] ${
                      isActive
                        ? "bg-white text-[var(--ink)]"
                        : "bg-[#F4F4F7] text-[var(--muted)]"
                    }`}
                  >
                    <Icon className="size-[14px]" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
