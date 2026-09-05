import { BadgeCheck, MessageSquare, Sparkles } from "lucide-react";

import { artboardGradient, isDark } from "@/lib/color";
import { ARTBOARD_SCALE, fontStack } from "@/lib/editor-data";
import type { Align, MediaAsset, Screen } from "@/lib/editor-types";
import { resolveText, textPatch } from "@/lib/localize";

import { AppScreen, appScreenBackground } from "./app-screens";
import { DeviceFrame, frameMetrics } from "./device-frame";
import { EditableText } from "./editable-text";

const ALIGN_ITEMS: Record<Align, string> = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
};

const ALIGN_TEXT: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const ACCENT_SHAPE: Record<string, string> = {
  rectangle: "h-[150px] w-[150px] rounded-[28px]",
  circle: "h-[170px] w-[170px] rounded-full",
  triangle: "h-[160px] w-[160px] [clip-path:polygon(50%_0,100%_100%,0_100%)]",
  line: "h-[10px] w-[240px] rounded-full",
  arrow: "h-[10px] w-[200px] rounded-full",
  star: "h-[170px] w-[170px] [clip-path:polygon(50%_0,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]",
};

/**
 * One App Store artboard at its authored 392x768. The canvas scales it for
 * zoom; the exporter rasterises it at real device resolution.
 */
export function ArtboardCard({
  screen,
  media = [],
  locale = "en-US",
  width = 392,
  height = 768,
  editable = false,
  onEdit,
}: {
  screen: Screen;
  /** Library the screen's `mediaId` resolves against. */
  media?: MediaAsset[];
  /** Locale the slide copy is rendered in. */
  locale?: string;
  width?: number;
  height?: number;
  /** Enables in-place editing of the headline and subhead. */
  editable?: boolean;
  onEdit?: (patch: Partial<Screen>) => void;
}) {
  const dark = isDark(screen.bg);
  const textAlign = ALIGN_TEXT[screen.align];
  // 84% is the authored device size, so the control scales relative to it.
  const metrics = frameMetrics(screen.deviceFrame, width, height);
  const has = (id: string) => screen.decorations.includes(id);
  const image = media.find((asset) => asset.id === screen.mediaId)?.dataUrl;
  const commit = (patch: Partial<Screen>) => onEdit?.(patch);
  const text = resolveText(screen, locale);

  return (
    <div
      className={`relative flex flex-col ${ALIGN_ITEMS[screen.align]} gap-[13px] overflow-hidden rounded-[2px] px-[30px] pt-[58px]`}
      // Gradient, headline size and device placement are user-edited values,
      // so they cannot be static Tailwind classes.
      style={{
        width,
        height,
        backgroundImage: artboardGradient(screen.bg),
        fontFamily: fontStack(screen.fontFamily),
      }}
    >
      {has("glow") ? (
        <div className="pointer-events-none absolute top-[38%] left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#FFFFFFCC_0%,#FFFFFF00_70%)]" />
      ) : null}

      {screen.accentShape ? (
        <div
          className={`pointer-events-none absolute top-[30%] left-1/2 -translate-x-1/2 bg-white/25 ${
            ACCENT_SHAPE[screen.accentShape] ?? ""
          }`}
        />
      ) : null}

      {screen.brandChipVisible ? (
        <div className="relative z-[2] flex h-[22px] shrink-0 items-center gap-[5px] rounded-full bg-[#FFFFFFB8] px-[9px] shadow-[0_1px_2px_#00000012]">
          <Sparkles className="size-[10px] shrink-0 text-[var(--purple)]" />
          <EditableText
            label="Brand chip"
            editable={editable}
            value={text.brandChip}
            onCommit={(value) =>
              commit(textPatch(screen, locale, "brandChip", value))
            }
            className="text-[8px] font-bold tracking-[0.8px] whitespace-nowrap text-[var(--purple)]"
          />
        </div>
      ) : null}

      {screen.headlineVisible ? (
        // Headline and subhead move together, keeping their 13px pairing.
        <div
          className="relative z-[2] flex w-full shrink-0 flex-col gap-[13px]"
          style={{
            transform: `translate(${screen.textX}px, ${screen.textY}px)`,
          }}
        >
          <EditableText
            label="Headline"
            multiline
            editable={editable}
            value={text.headline}
            onCommit={(value) =>
              commit(textPatch(screen, locale, "headline", value))
            }
            className={`w-full leading-none font-bold tracking-[-1.1px] whitespace-pre-line ${textAlign} ${
              dark ? "text-white" : "text-[var(--ink)]"
            }`}
            style={{ fontSize: screen.fontSize * ARTBOARD_SCALE }}
          />
          <EditableText
            label="Subhead"
            editable={editable}
            value={text.subhead}
            onCommit={(value) =>
              commit(textPatch(screen, locale, "subhead", value))
            }
            className={`w-full text-[12px] font-medium ${textAlign} ${
              dark ? "text-[#FFFFFFB0]" : "text-[#515154]"
            }`}
          />
        </div>
      ) : null}

      {has("callout") ? (
        <div className="relative z-[2] flex shrink-0 items-center gap-[6px] rounded-[10px] bg-white/85 px-[10px] py-[6px] shadow-[0_2px_6px_#00000014]">
          <MessageSquare className="size-[11px] text-[var(--purple)]" />
          <span className="text-[9px] font-semibold text-[var(--ink)]">
            Loved by 40,000 people
          </span>
        </div>
      ) : null}

      {has("badge") ? (
        <div className="relative z-[2] flex shrink-0 items-center gap-[6px] rounded-full bg-[#1D1D1F] px-[11px] py-[5px]">
          <BadgeCheck className="size-[11px] text-white" />
          <span className="text-[8px] font-bold tracking-[0.4px] text-white">
            EDITORS’ CHOICE
          </span>
        </div>
      ) : null}

      {screen.deviceVisible ? (
        <div
          className="relative z-[1] origin-top"
          style={{
            transform: `translate(${screen.deviceX}px, ${screen.deviceY}px) scale(${screen.deviceScale / 84})`,
          }}
        >
          <DeviceFrame
            metrics={metrics}
            color={screen.deviceColor}
            screenBackground={appScreenBackground(screen.app, metrics.kind)}
            className={
              has("shadow")
                ? "drop-shadow-[0_28px_44px_#002A6659]"
                : "drop-shadow-[0_16px_26px_#002A6629]"
            }
          >
            <AppScreen
              kind={screen.app}
              deviceKind={metrics.kind}
              screenWidth={metrics.screenWidth}
              imageUrl={image}
            />
          </DeviceFrame>
        </div>
      ) : null}
    </div>
  );
}
