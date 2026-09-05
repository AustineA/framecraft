import type { ReactNode } from "react";

import { ISLAND_PT, type DeviceKind, phoneSpec, pxPerMm } from "@/lib/editor-data";

/** Titanium and aluminium finishes: the rim carries the colour. */
const FINISH: Record<string, { rim: string; button: string }> = {
  "Black Titanium": {
    rim: "linear-gradient(150deg,#6E6E73 0%,#1B1B1D 22%,#0E0E0F 50%,#1B1B1D 78%,#7A7A80 100%)",
    button: "#3A3A3C",
  },
  "Natural Titanium": {
    rim: "linear-gradient(150deg,#E4E0D8 0%,#9A958C 22%,#7B766E 50%,#9A958C 78%,#EDE9E1 100%)",
    button: "#A9A49B",
  },
  "White Titanium": {
    rim: "linear-gradient(150deg,#FFFFFF 0%,#D6D3CD 22%,#B8B5AF 50%,#D6D3CD 78%,#FFFFFF 100%)",
    button: "#CFCCC6",
  },
  "Desert Titanium": {
    rim: "linear-gradient(150deg,#F0DCC0 0%,#B99A72 22%,#9A7C57 50%,#B99A72 78%,#F5E4CC 100%)",
    button: "#C2A47D",
  },
};

/** Status bar height in points — iPads carry a much shorter one. */
const STATUS_PT: Record<DeviceKind, number> = { iphone: 54, ipad: 24 };
const STATUS_SIDE_PT: Record<DeviceKind, number> = { iphone: 26, ipad: 32 };
const STATUS_FONT_PT: Record<DeviceKind, number> = { iphone: 15, ipad: 13 };
const HOME_INDICATOR_PT = { width: 140, height: 5, bottom: 8 };

type Button =
  | { edge: "left" | "right"; at: number; length: number }
  | { edge: "top"; at: number; length: number };

/** Placement as a fraction of the body's height (side) or width (top). */
const BUTTONS: Record<DeviceKind, Button[]> = {
  iphone: [
    { edge: "left", at: 0.162, length: 0.042 }, // Action
    { edge: "left", at: 0.232, length: 0.063 }, // Volume up
    { edge: "left", at: 0.31, length: 0.063 }, // Volume down
    { edge: "right", at: 0.264, length: 0.102 }, // Power
  ],
  ipad: [
    { edge: "right", at: 0.06, length: 0.05 }, // Volume up
    { edge: "right", at: 0.125, length: 0.05 }, // Volume down
    { edge: "top", at: 0.7, length: 0.13 }, // Top button
  ],
};

export type FrameMetrics = ReturnType<typeof frameMetrics>;

/**
 * Everything the frame needs, derived from real device dimensions.
 * The artboard size calibrates the on-canvas scale for the device's family.
 */
export function frameMetrics(
  frameName: string,
  artboardWidth: number,
  artboardHeight: number,
) {
  const spec = phoneSpec(frameName);
  const scale = pxPerMm(spec.kind, artboardWidth, artboardHeight);
  const bezel = spec.bezelMm * scale;
  const bodyWidth = spec.mmW * scale;
  const bodyHeight = spec.mmH * scale;
  const screenWidth = bodyWidth - bezel * 2;
  const ptPerPx = screenWidth / spec.ptW;

  return {
    spec,
    kind: spec.kind,
    ptPerPx,
    bezel,
    bodyWidth,
    bodyHeight,
    screenWidth,
    screenHeight: bodyHeight - bezel * 2,
    screenRadius: spec.radiusPt * ptPerPx,
    statusHeight: STATUS_PT[spec.kind] * ptPerPx,
    island:
      spec.kind === "iphone"
        ? {
            width: ISLAND_PT.width * ptPerPx,
            height: ISLAND_PT.height * ptPerPx,
            top: ISLAND_PT.top * ptPerPx,
          }
        : null,
  };
}

/** The iOS status bar, drawn to match what the simulator shows. */
function StatusBar({ metrics }: { metrics: FrameMetrics }) {
  const pad = STATUS_SIDE_PT[metrics.kind] * metrics.ptPerPx;
  const fontSize = STATUS_FONT_PT[metrics.kind] * metrics.ptPerPx;
  const glyph = fontSize * 0.78;

  return (
    <div
      className="absolute inset-x-0 top-0 z-[3] flex items-center justify-between text-[#1D1D1F]"
      style={{
        height: metrics.statusHeight,
        paddingLeft: pad,
        paddingRight: pad,
      }}
    >
      <span style={{ fontSize, fontWeight: 600, letterSpacing: -0.2 }}>
        9:41
      </span>
      <span className="flex items-center" style={{ gap: glyph * 0.32 }}>
        {metrics.kind === "iphone" ? (
          <svg
            viewBox="0 0 18 12"
            style={{ width: glyph * 1.35, height: glyph }}
            fill="currentColor"
            aria-hidden
          >
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
            <rect x="10" y="3" width="3" height="9" rx="1" />
            <rect x="15" y="0" width="3" height="12" rx="1" />
          </svg>
        ) : null}
        <svg
          viewBox="0 0 16 12"
          style={{ width: glyph * 1.2, height: glyph }}
          fill="currentColor"
          aria-hidden
        >
          <path d="M8 11.2 5.9 8.9a3 3 0 0 1 4.2 0L8 11.2Z" />
          <path
            d="M3.6 6.5a6.4 6.4 0 0 1 8.8 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M1.2 4a9.9 9.9 0 0 1 13.6 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <svg
          viewBox="0 0 26 12"
          style={{ width: glyph * 1.9, height: glyph }}
          aria-hidden
        >
          <rect
            x="0.6"
            y="0.6"
            width="22"
            height="10.8"
            rx="3.2"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="1.2"
          />
          <rect
            x="2.4"
            y="2.4"
            width="15"
            height="7.2"
            rx="2"
            fill="currentColor"
          />
          <path
            d="M24.2 4.3v3.4a2 2 0 0 0 0-3.4Z"
            fill="currentColor"
            fillOpacity="0.5"
          />
        </svg>
      </span>
    </div>
  );
}

export function DeviceFrame({
  metrics,
  color = "Black Titanium",
  screenBackground = "#000000",
  chrome = true,
  fillScreen = false,
  className = "",
  children,
}: {
  metrics: FrameMetrics;
  color?: string;
  /** Fills the status-bar safe area so it matches the app screen. */
  screenBackground?: string;
  /** Draw the iOS status bar, Dynamic Island and home indicator. */
  chrome?: boolean;
  /** Let content run edge to edge, under the chrome instead of below it. */
  fillScreen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const finish = FINISH[color] ?? FINISH["Black Titanium"];
  const rimWidth = Math.max(1.5, metrics.bezel * 0.26);
  const thickness = Math.max(2, metrics.bezel * 0.35);
  const inset = Math.max(1.5, metrics.bezel * 0.28);

  return (
    // Geometry comes from real device dimensions, so it cannot be static
    // Tailwind classes.
    <div className={`relative shrink-0 ${className}`}>
      {BUTTONS[metrics.kind].map((button, index) => (
        <span
          key={index}
          aria-hidden
          className="absolute z-0"
          style={
            button.edge === "top"
              ? {
                  top: -inset,
                  left: metrics.bodyWidth * button.at,
                  width: metrics.bodyWidth * button.length,
                  height: thickness,
                  background: finish.button,
                  borderRadius: thickness,
                }
              : {
                  [button.edge]: -inset,
                  top: metrics.bodyHeight * button.at,
                  height: metrics.bodyHeight * button.length,
                  width: thickness,
                  background: finish.button,
                  borderRadius: thickness,
                }
          }
        />
      ))}

      <div
        className="relative z-[1]"
        style={{
          width: metrics.bodyWidth,
          height: metrics.bodyHeight,
          padding: rimWidth,
          borderRadius: metrics.screenRadius + metrics.bezel,
          backgroundImage: finish.rim,
        }}
      >
        <div
          className="h-full w-full bg-[#0B0B0C]"
          style={{
            padding: metrics.bezel - rimWidth,
            borderRadius: metrics.screenRadius + metrics.bezel - rimWidth,
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden"
            style={{
              borderRadius: metrics.screenRadius,
              backgroundColor: screenBackground,
            }}
          >
            {/*
              Mock app UI is inset below the status bar, as it is under iOS.
              A real screenshot already includes its own, so it fills the
              screen and the chrome sits on top of it.
            */}
            <div
              className="h-full w-full"
              style={{
                paddingTop: chrome && !fillScreen ? metrics.statusHeight : 0,
              }}
            >
              {children}
            </div>

            {chrome ? <StatusBar metrics={metrics} /> : null}

            {chrome && metrics.island ? (
              <span
                aria-hidden
                className="absolute left-1/2 z-[4] -translate-x-1/2 rounded-full bg-black"
                style={{
                  top: metrics.island.top,
                  width: metrics.island.width,
                  height: metrics.island.height,
                }}
              />
            ) : null}

            {chrome ? (
              <span
                aria-hidden
                className="absolute left-1/2 z-[4] -translate-x-1/2 rounded-full bg-[#1D1D1F]/35"
                style={{
                  bottom: HOME_INDICATOR_PT.bottom * metrics.ptPerPx,
                  width: HOME_INDICATOR_PT.width * metrics.ptPerPx,
                  height: HOME_INDICATOR_PT.height * metrics.ptPerPx,
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
