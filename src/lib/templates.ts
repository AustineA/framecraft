import { ITEMLIST_PROJECT } from "./itemlist-template";
import { INITIAL_STATE, SCREENS } from "./editor-data";
import type { AppScreenKind, Screen } from "./editor-types";
import type { ProjectData } from "./projects";

export type Template = {
  id: string;
  /** App Store category the starter set is written for. */
  category: string;
  name: string;
  tagline: string;
  /** Accent used on the template card in the start screen. */
  accent: string;
  data: ProjectData;
};

type Slide = {
  name: string;
  miniTitle: string;
  headline: string;
  subhead: string;
  bg: string;
  app: AppScreenKind;
};

/** Fills a template's slides out into full screens on the shared defaults. */
function build(
  brand: string,
  font: string,
  slides: Slide[],
): ProjectData {
  const base = SCREENS[0];
  const screens: Screen[] = slides.map((slide, index) => ({
    ...base,
    id: `${brand.toLowerCase().replace(/\W+/g, "-")}-${index + 1}`,
    number: String(index + 1).padStart(2, "0"),
    name: slide.name,
    miniTitle: slide.miniTitle,
    brandChip: brand.toUpperCase(),
    brandChipVisible: true,
    headline: slide.headline,
    subhead: slide.subhead,
    bg: slide.bg,
    app: slide.app,
    mediaId: null,
    fontFamily: font,
    decorations: [],
    accentShape: null,
    deviceX: 0,
    deviceY: 0,
    textX: 0,
    textY: 0,
  }));

  return { ...INITIAL_STATE, screens, media: [], selectedScreenId: screens[0].id };
}

export const TEMPLATES: Template[] = [
  {
    id: "itemlist-reference",
    category: "Lifestyle · Plant care",
    name: "PlantPal — illustrated plant care",
    tagline: "A four-screen plant-care story with spanning artwork, callouts and cropped phones.",
    accent: "#B4C99A",
    data: ITEMLIST_PROJECT,
  },
  {
    id: "health",
    category: "Health & Fitness",
    name: "Habitly",
    tagline: "Habit tracking with a calm, routine-led story.",
    accent: "#0A84FF",
    data: { ...INITIAL_STATE, screens: SCREENS, media: [] },
  },
  {
    id: "finance",
    category: "Finance",
    name: "Ledger",
    tagline: "Balances, spending and budgets in a confident green.",
    accent: "#0E7C5A",
    data: build("Ledger", "Inter", [
      {
        name: "Opening hook",
        miniTitle: "MONEY, CLEAR",
        headline: "Every account,\none clear view.",
        subhead: "Balances that update the moment you spend.",
        bg: "#C8F2DF",
        app: "finance-home",
      },
      {
        name: "Balances",
        miniTitle: "BALANCES",
        headline: "Know exactly\nwhere you stand.",
        subhead: "Cash, cards and savings side by side.",
        bg: "#E2F5C4",
        app: "finance-home",
      },
      {
        name: "Spending",
        miniTitle: "SPENDING",
        headline: "See where it\nactually goes.",
        subhead: "Categories that sort themselves.",
        bg: "#C9EEF5",
        app: "finance-detail",
      },
      {
        name: "Budgets",
        miniTitle: "BUDGETS",
        headline: "Budgets that\nbend, not break.",
        subhead: "Nudges before you overspend, not after.",
        bg: "#DBF7E8",
        app: "finance-detail",
      },
      {
        name: "Insights",
        miniTitle: "INSIGHTS",
        headline: "Spot the habit\nbehind the number.",
        subhead: "Trends across every month you have tracked.",
        bg: "#CDE7FF",
        app: "finance-home",
      },
      {
        name: "Upgrade",
        miniTitle: "GO PRO",
        headline: "Your whole\nfinancial picture.",
        subhead: "Unlimited accounts and forecasting.",
        bg: "#BFEFD8",
        app: "finance-detail",
      },
    ]),
  },
  {
    id: "productivity",
    category: "Productivity",
    name: "Stackly",
    tagline: "Tasks and projects with a focused violet system.",
    accent: "#5E5CE6",
    data: build("Stackly", "Inter", [
      {
        name: "Opening hook",
        miniTitle: "GET IT DONE",
        headline: "The plan that\nactually happens.",
        subhead: "Everything you owe today, in one list.",
        bg: "#E0D7FF",
        app: "tasks-home",
      },
      {
        name: "Today",
        miniTitle: "TODAY",
        headline: "Start the day\nalready sorted.",
        subhead: "Priorities set before you open your inbox.",
        bg: "#D5E2FF",
        app: "tasks-home",
      },
      {
        name: "Projects",
        miniTitle: "PROJECTS",
        headline: "Every project,\nhonestly tracked.",
        subhead: "Progress you can see at a glance.",
        bg: "#EBE4FF",
        app: "tasks-detail",
      },
      {
        name: "Teamwork",
        miniTitle: "TOGETHER",
        headline: "Share the plan,\nnot the chaos.",
        subhead: "Assign, comment and ship together.",
        bg: "#F0DCFF",
        app: "tasks-detail",
      },
      {
        name: "Focus",
        miniTitle: "DEEP WORK",
        headline: "Protect the hours\nthat matter.",
        subhead: "One task at a time, timed and tracked.",
        bg: "#D9E9FF",
        app: "tasks-home",
      },
      {
        name: "Upgrade",
        miniTitle: "GO PRO",
        headline: "Room for\neverything.",
        subhead: "Unlimited projects and automations.",
        bg: "#D6CCFF",
        app: "tasks-detail",
      },
    ]),
  },
  {
    id: "social",
    category: "Social Networking",
    name: "Circle",
    tagline: "Feeds and profiles in a warm, expressive coral.",
    accent: "#FF3B6B",
    data: build("Circle", "Inter", [
      {
        name: "Opening hook",
        miniTitle: "YOUR PEOPLE",
        headline: "A smaller,\nwarmer internet.",
        subhead: "Just the people you actually know.",
        bg: "#FFD6E4",
        app: "social-home",
      },
      {
        name: "Feed",
        miniTitle: "THE FEED",
        headline: "Everything you\nmissed today.",
        subhead: "In order, with nothing shuffled in.",
        bg: "#FFDCC7",
        app: "social-home",
      },
      {
        name: "Profile",
        miniTitle: "PROFILE",
        headline: "A profile that\nfeels like you.",
        subhead: "Your work, your way, beautifully laid out.",
        bg: "#FFE6EE",
        app: "social-detail",
      },
      {
        name: "Stories",
        miniTitle: "STORIES",
        headline: "Share the small\nmoments too.",
        subhead: "Gone in a day, saved if you want.",
        bg: "#F6D9FF",
        app: "social-home",
      },
      {
        name: "Community",
        miniTitle: "COMMUNITY",
        headline: "Find the people\nwho get it.",
        subhead: "Circles for everything you are into.",
        bg: "#FFE2D2",
        app: "social-detail",
      },
      {
        name: "Upgrade",
        miniTitle: "GO PREMIUM",
        headline: "More of what\nyou love.",
        subhead: "No ads, bigger uploads, custom themes.",
        bg: "#FFCEDF",
        app: "social-detail",
      },
    ]),
  },
  {
    id: "photo",
    category: "Photo & Video",
    name: "Aperture",
    tagline: "Warm amber and cream, built for editors and cameras.",
    accent: "#F5A524",
    data: build("Aperture", "Inter", [
      {
        name: "Opening hook",
        miniTitle: "SHOOT. EDIT.",
        headline: "Your photos,\nfinally finished.",
        subhead: "Pro edits without the pro learning curve.",
        bg: "#FFF0BF",
        app: "photo-detail",
      },
      {
        name: "Library",
        miniTitle: "LIBRARY",
        headline: "Every shot,\ninstantly findable.",
        subhead: "Organised the moment you import.",
        bg: "#FFDCC7",
        app: "photo-home",
      },
      {
        name: "Editing",
        miniTitle: "EDITING",
        headline: "Adjust it until\nit feels right.",
        subhead: "Precise sliders, live preview, no lag.",
        bg: "#FFF3D9",
        app: "photo-detail",
      },
      {
        name: "Presets",
        miniTitle: "PRESETS",
        headline: "One tap to your\nsignature look.",
        subhead: "Save any edit as a reusable preset.",
        bg: "#FFD3B0",
        app: "photo-home",
      },
      {
        name: "Export",
        miniTitle: "EXPORT",
        headline: "Ready for\nanywhere.",
        subhead: "Full quality, every aspect ratio.",
        bg: "#FFF6E0",
        app: "photo-detail",
      },
      {
        name: "Upgrade",
        miniTitle: "GO PRO",
        headline: "The full\ndarkroom.",
        subhead: "RAW, masking and unlimited presets.",
        bg: "#FFE2BD",
        app: "photo-home",
      },
    ]),
  },
  {
    id: "shopping",
    category: "Shopping",
    name: "Marketplace",
    tagline: "A bright retail set built around product and price.",
    accent: "#FF6B35",
    data: build("Marketplace", "Inter", [
      {
        name: "Opening hook",
        miniTitle: "SHOP BETTER",
        headline: "Things worth\nkeeping.",
        subhead: "Considered goods from makers you can trust.",
        bg: "#FFDCC7",
        app: "shop-home",
      },
      {
        name: "Browse",
        miniTitle: "BROWSE",
        headline: "Find it in\nseconds.",
        subhead: "Search that understands what you meant.",
        bg: "#FFEEDD",
        app: "shop-home",
      },
      {
        name: "Product",
        miniTitle: "DETAILS",
        headline: "Every detail\nbefore you buy.",
        subhead: "Real photos, real reviews, real sizing.",
        bg: "#FFF0BF",
        app: "shop-detail",
      },
      {
        name: "Delivery",
        miniTitle: "DELIVERY",
        headline: "Know exactly\nwhen it lands.",
        subhead: "Live tracking from checkout to door.",
        bg: "#FFD0B4",
        app: "shop-detail",
      },
      {
        name: "Favourites",
        miniTitle: "SAVED",
        headline: "Save it now,\ndecide later.",
        subhead: "We will tell you when the price drops.",
        bg: "#DDF3E4",
        app: "shop-home",
      },
      {
        name: "Upgrade",
        miniTitle: "GO PLUS",
        headline: "Free delivery,\nevery order.",
        subhead: "Plus early access to every drop.",
        bg: "#FFE5D2",
        app: "shop-detail",
      },
    ]),
  },
];

export function template(id: string): Template | undefined {
  return TEMPLATES.find((item) => item.id === id);
}
