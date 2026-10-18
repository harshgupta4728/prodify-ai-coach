import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";

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

interface SmartSuggestProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  onFocus: (task: Task) => void;
}

interface ScoredTask {
  task: Task;
  score: number;
  reasons: string[];
}

const PRIORITY_WEIGHTS: Record<string, number> = {
  urgent: 40,
  high: 30,
  medium: 15,
  low: 5,
};

// Priority colours: urgent and high red, medium amber, low grey
const PRIORITY_BADGES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
  urgent: "bg-destructive/15 text-destructive",
};

const BADGE_CLASS = "inline-flex items-center rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium capitalize leading-4";

function scoreAndRankTasks(tasks: Task[]): ScoredTask[] {
  const pendingTasks = tasks.filter(t => !t.completed);
  if (pendingTasks.length === 0) return [];

  const now = new Date();
  const hour = now.getHours();

  // Count categories to suggest variety
  const categoryCounts: Record<string, number> = {};
  pendingTasks.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  return pendingTasks.map(task => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Deadline urgency (0-50 points)
    const deadline = new Date(task.deadline);
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeadline < 0) {
      score += 50;
      reasons.push(`Overdue by ${Math.abs(Math.round(hoursUntilDeadline / 24))} day(s)`);
    } else if (hoursUntilDeadline < 24) {
      score += 45;
      reasons.push("Due within 24 hours");
    } else if (hoursUntilDeadline < 72) {
      score += 35;
      reasons.push("Due within 3 days");
    } else if (hoursUntilDeadline < 168) {
      score += 20;
      reasons.push("Due this week");
    } else {
      score += 5;
    }

    // 2. Priority weight (5-40 points)
    const priorityScore = PRIORITY_WEIGHTS[task.priority] || 10;
    score += priorityScore;
    if (task.priority === 'urgent') {
      reasons.push("Marked as urgent priority");
    } else if (task.priority === 'high') {
      reasons.push("High priority task");
    }

    // 3. Time-of-day matching (0-15 points)
    if (hour >= 6 && hour < 12) {
      // Morning → harder tasks
      if (task.category === 'practice' || task.category === 'interview') {
        score += 15;
        reasons.push("Morning is ideal for challenging tasks");
      }
    } else if (hour >= 12 && hour < 17) {
      // Afternoon → study
      if (task.category === 'study') {
        score += 12;
        reasons.push("Afternoon is great for deep study");
      }
    } else if (hour >= 17 && hour < 22) {
      // Evening → review/lighter
      if (task.category === 'review' || task.category === 'other') {
        score += 12;
        reasons.push("Evening is perfect for review sessions");
      }
    }

    // 4. In-progress tasks get a small boost
    if (task.status === 'in_progress') {
      score += 10;
      reasons.push("Already in progress");
    }

    // 5. Category variety bonus — boost underrepresented categories
    const categoryCount = categoryCounts[task.category] || 0;
    if (categoryCount === 1) {
      score += 5;
    }

    // Ensure at least one reason
    if (reasons.length === 0) {
      reasons.push("Part of your task backlog");
    }

    return { task, score, reasons };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export const SmartSuggest = ({ open, onClose, tasks, onFocus }: SmartSuggestProps) => {
  const suggestions = scoreAndRankTasks(tasks);
  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Smart Suggest
          </DialogTitle>
          <DialogDescription>
            {pendingCount === 0
              ? "Suggestions show up here when you have pending tasks."
              : "Based on your deadlines, priorities, and time of day, here's what you should work on:"}
          </DialogDescription>
        </DialogHeader>

        {pendingCount === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All tasks completed"
            description="Great job. Add a new task to get your next suggestion."
          />
        ) : (
          <div className="space-y-3">
            {/* Ranked suggestions, most pressing first */}
            <ol className="divide-y rounded-lg border">
              {suggestions.map((suggestion, idx) => (
                <li key={suggestion.task._id} className="flex items-start gap-3 p-3">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs tabular-nums",
                      idx === 0 ? "border-primary/40 bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="min-w-0 break-words text-sm font-medium leading-6">{suggestion.task.title}</h4>
                      <span className="shrink-0 pt-1 font-mono text-xs tabular-nums text-muted-foreground">
                        Score {suggestion.score}
                      </span>
                    </div>

                    {/* Reasons */}
                    <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground marker:text-muted-foreground/50">
                      {suggestion.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn(BADGE_CLASS, PRIORITY_BADGES[suggestion.task.priority])}>
                          {suggestion.task.priority}
                        </span>
                        <span className="chip capitalize">
                          {suggestion.task.category}
                        </span>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {new Date(suggestion.task.deadline).toLocaleDateString()}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant={idx === 0 ? "default" : "secondary"}
                        onClick={() => {
                          onFocus(suggestion.task);
                          onClose();
                        }}
                        className="h-8 gap-1.5 px-2.5 text-xs"
                      >
                        <Play className="h-4 w-4" />
                        Start Focus
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <p className="text-center text-xs text-muted-foreground">
              Analyzing <span className="font-mono tabular-nums">{pendingCount}</span> pending task{pendingCount !== 1 ? 's' : ''} · Updated in real-time
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
