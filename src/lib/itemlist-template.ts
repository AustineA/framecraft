import { INITIAL_STATE, SCREENS } from "./editor-data";
import type { EditorState, Layer, MediaAsset, Screen } from "./editor-types";

/** Reference layout: 460×998 panels at x=74+480n in a 2048×1152 board. */
const S = 392 / 460;
export const ITEMLIST_COLORS = { teal: "#004C4B", olive: "#9FA747" };
const assets = [
  ["illustration", "Woman, parrot & belongings", "illustration.png"],
  ["camera", "Polaroid Sun 660 photograph", "camera.png"],
  ["locations-ui", "Locations screenshot", "locations-ui.svg"],
  ["search-ui", "Search screenshot", "search-ui.svg"],
  ["detail-ui", "Camera information", "detail-ui.svg"],
  ["floating-result", "Small box search result", "floating-result.svg"],
  ["star", "Rating star", "star.svg"],
];
export const ITEMLIST_MEDIA: MediaAsset[] = assets.map(([id, name, file]) => ({
  id: `itemlist-${id}`, name, dataUrl: `/templates/itemlist/${file}`,
}));

function layer(id: string, kind: Layer["kind"], x: number, y: number, width: number, height: number, patch: Partial<Layer> = {}): Layer {
  return {
    id, name: id, kind, x: x * S, y: y * S, width: width * S, height: height * S,
    rotation: 0, opacity: 100, visible: true, locked: false, plane: "front",
    text: "", fontSize: 24 * S, fontFamily: "Arial", fontWeight: 700,
    color: "#FFFFFF", fill: "transparent", radius: 0, shadow: false,
    mediaId: null, fit: "contain", padding: 0, lineHeight: 1, ...patch,
  };
}
function image(id: string, asset: string, x: number, y: number, w: number, h: number, patch: Partial<Layer> = {}) {
  return layer(id, "image", x, y, w, h, { mediaId: `itemlist-${asset}`, ...patch });
}
function text(id: string, value: string, x: number, y: number, w: number, h: number, size: number, patch: Partial<Layer> = {}) {
  return layer(id, "text", x, y, w, h, { text: value, fontSize: size * S, ...patch });
}
function shape(id: string, x: number, y: number, w: number, h: number, fill: string, radius: number) {
  return layer(id, "shape", x, y, w, h, { fill, radius: radius * S });
}
// Identical global illustration placement, clipped separately by each artboard.
function illustration(panel: number) {
  return image(`illustration-${panel}`, "illustration", 440 - (74 + panel * 480), 297 - 77, 790, 780);
}
const opening = [
  text("Opening headline", "no more\ninventory\nchaos", 30, 34, 400, 238, 82, { lineHeight: .97, letterSpacing: -2.5 * S }),
  ...Array.from({ length: 5 }, (_, index) => image(`Rating star ${index + 1}`, "star", 55 + index * 72, 299, 63, 63)),
  text("Average rating", "4,9 average ratings", 45, 369, 370, 47, 35, { color: "#9DBBBC", fontWeight: 700, letterSpacing: -.7 * S }),
  image("Locations phone", "locations-ui", 22, 451, 416, 950),
  shape("Foreground teal foliage", 296, 880, 215, 180, "#007779", 90),
  illustration(0),
];
const problem = [
  text("ADHD thought bubble", "Uh, I have ADHD!", 198, 30, 232, 69, 24, { fill: "#FFFFFF", color: "#080808", radius: 40 * S, rotation: 3, letterSpacing: -.8 * S }),
  shape("ADHD bubble tail", 407, 93, 18, 18, "#FFFFFF", 20),
  shape("ADHD bubble dot", 425, 112, 10, 10, "#FFFFFF", 10),
  text("Can't find anything bubble", "I can’t find anything!", 33, 138, 287, 74, 24, { fill: "#FFFFFF", color: "#080808", radius: 40 * S, rotation: -3, letterSpacing: -.6 * S }),
  shape("Lost items bubble tail", 34, 190, 18, 18, "#FFFFFF", 20),
  shape("Lost items bubble dot", 28, 211, 10, 10, "#FFFFFF", 10),
  illustration(1),
];
const search = [
  text("Search headline", "find\nany items\nin seconds", 20, 35, 420, 248, 80, { lineHeight: .96, letterSpacing: -2.7 * S }),
  image("Search phone", "search-ui", 20, 309, 416, 950),
  image("Floating small box result", "floating-result", 108, 701, 374, 116, { shadow: true }),
  illustration(2),
];
const detail = [
  shape("Camera card", 18, -15, 425, 796, "#EFF7FA", 56),
  image("Polaroid photo", "camera", 18, -4, 425, 300, { fit: "cover", imageScale: 1.35 }),
  image("Item information", "detail-ui", 18, 296, 425, 486),
  // Mask the card's lower corners with the same corner radius as the reference.
  text("Item details headline", "track all\nitems’ info", 25, 827, 410, 127, 60, { lineHeight: .95, letterSpacing: -1.6 * S }),
];
const names = ["No more inventory chaos", "I can’t find anything", "Find items in seconds", "Track every item"];
const contents = [opening, problem, search, detail];
export const ITEMLIST_SCREENS: Screen[] = contents.map((layers, index) => ({
  ...SCREENS[0], id: `itemlist-reference-${index + 1}`, number: String(index + 1).padStart(2, "0"),
  name: names[index], miniTitle: names[index].toUpperCase(), brandChip: "ITEMLIST",
  headline: "", subhead: "", brandChipVisible: false, headlineVisible: false, deviceVisible: false,
  decorations: [], accentShape: null, translations: {}, mediaId: null,
  bg: ITEMLIST_COLORS.teal, backgroundStyle: "solid", fontFamily: "Arial", layers,
}));
export const ITEMLIST_PROJECT: EditorState = {
  ...INITIAL_STATE, screens: ITEMLIST_SCREENS, media: ITEMLIST_MEDIA,
  selectedScreenId: ITEMLIST_SCREENS[0].id, tool: "layers", canvasDeviceId: "iphone-69",
  exportDeviceIds: ["iphone-69"],
};
