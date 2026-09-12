export type ToolId = "screens" | "text" | "media" | "shapes" | "brand" | "layers";
export type Align = "left" | "center" | "right";
export type AppScreenKind =
  | "today"
  | "plan"
  | "streak"
  | "insights"
  | "focus"
  | "upgrade"
  | "finance-home"
  | "finance-detail"
  | "tasks-home"
  | "tasks-detail"
  | "social-home"
  | "social-detail"
  | "photo-home"
  | "photo-detail"
  | "shop-home"
  | "shop-detail";
export type ExportFormat = "png" | "jpeg";
export type CanvasMode = "select" | "hand";
export type InspectorTab = "design" | "animate";
export type MediaTab = "uploads" | "app-screens";

/** Slide copy that can be localised. App UI is never translated. */
export type LocalizedText = {
  headline?: string;
  subhead?: string;
  brandChip?: string;
};

export type MediaAsset = {
  id: string;
  name: string;
  /** Downscaled data URL, so it persists and exports. */
  dataUrl: string;
};

/** Freeform objects use authored artboard pixels; arrays run back to front. */
export type Layer = {
  id: string;
  name: string;
  kind: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  plane: "back" | "front";
  text: string;
  fontSize: number;
  color: string;
  fill: string;
  radius: number;
  shadow: boolean;
  mediaId: string | null;
  fit: "contain" | "cover";
  imageScale?: number;
  /** Optional typography overrides for precisely authored layouts. */
  fontFamily?: string;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  padding?: number;
};

export type Screen = {
  /** Optional for compatibility with existing projects and CLI files. */
  layers?: Layer[];
  backgroundStyle?: "gradient" | "solid";
  id: string;
  number: string;
  name: string;
  /** Uppercase label drawn on the list thumbnail. */
  miniTitle: string;
  /** Small brand pill above the headline. */
  brandChip: string;
  brandChipVisible: boolean;
  /** Artboard headline. `\n` is a hard line break. */
  headline: string;
  subhead: string;
  /** Drives the thumbnail, the artboard gradient and the preview card. */
  bg: string;
  /** Which mini app screen renders inside the device. */
  app: AppScreenKind;
  /** An uploaded screenshot shown in the device instead of the mock UI. */
  mediaId: string | null;
  /**
   * Per-locale overrides for the slide copy, keyed by locale id. The base
   * `headline`/`subhead`/`brandChip` fields are the en-US source and the
   * fallback for any locale without an entry.
   */
  translations: Record<string, LocalizedText>;
  /** Headline size in App Store pixels (rendered at ARTBOARD_SCALE). */
  fontSize: number;
  /** Subtitle size, in the same authored units as fontSize. */
  subheadSize: number;
  align: Align;
  headlineVisible: boolean;
  deviceVisible: boolean;
  /** iOS chrome drawn over the screen: status bar, island, home indicator. */
  deviceChrome: boolean;
  deviceFrame: string;
  deviceColor: string;
  /** Device scale as a percentage. */
  deviceScale: number;
  /** Device offset from its laid-out position, in artboard pixels. */
  deviceX: number;
  deviceY: number;
  /** Headline + subhead offset, in artboard pixels. */
  textX: number;
  textY: number;
  fontFamily: string;
  /** Ids from SHAPE_DECORATIONS that are switched on for this screen. */
  decorations: string[];
  /** Id from BASIC_SHAPES drawn as a soft background accent, if any. */
  accentShape: string | null;
};

export type ExportDevice = {
  id: string;
  name: string;
  width: number;
  height: number;
};

export type EditorState = {
  tool: ToolId;
  selectedScreenId: string;
  /** Export target the canvas is sized against. */
  canvasDeviceId: string;
  screens: Screen[];
  media: MediaAsset[];
  /** Locale the slide copy is shown and edited in. */
  locale: string;
  zoom: number;
  canvasMode: CanvasMode;
  inspectorTab: InspectorTab;
  mediaTab: MediaTab;
  activeTextStyleId: string;
  previewOpen: boolean;
  exportOpen: boolean;
  exportDeviceIds: string[];
  exportFormat: ExportFormat;
  exportNaming: boolean;
};
