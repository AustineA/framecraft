import type { DeviceKind } from "@/lib/editor-data";
import type { AppScreenKind } from "@/lib/editor-types";

import {
  FinanceDetail,
  FinanceHome,
  PhotoDetail,
  PhotoHome,
  ShopDetail,
  ShopHome,
  SocialDetail,
  SocialHome,
  TasksDetail,
  TasksHome,
} from "./category-screens";
import {
  IpadFocus,
  IpadInsights,
  IpadPlan,
  IpadStreak,
  IpadToday,
  IpadUpgrade,
} from "./ipad-screens";
import {
  MiniFocus,
  MiniInsights,
  MiniPlan,
  MiniStreak,
  MiniToday,
  MiniUpgrade,
} from "./mini-screens";
import { TodayLarge } from "./today-large";

const PHONE = {
  today: MiniToday,
  plan: MiniPlan,
  streak: MiniStreak,
  insights: MiniInsights,
  focus: MiniFocus,
  upgrade: MiniUpgrade,
  "finance-home": FinanceHome,
  "finance-detail": FinanceDetail,
  "tasks-home": TasksHome,
  "tasks-detail": TasksDetail,
  "social-home": SocialHome,
  "social-detail": SocialDetail,
  "photo-home": PhotoHome,
  "photo-detail": PhotoDetail,
  "shop-home": ShopHome,
  "shop-detail": ShopDetail,
} satisfies Record<AppScreenKind, () => React.JSX.Element>;

/**
 * Only the Habitly screens have bespoke iPad layouts; anything without one
 * falls back to the phone design scaled to the tablet display.
 */
const TABLET: Partial<Record<AppScreenKind, () => React.JSX.Element>> = {
  today: IpadToday,
  plan: IpadPlan,
  streak: IpadStreak,
  insights: IpadInsights,
  focus: IpadFocus,
  upgrade: IpadUpgrade,
};

/** Authored width of each source design. */
const BASE = { ipad: 480, phoneLarge: 254, phoneMini: 176 };

/** Each screen's canvas colour, used to fill the status-bar safe area too. */
export function appScreenBackground(
  kind: AppScreenKind,
  deviceKind: DeviceKind = "iphone",
): string {
  if (deviceKind === "ipad" && TABLET[kind]) return "#F7F7F9";
  return kind === "today" ? "#F5F5F7" : "#F7F7F9";
}

/**
 * Renders an app screen at the chosen device's display width by scaling its
 * authored design. iPads get purpose-built sidebar layouts; on iPhone,
 * `today` has a dedicated full-size layout and the rest scale up from the
 * preview-sized originals.
 */
export function AppScreen({
  kind,
  screenWidth,
  deviceKind = "iphone",
  imageUrl,
}: {
  kind: AppScreenKind;
  screenWidth: number;
  deviceKind?: DeviceKind;
  /** An uploaded screenshot, shown instead of the mock app UI. */
  imageUrl?: string;
}) {
  if (imageUrl) {
    return (
      // Local data URL, so next/image optimisation does not apply.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className="h-full w-full object-cover object-top"
      />
    );
  }

  const tablet = deviceKind === "ipad" ? TABLET[kind] : undefined;
  const usePhoneLarge = !tablet && kind === "today";

  const Component = tablet ?? (usePhoneLarge ? TodayLarge : PHONE[kind]);
  const base = tablet
    ? BASE.ipad
    : usePhoneLarge
      ? BASE.phoneLarge
      : BASE.phoneMini;

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{ backgroundColor: appScreenBackground(kind, deviceKind) }}
    >
      <div
        className="origin-top-left"
        style={{ width: base, transform: `scale(${screenWidth / base})` }}
      >
        <Component />
      </div>
    </div>
  );
}
