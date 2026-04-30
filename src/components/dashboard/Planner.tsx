import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, CalendarDays, Target, BookOpen, Code, Bell, Mail, Play, Sparkles, LayoutGrid, List, CalendarRange, Timer, Link2, Tag, ListChecks, X, Square, CheckSquare, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendNotification } from "@/lib/notification-utils";
import { apiService } from "@/lib/api";
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

const CATEGORIES = [
  { value: 'study', label: 'Study', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
  { value: 'practice', label: 'Practice', icon: Code, color: 'bg-green-100 text-green-800' },
  { value: 'interview', label: 'Interview', icon: Target, color: 'bg-purple-100 text-purple-800' },
  { value: 'review', label: 'Review', icon: CalendarDays, color: 'bg-amber-100 text-amber-800' },
  { value: 'other', label: 'Other', icon: Calendar, color: 'bg-gray-100 text-gray-800' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-amber-100 text-amber-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export const Planner = ({ userEmail }: PlannerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load tasks from API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await apiService.getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();

    const savedSettings = localStorage.getItem('planner-notification-settings');
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }
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
    } catch (error) {
      console.error('Error creating task:', error);
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
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (task && !task.completed) {
      setShowCompletionDialog(taskId);
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
      console.error('Error marking task incomplete:', error);
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
    } catch (error) {
      console.error('Error completing task:', error);
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

    // If moving from done to another status
    if (task.completed && newStatus !== 'done') {
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
      console.error('Error changing task status:', error);
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

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = PRIORITIES.find(p => p.value === priority);
    return priorityObj?.color || 'bg-gray-100 text-gray-800';
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
  const urgentTasks = tasks.filter(task =>
    !task.completed &&
    (task.priority === 'urgent' || getDaysUntilDeadline(task.deadline) <= 3)
  );

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
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Focus Mode Bar */}
      {focusTask && (
        <FocusMode
          task={focusTask}
          onStop={handleFocusStop}
          onComplete={handleFocusComplete}
          onClose={() => setFocusTask(null)}
        />
      )}

      {/* Notification Settings */}
      {userEmail && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5 text-blue-600" />
                  {notificationSettings.enabled && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Email Notifications</p>
                  <p className="text-sm text-blue-600">
                    Automatic email reminders {notificationSettings.reminderTime} minutes before deadlines
                  </p>
                  <p className="text-xs text-blue-500">
                    Notifications will be sent to: {userEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="text-blue-700 border-blue-300"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enable Browser Notifications
                </Button>
                <Select
                  value={notificationSettings.reminderTime.toString()}
                  onValueChange={(value) => setNotificationSettings(prev => ({
                    ...prev,
                    reminderTime: parseInt(value)
                  }))}
                >
                  <SelectTrigger className="w-32">
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
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-xs text-muted-foreground">{completionRate.toFixed(1)}% completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-xs text-muted-foreground">{urgentTasks.length} urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-xs text-muted-foreground">{onTimeRate.toFixed(1)}% on time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">{Math.round(totalTimeSpent / 60)}h</p>
                <p className="text-xs text-muted-foreground">{Math.round(averageTimePerTask)}min avg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
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

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 px-3 rounded-none border-0",
                  viewMode === 'list' && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 px-3 rounded-none border-0",
                  viewMode === 'kanban' && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
                onClick={() => setViewMode('kanban')}
                title="Kanban Board"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 px-3 rounded-none border-0",
                  viewMode === 'calendar' && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
                onClick={() => setViewMode('calendar')}
                title="Calendar View"
              >
                <CalendarRange className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {/* AI Smart Suggest */}
            <Button
              variant="outline"
              onClick={() => setShowSmartSuggest(true)}
              className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50"
            >
              <Sparkles className="h-4 w-4" />
              AI Suggest
            </Button>

            {/* Add Task */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Create New Task
                  </DialogTitle>
                  <DialogDescription>
                    Use a template or build your own task
                  </DialogDescription>
                </DialogHeader>
                <TaskForm onSubmit={addTask} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      {/* Urgent Tasks Alert */}
      {urgentTasks.length > 0 && viewMode === 'list' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Urgent Tasks Due Soon!</p>
                <p className="text-sm text-red-600">
                  You have {urgentTasks.length} task(s) that need immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Content */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No tasks found. Create your first task to get started!</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onDelete={() => deleteTask(task._id)}
                onToggleComplete={() => toggleTaskCompletion(task._id)}
                onToggleSubtask={(index) => toggleSubtask(task._id, index)}
                onFocus={() => startFocus(task)}
                getDaysUntilDeadline={getDaysUntilDeadline}
                getPriorityColor={getPriorityColor}
                getCategoryIcon={getCategoryIcon}
              />
            ))
          )}
        </div>
      )}

      {viewMode === 'kanban' && (
        <KanbanView
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onEdit={(task) => setEditingTask(task)}
          onDelete={deleteTask}
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
              <DialogTitle>Edit Task</DialogTitle>
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
              <DialogTitle>Mark Task as Completed</DialogTitle>
              <DialogDescription>
                Add completion details to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
                <Input
                  id="timeSpent"
                  type="number"
                  placeholder="e.g., 45"
                  value={completionData.timeSpent}
                  onChange={(e) => setCompletionData({ ...completionData, timeSpent: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={completionData.difficulty} onValueChange={(value: any) => setCompletionData({ ...completionData, difficulty: value })}>
                  <SelectTrigger>
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
                <Label htmlFor="notes">Completion Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any notes about the task completion..."
                  value={completionData.notes}
                  onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompletionDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleTaskCompletion} className="bg-green-600 hover:bg-green-700">
                Mark as Completed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// ============ Quick Templates ============
const QUICK_TEMPLATES = [
  { emoji: '📖', label: 'DSA Practice', title: 'Solve DSA Problems', category: 'practice', priority: 'high', estimatedTime: 60, description: 'Practice data structures and algorithms problems' },
  { emoji: '🎯', label: 'Mock Interview', title: 'Mock Interview Prep', category: 'interview', priority: 'urgent', estimatedTime: 90, description: 'Practice mock interview questions and communication' },
  { emoji: '📚', label: 'Study Topic', title: 'Study New Topic', category: 'study', priority: 'medium', estimatedTime: 45, description: 'Learn and understand a new concept' },
  { emoji: '🔄', label: 'Revision', title: 'Revise Previous Topics', category: 'review', priority: 'medium', estimatedTime: 30, description: 'Review and reinforce previously studied topics' },
  { emoji: '💻', label: 'Project Work', title: 'Work on Project', category: 'other', priority: 'high', estimatedTime: 120, description: 'Build or contribute to a project' },
];

// ============ TaskForm ============
interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: any) => void;
}

const TaskForm = ({ task, onSubmit }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || 'study',
    priority: task?.priority || 'medium',
    deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
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
      deadline: formData.deadline || tomorrow.toISOString().slice(0, 16),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      deadline: formData.deadline,
    };
    if (formData.estimatedTime > 0) data.estimatedTime = formData.estimatedTime;
    if (formData.link) data.link = formData.link;
    if (formData.tags.length > 0) data.tags = formData.tags;
    if (formData.subtasks.length > 0) data.subtasks = formData.subtasks;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Quick Templates */}
      {!task && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((tmpl, i) => (
              <Button
                key={i}
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 hover:bg-primary/10 hover:border-primary/40"
                onClick={() => applyTemplate(tmpl)}
              >
                <span>{tmpl.emoji}</span>
                {tmpl.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="What do you need to do?"
          required
        />
      </div>

      {/* Category & Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Category</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value as any })}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  formData.category === cat.value
                    ? cat.color + " border-current ring-1 ring-current/20"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Priority</Label>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map(pri => (
              <button
                key={pri.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: pri.value as any })}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  formData.priority === pri.value
                    ? pri.color + " border-current ring-1 ring-current/20"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                {pri.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deadline & Estimated Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="deadline" className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Deadline *
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
            <Timer className="h-3.5 w-3.5" /> Est. Time (min)
          </Label>
          <div className="flex items-center gap-2">
            {[15, 30, 45, 60, 90, 120].map(min => (
              <button
                key={min}
                type="button"
                onClick={() => setFormData({ ...formData, estimatedTime: min })}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium transition-all",
                  formData.estimatedTime === min
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
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
        className="text-xs text-muted-foreground hover:text-foreground w-full justify-center gap-1"
        onClick={() => setShowExtras(!showExtras)}
      >
        {showExtras ? '− Less options' : '+ Subtasks, Tags, Link'}
      </Button>

      {showExtras && (
        <div className="space-y-4 border-t pt-4">
          {/* Subtasks */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" /> Subtasks / Checklist
            </Label>
            <div className="flex gap-2">
              <Input
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add a step..."
                className="flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSubtask} className="px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.subtasks.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {formData.subtasks.map((st, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg group">
                    <Square className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{st.text}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-500"
                      onClick={() => removeSubtask(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type a tag & press Enter..."
                className="flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" /> Reference Link
            </Label>
            <Input
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://..."
              type="url"
            />
          </div>
        </div>
      )}

      <DialogFooter className="pt-2">
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full gap-2">
          {task ? (
            <><Edit className="h-4 w-4" /> Update Task</>
          ) : (
            <><Zap className="h-4 w-4" /> Create Task</>
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
  onToggleSubtask: (index: number) => void;
  onFocus: () => void;
  getDaysUntilDeadline: (deadline: string) => number;
  getPriorityColor: (priority: string) => string;
  getCategoryIcon: (category: string) => any;
}

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleSubtask,
  onFocus,
  getDaysUntilDeadline,
  getPriorityColor,
  getCategoryIcon
}: TaskCardProps) => {
  const daysUntilDeadline = getDaysUntilDeadline(task.deadline);
  const CategoryIcon = getCategoryIcon(task.category);
  const isOverdue = daysUntilDeadline < 0;
  const isDueSoon = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;
  const subtasksDone = task.subtasks?.filter(s => s.done).length || 0;
  const subtasksTotal = task.subtasks?.length || 0;
  const subtaskProgress = subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      task.completed && "opacity-60 bg-gray-50",
      isOverdue && !task.completed && "border-red-200 bg-red-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="mt-0.5 p-1 h-auto hover:bg-green-50"
                onClick={onToggleComplete}
                title={task.completed ? "Mark as incomplete" : "Mark as completed"}
              >
                <CheckCircle className={cn(
                  "h-5 w-5",
                  task.completed ? "text-green-600" : "text-gray-400 hover:text-green-600"
                )} />
              </Button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className={cn(
                    "font-semibold",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </h3>
                  <Badge className={getPriorityColor(task.priority)}>
                    {PRIORITIES.find(p => p.value === task.priority)?.label}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CategoryIcon className="h-3 w-3" />
                    {CATEGORIES.find(c => c.value === task.category)?.label}
                  </Badge>
                  {task.status === 'in_progress' && (
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  )}
                  {task.completed && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
                  )}
                  {task.estimatedTime ? (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Timer className="h-3 w-3" />
                      {task.estimatedTime >= 60 ? `${task.estimatedTime / 60}h` : `${task.estimatedTime}m`}
                    </Badge>
                  ) : null}
                  {!task.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onToggleComplete}
                      className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>

                {task.description && (
                  <p className={cn(
                    "text-sm text-muted-foreground mb-2",
                    task.completed && "line-through"
                  )}>
                    {task.description}
                  </p>
                )}

                {/* Subtasks */}
                {subtasksTotal > 0 && (
                  <div className="mb-3 space-y-1.5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${subtaskProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{subtasksDone}/{subtasksTotal}</span>
                    </div>
                    {task.subtasks!.map((st, i) => (
                      <button
                        key={i}
                        onClick={() => onToggleSubtask(i)}
                        className="flex items-center gap-2 text-sm w-full text-left hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
                      >
                        {st.done ? (
                          <CheckSquare className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={cn(st.done && "line-through text-muted-foreground")}>{st.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {task.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Completion Details */}
                {task.completed && (
                  <div className="mb-2 p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-4 text-xs">
                      {task.completedAt && (
                        <div className="flex items-center gap-1 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Completed {new Date(task.completedAt).toLocaleDateString()}
                        </div>
                      )}
                      {task.timeSpent ? (
                        <div className="flex items-center gap-1 text-blue-700">
                          <Clock className="h-3 w-3" />
                          {task.timeSpent}m{task.estimatedTime ? ` / ${task.estimatedTime}m est` : ''}
                        </div>
                      ) : null}
                      {task.difficulty && (
                        <div className="flex items-center gap-1 text-purple-700">
                          <Target className="h-3 w-3" />
                          {task.difficulty}
                        </div>
                      )}
                    </div>
                    {task.notes && (
                      <p className="text-xs text-green-600 mt-1 italic">"{task.notes}"</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.deadline).toLocaleDateString()}
                  </div>

                  <div className={cn(
                    "flex items-center gap-1",
                    isOverdue && !task.completed && "text-red-600 font-medium",
                    isDueSoon && "text-primary font-medium"
                  )}>
                    <Clock className="h-3 w-3" />
                    {isOverdue
                      ? `${Math.abs(daysUntilDeadline)} days overdue`
                      : `${daysUntilDeadline} days left`
                    }
                  </div>

                  {task.link && (
                    <a
                      href={task.link}
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
          </div>

          <div className="flex items-center gap-1">
            {!task.completed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFocus}
                className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                title="Start Focus Mode"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
              title="Edit task"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
