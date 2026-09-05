import {
  BookOpen,
  Circle,
  CircleCheckBig,
  Droplets,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

type Habit = {
  label: string;
  icon: LucideIcon;
  boxClass: string;
  iconClass: string;
  done: boolean;
};

const HABITS: Habit[] = [
  {
    label: "Drink water",
    icon: Droplets,
    boxClass: "bg-[#E9FFE0]",
    iconClass: "text-[#4F9B30]",
    done: true,
  },
  {
    label: "Read 10 pages",
    icon: BookOpen,
    boxClass: "bg-[#E9FFE0]",
    iconClass: "text-[#4F9B30]",
    done: true,
  },
  {
    label: "Move your body",
    icon: Dumbbell,
    boxClass: "bg-[#EEEAFE]",
    iconClass: "text-[var(--purple)]",
    done: false,
  },
];

/** The full-size Habitly home screen, as drawn on the canvas artboard. */
export function TodayLarge() {
  return (
    <div className="flex w-[254px] flex-col gap-[17px] bg-[#F5F5F7] px-[17px] pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[3px]">
          <p className="text-[16px] font-bold text-[var(--ink)]">
            Good morning, Alex
          </p>
          <p className="text-[9px] text-[var(--muted)]">Tuesday, June 18</p>
        </div>
        <div className="size-[28px] rounded-full bg-[#DCD7FF]" />
      </div>

      <div className="flex h-[132px] flex-col gap-2 rounded-[20px] bg-[linear-gradient(210deg,#0A84FF_0%,#5856D6_100%)] p-4">
        <p className="text-[8px] font-bold tracking-[0.6px] text-[#FFFFFFAA]">
          TODAY’S FOCUS
        </p>
        <p className="text-[22px] font-bold text-white">3 of 5 habits</p>
        <div className="h-[7px] w-full rounded-full bg-[#FFFFFF30]">
          <div className="h-full w-[120px] rounded-full bg-white" />
        </div>
      </div>

      <p className="text-[13px] font-bold text-[var(--ink)]">Morning routine</p>

      <ul className="flex flex-col gap-[9px]">
        {HABITS.map(({ label, icon: Icon, boxClass, iconClass, done }) => (
          <li
            key={label}
            className="flex h-[48px] items-center justify-between rounded-[12px] bg-white px-[11px]"
          >
            <span className="flex items-center gap-[9px]">
              <span
                className={`flex size-[28px] items-center justify-center rounded-[8px] ${boxClass}`}
              >
                <Icon className={`size-[13px] ${iconClass}`} />
              </span>
              <span className="text-[10px] font-semibold text-[var(--ink)]">
                {label}
              </span>
            </span>
            {done ? (
              <CircleCheckBig
                aria-label="Completed"
                className="size-[15px] text-[#65B446]"
              />
            ) : (
              <Circle
                aria-label="Not completed"
                className="size-[15px] text-[#C9C9D1]"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
