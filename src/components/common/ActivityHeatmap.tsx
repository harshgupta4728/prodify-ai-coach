import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const LEVELS = ["bg-muted", "bg-primary/25", "bg-primary/45", "bg-primary/70", "bg-primary"];

const pad = (n: number) => String(n).padStart(2, "0");
// Same "YYYY-MM-DD" key the server uses for the user's local calendar day
const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const levelFor = (count: number) => (count <= 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4);

interface Cell {
  key: string;
  count: number;
  date: Date;
  future: boolean;
}

/**
 * GitHub-style calendar of problems solved per day: one column per week (Sunday on top),
 * the latest week on the right. The squares stretch to fill the card; on narrow screens
 * the calendar scrolls sideways instead of shrinking below a readable size.
 */
export const ActivityHeatmap = ({ activity, weeks = 52 }: { activity: Record<string, number>; weeks?: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { cells, months, total } = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // midday, so stepping one day at a time never trips over DST
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7);

    const cells: Cell[] = [];
    const months: { week: number; label: string }[] = [];
    let total = 0;
    for (let i = 0; i < weeks * 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const future = date > today;
      const count = future ? 0 : activity[dayKey(date)] || 0;
      total += count;
      cells.push({ key: dayKey(date), count, date, future });
      // Label each month above the first week that starts in it
      if (i % 7 === 0 && date.getDate() <= 7) {
        months.push({ week: i / 7, label: date.toLocaleDateString(undefined, { month: "short" }) });
      }
    }
    return { cells, months, total };
  }, [activity, weeks]);

  // On narrow screens, start scrolled to the latest weeks
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [cells]);

  const describe = (cell: Cell) => {
    const date = cell.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    if (cell.count === 0) return `No problems solved on ${date}`;
    return `${cell.count} problem${cell.count === 1 ? "" : "s"} solved on ${date}`;
  };

  return (
    <div className="space-y-3">
      <div ref={scrollRef} className="overflow-x-auto pb-1" role="img" aria-label={`${total} problems solved in the last year`}>
        <div
          className="grid min-w-[640px] gap-[3px] font-mono text-[10px] leading-none text-muted-foreground"
          style={{ gridTemplateColumns: `2rem repeat(${weeks}, minmax(0, 1fr))`, gridAutoFlow: "column" }}
        >
          {/* Column 1: weekday names under an empty corner */}
          <span style={{ gridColumn: 1, gridRow: 1 }} />
          {WEEKDAY_LABELS.map((label, day) => (
            <span key={day} className="self-center" style={{ gridColumn: 1, gridRow: day + 2 }}>{label}</span>
          ))}

          {months.map((month) => (
            <span key={month.week} className="whitespace-nowrap pb-1" style={{ gridColumn: month.week + 2, gridRow: 1 }}>
              {month.label}
            </span>
          ))}

          {cells.map((cell, i) => (
            <div
              key={cell.key}
              title={cell.future ? undefined : describe(cell)}
              className={cn("aspect-square rounded-[2px]", cell.future ? "bg-transparent" : LEVELS[levelFor(cell.count)])}
              style={{ gridColumn: Math.floor(i / 7) + 2, gridRow: (i % 7) + 2 }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>
          <span className="font-mono text-foreground">{total}</span> solved in the last year
        </span>
        <span className="flex items-center gap-1" aria-hidden="true">
          Less
          {LEVELS.map((level) => (
            <span key={level} className={cn("h-2.5 w-2.5 rounded-[2px]", level)} />
          ))}
          More
        </span>
      </div>
    </div>
  );
};
