import type { ReactNode } from "react";

import { ISLAND_PT, type DeviceKind, phoneSpec, pxPerMm } from "@/lib/editor-data";

/**
 * Device finishes.
 *
 * Metal reads as metal because of alternating light and dark bands, not a
 * smooth ramp — the rail picks up a highlight where it curves away at each
 * edge, so every finish alternates specular and shadow across its width.
 * `edge` is the hairline where the rail meets the glass, `antenna` the
 * lighter breaks in the band.
 */
const FINISH: Record<
  string,
  { rail: string; button: string; edge: string; antenna: string }
> = {
  "Black Titanium": {
    // Simulator art is a near-flat #2A2A2B rail with a 2px bright outer
    // edge, so the gradient stays tight and the highlight does the work.
    rail: "linear-gradient(150deg,#3A3A3C 0%,#2A2A2B 26%,#232325 52%,#2D2D2F 76%,#3E3E41 100%)",
    button: "linear-gradient(180deg,#3C3C3F 0%,#262628 52%,#333336 100%)",
    edge: "rgba(255,255,255,0.36)",
    antenna: "rgba(150,152,158,0.5)",
  },
  "Natural Titanium": {
    rail: "linear-gradient(150deg,#D8D3C9 0%,#B5B0A6 26%,#A19C93 52%,#BCB7AD 76%,#DED9CF 100%)",
    button: "linear-gradient(180deg,#C6C1B7 0%,#A5A097 52%,#B8B3A9 100%)",
    edge: "rgba(255,255,255,0.55)",
    antenna: "rgba(255,255,255,0.5)",
  },
  "White Titanium": {
    rail: "linear-gradient(150deg,#F0EEEA 0%,#DCD9D4 26%,#CBC8C2 52%,#E0DDD8 76%,#F4F2EE 100%)",
    button: "linear-gradient(180deg,#E6E4E0 0%,#CFCCC6 52%,#DDDBD6 100%)",
    edge: "rgba(255,255,255,0.7)",
    antenna: "rgba(255,255,255,0.6)",
  },
  "Desert Titanium": {
    rail: "linear-gradient(150deg,#CFB694 0%,#B99A72 26%,#A78B64 52%,#C0A379 76%,#D8C0A0 100%)",
    button: "linear-gradient(180deg,#C4A57D 0%,#A78B64 52%,#B99A72 100%)",
    edge: "rgba(255,244,228,0.5)",
    antenna: "rgba(255,244,228,0.5)",
  },
};

/** Antenna breaks in the rail, as a fraction of the body's height. */
const ANTENNA_AT = [0.085, 0.915];

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
  const screenWidth = bodyWidth - bezel * 2;
  const ptPerPx = screenWidth / spec.ptW;

  /*
   * The screen takes the display's own aspect rather than the body's minus a
   * bezel: a screenshot is exactly ptW x ptH, so any other shape would crop
   * or squash it. The body height follows from the screen plus its border.
   */
  const screenHeight = screenWidth * (spec.ptH / spec.ptW);
  const bodyHeight = screenHeight + bezel * 2;

  return {
    spec,
    kind: spec.kind,
    ptPerPx,
    bezel,
    bodyWidth,
    bodyHeight,
    screenWidth,
    screenHeight,
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
  // Simulator art measures 11px of rail against 15px of black, so the metal
  // takes 42% of the border. Weighting it the other way was what made the
  // frame read as one heavy black band instead of metal around glass.
  const rimWidth = Math.max(1, metrics.bezel * 0.423);
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
                  backgroundImage: finish.button,
                  borderRadius: thickness,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
                }
              : {
                  [button.edge]: -inset,
                  top: metrics.bodyHeight * button.at,
                  height: metrics.bodyHeight * button.length,
                  width: thickness,
                  backgroundImage: finish.button,
                  borderRadius: thickness,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
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
          backgroundImage: finish.rail,
          // A hairline of light on the outer curve, and a dark seat under it,
          // which is what separates milled metal from a flat grey band.
          boxShadow: [
            `inset 0 0 0 ${Math.max(0.6, rimWidth * 0.19).toFixed(2)}px ${finish.edge}`,
            "inset 0 0.5px 0.5px rgba(255,255,255,0.10)",
            "0 0 0 0.5px rgba(0,0,0,0.45)",
          ].join(", "),
        }}
      >
        {/* Antenna breaks: the rail is not one continuous piece of metal. */}
        {metrics.kind === "iphone"
          ? ANTENNA_AT.map((at) => (
              <span
                key={at}
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: -0.5,
                  right: -0.5,
                  top: metrics.bodyHeight * at,
                  height: Math.max(0.75, rimWidth * 0.4),
                  background: finish.antenna,
                  opacity: 0.75,
                }}
              />
            ))
          : null}

        <div
          className="h-full w-full bg-[#020203]"
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
              // The glass sits slightly proud of the black border.
              boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.07)",
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
