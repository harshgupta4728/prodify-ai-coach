import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Pencil, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  _id: string;
  title: string;
  description: string;
  category: 'study' | 'practice' | 'interview' | 'review' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'done';
  deadline: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  timeSpent?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  notes?: string;
}

interface CalendarViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onFocus: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Priority colours: urgent and high red, medium amber, low grey (done tasks get a green dot)
const PRIORITY_DOT: Record<string, string> = {
  urgent: "bg-destructive",
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-muted-foreground",
};

const PRIORITY_BADGES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
  urgent: "bg-destructive/15 text-destructive",
};

const BADGE_CLASS = "inline-flex items-center rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium capitalize leading-4";

export const CalendarView = ({ tasks, onToggleComplete, onFocus, onEdit }: CalendarViewProps) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(null);
  };

  const getDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Group tasks by deadline date
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach(task => {
    const d = new Date(task.deadline);
    const key = getDateKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(task);
  });

  const isToday = (day: number) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  // Build calendar grid
  const cells: { day: number; isCurrentMonth: boolean; dateKey: string }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    cells.push({ day: d, isCurrentMonth: false, dateKey: getDateKey(y, m, d) });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, dateKey: getDateKey(currentYear, currentMonth, d) });
  }

  // Next month leading days
  const remaining = 42 - cells.length; // 6 rows × 7
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    cells.push({ day: d, isCurrentMonth: false, dateKey: getDateKey(y, m, d) });
  }

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8" title="Previous month" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="min-w-[150px] text-center text-base font-semibold sm:min-w-[180px]">
            {MONTHS[currentMonth]} <span className="font-mono tabular-nums">{currentYear}</span>
          </h3>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8" title="Next month" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday} className="h-8">
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {DAYS.map(day => (
            <div key={day} className="eyebrow py-2 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dateTasks = tasksByDate[cell.dateKey] || [];
            const hasCompleted = dateTasks.some(t => t.completed);
            const hasOverdue = dateTasks.some(t => !t.completed && new Date(t.deadline) < today);
            const hasPending = dateTasks.some(t => !t.completed);
            const isSelected = selectedDate === cell.dateKey;
            const isTodayCell = cell.isCurrentMonth && isToday(cell.day);

            return (
              <div
                key={idx}
                onClick={() => cell.isCurrentMonth && setSelectedDate(isSelected ? null : cell.dateKey)}
                aria-current={isTodayCell ? "date" : undefined}
                className={cn(
                  "min-h-[64px] min-w-0 border-b border-r p-1 transition-colors sm:min-h-[96px] sm:p-1.5",
                  "[&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0",
                  cell.isCurrentMonth ? "cursor-pointer hover:bg-accent/50" : "bg-muted/30 text-muted-foreground/50",
                  isSelected && "bg-accent hover:bg-accent"
                )}
              >
                {/* Date number, and how many tasks are due (phones) */}
                <div className="flex items-start justify-between gap-1">
                  <span className={cn(
                    "flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-mono text-xs tabular-nums",
                    isTodayCell && "font-semibold text-primary ring-1 ring-primary"
                  )}>
                    {cell.day}
                  </span>
                  {dateTasks.length > 0 && (
                    <span className={cn(
                      "pr-0.5 pt-1 font-mono text-[10px] leading-none tabular-nums sm:hidden",
                      hasOverdue ? "text-destructive" : hasCompleted && !hasPending ? "text-success" : "text-muted-foreground"
                    )}>
                      {dateTasks.length}
                    </span>
                  )}
                </div>

                {/* Task pills (wider screens) */}
                {dateTasks.length > 0 && (
                  <div className="mt-1 hidden space-y-0.5 sm:block">
                    {dateTasks.slice(0, 3).map(task => {
                      const isOverdueTask = !task.completed && new Date(task.deadline) < today;
                      return (
                        <div
                          key={task._id}
                          title={task.title}
                          className={cn(
                            "flex items-center gap-1 rounded-sm border px-1 py-px text-[11px] leading-4",
                            isOverdueTask ? "border-destructive/30 bg-destructive/10 text-destructive" : "bg-muted text-foreground",
                            task.completed && "text-muted-foreground line-through"
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", task.completed ? "bg-success" : PRIORITY_DOT[task.priority])} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}
                    {dateTasks.length > 3 && (
                      <p className="px-1 font-mono text-[10px] text-muted-foreground">+{dateTasks.length - 3} more</p>
                    )}
                  </div>
                )}

                {/* Task dots (phones) */}
                {dateTasks.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 px-0.5 sm:hidden">
                    {dateTasks.slice(0, 3).map(task => (
                      <span
                        key={task._id}
                        className={cn("h-1.5 w-1.5 rounded-full", task.completed ? "bg-success" : PRIORITY_DOT[task.priority])}
                        title={task.title}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Urgent / high</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> Medium</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Low</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Completed</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-destructive/30 bg-destructive/10" /> Overdue</span>
      </div>

      {/* Selected Date Panel */}
      {selectedDate && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <h4 className="text-sm font-semibold">
              Tasks for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
            </span>
          </div>

          {selectedTasks.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No tasks for this date.</p>
          ) : (
            <ul className="divide-y">
              {selectedTasks.map(task => {
                const completeLabel = task.completed ? "Mark as incomplete" : "Mark as completed";
                return (
                  <li
                    key={task._id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleComplete(task._id)}
                      title={completeLabel}
                      aria-label={completeLabel}
                      className={cn(
                        "-m-1 shrink-0 rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        task.completed ? "text-success" : "text-muted-foreground hover:text-success"
                      )}
                    >
                      {task.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "truncate text-sm font-medium",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className={cn(BADGE_CLASS, task.completed ? "bg-muted text-muted-foreground" : PRIORITY_BADGES[task.priority])}>
                          {task.priority}
                        </span>
                        <span className="chip capitalize">{task.category}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!task.completed && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 gap-1.5 px-2.5 text-xs"
                          onClick={() => onFocus(task)}
                        >
                          <Play className="h-4 w-4" />
                          Focus
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(task)}
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
};
