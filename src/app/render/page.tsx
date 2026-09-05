"use client";

import { useEffect, useState } from "react";

import { ArtboardCard } from "@/components/editor/artboard";
import { artboardHeightFor, exportDevice } from "@/lib/editor-data";
import type { MediaAsset, Screen } from "@/lib/editor-types";

type RenderRequest = {
  screen: Screen;
  media: MediaAsset[];
  locale: string;
  deviceId: string;
};

declare global {
  interface Window {
    __framecraftRender?: (request: RenderRequest) => Promise<boolean>;
    __framecraftReady?: boolean;
  }
}

/**
 * Headless render target for the CLI.
 *
 * The artboard is authored at 392px, so it is scaled into a box of the
 * device's exact pixel size and screenshotted at a device scale factor of 1.
 * That yields precise App Store dimensions with vector-sharp text, and needs
 * no rasteriser in the browser.
 */
export default function RenderPage() {
  const [request, setRequest] = useState<RenderRequest | null>(null);

  useEffect(() => {
    window.__framecraftRender = (next) =>
      new Promise((resolve) => {
        setRequest(next);
        // Two frames: one for React to commit, one for the paint.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve(true)),
        );
      });
    window.__framecraftReady = true;
  }, []);

  if (!request) return null;

  const device = exportDevice(request.deviceId);
  const artboardHeight = artboardHeightFor(device);

  return (
    <div
      id="artboard"
      style={{
        width: device.width,
        height: device.height,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 392,
          height: artboardHeight,
          transformOrigin: "top left",
          // Non-uniform so the rounded artboard height fills exactly.
          transform: `scale(${device.width / 392}, ${device.height / artboardHeight})`,
        }}
      >
        <ArtboardCard
          screen={request.screen}
          media={request.media}
          locale={request.locale}
          height={artboardHeight}
        />
      </div>
    </div>
  );
}
