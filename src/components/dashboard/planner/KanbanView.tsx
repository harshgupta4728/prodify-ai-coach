import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, CircleDot, Clock, GripVertical, Pencil, Play, Trash2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeDeadline } from "@/lib/deadlines";

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

interface KanbanViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onFocus: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

// Priority colours: urgent and high red, medium amber, low grey
const PRIORITY_BADGES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
  urgent: "bg-destructive/15 text-destructive",
};

const BADGE_CLASS = "inline-flex items-center rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium capitalize leading-4";

// Status icons: in progress amber, done green, to do grey
const COLUMNS: { id: 'todo' | 'in_progress' | 'done'; title: string; icon: LucideIcon; iconClass: string }[] = [
  { id: 'todo', title: 'To Do', icon: Circle, iconClass: 'text-muted-foreground' },
  { id: 'in_progress', title: 'In Progress', icon: CircleDot, iconClass: 'text-warning' },
  { id: 'done', title: 'Done', icon: CheckCircle2, iconClass: 'text-success' },
];

export const KanbanView = ({ tasks, onStatusChange, onEdit, onDelete, onFocus, onToggleComplete }: KanbanViewProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => {
      const taskStatus = t.status || (t.completed ? 'done' : 'todo');
      return taskStatus === status;
    });
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: 'todo' | 'in_progress' | 'done') => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, columnId);
    }
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:min-h-[500px] md:grid-cols-3">
      {COLUMNS.map(column => {
        const columnTasks = getTasksByStatus(column.id);
        const isDragOver = dragOverColumn === column.id;
        const ColumnIcon = column.icon;

        return (
          <div
            key={column.id}
            className={cn(
              "flex min-w-0 flex-col rounded-lg border bg-muted/30 transition-colors",
              isDragOver && "border-primary/50 bg-accent/40"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
              <div className="flex items-center gap-2">
                <ColumnIcon className={cn("h-4 w-4", column.iconClass)} />
                <span className="text-sm font-medium">{column.title}</span>
              </div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Body */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[600px] p-2">
              {columnTasks.length === 0 ? (
                <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                  {isDragOver ? "Drop here" : "No tasks"}
                </div>
              ) : (
                columnTasks.map(task => {
                  const due = describeDeadline(task.deadline);
                  const isOverdue = due.overdue && !task.completed;
                  const isDueSoon = due.soon && !task.completed;
                  const isDragging = draggedId === task._id;

                  return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "cursor-grab rounded-md border bg-card p-3 transition-colors hover:border-input active:cursor-grabbing",
                        isDragging && "opacity-40",
                        isOverdue && "border-destructive/40"
                      )}
                    >
                      <div className="space-y-2">
                        {/* Drag handle + Title */}
                        <div className="flex items-start gap-2">
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                          <p className={cn(
                            "min-w-0 flex-1 break-words text-sm font-medium leading-5",
                            task.completed && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1 pl-6">
                          <span className={cn(BADGE_CLASS, task.completed ? "bg-muted text-muted-foreground" : PRIORITY_BADGES[task.priority])}>
                            {task.priority}
                          </span>
                          <span className="chip capitalize">
                            {task.category}
                          </span>
                        </div>

                        {/* Deadline */}
                        <div className="flex items-center justify-between gap-2 pl-6">
                          <div className={cn(
                            "flex items-center gap-1 text-xs",
                            isOverdue ? "font-medium text-destructive" : isDueSoon ? "text-warning" : "text-muted-foreground"
                          )}>
                            <Clock className="h-3 w-3" />
                            <span title={due.text}>{task.completed ? "Done" : due.short}</span>
                          </div>

                          {/* Actions */}
                          <div className="-mr-1 flex items-center">
                            {column.id !== 'done' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => onFocus(task)}
                                title="Start Focus Mode"
                                aria-label="Start Focus Mode"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => onEdit(task)}
                              title="Edit task"
                              aria-label="Edit task"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => onDelete(task._id)}
                              title="Delete task"
                              aria-label="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
