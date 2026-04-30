import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Play, Edit } from "lucide-react";
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

const CATEGORY_DOT: Record<string, string> = {
  study: "bg-blue-500",
  practice: "bg-green-500",
  interview: "bg-purple-500",
  review: "bg-amber-500",
  other: "bg-gray-500",
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: "ring-2 ring-red-400",
  high: "ring-2 ring-amber-400",
  medium: "",
  low: "",
};

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold min-w-[180px] text-center">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2 border-b">
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
                className={cn(
                  "min-h-[80px] p-1.5 border-b border-r cursor-pointer transition-colors relative",
                  !cell.isCurrentMonth && "bg-muted/30 text-muted-foreground/50",
                  cell.isCurrentMonth && "hover:bg-accent/50",
                  isSelected && "bg-primary/10 ring-1 ring-primary",
                  isTodayCell && "bg-primary/5"
                )}
              >
                {/* Date number */}
                <div className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                  isTodayCell && "bg-primary text-primary-foreground font-bold"
                )}>
                  {cell.day}
                </div>

                {/* Task dots */}
                {dateTasks.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-0.5">
                    {dateTasks.slice(0, 3).map(task => (
                      <div
                        key={task._id}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          task.completed
                            ? "bg-green-500"
                            : hasOverdue && !task.completed && new Date(task.deadline) < today
                            ? "bg-red-500"
                            : CATEGORY_DOT[task.category],
                          PRIORITY_DOT[task.priority]
                        )}
                        title={task.title}
                      />
                    ))}
                    {dateTasks.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{dateTasks.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Task count badge */}
                {dateTasks.length > 0 && (
                  <div className="absolute bottom-1 right-1">
                    <span className={cn(
                      "text-[10px] font-medium px-1 rounded",
                      hasOverdue ? "text-red-600" : hasCompleted && !hasPending ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {dateTasks.length}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Completed</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Overdue</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Study</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-300" /> Practice</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Interview</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Review</div>
      </div>

      {/* Selected Date Panel */}
      {selectedDate && (
        <Card className="border-primary/30">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                Tasks for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h4>
              <Badge variant="outline">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</Badge>
            </div>

            {selectedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No tasks for this date.</p>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map(task => (
                  <div
                    key={task._id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      task.completed ? "bg-green-50/50 border-green-200" : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onToggleComplete(task._id)}
                      >
                        <CheckCircle className={cn(
                          "h-5 w-5",
                          task.completed ? "text-green-600" : "text-gray-400"
                        )} />
                      </Button>
                      <div className="min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          task.completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={cn("text-[10px] px-1.5 py-0", {
                            'bg-gray-100 text-gray-700': task.priority === 'low',
                            'bg-yellow-100 text-yellow-800': task.priority === 'medium',
                            'bg-amber-100 text-amber-800': task.priority === 'high',
                            'bg-red-100 text-red-800': task.priority === 'urgent',
                          })}>
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">{task.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => onFocus(task)}
                        >
                          <Play className="h-3 w-3" />
                          Focus
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onEdit(task)}
                        title="Edit task"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
