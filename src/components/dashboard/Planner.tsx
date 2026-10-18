import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertCircle, Bell, BellRing, BookOpen, Calendar, CalendarDays, CalendarRange, Check, CheckCircle2, CheckSquare,
  ChevronDown, Circle, Clock, Code, LayoutGrid, Laptop, Link2, List, ListChecks, Pencil, Play, Plus, RotateCcw,
  Search, Sparkles, Square, Tag, Target, Timer, Trash2, X, type LucideIcon,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, safeExternalUrl } from "@/lib/utils";
import { sendNotification } from "@/lib/notification-utils";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { describeDeadline, toLocalInputValue, fromLocalInputValue } from "@/lib/deadlines";
import { PageHeader } from "@/components/common/PageHeader";
import { StatTile } from "@/components/common/StatTile";
import { EmptyState } from "@/components/common/EmptyState";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { FocusMode } from "./planner/FocusMode";
import { KanbanView } from "./planner/KanbanView";
import { CalendarView } from "./planner/CalendarView";
import { SmartSuggest } from "./planner/SmartSuggest";

interface Subtask {
  text: string;
  done: boolean;
}

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
  estimatedTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  subtasks?: Subtask[];
  link?: string;
  tags?: string[];
  notes?: string;
  streak?: number;
  notificationSent?: boolean;
}

interface PlannerProps {
  userEmail?: string;
}

// Categories are neutral; colour is kept for things that mean something (priority, due dates, done)
const CATEGORIES = [
  { value: 'study', label: 'Study', icon: BookOpen },
  { value: 'practice', label: 'Practice', icon: Code },
  { value: 'interview', label: 'Interview', icon: Target },
  { value: 'review', label: 'Review', icon: CalendarDays },
  { value: 'other', label: 'Other', icon: Calendar },
];

// Priority colours: urgent and high red, medium amber, low grey
const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  { value: 'medium', label: 'Medium', color: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  { value: 'high', label: 'High', color: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  { value: 'urgent', label: 'Urgent', color: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
];

// Small text badge, same shape as the difficulty badge
const BADGE_CLASS = "inline-flex items-center rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium leading-4";

const VIEW_MODES = [
  { value: 'list', label: 'List View', icon: List },
  { value: 'kanban', label: 'Kanban Board', icon: LayoutGrid },
  { value: 'calendar', label: 'Calendar View', icon: CalendarRange },
] as const;

export const Planner = ({ userEmail }: PlannerProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCompletionDialog, setShowCompletionDialog] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState({
    timeSpent: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    notes: ''
  });
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    reminderTime: 60
  });

  // Focus Mode state
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  // Smart Suggest state
  const [showSmartSuggest, setShowSmartSuggest] = useState(false);

  // Every failed action tells the user why (e.g. the server's validation message)
  const showError = (error: unknown, title: string) => {
    toast({
      title,
      description: error instanceof Error ? error.message : "Please try again.",
      variant: "destructive",
    });
  };

  // Load tasks from API
  const loadTasks = async () => {
    try {
      setLoading(true);
      setLoadFailed(false);
      const fetchedTasks = await apiService.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    try {
      const savedSettings = localStorage.getItem('planner-notification-settings');
      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
    } catch {
      // Keep the default reminder settings
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save notification settings
  useEffect(() => {
    localStorage.setItem('planner-notification-settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Notification checker
  useEffect(() => {
    const checkNotifications = () => {
      if (!notificationSettings.enabled || !userEmail) return;

      const now = new Date();
      const pendingTasks = tasks.filter(task => !task.completed);

      pendingTasks.forEach(async (task) => {
        const deadline = new Date(task.deadline);
        const minutesUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60);

        if (minutesUntilDeadline <= notificationSettings.reminderTime &&
          minutesUntilDeadline > 0 &&
          !task.notificationSent) {
          await sendTaskNotification(task);
          try {
            await apiService.markNotificationSent(task._id);
            setTasks(prev => prev.map(t =>
              t._id === task._id ? { ...t, notificationSent: true } : t
            ));
          } catch (error) {
            console.error('Error marking notification as sent:', error);
          }
        }
      });
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [tasks, notificationSettings, userEmail]);

  const sendTaskNotification = async (task: Task) => {
    try {
      await sendNotification(
        'Task Deadline Reminder',
        `Your task "${task.title}" is due in ${notificationSettings.reminderTime} minutes!`,
        'both',
        userEmail
      );
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const addTask = async (taskData: any) => {
    try {
      const newTask = await apiService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setIsAddDialogOpen(false);
      toast({ title: "Task created", description: newTask.title });
    } catch (error) {
      showError(error, "Couldn't create the task");
    }
  };

  const toggleSubtask = async (taskId: string, subtaskIndex: number) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task || !task.subtasks) return;
    const updatedSubtasks = task.subtasks.map((st, i) =>
      i === subtaskIndex ? { ...st, done: !st.done } : st
    );
    await updateTask(taskId, { subtasks: updatedSubtasks } as any);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await apiService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task =>
        task._id === taskId ? updatedTask : task
      ));
      setEditingTask(null);
    } catch (error) {
      showError(error, "Couldn't update the task");
    }
  };

  // Delete asks first (see the confirmation dialog below)
  const requestDelete = (taskId: string) => {
    setTaskToDelete(tasks.find(t => t._id === taskId) || null);
  };

  const deleteTask = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      toast({ title: "Task deleted" });
    } catch (error) {
      showError(error, "Couldn't delete the task");
    }
  };

  // Ticking the checkbox completes right away; "Mark Complete" opens the details dialog
  const quickCompleteTask = async (taskId: string) => {
    try {
      await apiService.completeTask(taskId, {});
      setTasks(prev => prev.map(task =>
        task._id === taskId
          ? { ...task, completed: true, status: 'done' as const, completedAt: new Date().toISOString() }
          : task
      ));
      toast({ title: "Task completed" });
    } catch (error) {
      showError(error, "Couldn't complete the task");
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (task && !task.completed) {
      quickCompleteTask(taskId);
    } else {
      markTaskIncomplete(taskId);
    }
  };

  const markTaskIncomplete = async (taskId: string) => {
    try {
      await apiService.incompleteTask(taskId);
      setTasks(prev => prev.map(task =>
        task._id === taskId ? {
          ...task,
          completed: false,
          status: 'todo' as const,
          completedAt: undefined,
          timeSpent: 0,
          difficulty: 'medium' as const,
          notes: ''
        } : task
      ));
    } catch (error) {
      showError(error, "Couldn't reopen the task");
    }
  };

  const handleTaskCompletion = async () => {
    if (!showCompletionDialog) return;

    try {
      const completionDataToSend = {
        timeSpent: completionData.timeSpent ? parseInt(completionData.timeSpent) : undefined,
        difficulty: completionData.difficulty,
        notes: completionData.notes || undefined
      };

      await apiService.completeTask(showCompletionDialog, completionDataToSend);

      setTasks(prev => prev.map(task =>
        task._id === showCompletionDialog ? {
          ...task,
          completed: true,
          status: 'done' as const,
          completedAt: new Date().toISOString(),
          timeSpent: completionDataToSend.timeSpent,
          difficulty: completionDataToSend.difficulty,
          notes: completionDataToSend.notes
        } : task
      ));

      setShowCompletionDialog(null);
      setCompletionData({ timeSpent: '', difficulty: 'medium', notes: '' });
      toast({ title: "Task completed" });
    } catch (error) {
      showError(error, "Couldn't complete the task");
    }
  };

  // Kanban status change
  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    if (newStatus === 'done') {
      // Trigger completion dialog
      setShowCompletionDialog(taskId);
      return;
    }

    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // If moving from done to another status ('done' already returned above)
    if (task.completed) {
      await markTaskIncomplete(taskId);
      // Then update status
      await updateTask(taskId, { status: newStatus } as any);
      return;
    }

    // Normal status change
    try {
      const updatedTask = await apiService.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t =>
        t._id === taskId ? updatedTask : t
      ));
    } catch (error) {
      showError(error, "Couldn't move the task");
    }
  };

  // Focus mode handlers
  const startFocus = (task: Task) => {
    setFocusTask(task);
  };

  const handleFocusStop = async (elapsedMinutes: number) => {
    if (focusTask && elapsedMinutes > 0) {
      const currentTimeSpent = focusTask.timeSpent || 0;
      await updateTask(focusTask._id, { timeSpent: currentTimeSpent + elapsedMinutes } as any);
    }
    setFocusTask(null);
  };

  const handleFocusComplete = (elapsedMinutes: number) => {
    if (focusTask) {
      // Pre-fill completion dialog with focus time
      setCompletionData(prev => ({
        ...prev,
        timeSpent: String((focusTask.timeSpent || 0) + elapsedMinutes)
      }));
      setShowCompletionDialog(focusTask._id);
    }
    setFocusTask(null);
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = PRIORITIES.find(p => p.value === priority);
    return priorityObj?.color || 'bg-muted text-muted-foreground';
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = CATEGORIES.find(c => c.value === category);
    return categoryObj?.icon || Calendar;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' ||
      (filter === 'pending' && !task.completed) ||
      (filter === 'completed' && task.completed);
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesSearch = !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesCategory && matchesSearch;
  });

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const urgentTasks = tasks.filter(task => {
    if (task.completed) return false;
    const due = describeDeadline(task.deadline);
    return task.priority === 'urgent' || due.soon || due.overdue;
  });
  const overdueCount = urgentTasks.filter(task => describeDeadline(task.deadline).overdue).length;

  // Analytics
  const totalTimeSpent = completedTasks.reduce((total, task) => total + (task.timeSpent || 0), 0);
  const averageTimePerTask = completedTasks.length > 0 ? totalTimeSpent / completedTasks.length : 0;
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  const onTimeCompletions = completedTasks.filter(task => {
    if (!task.completedAt) return false;
    return new Date(task.completedAt) <= new Date(task.deadline);
  }).length;
  const onTimeRate = completedTasks.length > 0 ? (onTimeCompletions / completedTasks.length) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <span className="sr-only">Loading your tasks...</span>
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[104px]" />)}
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <Card className="p-8 text-center space-y-3">
        <p className="font-medium">Couldn't load your tasks</p>
        <p className="text-sm text-muted-foreground">Check your internet connection and try again.</p>
        <Button onClick={loadTasks} variant="secondary" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planner"
        description="Plan study sessions and keep track of deadlines."
        actions={
          <>
            {/* AI Smart Suggest */}
            <Button variant="secondary" onClick={() => setShowSmartSuggest(true)} className="gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Suggest
            </Button>

            {/* Add Task */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>New task</DialogTitle>
                  <DialogDescription>
                    Use a template or build your own task
                  </DialogDescription>
                </DialogHeader>
                <TaskForm onSubmit={addTask} />
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* Focus Mode Bar */}
      {focusTask && (
        <FocusMode
          task={focusTask}
          onStop={handleFocusStop}
          onComplete={handleFocusComplete}
          onClose={() => setFocusTask(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Total"
          value={tasks.length}
          hint={`${completionRate.toFixed(1)}% completed`}
          icon={ListChecks}
        />
        <StatTile
          label="Pending"
          value={pendingTasks.length}
          hint={`${urgentTasks.length} due soon`}
          icon={Clock}
        />
        <StatTile
          label="Completed"
          value={completedTasks.length}
          hint={`${onTimeRate.toFixed(1)}% on time`}
          icon={CheckCircle2}
        />
        <StatTile
          label="Time spent"
          value={Math.round(totalTimeSpent / 60)}
          unit="h"
          hint={`${Math.round(averageTimePerTask)} min avg`}
          icon={Timer}
        />
      </div>

      {/* Deadline reminders */}
      {userEmail && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">Deadline reminders</p>
                <p className="text-sm text-muted-foreground">
                  Email and browser reminders {notificationSettings.reminderTime >= 60 ? `${notificationSettings.reminderTime / 60} hour${notificationSettings.reminderTime === 60 ? '' : 's'}` : `${notificationSettings.reminderTime} minutes`} before a deadline, sent to <span className="break-all text-foreground">{userEmail}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Reminders go out while Prodify is open in one of your browser tabs.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-7 sm:shrink-0 sm:pl-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={requestNotificationPermission}
                className="gap-2"
              >
                <BellRing className="h-4 w-4" />
                Enable Browser Notifications
              </Button>
              <Select
                value={notificationSettings.reminderTime.toString()}
                onValueChange={(value) => setNotificationSettings(prev => ({
                  ...prev,
                  reminderTime: parseInt(value)
                }))}
              >
                <SelectTrigger className="h-9 w-32" aria-label="Remind me before a deadline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="1440">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Tasks: search, filters and view */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tasks"
              className="h-9 pl-9"
            />
          </div>

          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="h-9 w-32" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-40" aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View switcher */}
          <div role="group" aria-label="View" className="ml-auto inline-flex h-9 items-center gap-0.5 rounded-md border bg-muted p-0.5">
            {VIEW_MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setViewMode(value)}
                title={label}
                aria-label={label}
                aria-pressed={viewMode === value}
                className={cn(
                  "inline-flex h-full w-8 items-center justify-center rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  viewMode === value ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Urgent Tasks Alert */}
        {urgentTasks.length > 0 && viewMode === 'list' && (
          // Red only when something is already overdue; amber when it's just coming up
          <div className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3",
            overdueCount > 0 ? "border-destructive/30 bg-destructive/10" : "border-warning/30 bg-warning/10"
          )}>
            <AlertCircle className={cn("mt-0.5 h-4 w-4 shrink-0", overdueCount > 0 ? "text-destructive" : "text-warning")} />
            <div className="min-w-0">
              <p className={cn("text-sm font-medium", overdueCount > 0 ? "text-destructive" : "text-warning")}>
                {overdueCount > 0 ? "Overdue tasks" : "Due soon"}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono tabular-nums text-foreground">{urgentTasks.length}</span>{' '}
                {urgentTasks.length === 1 ? 'task is' : 'tasks are'} overdue, due within 3 days, or marked urgent.
              </p>
            </div>
          </div>
        )}

        {/* View Content */}
        {viewMode === 'list' && (
          filteredTasks.length === 0 ? (
            tasks.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No tasks yet"
                description="Plan your first study session."
                action={
                  <Button variant="secondary" onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add your first task
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No tasks match your search or filters"
                action={
                  <Button variant="secondary" onClick={() => { setFilter('all'); setCategoryFilter('all'); setSearchQuery(''); }}>
                    Clear filters
                  </Button>
                }
              />
            )
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => requestDelete(task._id)}
                    onToggleComplete={() => toggleTaskCompletion(task._id)}
                    onOpenCompletion={() => setShowCompletionDialog(task._id)}
                    onToggleSubtask={(index) => toggleSubtask(task._id, index)}
                    onFocus={() => startFocus(task)}
                    getPriorityColor={getPriorityColor}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </ul>
            </Card>
          )
        )}

        {viewMode === 'kanban' && (
          <KanbanView
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onEdit={(task) => setEditingTask(task)}
            onDelete={requestDelete}
            onFocus={startFocus}
            onToggleComplete={toggleTaskCompletion}
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarView
            tasks={filteredTasks}
            onToggleComplete={toggleTaskCompletion}
            onFocus={startFocus}
            onEdit={(task) => setEditingTask(task)}
          />
        )}
      </div>

      {/* Smart Suggest Dialog */}
      <SmartSuggest
        open={showSmartSuggest}
        onClose={() => setShowSmartSuggest(false)}
        tasks={tasks}
        onFocus={startFocus}
      />

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Edit task</DialogTitle>
              <DialogDescription>
                Update your task details
              </DialogDescription>
            </DialogHeader>
            <TaskForm
              task={editingTask}
              onSubmit={(taskData) => updateTask(editingTask._id, taskData)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Task Completion Dialog */}
      {showCompletionDialog && (
        <Dialog open={!!showCompletionDialog} onOpenChange={() => setShowCompletionDialog(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Mark task as completed</DialogTitle>
              <DialogDescription>
                Add completion details to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timeSpent">Time spent (minutes)</Label>
                <Input
                  id="timeSpent"
                  type="number"
                  placeholder="e.g., 45"
                  value={completionData.timeSpent}
                  onChange={(e) => setCompletionData({ ...completionData, timeSpent: e.target.value })}
                  className="font-mono tabular-nums"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={completionData.difficulty} onValueChange={(value: any) => setCompletionData({ ...completionData, difficulty: value })}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any notes about the task completion..."
                  value={completionData.notes}
                  onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:space-x-0">
              <Button variant="outline" onClick={() => setShowCompletionDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleTaskCompletion} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mark as Completed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => { if (!open) setTaskToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              "{taskToDelete?.title}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (taskToDelete) deleteTask(taskToDelete._id); setTaskToDelete(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ============ Quick Templates ============
const QUICK_TEMPLATES: Array<{
  icon: LucideIcon;
  label: string;
  title: string;
  category: Task['category'];
  priority: Task['priority'];
  estimatedTime: number;
  description: string;
}> = [
  { icon: Code, label: 'DSA Practice', title: 'Solve DSA Problems', category: 'practice', priority: 'high', estimatedTime: 60, description: 'Practice data structures and algorithms problems' },
  { icon: Target, label: 'Mock Interview', title: 'Mock Interview Prep', category: 'interview', priority: 'urgent', estimatedTime: 90, description: 'Practice mock interview questions and communication' },
  { icon: BookOpen, label: 'Study Topic', title: 'Study New Topic', category: 'study', priority: 'medium', estimatedTime: 45, description: 'Learn and understand a new concept' },
  { icon: RotateCcw, label: 'Revision', title: 'Revise Previous Topics', category: 'review', priority: 'medium', estimatedTime: 30, description: 'Review and reinforce previously studied topics' },
  { icon: Laptop, label: 'Project Work', title: 'Work on Project', category: 'other', priority: 'high', estimatedTime: 120, description: 'Build or contribute to a project' },
];

// One choice in the task form (category, priority, estimate); the picked one is lit up like the active sidebar item
const optionClass = (selected: boolean) => cn(
  "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  selected
    ? "border-foreground/25 bg-accent text-foreground"
    : "border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground"
);

// ============ TaskForm ============
interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: any) => Promise<void> | void;
}

const TaskForm = ({ task, onSubmit }: TaskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || 'study',
    priority: task?.priority || 'medium',
    deadline: task?.deadline ? toLocalInputValue(task.deadline) : '',
    estimatedTime: task?.estimatedTime || 0,
    link: task?.link || '',
    tags: task?.tags || [] as string[],
    subtasks: task?.subtasks || [] as Subtask[],
  });
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [showExtras, setShowExtras] = useState(
    !!(task?.link || task?.tags?.length || task?.subtasks?.length || task?.estimatedTime)
  );

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    setFormData({
      ...formData,
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      estimatedTime: template.estimatedTime,
      deadline: formData.deadline || toLocalInputValue(tomorrow),
    });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addSubtask = () => {
    const text = subtaskInput.trim();
    if (text) {
      setFormData({ ...formData, subtasks: [...formData.subtasks, { text, done: false }] });
      setSubtaskInput('');
    }
  };

  const removeSubtask = (index: number) => {
    setFormData({ ...formData, subtasks: formData.subtasks.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // A tag or step that was typed but not added with Enter is still kept
    const pendingTag = tagInput.trim();
    const pendingSubtask = subtaskInput.trim();
    const tags = pendingTag && !formData.tags.includes(pendingTag) ? [...formData.tags, pendingTag] : formData.tags;
    const subtasks = pendingSubtask ? [...formData.subtasks, { text: pendingSubtask, done: false }] : formData.subtasks;

    // Always sent, so clearing a link, tags or steps while editing really clears them
    const data = {
      title: formData.title.trim(),
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      deadline: fromLocalInputValue(formData.deadline),
      estimatedTime: formData.estimatedTime,
      link: formData.link.trim(),
      tags,
      subtasks,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Quick Templates */}
      {!task && (
        <div className="space-y-2">
          <p className="eyebrow">Quick templates</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((tmpl, i) => (
              <Button
                key={i}
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs"
                onClick={() => applyTemplate(tmpl)}
              >
                <tmpl.icon className="h-4 w-4 text-muted-foreground" />
                {tmpl.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Task title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="What do you need to do?"
          required
        />
      </div>

      {/* Category & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                aria-pressed={formData.category === cat.value}
                onClick={() => setFormData({ ...formData, category: cat.value as any })}
                className={optionClass(formData.category === cat.value)}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex flex-wrap gap-1.5">
            {PRIORITIES.map(pri => (
              <button
                key={pri.value}
                type="button"
                aria-pressed={formData.priority === pri.value}
                onClick={() => setFormData({ ...formData, priority: pri.value as any })}
                className={optionClass(formData.priority === pri.value)}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", pri.dot)} aria-hidden="true" />
                {pri.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deadline & Estimated Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deadline" className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Deadline *
          </Label>
          <Input
            id="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-muted-foreground" /> Estimated time
          </Label>
          <div className="flex flex-wrap items-center gap-1.5">
            {[15, 30, 45, 60, 90, 120].map(min => (
              <button
                key={min}
                type="button"
                aria-pressed={formData.estimatedTime === min}
                onClick={() => setFormData({ ...formData, estimatedTime: min })}
                className={cn(optionClass(formData.estimatedTime === min), "font-mono tabular-nums")}
              >
                {min >= 60 ? `${min / 60}h` : `${min}m`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add details..."
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Toggle for extra fields */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={showExtras}
        className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setShowExtras(!showExtras)}
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", showExtras && "rotate-180")} />
        {showExtras ? 'Fewer options' : 'Subtasks, tags and link'}
      </Button>

      {showExtras && (
        <div className="space-y-4 border-t pt-4">
          {/* Subtasks */}
          <div className="space-y-2">
            <Label htmlFor="subtask-input" className="flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5 text-muted-foreground" /> Subtasks
            </Label>
            <div className="flex gap-2">
              <Input
                id="subtask-input"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add a step..."
                className="flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
              />
              <Button type="button" variant="secondary" size="icon" onClick={addSubtask} title="Add step" aria-label="Add step">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.subtasks.length > 0 && (
              <ul className="space-y-1">
                {formData.subtasks.map((st, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-md border bg-muted/40 py-1 pl-2.5 pr-1">
                    <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 break-words text-sm">{st.text}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeSubtask(i)}
                      title="Remove step"
                      aria-label={`Remove step: ${st.text}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tag-input" className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" /> Tags
            </Label>
            <Input
              id="tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Type a tag & press Enter..."
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.tags.map(tag => (
                  <span key={tag} className="chip gap-1 pr-0.5">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="rounded-sm p-0.5 transition-colors hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link-input" className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" /> Reference link
            </Label>
            <Input
              id="link-input"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://..."
              type="url"
            />
          </div>
        </div>
      )}

      <DialogFooter className="pt-1">
        <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
          {isSubmitting ? (
            "Saving..."
          ) : task ? (
            <><Check className="h-4 w-4" /> Update Task</>
          ) : (
            <><Plus className="h-4 w-4" /> Create Task</>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// ============ TaskCard ============
interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onOpenCompletion: () => void;
  onToggleSubtask: (index: number) => void;
  onFocus: () => void;
  getPriorityColor: (priority: string) => string;
  getCategoryIcon: (category: string) => any;
}

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onOpenCompletion,
  onToggleSubtask,
  onFocus,
  getPriorityColor,
  getCategoryIcon
}: TaskCardProps) => {
  const due = describeDeadline(task.deadline);
  const CategoryIcon = getCategoryIcon(task.category);
  const isOverdue = due.overdue;
  const isDueSoon = due.soon && !task.completed;
  const subtasksDone = task.subtasks?.filter(s => s.done).length || 0;
  const subtasksTotal = task.subtasks?.length || 0;
  const subtaskProgress = subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0;
  const resourceUrl = safeExternalUrl(task.link);

  const completeLabel = task.completed ? "Mark as incomplete" : "Mark as completed";

  // One row in the task list card: checkbox, details, then the row's actions
  // (on the right on wider screens, underneath on phones)
  return (
    <li className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <button
          type="button"
          onClick={onToggleComplete}
          title={completeLabel}
          aria-label={completeLabel}
          className={cn(
            "-m-1 shrink-0 rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            task.completed ? "text-success" : "text-muted-foreground hover:text-success"
          )}
        >
          {task.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className={cn(
              "min-w-0 break-words text-sm font-medium leading-5",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            <span className={cn(BADGE_CLASS, task.completed ? "bg-muted text-muted-foreground" : getPriorityColor(task.priority))}>
              {PRIORITIES.find(p => p.value === task.priority)?.label}
            </span>
            <span className="chip gap-1">
              <CategoryIcon className="h-3 w-3" />
              {CATEGORIES.find(c => c.value === task.category)?.label}
            </span>
            {task.status === 'in_progress' && (
              <Badge variant="warning">In Progress</Badge>
            )}
            {task.completed && (
              <Badge variant="success">Completed</Badge>
            )}
          </div>

          {task.description && (
            <p className={cn(
              "break-words text-sm text-muted-foreground",
              task.completed && "line-through"
            )}>
              {task.description}
            </p>
          )}

          {/* Subtasks */}
          {subtasksTotal > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Progress value={subtaskProgress} className="flex-1" aria-label="Subtasks done" />
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{subtasksDone}/{subtasksTotal}</span>
              </div>
              <ul className="space-y-0.5">
                {task.subtasks!.map((st, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => onToggleSubtask(i)}
                      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm transition-colors hover:bg-accent"
                    >
                      {st.done ? (
                        <CheckSquare className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={cn("min-w-0 break-words", st.done && "line-through text-muted-foreground")}>{st.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map(tag => (
                <span key={tag} className="chip">#{tag}</span>
              ))}
            </div>
          )}

          {/* Completion Details */}
          {task.completed && (
            <div className="space-y-1 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {task.completedAt && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Completed <span className="font-mono tabular-nums">{new Date(task.completedAt).toLocaleDateString()}</span>
                  </span>
                )}
                {task.timeSpent ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono tabular-nums">
                      {task.timeSpent}m{task.estimatedTime ? ` / ${task.estimatedTime}m est` : ''}
                    </span>
                  </span>
                ) : null}
                {task.difficulty && <DifficultyBadge difficulty={task.difficulty} />}
              </div>
              {task.notes && (
                <p className="italic">"{task.notes}"</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="font-mono tabular-nums">{new Date(task.deadline).toLocaleDateString()}</span>
            </span>

            <span className={cn(
              "flex items-center gap-1",
              isOverdue && !task.completed && "font-medium text-destructive",
              isDueSoon && "font-medium text-warning"
            )}>
              <Clock className="h-3 w-3" />
              {task.completed ? "Done" : due.text}
            </span>

            {task.estimatedTime ? (
              <span className="flex items-center gap-1" title="Estimated time">
                <Timer className="h-3 w-3" />
                <span className="font-mono tabular-nums">
                  {task.estimatedTime >= 60 ? `${task.estimatedTime / 60}h` : `${task.estimatedTime}m`}
                </span>
              </span>
            ) : null}

            {resourceUrl && (
              <a
                href={resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
                onClick={e => e.stopPropagation()}
              >
                <Link2 className="h-3 w-3" />
                Resource
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 pl-8 sm:-mt-1.5 sm:pl-0">
        {!task.completed && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCompletion}
            title="Complete and log time spent, difficulty and notes"
            className="mr-1 h-8 px-2.5 text-xs"
          >
            Mark Complete…
          </Button>
        )}
        {!task.completed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onFocus}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Start Focus Mode"
            aria-label="Start Focus Mode"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Edit task"
          aria-label="Edit task"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
};
