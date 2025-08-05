import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, CalendarDays, Target, BookOpen, Code, Bell, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendNotification } from "@/lib/notification-utils";
import { apiService } from "@/lib/api";

interface Task {
  _id: string;
  title: string;
  description: string;
  category: 'study' | 'practice' | 'interview' | 'review' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  timeSpent?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  notes?: string;
  streak?: number; // consecutive days completed
  notificationSent?: boolean; // track if notification was sent
}

interface PlannerProps {
  userEmail?: string;
}

const CATEGORIES = [
  { value: 'study', label: 'Study', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
  { value: 'practice', label: 'Practice', icon: Code, color: 'bg-green-100 text-green-800' },
  { value: 'interview', label: 'Interview', icon: Target, color: 'bg-purple-100 text-purple-800' },
  { value: 'review', label: 'Review', icon: CalendarDays, color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', icon: Calendar, color: 'bg-gray-100 text-gray-800' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export const Planner = ({ userEmail }: PlannerProps) => {
  console.log('🔍 Planner component received userEmail:', userEmail);
  
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
    reminderTime: 60 // minutes before deadline
  });

  // Load tasks from API on component mount
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
    
    // Load notification settings from localStorage (user preference)
    const savedSettings = localStorage.getItem('planner-notification-settings');
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save notification settings to localStorage
  useEffect(() => {
    localStorage.setItem('planner-notification-settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Check for notifications every minute
  useEffect(() => {
    const checkNotifications = () => {
      if (!notificationSettings.enabled || !userEmail) {
        console.log('Notifications disabled or no user email');
        return;
      }

      const now = new Date();
      const pendingTasks = tasks.filter(task => !task.completed);
      
      console.log(`Checking ${pendingTasks.length} pending tasks for notifications...`);

      pendingTasks.forEach(async (task) => {
        const deadline = new Date(task.deadline);
        const timeUntilDeadline = deadline.getTime() - now.getTime();
        const minutesUntilDeadline = timeUntilDeadline / (1000 * 60);

        console.log(`Task "${task.title}": ${minutesUntilDeadline.toFixed(1)} minutes until deadline, notification sent: ${task.notificationSent}`);

        // Send notification if deadline is within reminder time and notification hasn't been sent
        if (minutesUntilDeadline <= notificationSettings.reminderTime && 
            minutesUntilDeadline > 0 && 
            !task.notificationSent) {
          console.log(`Sending notification for task: ${task.title}`);
          await sendTaskNotification(task);
          
          // Mark notification as sent in database
          try {
            await apiService.markNotificationSent(task._id);
            // Update local state
            setTasks(prev => prev.map(t => 
              t._id === task._id ? { ...t, notificationSent: true } : t
            ));
          } catch (error) {
            console.error('Error marking notification as sent:', error);
          }
        }
      });
    };

    // Check immediately
    checkNotifications();
    
    // Check every minute
    const interval = setInterval(checkNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [tasks, notificationSettings, userEmail]);

  const sendTaskNotification = async (task: Task) => {
    try {
      console.log('🔔 sendTaskNotification called for task:', task.title);
      console.log('👤 Current userEmail in Planner:', userEmail);
      console.log('⚙️ Notification settings:', notificationSettings);
      
      // Send notifications using the centralized notification system
      await sendNotification(
        'Task Deadline Reminder',
        `Your task "${task.title}" is due in ${notificationSettings.reminderTime} minutes!`,
        'both',
        userEmail
      );
      
      console.log('✅ Notification sent successfully for task:', task.title);
      
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const addTask = async (taskData: Omit<Task, '_id' | 'createdAt' | 'completed' | 'notificationSent'>) => {
    try {
      const newTask = await apiService.createTask({
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        deadline: taskData.deadline,
        tags: taskData.tags
      });
      
      setTasks(prev => [newTask, ...prev]);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
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
      // Show completion dialog for pending tasks
      setShowCompletionDialog(taskId);
    } else {
      // Mark as incomplete
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
          completedAt: undefined,
          timeSpent: 0,
          difficulty: 'medium',
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

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    const daysUntilDeadline = getDaysUntilDeadline(task.deadline);
    return daysUntilDeadline >= 0;
  }).length;
  const onTimeRate = completedTasks.length > 0 ? (onTimeCompletions / completedTasks.length) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Header with Stats */}
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
          <div className="flex gap-2">
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

            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="kanban">Kanban</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task with deadline and priority
                </DialogDescription>
              </DialogHeader>
              <TaskForm onSubmit={addTask} />
            </DialogContent>
          </Dialog>
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
      {urgentTasks.length > 0 && (
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

      {/* Tasks List */}
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
              getDaysUntilDeadline={getDaysUntilDeadline}
              getPriorityColor={getPriorityColor}
              getCategoryIcon={getCategoryIcon}
            />
          ))
        )}
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="sm:max-w-[425px]">
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

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: Omit<Task, '_id' | 'createdAt' | 'completed' | 'notificationSent'>) => void;
}

const TaskForm = ({ task, onSubmit }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || 'study',
    priority: task?.priority || 'medium',
    deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map(priority => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Input
          id="deadline"
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          required
        />
      </div>

      <DialogFooter>
        <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
          {task ? 'Update Task' : 'Add Task'}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  getDaysUntilDeadline: (deadline: string) => number;
  getPriorityColor: (priority: string) => string;
  getCategoryIcon: (category: string) => any;
}

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleComplete, 
  getDaysUntilDeadline, 
  getPriorityColor, 
  getCategoryIcon 
}: TaskCardProps) => {
  const daysUntilDeadline = getDaysUntilDeadline(task.deadline);
  const CategoryIcon = getCategoryIcon(task.category);
  const isOverdue = daysUntilDeadline < 0;
  const isDueSoon = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      task.completed && "opacity-60 bg-gray-50",
      isOverdue && "border-red-200 bg-red-50"
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
                <div className="flex items-center gap-2 mb-2">
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
                  {task.completed && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  )}
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
                
                {/* Completion Details */}
                {task.completed && (
                  <div className="mb-2 p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-4 text-xs">
                      {task.completedAt && (
                        <div className="flex items-center gap-1 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Completed on {new Date(task.completedAt).toLocaleDateString()}
                        </div>
                      )}
                      {task.timeSpent && (
                        <div className="flex items-center gap-1 text-blue-700">
                          <Clock className="h-3 w-3" />
                          {task.timeSpent} min
                        </div>
                      )}
                      {task.difficulty && (
                        <div className="flex items-center gap-1 text-purple-700">
                          <Target className="h-3 w-3" />
                          {task.difficulty}
                        </div>
                      )}
                    </div>
                    {task.notes && (
                      <p className="text-xs text-green-600 mt-1 italic">
                        "{task.notes}"
                      </p>
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
                    isOverdue && "text-red-600 font-medium",
                    isDueSoon && "text-orange-600 font-medium"
                  )}>
                    <Clock className="h-3 w-3" />
                    {isOverdue 
                      ? `${Math.abs(daysUntilDeadline)} days overdue`
                      : isDueSoon
                      ? `${daysUntilDeadline} days left`
                      : `${daysUntilDeadline} days left`
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
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