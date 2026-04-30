import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, Edit, Trash2, Play, GripVertical } from "lucide-react";
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

interface KanbanViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onFocus: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "border-l-gray-400",
  medium: "border-l-yellow-500",
  high: "border-l-amber-500",
  urgent: "border-l-red-500",
};

const PRIORITY_BADGES: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-amber-100 text-amber-800",
  urgent: "bg-red-100 text-red-800",
};

const CATEGORY_COLORS: Record<string, string> = {
  study: "bg-blue-100 text-blue-700",
  practice: "bg-green-100 text-green-700",
  interview: "bg-purple-100 text-purple-700",
  review: "bg-amber-100 text-amber-700",
  other: "bg-gray-100 text-gray-700",
};

const COLUMNS: { id: 'todo' | 'in_progress' | 'done'; title: string; emoji: string; bgClass: string; headerClass: string }[] = [
  { id: 'todo', title: 'To Do', emoji: '📋', bgClass: 'bg-slate-50/50', headerClass: 'bg-slate-100 text-slate-800' },
  { id: 'in_progress', title: 'In Progress', emoji: '⚡', bgClass: 'bg-blue-50/50', headerClass: 'bg-blue-100 text-blue-800' },
  { id: 'done', title: 'Done', emoji: '✅', bgClass: 'bg-green-50/50', headerClass: 'bg-green-100 text-green-800' },
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

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    <div className="grid grid-cols-3 gap-4 min-h-[500px]">
      {COLUMNS.map(column => {
        const columnTasks = getTasksByStatus(column.id);
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={cn(
              "rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col",
              isDragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-transparent",
              column.bgClass
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={cn("rounded-t-lg px-4 py-3 flex items-center justify-between", column.headerClass)}>
              <div className="flex items-center gap-2">
                <span>{column.emoji}</span>
                <span className="font-semibold text-sm">{column.title}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {columnTasks.length}
              </Badge>
            </div>

            {/* Column Body */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[600px]">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm opacity-60">
                  {isDragOver ? "Drop here!" : "No tasks"}
                </div>
              ) : (
                columnTasks.map(task => {
                  const daysLeft = getDaysUntilDeadline(task.deadline);
                  const isOverdue = daysLeft < 0 && !task.completed;
                  const isDragging = draggedId === task._id;

                  return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "bg-background rounded-lg border border-border shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md border-l-4",
                        PRIORITY_COLORS[task.priority],
                        isDragging && "opacity-40 scale-95",
                        isOverdue && "ring-1 ring-red-300"
                      )}
                    >
                      <div className="p-3 space-y-2">
                        {/* Drag handle + Title */}
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium text-sm leading-tight",
                              task.completed && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </p>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 pl-6">
                          <Badge className={cn("text-[10px] px-1.5 py-0", PRIORITY_BADGES[task.priority])}>
                            {task.priority}
                          </Badge>
                          <Badge className={cn("text-[10px] px-1.5 py-0", CATEGORY_COLORS[task.category])}>
                            {task.category}
                          </Badge>
                        </div>

                        {/* Deadline */}
                        <div className="flex items-center justify-between pl-6">
                          <div className={cn(
                            "flex items-center gap-1 text-xs",
                            isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                          )}>
                            <Clock className="h-3 w-3" />
                            {isOverdue
                              ? `${Math.abs(daysLeft)}d overdue`
                              : daysLeft === 0
                              ? "Due today"
                              : `${daysLeft}d left`
                            }
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-0.5">
                            {column.id !== 'done' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-primary hover:text-primary"
                                onClick={() => onFocus(task)}
                                title="Start Focus"
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onEdit(task)}
                              title="Edit"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                              onClick={() => onDelete(task._id)}
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
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
