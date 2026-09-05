import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Bookmark,
  Coffee,
  Contrast,
  Crop,
  Heart,
  MessageCircle,
  Search,
  Send,
  ShoppingBag,
  Star,
  Sun,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Category app screens used by the starter templates, authored at the same
 * 176x387 as the other mini screens and following the same language:
 * #F7F7F9 canvas, white cards, one gradient hero, tinted icon tiles.
 */
const SHELL =
  "flex h-[387px] w-[176px] flex-col gap-[9px] overflow-hidden rounded-t-[18px] bg-[#F7F7F9] p-[11px]";

function Title({ text, right }: { text: string; right?: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-between">
      <span className="text-[10px] font-bold text-[var(--ink)]">{text}</span>
      {right}
    </div>
  );
}

function Label({ text }: { text: string }) {
  return (
    <span className="shrink-0 text-[7px] font-bold text-[var(--ink)]">
      {text}
    </span>
  );
}

/* ------------------------------------------------------------ Finance ---- */

const LEDGER_ROWS: {
  name: string;
  meta: string;
  amount: string;
  icon: LucideIcon;
  tint: string;
  box: string;
  positive?: boolean;
}[] = [
  {
    name: "Salary",
    meta: "Acme Inc",
    amount: "+$4,200",
    icon: ArrowDownLeft,
    tint: "text-[#0E7C5A]",
    box: "bg-[#DFF3EA]",
    positive: true,
  },
  {
    name: "Blue Bottle",
    meta: "Coffee",
    amount: "−$6.40",
    icon: Coffee,
    tint: "text-[#8A6A3C]",
    box: "bg-[#F6EEDF]",
  },
  {
    name: "Rent",
    meta: "Housing",
    amount: "−$1,850",
    icon: ArrowUpRight,
    tint: "text-[#B4453C]",
    box: "bg-[#FBE7E4]",
  },
];

export function FinanceHome() {
  return (
    <div className={SHELL}>
      <Title
        text="Ledger"
        right={<Bell className="size-[10px] text-[var(--muted)]" />}
      />

      <div className="flex h-[92px] shrink-0 flex-col justify-center gap-[5px] rounded-[14px] bg-[linear-gradient(210deg,#0E7C5A_0%,#084C38_100%)] p-[12px]">
        <span className="text-[5px] font-bold tracking-[0.6px] text-[#FFFFFFAA]">
          TOTAL BALANCE
        </span>
        <span className="text-[18px] font-bold text-white">$12,480.20</span>
        <span className="flex items-center gap-[3px] text-[6px] text-[#FFFFFFCC]">
          <ArrowUpRight className="size-[7px]" />
          2.4% this month
        </span>
      </div>

      <div className="flex shrink-0 gap-[7px]">
        {[
          { label: "Income", value: "$5.2k", icon: ArrowDownLeft },
          { label: "Spent", value: "$3.1k", icon: Wallet },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-1 flex-col gap-[3px] rounded-[11px] bg-white p-[9px]"
          >
            <Icon className="size-[10px] text-[#0E7C5A]" />
            <span className="text-[11px] font-bold text-[var(--ink)]">
              {value}
            </span>
            <span className="text-[5px] text-[var(--muted)]">{label}</span>
          </div>
        ))}
      </div>

      <Label text="Recent" />

      <ul className="flex flex-col gap-[6px]">
        {LEDGER_ROWS.map(({ name, meta, amount, icon: Icon, tint, box, positive }) => (
          <li
            key={name}
            className="flex h-[36px] items-center gap-[7px] rounded-[10px] bg-white px-[8px]"
          >
            <span
              className={`flex size-[20px] shrink-0 items-center justify-center rounded-[6px] ${box}`}
            >
              <Icon className={`size-[9px] ${tint}`} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[6px] font-semibold text-[var(--ink)]">
                {name}
              </span>
              <span className="truncate text-[5px] text-[var(--muted)]">
                {meta}
              </span>
            </span>
            <span
              className={`shrink-0 text-[6px] font-bold ${
                positive ? "text-[#0E7C5A]" : "text-[var(--ink)]"
              }`}
            >
              {amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SPEND = [
  { name: "Housing", value: "$1,850", pct: "w-[86%]", bar: "bg-[#0E7C5A]" },
  { name: "Food", value: "$420", pct: "w-[42%]", bar: "bg-[#3FA98A]" },
  { name: "Transport", value: "$180", pct: "w-[24%]", bar: "bg-[#7CC7B1]" },
  { name: "Fun", value: "$96", pct: "w-[14%]", bar: "bg-[#B5E0D3]" },
];

export function FinanceDetail() {
  return (
    <div className={SHELL}>
      <Title text="Spending" />

      <div className="flex h-[86px] shrink-0 items-center justify-between rounded-[14px] bg-[#E4F3EC] p-[12px]">
        <span className="flex flex-col gap-[3px]">
          <span className="text-[5px] font-bold tracking-[0.5px] text-[#0E7C5A]">
            THIS MONTH
          </span>
          <span className="text-[19px] font-bold text-[#0A4A38]">$2,546</span>
          <span className="text-[5px] text-[#3E7566]">of $3,200 budget</span>
        </span>
        <svg viewBox="0 0 56 56" className="size-[56px]">
          <circle
            cx="28"
            cy="28"
            r="23"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="7"
          />
          <circle
            cx="28"
            cy="28"
            r="23"
            fill="none"
            stroke="#0E7C5A"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 23 * 0.79} ${2 * Math.PI * 23}`}
            transform="rotate(-90 28 28)"
          />
        </svg>
      </div>

      <Label text="By category" />

      <ul className="flex flex-col gap-[8px]">
        {SPEND.map(({ name, value, pct, bar }) => (
          <li
            key={name}
            className="flex flex-col gap-[4px] rounded-[10px] bg-white p-[9px]"
          >
            <span className="flex items-center justify-between">
              <span className="text-[6px] font-semibold text-[var(--ink)]">
                {name}
              </span>
              <span className="text-[6px] font-bold text-[var(--ink)]">
                {value}
              </span>
            </span>
            <span className="h-[4px] w-full rounded-full bg-[#EDEFF1]">
              <span className={`block h-full rounded-full ${pct} ${bar}`} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------- Productivity ---- */

const TASKS = [
  { name: "Finish launch brief", meta: "Today · 2pm", done: true },
  { name: "Review Q3 numbers", meta: "Today · 4pm", done: true },
  { name: "Call with design", meta: "Tomorrow", done: false },
  { name: "Ship changelog", meta: "Friday", done: false },
];

export function TasksHome() {
  return (
    <div className={SHELL}>
      <Title
        text="Today"
        right={<span className="size-[18px] rounded-full bg-[#DDDCFF]" />}
      />

      <div className="flex h-[76px] shrink-0 flex-col justify-center gap-[6px] rounded-[14px] bg-[linear-gradient(210deg,#5E5CE6_0%,#8E7BFF_100%)] p-[12px]">
        <span className="text-[5px] font-bold tracking-[0.6px] text-[#FFFFFFAA]">
          TODAY’S PROGRESS
        </span>
        <span className="text-[15px] font-bold text-white">4 of 9 done</span>
        <span className="h-[5px] w-full rounded-full bg-[#FFFFFF30]">
          <span className="block h-full w-[44%] rounded-full bg-white" />
        </span>
      </div>

      <Label text="Up next" />

      <ul className="flex flex-col gap-[6px]">
        {TASKS.map(({ name, meta, done }) => (
          <li
            key={name}
            className="flex h-[38px] items-center gap-[8px] rounded-[10px] bg-white px-[9px]"
          >
            <span
              className={`flex size-[13px] shrink-0 items-center justify-center rounded-full border ${
                done ? "border-[#5E5CE6] bg-[#5E5CE6]" : "border-[#C9C9D1]"
              }`}
            >
              {done ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="size-[7px]"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : null}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={`truncate text-[6px] font-semibold ${
                  done
                    ? "text-[var(--muted)] line-through"
                    : "text-[var(--ink)]"
                }`}
              >
                {name}
              </span>
              <span className="truncate text-[5px] text-[var(--muted)]">
                {meta}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const BOARD = [
  { stage: "To do", count: "3", tint: "bg-[#EFEFFF]", dot: "bg-[#5E5CE6]" },
  { stage: "In progress", count: "2", tint: "bg-[#FFF3E0]", dot: "bg-[#FF9F0A]" },
  { stage: "Done", count: "7", tint: "bg-[#E6F8E3]", dot: "bg-[#34C759]" },
];

export function TasksDetail() {
  return (
    <div className={SHELL}>
      <Title text="Launch plan" />
      <span className="shrink-0 text-[5px] text-[var(--muted)]">
        12 tasks · 3 collaborators
      </span>

      <div className="flex shrink-0 gap-[6px]">
        {BOARD.map(({ stage, count, tint, dot }) => (
          <div
            key={stage}
            className={`flex flex-1 flex-col gap-[3px] rounded-[10px] p-[8px] ${tint}`}
          >
            <span className={`size-[5px] rounded-full ${dot}`} />
            <span className="text-[12px] font-bold text-[var(--ink)]">
              {count}
            </span>
            <span className="text-[5px] text-[var(--muted)]">{stage}</span>
          </div>
        ))}
      </div>

      <Label text="In progress" />

      <ul className="flex flex-col gap-[7px]">
        {[
          { name: "App Store assets", meta: "Due Thu", pct: "w-[70%]" },
          { name: "Pricing page copy", meta: "Due Fri", pct: "w-[40%]" },
          { name: "Press kit", meta: "Next week", pct: "w-[15%]" },
        ].map(({ name, meta, pct }) => (
          <li
            key={name}
            className="flex flex-col gap-[5px] rounded-[11px] bg-white p-[9px]"
          >
            <span className="flex items-center justify-between">
              <span className="truncate text-[6px] font-semibold text-[var(--ink)]">
                {name}
              </span>
              <span className="shrink-0 text-[5px] text-[var(--muted)]">
                {meta}
              </span>
            </span>
            <span className="h-[4px] w-full rounded-full bg-[#EFEFF2]">
              <span className={`block h-full rounded-full bg-[#5E5CE6] ${pct}`} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------- Social ---- */

const STORY_TINTS = [
  "bg-[#FFD3DE]",
  "bg-[#D8E4FF]",
  "bg-[#FFE8C7]",
  "bg-[#D9F5E6]",
  "bg-[#EADCFF]",
];

export function SocialHome() {
  return (
    <div className={SHELL}>
      <Title
        text="Circle"
        right={<Send className="size-[10px] text-[var(--muted)]" />}
      />

      <div className="flex shrink-0 justify-between">
        {STORY_TINTS.map((tint, index) => (
          <span
            key={index}
            className={`size-[26px] rounded-full border-2 border-[#FF3B6B] ${tint}`}
          />
        ))}
      </div>

      <div className="flex flex-col gap-[7px] rounded-[13px] bg-white p-[9px]">
        <span className="flex items-center gap-[6px]">
          <span className="size-[16px] rounded-full bg-[#FFD3DE]" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[6px] font-bold text-[var(--ink)]">
              maya.builds
            </span>
            <span className="truncate text-[5px] text-[var(--muted)]">
              San Francisco
            </span>
          </span>
        </span>

        <span className="block h-[104px] w-full rounded-[10px] bg-[linear-gradient(210deg,#FF9AB5_0%,#FF3B6B_60%,#C9184A_100%)]" />

        <span className="flex items-center gap-[9px]">
          <Heart className="size-[11px] text-[#FF3B6B]" />
          <MessageCircle className="size-[11px] text-[var(--muted)]" />
          <Send className="size-[11px] text-[var(--muted)]" />
          <span className="flex-1" />
          <Bookmark className="size-[11px] text-[var(--muted)]" />
        </span>

        <span className="text-[5px] font-semibold text-[var(--ink)]">
          2,481 likes
        </span>
        <span className="text-[5px] leading-[1.5] text-[var(--muted)]">
          Golden hour on the coast. Swipe for the full set →
        </span>
      </div>
    </div>
  );
}

export function SocialDetail() {
  return (
    <div className={SHELL}>
      <div className="flex shrink-0 flex-col items-center gap-[5px] pt-[4px]">
        <span className="size-[44px] rounded-full bg-[linear-gradient(210deg,#FF9AB5_0%,#FF3B6B_100%)]" />
        <span className="text-[10px] font-bold text-[var(--ink)]">
          Maya Chen
        </span>
        <span className="text-[5px] text-[var(--muted)]">@maya.builds</span>
      </div>

      <div className="flex shrink-0 justify-between rounded-[12px] bg-white px-[12px] py-[9px]">
        {[
          ["248", "Posts"],
          ["12.4k", "Followers"],
          ["318", "Following"],
        ].map(([value, label]) => (
          <span key={label} className="flex flex-col items-center gap-[2px]">
            <span className="text-[10px] font-bold text-[var(--ink)]">
              {value}
            </span>
            <span className="text-[5px] text-[var(--muted)]">{label}</span>
          </span>
        ))}
      </div>

      <span className="shrink-0 text-[5px] leading-[1.5] text-[var(--muted)]">
        Designer & photographer. Building small things carefully.
      </span>

      <div className="flex shrink-0 gap-[6px]">
        <span className="flex h-[24px] flex-1 items-center justify-center rounded-[8px] bg-[#FF3B6B] text-[6px] font-bold text-white">
          Follow
        </span>
        <span className="flex h-[24px] flex-1 items-center justify-center rounded-[8px] bg-white text-[6px] font-semibold text-[var(--ink)]">
          Message
        </span>
      </div>

      <div className="grid grid-cols-3 gap-[4px]">
        {[
          "bg-[#FFD3DE]",
          "bg-[#FFB3C6]",
          "bg-[#FF8FA8]",
          "bg-[#EADCFF]",
          "bg-[#D8E4FF]",
          "bg-[#FFE8C7]",
        ].map((tint, index) => (
          <span key={index} className={`h-[38px] rounded-[6px] ${tint}`} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------- Photo & Video --- */

export function PhotoHome() {
  return (
    <div className={SHELL}>
      <Title
        text="Library"
        right={<Search className="size-[10px] text-[var(--muted)]" />}
      />

      <div className="flex shrink-0 gap-[5px]">
        {["All", "Recents", "Edited", "Favourites"].map((chip, index) => (
          <span
            key={chip}
            className={`rounded-full px-[7px] py-[4px] text-[5px] font-semibold ${
              index === 0
                ? "bg-[#1D1D1F] text-white"
                : "bg-white text-[var(--muted)]"
            }`}
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-[5px]">
        {[
          "bg-[linear-gradient(200deg,#F5A524_0%,#C2410C_100%)]",
          "bg-[linear-gradient(200deg,#8ECAE6_0%,#219EBC_100%)]",
          "bg-[linear-gradient(200deg,#CDB4DB_0%,#7B2CBF_100%)]",
          "bg-[linear-gradient(200deg,#B7E4C7_0%,#2D6A4F_100%)]",
          "bg-[linear-gradient(200deg,#FFB4A2_0%,#B5651D_100%)]",
          "bg-[linear-gradient(200deg,#C9CBCF_0%,#4B5057_100%)]",
        ].map((tint, index) => (
          <span key={index} className={`h-[72px] rounded-[9px] ${tint}`} />
        ))}
      </div>
    </div>
  );
}

const EDITS: { label: string; value: string; icon: LucideIcon; pct: string }[] = [
  { label: "Exposure", value: "+18", icon: Sun, pct: "w-[64%]" },
  { label: "Contrast", value: "+32", icon: Contrast, pct: "w-[74%]" },
  { label: "Crop", value: "4:5", icon: Crop, pct: "w-[38%]" },
];

export function PhotoDetail() {
  return (
    <div className={SHELL}>
      <Title text="Edit" />

      <span className="block h-[142px] shrink-0 rounded-[12px] bg-[linear-gradient(200deg,#F5A524_0%,#C2410C_55%,#3F1D0B_100%)]" />

      <Label text="Adjust" />

      <ul className="flex flex-col gap-[7px]">
        {EDITS.map(({ label, value, icon: Icon, pct }) => (
          <li
            key={label}
            className="flex flex-col gap-[5px] rounded-[10px] bg-white p-[9px]"
          >
            <span className="flex items-center gap-[6px]">
              <Icon className="size-[9px] text-[#C2410C]" />
              <span className="flex-1 text-[6px] font-semibold text-[var(--ink)]">
                {label}
              </span>
              <span className="text-[6px] font-bold text-[var(--ink)]">
                {value}
              </span>
            </span>
            <span className="h-[3px] w-full rounded-full bg-[#EFEFF2]">
              <span className={`block h-full rounded-full bg-[#F5A524] ${pct}`} />
            </span>
          </li>
        ))}
      </ul>

      <span className="flex h-[26px] shrink-0 items-center justify-center rounded-[9px] bg-[#1D1D1F] text-[6px] font-bold text-white">
        Export photo
      </span>
    </div>
  );
}

/* ----------------------------------------------------------- Shopping ---- */

const PRODUCTS = [
  { name: "Linen shirt", price: "$68", tint: "bg-[#E8E2D8]" },
  { name: "Canvas tote", price: "$32", tint: "bg-[#D9E4DD]" },
  { name: "Wool cap", price: "$24", tint: "bg-[#EADFD3]" },
  { name: "Runner", price: "$115", tint: "bg-[#DDE3EC]" },
];

export function ShopHome() {
  return (
    <div className={SHELL}>
      <div className="flex h-[24px] shrink-0 items-center gap-[6px] rounded-[9px] bg-white px-[8px]">
        <Search className="size-[9px] text-[var(--muted)]" />
        <span className="text-[6px] text-[var(--muted)]">Search the shop</span>
      </div>

      <div className="flex shrink-0 gap-[5px]">
        {["New", "Men", "Women", "Home"].map((chip, index) => (
          <span
            key={chip}
            className={`rounded-full px-[8px] py-[4px] text-[5px] font-semibold ${
              index === 0
                ? "bg-[#FF6B35] text-white"
                : "bg-white text-[var(--muted)]"
            }`}
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-[7px]">
        {PRODUCTS.map(({ name, price, tint }) => (
          <span
            key={name}
            className="flex flex-col gap-[4px] rounded-[11px] bg-white p-[7px]"
          >
            <span className={`block h-[62px] rounded-[8px] ${tint}`} />
            <span className="truncate text-[6px] font-semibold text-[var(--ink)]">
              {name}
            </span>
            <span className="text-[6px] font-bold text-[#FF6B35]">{price}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ShopDetail() {
  return (
    <div className={SHELL}>
      <span className="block h-[132px] shrink-0 rounded-[12px] bg-[#E8E2D8]" />

      <div className="flex shrink-0 items-start justify-between">
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="truncate text-[10px] font-bold text-[var(--ink)]">
            Linen shirt
          </span>
          <span className="flex items-center gap-[3px] text-[5px] text-[var(--muted)]">
            <Star className="size-[6px] text-[#FF9F0A]" />
            4.8 · 212 reviews
          </span>
        </span>
        <span className="text-[13px] font-bold text-[#FF6B35]">$68</span>
      </div>

      <Label text="Size" />

      <div className="flex shrink-0 gap-[5px]">
        {["XS", "S", "M", "L", "XL"].map((size, index) => (
          <span
            key={size}
            className={`flex h-[22px] flex-1 items-center justify-center rounded-[7px] text-[6px] font-semibold ${
              index === 2
                ? "bg-[#1D1D1F] text-white"
                : "bg-white text-[var(--ink)]"
            }`}
          >
            {size}
          </span>
        ))}
      </div>

      <span className="flex shrink-0 items-center gap-[6px] rounded-[10px] bg-[#FFF1EB] p-[9px]">
        <Truck className="size-[10px] shrink-0 text-[#FF6B35]" />
        <span className="text-[5px] leading-[1.4] text-[#9A4A22]">
          Free delivery Thursday · returns within 30 days
        </span>
      </span>

      <span className="flex h-[28px] shrink-0 items-center justify-center gap-[5px] rounded-[10px] bg-[#FF6B35] text-[6px] font-bold text-white">
        <ShoppingBag className="size-[9px]" />
        Add to bag
      </span>
    </div>
  );
}
