import {
  BookOpen,
  Check,
  Sparkles,
  Circle,
  CircleCheckBig,
  Droplets,
  Dumbbell,
  Flame,
  Pause,
  PenLine,
  Plus,
  Settings2,
  type LucideIcon,
} from "lucide-react";

/**
 * Every mini screen is authored at the designed 176x387 preview size.
 * `AppScreen` scales them up for the large canvas artboard.
 */
const SHELL =
  "flex h-[387px] w-[176px] flex-col gap-[9px] overflow-hidden rounded-t-[18px] bg-[#F7F7F9] p-[11px]";

/* -------------------------------------------------------------- Today ---- */

type Habit = {
  label: string;
  icon: LucideIcon;
  boxClass: string;
  iconClass: string;
  done: boolean;
};

const TODAY_HABITS: Habit[] = [
  {
    label: "Drink water",
    icon: Droplets,
    boxClass: "bg-[#E6F8E3]",
    iconClass: "text-[#34A853]",
    done: true,
  },
  {
    label: "Read 10 pages",
    icon: BookOpen,
    boxClass: "bg-[#E6F8E3]",
    iconClass: "text-[#34A853]",
    done: true,
  },
  {
    label: "Workout",
    icon: Dumbbell,
    boxClass: "bg-[#EEEAFE]",
    iconClass: "text-[#5856D6]",
    done: false,
  },
];

export function MiniToday() {
  return (
    <div className={SHELL}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[2px]">
          <p className="text-[9px] font-bold text-[var(--ink)]">Good morning</p>
          <p className="text-[6px] text-[var(--muted)]">Tuesday, June 18</p>
        </div>
        <span className="size-[20px] rounded-full bg-[#D9D2FF]" />
      </div>

      <div className="flex h-[88px] flex-col gap-[6px] rounded-[14px] bg-[linear-gradient(210deg,#5856D6_0%,#7B61FF_100%)] p-[11px]">
        <p className="text-[5px] font-bold tracking-[0.5px] text-[#FFFFFFAA]">
          TODAY’S PROGRESS
        </p>
        <p className="text-[13px] font-bold text-white">4 of 5 habits</p>
        <div className="h-[5px] w-full rounded-full bg-[#FFFFFF30]">
          <div className="h-full w-[90px] rounded-full bg-white" />
        </div>
      </div>

      <p className="text-[7px] font-bold text-[var(--ink)]">Morning routine</p>

      <ul className="flex flex-col gap-[6px]">
        {TODAY_HABITS.map(({ label, icon: Icon, boxClass, iconClass, done }) => (
          <li
            key={label}
            className="flex h-[35px] items-center justify-between rounded-[9px] bg-white px-2"
          >
            <span className="flex items-center gap-[6px]">
              <span
                className={`flex size-[20px] items-center justify-center rounded-[6px] ${boxClass}`}
              >
                <Icon className={`size-[9px] ${iconClass}`} />
              </span>
              <span className="text-[6px] font-semibold text-[var(--ink)]">
                {label}
              </span>
            </span>
            {done ? (
              <CircleCheckBig className="size-[10px] text-[#34C759]" />
            ) : (
              <Circle className="size-[10px] text-[#C7C7CC]" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------- Plan ---- */

const PLAN_WEEK = [
  { letter: "M", day: "17", active: false },
  { letter: "T", day: "18", active: true },
  { letter: "W", day: "19", active: false },
  { letter: "T", day: "20", active: false },
  { letter: "F", day: "21", active: false },
];

const PLAN_SCHEDULE = [
  { time: "7:00", accent: "bg-[#5856D6]", name: "Morning reset" },
  { time: "12:30", accent: "bg-[#34C759]", name: "Walk outside" },
  { time: "18:00", accent: "bg-[#FF9F0A]", name: "Read & reflect" },
  { time: "21:30", accent: "bg-[#0A84FF]", name: "Wind down" },
];

export function MiniPlan() {
  return (
    <div className={SHELL}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-[var(--ink)]">Your day</p>
        <span className="flex size-[20px] items-center justify-center rounded-full bg-[var(--purple)]">
          <Plus className="size-[9px] text-white" />
        </span>
      </div>

      <div className="flex justify-between">
        {PLAN_WEEK.map(({ letter, day, active }) => (
          <div
            key={day}
            className={`flex h-[38px] w-[24px] flex-col items-center justify-center gap-[2px] rounded-[8px] ${
              active ? "bg-[var(--purple)]" : "bg-white"
            }`}
          >
            <span
              className={`text-[5px] ${active ? "text-[#FFFFFFAA]" : "text-[var(--muted)]"}`}
            >
              {letter}
            </span>
            <span
              className={`text-[7px] font-bold ${active ? "text-white" : "text-[var(--ink)]"}`}
            >
              {day}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[7px] font-bold text-[var(--ink)]">Today’s schedule</p>

      <ul className="flex flex-col gap-[7px]">
        {PLAN_SCHEDULE.map(({ time, accent, name }) => (
          <li
            key={name}
            className="flex h-[42px] items-center gap-2 rounded-[10px] bg-white px-2"
          >
            <span className="text-[5px] font-semibold text-[var(--muted)]">
              {time}
            </span>
            <span className={`h-[24px] w-[3px] rounded-[2px] ${accent}`} />
            <span className="text-[6px] font-[650] text-[var(--ink)]">
              {name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------- Streak ---- */

/** Four calendar weeks; the last three days of weeks 3 and 4 are still open. */
const STREAK_WEEKS = [7, 7, 4, 4];

export function MiniStreak() {
  return (
    <div className={SHELL}>
      <p className="text-[10px] font-bold text-[var(--ink)]">Your streak</p>

      <div className="flex h-[94px] flex-col items-center gap-1 rounded-[14px] bg-[linear-gradient(200deg,#FF9F0A_0%,#FF6B00_100%)] p-3">
        <Flame className="size-[22px] text-white" />
        <p className="text-[17px] font-bold text-white">18 days</p>
        <p className="text-[5px] text-[#FFFFFFAA]">Personal best: 24</p>
      </div>

      <p className="text-[7px] font-bold text-[var(--ink)]">June</p>

      <div className="flex flex-col gap-[6px] rounded-[11px] bg-white p-2">
        {STREAK_WEEKS.map((filled, week) => (
          <div key={week} className="flex justify-between">
            {Array.from({ length: 7 }, (_, day) => (
              <span
                key={day}
                className={`flex size-[15px] items-center justify-center rounded-[5px] ${
                  day < filled ? "bg-[#FFF0D6]" : "bg-[#F0F0F2]"
                }`}
              >
                {day < filled ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF8A00"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-[7px]"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : null}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="rounded-[10px] bg-[#FFF5E5] p-[10px]">
        <p className="text-[6px] font-semibold text-[#9B5A00]">
          Consistency is becoming your superpower.
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Insights ---- */

const INSIGHT_BARS = [
  { day: "M", barClass: "h-[42px] bg-[#CDEBE6]" },
  { day: "T", barClass: "h-[58px] bg-[#CDEBE6]" },
  { day: "W", barClass: "h-[70px] bg-[#CDEBE6]" },
  { day: "T", barClass: "h-[48px] bg-[#CDEBE6]" },
  { day: "F", barClass: "h-[68px] bg-[#30B0C7]" },
  { day: "S", barClass: "h-[62px] bg-[#CDEBE6]" },
  { day: "S", barClass: "h-[34px] bg-[#CDEBE6]" },
];

/** 310° of a 44px ring with a 0.72 inner radius, as a stroked arc. */
function CompletionRing() {
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 44 44" className="size-[44px]">
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        stroke="#30B0C7"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${(circumference * 310) / 360} ${circumference}`}
        transform="rotate(-90 22 22)"
      />
    </svg>
  );
}

export function MiniInsights() {
  return (
    <div className={SHELL}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-[var(--ink)]">Insights</p>
        <p className="text-[6px] text-[#30A89E]">This week</p>
      </div>

      <div className="flex h-[74px] items-center justify-between rounded-[13px] bg-[#E0F5F0] p-[10px]">
        <div className="flex flex-col gap-[3px]">
          <p className="text-[5px] font-bold tracking-[0.4px] text-[#278C82]">
            COMPLETION
          </p>
          <p className="text-[20px] font-bold text-[#167B72]">86%</p>
        </div>
        <CompletionRing />
      </div>

      <p className="text-[7px] font-bold text-[var(--ink)]">Daily activity</p>

      <div className="flex h-[104px] items-end justify-between gap-[7px] rounded-[11px] bg-white px-2 py-[10px]">
        {INSIGHT_BARS.map(({ day, barClass }, index) => (
          <div
            key={`${day}-${index}`}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1"
          >
            <span className={`w-[10px] rounded-[5px] ${barClass}`} />
            <span className="text-[5px] text-[var(--muted)]">{day}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-[7px]">
        {[
          { value: "12", label: "habits done" },
          { value: "4.2h", label: "focus time" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="flex h-[54px] flex-1 flex-col gap-[3px] rounded-[10px] bg-white p-[9px]"
          >
            <p className="text-[12px] font-bold text-[var(--ink)]">{value}</p>
            <p className="text-[5px] text-[var(--muted)]">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Focus ---- */

export function MiniFocus() {
  return (
    <div className={SHELL}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-[var(--ink)]">Focus</p>
        <Settings2 className="size-[10px] text-[var(--muted)]" />
      </div>

      <div className="flex h-[182px] flex-col items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(210deg,#FF375F_0%,#FF6482_100%)] p-4">
        <p className="text-[5px] font-bold tracking-[0.8px] text-[#FFFFFFAA]">
          DEEP WORK
        </p>
        <p className="text-[30px] font-bold tracking-[-1px] text-white">24:18</p>
        <p className="text-[6px] text-[#FFFFFFAA]">of 30 minutes</p>
        <span className="flex size-[34px] items-center justify-center rounded-full bg-white">
          <Pause className="size-[13px] text-[#FF375F]" />
        </span>
      </div>

      <p className="text-[7px] font-bold text-[var(--ink)]">Current task</p>

      <div className="flex h-[48px] items-center gap-2 rounded-[11px] bg-white px-[10px]">
        <span className="flex size-[26px] items-center justify-center rounded-[8px] bg-[#FFE6EC]">
          <PenLine className="size-[11px] text-[#FF375F]" />
        </span>
        <div className="flex flex-col gap-[2px]">
          <p className="text-[7px] font-[650] text-[var(--ink)]">
            Write launch brief
          </p>
          <p className="text-[5px] text-[var(--muted)]">Product launch</p>
        </div>
      </div>

      <div className="rounded-[10px] bg-[#FFF0F3] p-[10px]">
        <p className="text-center text-[6px] font-semibold text-[#B92142]">
          One task. Your full attention.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Upgrade ---- */

const PERKS = ["Unlimited habits", "Advanced insights", "Custom themes"];

export function MiniUpgrade() {
  return (
    <div className={SHELL}>
      <p className="text-[10px] font-bold text-[var(--ink)]">Go Premium</p>

      <div className="flex h-[92px] flex-col items-center justify-center gap-[3px] rounded-[14px] bg-[linear-gradient(210deg,#7B61FF_0%,#5856D6_100%)] p-3">
        <Sparkles className="size-[20px] text-white" />
        <p className="text-[13px] font-bold text-white">Habitly Pro</p>
        <p className="text-[5px] text-[#FFFFFFAA]">Everything, unlocked</p>
      </div>

      <p className="text-[7px] font-bold text-[var(--ink)]">What you get</p>

      <ul className="flex flex-col gap-[6px]">
        {PERKS.map((perk) => (
          <li
            key={perk}
            className="flex h-[26px] items-center gap-[6px] rounded-[9px] bg-white px-2"
          >
            <span className="flex size-[16px] items-center justify-center rounded-[5px] bg-[#EEEAFE]">
              <Check className="size-[8px] text-[#5856D6]" />
            </span>
            <span className="text-[6px] font-semibold text-[var(--ink)]">
              {perk}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-[6px]">
        <div className="flex flex-1 flex-col gap-[2px] rounded-[10px] bg-white p-[8px]">
          <span className="text-[5px] text-[var(--muted)]">Monthly</span>
          <span className="text-[10px] font-bold text-[var(--ink)]">$4.99</span>
        </div>
        <div className="flex flex-1 flex-col gap-[2px] rounded-[10px] border border-[#5856D6] bg-[#5856D610] p-[8px]">
          <span className="text-[5px] font-semibold text-[#5856D6]">
            Yearly · save 33%
          </span>
          <span className="text-[10px] font-bold text-[var(--ink)]">
            $39.99
          </span>
        </div>
      </div>

      <div className="flex h-[30px] items-center justify-center rounded-[10px] bg-[#5856D6]">
        <span className="text-[7px] font-bold text-white">
          Start 7-day free trial
        </span>
      </div>
    </div>
  );
}
