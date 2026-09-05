import type { EditorState, ExportDevice, Screen } from "./editor-types";

/**
 * Headline sizes are authored in App Store pixels; the artboard is a scaled
 * representation of the device, so rendered size = fontSize * ARTBOARD_SCALE.
 * 72 px (the design's default) renders at the designed 34 px.
 */
export const ARTBOARD_SCALE = 34 / 72;

export const ARTBOARD_WIDTH = 392;
export const ARTBOARD_HEIGHT = 768;

export const SCREENS: Screen[] = [
  {
    id: "opening-hook",
    number: "01",
    name: "Opening hook",
    miniTitle: "BUILD BETTER",
    brandChip: "HABITLY",
    brandChipVisible: true,
    headline: "Build better\nhabits.",
    subhead: "Tiny steps that actually stick.",
    bg: "#CDE7FF",
    app: "today",
    mediaId: null,
    translations: {},
    fontSize: 72,
    align: "center",
    headlineVisible: true,
    deviceVisible: true,
    deviceFrame: "iPhone 16 Pro Max",
    deviceColor: "Black Titanium",
    deviceScale: 84,
    deviceX: 0,
    deviceY: 0,
    textX: 0,
    textY: 0,
    fontFamily: "Inter",
    decorations: [],
    accentShape: null,
  },
  {
    id: "daily-plan",
    number: "02",
    name: "Daily plan",
    miniTitle: "YOUR DAY",
    brandChip: "HABITLY",
    brandChipVisible: true,
    headline: "Your day,\nbeautifully clear.",
    subhead: "Small routines. Meaningful momentum.",
    bg: "#E0D7FF",
    app: "plan",
    mediaId: null,
    translations: {},
    fontSize: 72,
    align: "center",
    headlineVisible: true,
    deviceVisible: true,
    deviceFrame: "iPhone 16 Pro Max",
    deviceColor: "Black Titanium",
    deviceScale: 84,
    deviceX: 0,
    deviceY: 0,
    textX: 0,
    textY: 0,
    fontFamily: "Inter",
    decorations: [],
    accentShape: null,
  },
  {
    id: "streaks",
    number: "03",
    name: "Streaks",
    miniTitle: "STAY ON",
    brandChip: "HABITLY",
    brandChipVisible: true,
    headline: "Keep your\nstreak alive.",
    subhead: "Eighteen days and counting.",
    bg: "#C9EEF5",
    app: "streak",
    mediaId: null,
    translations: {},
    fontSize: 72,
    align: "center",
    headlineVisible: true,
    deviceVisible: true,
    deviceFrame: "iPhone 16 Pro Max",
    deviceColor: "Black Titanium",
    deviceScale: 84,
    deviceX: 0,
    deviceY: 0,
    textX: 0,
    textY: 0,
    fontFamily: "Inter",
    decorations: [],
    accentShape: null,
  },
  {
    id: "insights",
    number: "04",
    name: "Insights",
    miniTitle: "SMALL WINS",
    brandChip: "HABITLY",
    brandChipVisible: true,
    headline: "Small wins,\nmade visible.",
    subhead: "See the progress you are making.",
    bg: "#C8F2DF",
    app: "insights",
    mediaId: null,
    translations: {},
    fontSize: 72,
    align: "center",
    headlineVisible: true,
    deviceVisible: true,
    deviceFrame: "iPhone 16 Pro Max",
    deviceColor: "Black Titanium",
    deviceScale: 84,
    deviceX: 0,
    deviceY: 0,
    textX: 0,
    textY: 0,
    fontFamily: "Inter",
    decorations: [],
    accentShape: null,
  },
  {
    id: "focus",
    number: "05",
    name: "Focus",
    miniTitle: "FOCUS MODE",
    brandChip: "HABITLY",
    brandChipVisible: true,
    headline: "Focus on\nwhat matters.",
    subhead: "One task. Your full attention.",
    bg: "#D8E4FF",
    app: "focus",
    mediaId: null,
    translations: {},
    fontSize: 72,
    align: "center",
    headlineVisible: true,
    deviceVisible: true,
    deviceFrame: "iPhone 16 Pro Max",
    deviceColor: "Black Titanium",
    deviceScale: 84,
    deviceX: 0,
    deviceY: 0,
    textX: 0,
    textY: 0,
    fontFamily: "Inter",
    decorations: [],
    accentShape: null,
  },
  {
    id: "upgrade",
    number: "06",
    name: "Upgrade",
    miniTitle: "GO PREMIUM",
    brandChip: "HABITLY",
    brandChipVisible: true,
    headline: "Go premium,\ngo further.",
    subhead: "Unlock every habit and insight.",
    bg: "#FFD6E4",
    app: "upgrade",
    mediaId: null,
    translations: {},
    fontSize: 72,
    align: "center",
    headlineVisible: true,
    deviceVisible: true,
    deviceFrame: "iPhone 16 Pro Max",
    deviceColor: "Black Titanium",
    deviceScale: 84,
    deviceX: 0,
    deviceY: 0,
    textX: 0,
    textY: 0,
    fontFamily: "Inter",
    decorations: [],
    accentShape: null,
  },
];

export const BASIC_SHAPES = [
  { id: "rectangle", name: "Rectangle" },
  { id: "circle", name: "Circle" },
  { id: "triangle", name: "Triangle" },
  { id: "line", name: "Line" },
  { id: "arrow", name: "Arrow" },
  { id: "star", name: "Star" },
];

export const SHAPE_DECORATIONS = [
  { id: "badge", name: "App Store badge" },
  { id: "callout", name: "Feature callout" },
  { id: "glow", name: "Spotlight glow" },
  { id: "shadow", name: "Device shadow" },
];

/** App Store Connect screenshot sizes. */
export const EXPORT_DEVICES: ExportDevice[] = [
  { id: "iphone-69", name: "iPhone 6.9-inch", width: 1320, height: 2868 },
  { id: "iphone-65", name: "iPhone 6.5-inch", width: 1284, height: 2778 },
  { id: "iphone-63", name: "iPhone 6.3-inch", width: 1206, height: 2622 },
  { id: "iphone-55", name: "iPhone 5.5-inch", width: 1242, height: 2208 },
  { id: "ipad-13", name: "iPad 13-inch", width: 2064, height: 2752 },
  { id: "ipad-129", name: "iPad 12.9-inch", width: 2048, height: 2732 },
];

/** Artboards are authored 392 px wide; every size derives from that. */
export const EXPORT_BASE_WIDTH = 392;

/** Artboard height that matches a device's aspect ratio. */
export function artboardHeightFor(device: ExportDevice): number {
  return Math.round((EXPORT_BASE_WIDTH * device.height) / device.width);
}

export function exportDevice(id: string): ExportDevice {
  return EXPORT_DEVICES.find((device) => device.id === id) ?? EXPORT_DEVICES[0];
}

export const TEXT_STYLES = [
  { id: "display", name: "Display", meta: "Inter Bold · 72", size: 72 },
  { id: "headline", name: "Headline", meta: "Inter Bold · 48", size: 48 },
  {
    id: "subheadline",
    name: "Subheadline",
    meta: "Inter Semibold · 24",
    size: 24,
  },
  { id: "body", name: "Body", meta: "Inter Regular · 17", size: 17 },
  { id: "caption", name: "Caption", meta: "Inter Medium · 13", size: 13 },
];

/**
 * Real device geometry, the same numbers the simulator draws from.
 * `mm` is the physical body, `pt` the logical display, `bezelMm` the uniform
 * border around the screen (measured from Apple's published body size against
 * the display's physical size). Everything the frame draws derives from these.
 */
export type DeviceKind = "iphone" | "ipad";

export type PhoneSpec = {
  name: string;
  kind: DeviceKind;
  mmW: number;
  mmH: number;
  ptW: number;
  ptH: number;
  bezelMm: number;
  /** Display corner radius, points. */
  radiusPt: number;
};

/** Dynamic Island, points. iPads have none. */
export const ISLAND_PT = { width: 125, height: 36.67, top: 11 };

const IPHONE = { kind: "iphone", bezelMm: 2.45, radiusPt: 55 } as const;
const IPAD_PRO = { kind: "ipad", bezelMm: 8.5, radiusPt: 30 } as const;

export const PHONE_FRAMES: PhoneSpec[] = [
  // iPhone 17
  { name: "iPhone 17 Pro Max", mmW: 78.0, mmH: 163.4, ptW: 440, ptH: 956, ...IPHONE },
  { name: "iPhone 17 Pro", mmW: 71.9, mmH: 150.0, ptW: 402, ptH: 874, ...IPHONE },
  { name: "iPhone 17", mmW: 71.5, mmH: 149.6, ptW: 402, ptH: 874, ...IPHONE },
  { name: "iPhone Air", mmW: 74.7, mmH: 156.2, ptW: 420, ptH: 912, ...IPHONE },
  // iPhone 16
  { name: "iPhone 16 Pro Max", mmW: 77.6, mmH: 163.0, ptW: 440, ptH: 956, ...IPHONE },
  { name: "iPhone 16 Pro", mmW: 71.5, mmH: 149.6, ptW: 402, ptH: 874, ...IPHONE },
  { name: "iPhone 16 Plus", mmW: 77.8, mmH: 160.9, ptW: 430, ptH: 932, ...IPHONE },
  { name: "iPhone 16", mmW: 71.6, mmH: 147.6, ptW: 393, ptH: 852, ...IPHONE },
  { name: "iPhone 15 Pro Max", mmW: 76.7, mmH: 159.9, ptW: 430, ptH: 932, ...IPHONE },
  // iPad
  { name: "iPad Pro 13-inch", mmW: 215.5, mmH: 281.6, ptW: 1032, ptH: 1376, ...IPAD_PRO },
  { name: "iPad Pro 11-inch", mmW: 177.5, mmH: 249.7, ptW: 834, ptH: 1210, ...IPAD_PRO },
  { name: "iPad Air 13-inch", mmW: 214.9, mmH: 280.6, ptW: 1024, ptH: 1366, kind: "ipad", bezelMm: 8.9, radiusPt: 18 },
  { name: "iPad mini", mmW: 134.8, mmH: 195.4, ptW: 744, ptH: 1133, kind: "ipad", bezelMm: 9.4, radiusPt: 21 },
];

/**
 * Reference device per family, and the share of the artboard it should fill.
 * Scale is computed from the reference and then applied to every device in
 * that family, so an iPhone 16 still renders smaller than a 16 Pro Max.
 */
const REFERENCE = {
  iphone: { name: "iPhone 16 Pro Max", widthShare: 0.69, heightShare: 0.67 },
  ipad: { name: "iPad Pro 13-inch", widthShare: 0.72, heightShare: 0.62 },
};

function specByName(name: string): PhoneSpec {
  return PHONE_FRAMES.find((phone) => phone.name === name) ?? PHONE_FRAMES[0];
}

/**
 * Pixels per millimetre for a device family on a given artboard.
 *
 * Fitting on both axes matters because the artboard's shape follows the
 * selected screenshot size: an iPad canvas is far squarer than an iPhone one,
 * so sizing by width alone would push the device off the bottom.
 */
export function pxPerMm(
  kind: DeviceKind,
  artboardWidth: number,
  artboardHeight: number,
): number {
  const { name, widthShare, heightShare } = REFERENCE[kind];
  const reference = specByName(name);
  return Math.min(
    (artboardWidth * widthShare) / reference.mmW,
    (artboardHeight * heightShare) / reference.mmH,
  );
}

export const DEVICE_FRAMES = PHONE_FRAMES.map((phone) => phone.name);

export function phoneSpec(name: string): PhoneSpec {
  return specByName(name);
}



export const DEVICE_COLORS = [
  "Black Titanium",
  "Natural Titanium",
  "White Titanium",
  "Desert Titanium",
];

export type FontOption = { name: string; stack: string };

const SYSTEM_STACK =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

/**
 * Curated fonts, offered above whatever is installed locally.
 *
 * Values are CSS stacks rather than utility classes because the picker also
 * accepts arbitrary families from the Local Font Access API, which Tailwind
 * cannot know about ahead of time.
 */
export const FONT_GROUPS: { label: string; fonts: FontOption[] }[] = [
  {
    label: "System",
    fonts: [
      { name: "System", stack: SYSTEM_STACK },
      { name: "System Serif", stack: "ui-serif, Georgia, Cambria, serif" },
      {
        name: "System Rounded",
        stack: "ui-rounded, 'SF Pro Rounded', system-ui, sans-serif",
      },
      {
        name: "System Mono",
        stack: "ui-monospace, SFMono-Regular, Menlo, monospace",
      },
    ],
  },
  {
    label: "Bundled",
    fonts: [
      { name: "Inter", stack: "var(--font-inter), Inter, sans-serif" },
      {
        name: "Funnel Sans",
        stack: "var(--font-funnel-sans), 'Funnel Sans', sans-serif",
      },
    ],
  },
];

const FONT_STACKS: Record<string, string> = Object.fromEntries(
  FONT_GROUPS.flatMap((group) =>
    group.fonts.map((font) => [font.name, font.stack]),
  ),
);

export const CURATED_FONTS = FONT_GROUPS.flatMap((group) => group.fonts).map(
  (font) => font.name,
);

/** Resolves a saved font name to a CSS stack, local families included. */
export function fontStack(name: string): string {
  return FONT_STACKS[name] ?? `"${name}", ${SYSTEM_STACK}`;
}

export const MEDIA_ASSET_CLASSES = [
  "bg-[#DED8FF]",
  "bg-[#FFE4C7]",
  "bg-[#D9F2EA]",
  "bg-[#D8E8FF]",
  "bg-[#FFE0EA]",
  "bg-[#ECECF0]",
];

/**
 * Bright, high-luminance backgrounds offered in the inspector.
 * Light grounds with dark headlines read best in the App Store grid, so the
 * presets stay above ~85% luminance while keeping real chroma.
 */
/** App Store Connect localisations offered for the slide copy. */
export const LOCALES: { id: string; name: string }[] = [
  { id: "en-US", name: "English (U.S.)" },
  { id: "en-GB", name: "English (U.K.)" },
  { id: "es-ES", name: "Spanish (Spain)" },
  { id: "es-MX", name: "Spanish (Mexico)" },
  { id: "fr-FR", name: "French" },
  { id: "de-DE", name: "German" },
  { id: "it-IT", name: "Italian" },
  { id: "pt-BR", name: "Portuguese (Brazil)" },
  { id: "nl-NL", name: "Dutch" },
  { id: "tr-TR", name: "Turkish" },
  { id: "ru-RU", name: "Russian" },
  { id: "ar-SA", name: "Arabic" },
  { id: "hi-IN", name: "Hindi" },
  { id: "id-ID", name: "Indonesian" },
  { id: "ja-JP", name: "Japanese" },
  { id: "ko-KR", name: "Korean" },
  { id: "zh-Hans", name: "Chinese (Simplified)" },
  { id: "zh-Hant", name: "Chinese (Traditional)" },
];

export const BASE_LOCALE = "en-US";

export function localeName(id: string): string {
  return LOCALES.find((locale) => locale.id === id)?.name ?? id;
}

export const BRIGHT_BACKGROUNDS: { name: string; hex: string }[] = [
  { name: "Sky", hex: "#CDE7FF" },
  { name: "Azure", hex: "#D8E4FF" },
  { name: "Lilac", hex: "#E0D7FF" },
  { name: "Violet", hex: "#EBE4FF" },
  { name: "Orchid", hex: "#F0DCFF" },
  { name: "Blush", hex: "#FFD6E4" },
  { name: "Rose", hex: "#FFCEDF" },
  { name: "Coral", hex: "#FFD9D2" },
  { name: "Peach", hex: "#FFDCC7" },
  { name: "Apricot", hex: "#FFD0B4" },
  { name: "Lemon", hex: "#FFF0BF" },
  { name: "Cream", hex: "#FFF3D9" },
  { name: "Lime", hex: "#E2F5C4" },
  { name: "Mint", hex: "#C8F2DF" },
  { name: "Seafoam", hex: "#DBF7E8" },
  { name: "Aqua", hex: "#C9EEF5" },
  { name: "Cloud", hex: "#F2F4F7" },
  { name: "White", hex: "#FFFFFF" },
];

export const BRAND_COLORS = [
  { name: "Primary", hex: "#0A84FF", swatchClass: "bg-[#0A84FF]" },
  { name: "Indigo", hex: "#5856D6", swatchClass: "bg-[#5856D6]" },
  { name: "Success", hex: "#34C759", swatchClass: "bg-[#34C759]" },
  { name: "Warm", hex: "#FF9F0A", swatchClass: "bg-[#FF9F0A]" },
];

export const ZOOM_STEPS = [25, 50, 72, 100, 150, 200];

export const INITIAL_STATE: EditorState = {
  tool: "screens",
  selectedScreenId: "daily-plan",
  canvasDeviceId: "iphone-69",
  screens: SCREENS,
  media: [],
  locale: "en-US",
  zoom: 72,
  canvasMode: "select",
  inspectorTab: "design",
  mediaTab: "uploads",
  activeTextStyleId: "display",
  previewOpen: false,
  exportOpen: false,
  exportDeviceIds: ["iphone-69", "iphone-65"],
  exportFormat: "png",
  exportNaming: true,
};
