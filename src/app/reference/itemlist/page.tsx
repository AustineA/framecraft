"use client";

import Link from "next/link";
import { ArtboardCard } from "@/components/editor/artboard";
import { ITEMLIST_COLORS, ITEMLIST_MEDIA, ITEMLIST_SCREENS } from "@/lib/itemlist-template";

/** Full-size reference board; the editable version is in the template picker. */
export default function ItemlistReference() {
  return <main aria-label="Itemlist reference composition" style={{ width: "100vw", height: "100vh", overflow: "auto", background: ITEMLIST_COLORS.olive }}>
    <nav aria-label="Reference actions" className="fixed right-4 top-3 z-50 flex items-center gap-3 rounded-xl bg-white/95 p-3 text-xs shadow-md">
      <Link href="/">Open editor templates</Link>
      <a href="/templates/itemlist/itemlist.framecraft.json" download>Download editable project</a>
      <a href="/templates/itemlist/itemlist-reference-2048x1152.png" download className="rounded-lg bg-[#004C4B] px-3 py-2 text-white">Download 2048 × 1152 PNG</a>
    </nav>
    <div id="itemlist-storyboard" style={{ position: "relative", width: 2048, height: 1152, background: ITEMLIST_COLORS.olive, overflow: "hidden" }}>
      {ITEMLIST_SCREENS.map((screen, index) => <div key={screen.id} style={{ position: "absolute", left: 74 + index * 480, top: 77, width: 460, height: 998, borderRadius: 60, overflow: "hidden" }}>
        <div style={{ transform: "scale(1.1734693877551021)", transformOrigin: "top left" }}>
          <ArtboardCard screen={screen} media={ITEMLIST_MEDIA} height={998 * 392 / 460} />
        </div>
      </div>)}
      {/* The supplied reference includes the left edge of a fifth card. */}
      <div aria-hidden style={{ position: "absolute", left: 1994, top: 77, width: 460, height: 998, borderRadius: 60, overflow: "hidden", background: ITEMLIST_COLORS.teal }}>
        <div style={{ position: "absolute", left: 23, top: 224, width: 416, height: 920, borderRadius: 88, border: `5px solid ${ITEMLIST_COLORS.olive}`, background: "#080808", padding: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/templates/itemlist/camera.png" alt="" style={{ width: "100%", height: 530, marginTop: 223, objectFit: "cover" }} />
        </div>
      </div>
    </div>
  </main>;
}
