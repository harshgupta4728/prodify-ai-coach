import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Play, Clock, AlertTriangle, TrendingUp, Brain } from "lucide-react";
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

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

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
      reasons.push(`⚠️ Overdue by ${Math.abs(Math.round(hoursUntilDeadline / 24))} day(s)`);
    } else if (hoursUntilDeadline < 24) {
      score += 45;
      reasons.push("🔥 Due within 24 hours");
    } else if (hoursUntilDeadline < 72) {
      score += 35;
      reasons.push("⏰ Due within 3 days");
    } else if (hoursUntilDeadline < 168) {
      score += 20;
      reasons.push("📅 Due this week");
    } else {
      score += 5;
    }

    // 2. Priority weight (5-40 points)
    const priorityScore = PRIORITY_WEIGHTS[task.priority] || 10;
    score += priorityScore;
    if (task.priority === 'urgent') {
      reasons.push("🚨 Marked as urgent priority");
    } else if (task.priority === 'high') {
      reasons.push("📌 High priority task");
    }

    // 3. Time-of-day matching (0-15 points)
    if (hour >= 6 && hour < 12) {
      // Morning → harder tasks
      if (task.category === 'practice' || task.category === 'interview') {
        score += 15;
        reasons.push("🌅 Morning is ideal for challenging tasks");
      }
    } else if (hour >= 12 && hour < 17) {
      // Afternoon → study
      if (task.category === 'study') {
        score += 12;
        reasons.push("☀️ Afternoon is great for deep study");
      }
    } else if (hour >= 17 && hour < 22) {
      // Evening → review/lighter
      if (task.category === 'review' || task.category === 'other') {
        score += 12;
        reasons.push("🌙 Evening is perfect for review sessions");
      }
    }

    // 4. In-progress tasks get a small boost
    if (task.status === 'in_progress') {
      score += 10;
      reasons.push("▶️ Already in progress");
    }

    // 5. Category variety bonus — boost underrepresented categories
    const categoryCount = categoryCounts[task.category] || 0;
    if (categoryCount === 1) {
      score += 5;
    }

    // Ensure at least one reason
    if (reasons.length === 0) {
      reasons.push("📋 Part of your task backlog");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-primary flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            AI Smart Suggest
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {pendingCount === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary/40" />
              <p className="text-muted-foreground">All tasks completed! Great job! 🎉</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Based on your deadlines, priorities, and time of day — here's what you should work on:
              </p>

              {suggestions.map((suggestion, idx) => (
                <Card
                  key={suggestion.task._id}
                  className={cn(
                    "p-4 transition-all hover:shadow-md",
                    idx === 0 && "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0 mt-0.5">
                      {MEDAL_EMOJIS[idx]}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{suggestion.task.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          Score: {suggestion.score}
                        </Badge>
                      </div>

                      {/* Reasons */}
                      <div className="space-y-1">
                        {suggestion.reasons.map((reason, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {reason}
                          </p>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-[10px]", {
                            'bg-red-100 text-red-800': suggestion.task.priority === 'urgent',
                            'bg-amber-100 text-amber-800': suggestion.task.priority === 'high',
                            'bg-yellow-100 text-yellow-800': suggestion.task.priority === 'medium',
                            'bg-gray-100 text-gray-700': suggestion.task.priority === 'low',
                          })}>
                            {suggestion.task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {suggestion.task.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            · {new Date(suggestion.task.deadline).toLocaleDateString()}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => {
                            onFocus(suggestion.task);
                            onClose();
                          }}
                          className="h-7 gap-1 text-xs"
                        >
                          <Play className="h-3 w-3" />
                          Start Focus
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <p className="text-xs text-center text-muted-foreground pt-2">
                Analyzing {pendingCount} pending task{pendingCount !== 1 ? 's' : ''} · Updated in real-time
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
