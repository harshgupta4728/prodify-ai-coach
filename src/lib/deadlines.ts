// Task deadline helpers. Deadlines are stored as UTC instants; everything shown to the
// user (and the <input type="datetime-local"> value) is in the user's local time.

const pad = (n: number) => String(n).padStart(2, "0");

// For datetime-local inputs. toISOString() would shift the time by the UTC offset
// (e.g. 6:00 PM in India would show as 12:30 PM).
export function toLocalInputValue(value: string | Date): string {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// A datetime-local value ("2026-10-18T18:00", local time) as a UTC ISO string for the server
export function fromLocalInputValue(value: string): string {
  return new Date(value).toISOString();
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export interface DeadlineInfo {
  text: string;      // full label, e.g. "Due tomorrow 6:00 PM"
  short: string;     // compact label for small cards, e.g. "1d left"
  overdue: boolean;
  soon: boolean;     // due within 3 days
}

// "Due today 6:00 PM", "Due tomorrow 9:00 AM", "Due in 5 days", "Overdue by 2 days"
export function describeDeadline(deadline: string, now: Date = new Date()): DeadlineInfo {
  const due = new Date(deadline);
  const dayDiff = Math.round((startOfDay(due) - startOfDay(now)) / 86400000);
  const time = due.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (due.getTime() < now.getTime()) {
    const daysLate = Math.max(-dayDiff, 0);
    return daysLate === 0
      ? { text: `Overdue (was due ${time})`, short: "Overdue", overdue: true, soon: false }
      : { text: `Overdue by ${daysLate} day${daysLate === 1 ? "" : "s"}`, short: `${daysLate}d overdue`, overdue: true, soon: false };
  }
  if (dayDiff === 0) return { text: `Due today ${time}`, short: "Today", overdue: false, soon: true };
  if (dayDiff === 1) return { text: `Due tomorrow ${time}`, short: "Tomorrow", overdue: false, soon: true };
  return { text: `Due in ${dayDiff} days`, short: `${dayDiff}d left`, overdue: false, soon: dayDiff <= 3 };
}
