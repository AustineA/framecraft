import {
  BookOpen,
  Brain,
  CalendarDays,
  ChartNoAxesColumn,
  Circle,
  CircleCheckBig,
  Droplets,
  Dumbbell,
  Flame,
  Pause,
  PenLine,
  Plus,
  Check,
  Settings2,
  Sparkles,
  Sun,
  Timer,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

/**
 * iPad layouts, authored at 480x640 — the 3:4 of a 1032x1376 pt display.
 *
 * These are not the phone screens stretched: iPadOS puts navigation in a
 * persistent sidebar and uses the extra width for side-by-side content, so
 * each screen is recomposed around that. The visual language is unchanged —
 * #F7F7F9 canvas, white cards, the same gradients, tinted icon tiles and
 * type hierarchy as the iPhone screens.
 */

const NAV: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "today", label: "Today", icon: Sun },
  { id: "plan", label: "Plan", icon: CalendarDays },
  { id: "streak", label: "Streaks", icon: Flame },
  { id: "insights", label: "Insights", icon: ChartNoAxesColumn },
  { id: "focus", label: "Focus", icon: Timer },
  { id: "upgrade", label: "Upgrade", icon: Sparkles },
];

function IpadShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-[640px] w-[480px] bg-[#F7F7F9]">
      <aside className="flex w-[152px] shrink-0 flex-col gap-5 border-r border-r-[#0000000F] bg-white px-4 py-6">
        <div className="flex items-center gap-[9px]">
          <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-[linear-gradient(210deg,#0A84FF_0%,#5856D6_100%)]">
            <Sparkles className="size-[15px] text-white" />
          </span>
          <span className="text-[17px] font-bold tracking-[-0.3px] text-[var(--ink)]">
            Habitly
          </span>
        </div>

        <nav className="flex flex-col gap-[3px]">
          {NAV.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <span
                key={id}
                className={`flex h-[36px] items-center gap-[10px] rounded-[10px] px-[10px] ${
                  isActive ? "bg-[#007AFF14]" : ""
                }`}
              >
                <Icon
                  className={`size-[16px] ${
                    isActive ? "text-[var(--purple)]" : "text-[var(--muted)]"
                  }`}
                />
                <span
                  className={`text-[14px] ${
                    isActive
                      ? "font-semibold text-[var(--purple)]"
                      : "font-medium text-[var(--muted)]"
                  }`}
                >
                  {label}
                </span>
              </span>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-[9px]">
          <span className="size-[30px] rounded-full bg-[#DCD7FF]" />
          <span className="flex flex-col">
            <span className="text-[13px] font-semibold text-[var(--ink)]">
              Alex
            </span>
            <span className="text-[11px] text-[var(--muted)]">Premium</span>
          </span>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col gap-[18px] p-[22px]">
        {children}
      </main>
    </div>
  );
}

function ScreenTitle({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between">
      <span className="flex flex-col gap-[3px]">
        <span className="text-[24px] font-bold tracking-[-0.5px] text-[var(--ink)]">
          {title}
        </span>
        {meta ? (
          <span className="text-[13px] text-[var(--muted)]">{meta}</span>
        ) : null}
      </span>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------- Today ---- */

const HABITS: {
  label: string;
  note: string;
  icon: LucideIcon;
  box: string;
  tint: string;
  done: boolean;
}[] = [
  {
    label: "Drink water",
    note: "6 of 8 glasses",
    icon: Droplets,
    box: "bg-[#E6F8E3]",
    tint: "text-[#34A853]",
    done: true,
  },
  {
    label: "Read 10 pages",
    note: "Finished at 7:40",
    icon: BookOpen,
    box: "bg-[#E6F8E3]",
    tint: "text-[#34A853]",
    done: true,
  },
  {
    label: "Workout",
    note: "Upper body · 40 min",
    icon: Dumbbell,
    box: "bg-[#EEEAFE]",
    tint: "text-[#5856D6]",
    done: false,
  },
  {
    label: "Meditate",
    note: "10 min wind down",
    icon: Brain,
    box: "bg-[#FFF0D6]",
    tint: "text-[#FF9F0A]",
    done: false,
  },
];

export function IpadToday() {
  return (
    <IpadShell active="today">
      <ScreenTitle title="Good morning, Alex" meta="Tuesday, June 18" />

      <div className="flex shrink-0 flex-col gap-[10px] rounded-[22px] bg-[linear-gradient(210deg,#0A84FF_0%,#5856D6_100%)] p-[22px]">
        <span className="text-[12px] font-bold tracking-[0.8px] text-[#FFFFFFAA]">
          TODAY’S PROGRESS
        </span>
        <span className="text-[34px] font-bold text-white">4 of 5 habits</span>
        <span className="h-[9px] w-full rounded-full bg-[#FFFFFF30]">
          <span className="block h-full w-[72%] rounded-full bg-white" />
        </span>
      </div>

      <span className="shrink-0 text-[18px] font-bold text-[var(--ink)]">
        Morning routine
      </span>

      <div className="grid grid-cols-2 gap-[12px]">
        {HABITS.map(({ label, note, icon: Icon, box, tint, done }) => (
          <div
            key={label}
            className="flex items-center gap-[12px] rounded-[16px] bg-white p-[14px]"
          >
            <span
              className={`flex size-[36px] shrink-0 items-center justify-center rounded-[11px] ${box}`}
            >
              <Icon className={`size-[17px] ${tint}`} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <span className="truncate text-[15px] font-semibold text-[var(--ink)]">
                {label}
              </span>
              <span className="truncate text-[12px] text-[var(--muted)]">
                {note}
              </span>
            </span>
            {done ? (
              <CircleCheckBig className="size-[18px] shrink-0 text-[#34C759]" />
            ) : (
              <Circle className="size-[18px] shrink-0 text-[#C7C7CC]" />
            )}
          </div>
        ))}
      </div>
    </IpadShell>
  );
}

/* --------------------------------------------------------------- Plan ---- */

const WEEK = [
  { letter: "M", day: "17" },
  { letter: "T", day: "18", active: true },
  { letter: "W", day: "19" },
  { letter: "T", day: "20" },
  { letter: "F", day: "21" },
  { letter: "S", day: "22" },
  { letter: "S", day: "23" },
];

const SCHEDULE = [
  { time: "7:00", name: "Morning reset", meta: "20 min", bar: "bg-[#5856D6]" },
  { time: "12:30", name: "Walk outside", meta: "30 min", bar: "bg-[#34C759]" },
  { time: "18:00", name: "Read & reflect", meta: "25 min", bar: "bg-[#FF9F0A]" },
  { time: "21:30", name: "Wind down", meta: "15 min", bar: "bg-[#0A84FF]" },
];

export function IpadPlan() {
  return (
    <IpadShell active="plan">
      <ScreenTitle
        title="Your day"
        meta="June 2026"
        action={
          <span className="flex size-[34px] items-center justify-center rounded-full bg-[var(--purple)]">
            <Plus className="size-[16px] text-white" />
          </span>
        }
      />

      <div className="flex shrink-0 justify-between gap-[8px]">
        {WEEK.map(({ letter, day, active }) => (
          <span
            key={day}
            className={`flex h-[62px] flex-1 flex-col items-center justify-center gap-[4px] rounded-[14px] ${
              active ? "bg-[var(--purple)]" : "bg-white"
            }`}
          >
            <span
              className={`text-[11px] ${active ? "text-[#FFFFFFAA]" : "text-[var(--muted)]"}`}
            >
              {letter}
            </span>
            <span
              className={`text-[16px] font-bold ${active ? "text-white" : "text-[var(--ink)]"}`}
            >
              {day}
            </span>
          </span>
        ))}
      </div>

      <span className="shrink-0 text-[18px] font-bold text-[var(--ink)]">
        Today’s schedule
      </span>

      <div className="flex flex-col gap-[10px]">
        {SCHEDULE.map(({ time, name, meta, bar }) => (
          <div
            key={name}
            className="flex h-[58px] items-center gap-[14px] rounded-[16px] bg-white px-[16px]"
          >
            <span className="w-[42px] shrink-0 text-[13px] font-semibold text-[var(--muted)]">
              {time}
            </span>
            <span className={`h-[32px] w-[4px] shrink-0 rounded-[2px] ${bar}`} />
            <span className="min-w-0 flex-1 truncate text-[16px] font-semibold text-[var(--ink)]">
              {name}
            </span>
            <span className="shrink-0 text-[12px] text-[var(--muted)]">
              {meta}
            </span>
          </div>
        ))}
      </div>
    </IpadShell>
  );
}

/* ------------------------------------------------------------- Streak ---- */

/** Weeks 1-2 complete, week 3 partial, the rest still ahead. */
const CALENDAR = [7, 7, 4, 0, 0];

export function IpadStreak() {
  return (
    <IpadShell active="streak">
      <ScreenTitle title="Your streak" meta="Keep the chain going" />

      <div className="flex shrink-0 gap-[14px]">
        <div className="flex w-[150px] shrink-0 flex-col items-center justify-center gap-[6px] rounded-[22px] bg-[linear-gradient(200deg,#FF9F0A_0%,#FF6B00_100%)] p-[18px]">
          <Flame className="size-[38px] text-white" />
          <span className="text-[30px] font-bold text-white">18</span>
          <span className="text-[13px] font-semibold text-[#FFFFFFCC]">
            days
          </span>
          <span className="text-[11px] text-[#FFFFFFAA]">Best: 24</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[10px] rounded-[20px] bg-white p-[16px]">
          <span className="text-[15px] font-bold text-[var(--ink)]">June</span>
          <div className="flex flex-col gap-[7px]">
            {CALENDAR.map((filled, week) => (
              <div key={week} className="flex justify-between gap-[6px]">
                {Array.from({ length: 7 }, (_, day) => (
                  <span
                    key={day}
                    className={`flex h-[26px] flex-1 items-center justify-center rounded-[8px] ${
                      day < filled ? "bg-[#FFF0D6]" : "bg-[#F2F2F4]"
                    }`}
                  >
                    {day < filled ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FF8A00"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-[12px]"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : null}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-[16px] bg-[#FFF5E5] px-[18px] py-[14px]">
        <span className="text-[14px] font-semibold text-[#9B5A00]">
          Consistency is becoming your superpower.
        </span>
      </div>
    </IpadShell>
  );
}

/* ----------------------------------------------------------- Insights ---- */

const BARS = [
  { day: "M", barClass: "h-[46%] bg-[#CDEBE6]" },
  { day: "T", barClass: "h-[64%] bg-[#CDEBE6]" },
  { day: "W", barClass: "h-[78%] bg-[#CDEBE6]" },
  { day: "T", barClass: "h-[53%] bg-[#CDEBE6]" },
  { day: "F", barClass: "h-[74%] bg-[#30B0C7]" },
  { day: "S", barClass: "h-[68%] bg-[#CDEBE6]" },
  { day: "S", barClass: "h-[38%] bg-[#CDEBE6]" },
];

const METRICS = [
  { value: "12", label: "habits done" },
  { value: "4.2h", label: "focus time" },
  { value: "86%", label: "completion" },
];

function CompletionRing() {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 72 72" className="size-[72px]">
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="9"
      />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#30B0C7"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${(circumference * 310) / 360} ${circumference}`}
        transform="rotate(-90 36 36)"
      />
    </svg>
  );
}

export function IpadInsights() {
  return (
    <IpadShell active="insights">
      <ScreenTitle
        title="Insights"
        meta="This week"
        action={
          <span className="rounded-full bg-[#E0F5F0] px-[14px] py-[7px] text-[12px] font-semibold text-[#278C82]">
            Jun 17 – 23
          </span>
        }
      />

      <div className="flex shrink-0 gap-[14px]">
        <div className="flex w-[168px] shrink-0 items-center justify-between rounded-[20px] bg-[#E0F5F0] p-[18px]">
          <span className="flex flex-col gap-[4px]">
            <span className="text-[11px] font-bold tracking-[0.6px] text-[#278C82]">
              COMPLETION
            </span>
            <span className="text-[30px] font-bold text-[#167B72]">86%</span>
          </span>
          <CompletionRing />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[10px] rounded-[20px] bg-white p-[16px]">
          <span className="text-[15px] font-bold text-[var(--ink)]">
            Daily activity
          </span>
          <div className="flex h-[92px] items-end justify-between gap-[8px]">
            {BARS.map(({ day, barClass }, index) => (
              <span
                key={`${day}-${index}`}
                className="flex h-full flex-1 flex-col items-center justify-end gap-[6px]"
              >
                <span className={`w-full rounded-[6px] ${barClass}`} />
                <span className="text-[11px] text-[var(--muted)]">{day}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-[14px]">
        {METRICS.map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-1 flex-col gap-[4px] rounded-[16px] bg-white p-[16px]"
          >
            <span className="text-[24px] font-bold text-[var(--ink)]">
              {value}
            </span>
            <span className="text-[12px] text-[var(--muted)]">{label}</span>
          </div>
        ))}
      </div>
    </IpadShell>
  );
}

/* -------------------------------------------------------------- Focus ---- */

export function IpadFocus() {
  return (
    <IpadShell active="focus">
      <ScreenTitle
        title="Focus"
        meta="Deep work session"
        action={<Settings2 className="size-[18px] text-[var(--muted)]" />}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-[10px] rounded-[24px] bg-[linear-gradient(210deg,#FF375F_0%,#FF6482_100%)] p-[24px]">
        <span className="text-[12px] font-bold tracking-[1px] text-[#FFFFFFAA]">
          DEEP WORK
        </span>
        <span className="text-[62px] leading-none font-bold tracking-[-2px] text-white">
          24:18
        </span>
        <span className="text-[14px] text-[#FFFFFFAA]">of 30 minutes</span>
        <span className="mt-[6px] flex size-[52px] items-center justify-center rounded-full bg-white">
          <Pause className="size-[20px] text-[#FF375F]" />
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-[14px] rounded-[18px] bg-white p-[16px]">
        <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[13px] bg-[#FFE6EC]">
          <PenLine className="size-[18px] text-[#FF375F]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="truncate text-[16px] font-semibold text-[var(--ink)]">
            Write launch brief
          </span>
          <span className="truncate text-[12px] text-[var(--muted)]">
            Product launch · Due today
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-[#FFF0F3] px-[12px] py-[6px] text-[12px] font-semibold text-[#B92142]">
          Active
        </span>
      </div>

      <div className="shrink-0 rounded-[16px] bg-[#FFF0F3] px-[18px] py-[13px] text-center">
        <span className="text-[14px] font-semibold text-[#B92142]">
          One task. Your full attention.
        </span>
      </div>
    </IpadShell>
  );
}

/* ------------------------------------------------------------ Upgrade ---- */

const PRO_PERKS = [
  "Unlimited habits",
  "Advanced insights",
  "Custom themes",
  "Cloud sync across devices",
];

export function IpadUpgrade() {
  return (
    <IpadShell active="upgrade">
      <ScreenTitle title="Go Premium" meta="Unlock the full Habitly" />

      <div className="flex shrink-0 flex-col items-center gap-[6px] rounded-[22px] bg-[linear-gradient(210deg,#7B61FF_0%,#5856D6_100%)] p-[22px]">
        <Sparkles className="size-[34px] text-white" />
        <span className="text-[26px] font-bold text-white">Habitly Pro</span>
        <span className="text-[13px] text-[#FFFFFFAA]">
          Everything, unlocked
        </span>
      </div>

      <div className="flex shrink-0 gap-[12px]">
        <div className="flex flex-1 flex-col gap-[3px] rounded-[16px] bg-white p-[16px]">
          <span className="text-[12px] text-[var(--muted)]">Monthly</span>
          <span className="text-[22px] font-bold text-[var(--ink)]">$4.99</span>
          <span className="text-[11px] text-[var(--muted)]">per month</span>
        </div>
        <div className="flex flex-1 flex-col gap-[3px] rounded-[16px] border-2 border-[#5856D6] bg-[#5856D60F] p-[16px]">
          <span className="text-[12px] font-semibold text-[#5856D6]">
            Yearly · save 33%
          </span>
          <span className="text-[22px] font-bold text-[var(--ink)]">
            $39.99
          </span>
          <span className="text-[11px] text-[var(--muted)]">per year</span>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-[10px]">
        {PRO_PERKS.map((perk) => (
          <span
            key={perk}
            className="flex items-center gap-[10px] rounded-[14px] bg-white px-[14px] py-[12px]"
          >
            <span className="flex size-[24px] shrink-0 items-center justify-center rounded-[8px] bg-[#EEEAFE]">
              <Check className="size-[13px] text-[#5856D6]" />
            </span>
            <span className="min-w-0 truncate text-[13px] font-semibold text-[var(--ink)]">
              {perk}
            </span>
          </span>
        ))}
      </div>

      <div className="flex h-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[#5856D6]">
        <span className="text-[16px] font-bold text-white">
          Start 7-day free trial
        </span>
      </div>
    </IpadShell>
  );
}
