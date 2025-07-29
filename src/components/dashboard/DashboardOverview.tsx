import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Lightbulb,
  ArrowRight,
  Code,
  Trophy
} from "lucide-react";
import aiAssistant from "@/assets/ai-assistant.jpg";

interface DashboardOverviewProps {
  userName: string;
}

export const DashboardOverview = ({ userName }: DashboardOverviewProps) => {
  const todayTasks = [
    { id: 1, title: "Complete Binary Tree Problems", due: "Today", completed: false },
    { id: 2, title: "Review Dynamic Programming", due: "Today", completed: true },
    { id: 3, title: "Practice Linked List", due: "Tomorrow", completed: false },
  ];

  const currentStreak = 15;
  const problemsSolved = 247;
  const currentRating = 1420;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-secondary rounded-xl p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to continue your DSA journey? You're on a {currentStreak}-day streak!
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="gap-2">
              <Trophy className="h-4 w-4" />
              {currentStreak} Day Streak
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Code className="h-4 w-4" />
              {problemsSolved} Problems Solved
            </Badge>
          </div>
        </div>
        <div className="absolute right-4 top-4 opacity-10">
          <TrendingUp className="h-32 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-soft transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{currentRating}</div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                +24 this week
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-soft transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Problems Solved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{problemsSolved}</div>
              <div className="flex items-center gap-1 text-sm text-success">
                <Target className="h-4 w-4" />
                +8 this week
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-soft transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Study Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{currentStreak} days</div>
              <div className="flex items-center gap-1 text-sm text-warning">
                <Clock className="h-4 w-4" />
                Keep it up!
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <Card className="border-primary/20 bg-gradient-accent/5 hover:shadow-soft transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Smart Recommendations</CardTitle>
                <CardDescription>AI-powered suggestions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <img 
                  src={aiAssistant} 
                  alt="AI Assistant" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Great job on Arrays! 🎉</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    You've mastered array problems. Time to tackle Linked Lists next!
                  </p>
                  <Button size="sm" variant="outline" className="gap-2">
                    Start Linked Lists
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Progress */}
        <Card className="hover:shadow-soft transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Current DSA Topic Progress
            </CardTitle>
            <CardDescription>Binary Trees - Week 3 of 4</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span className="font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Tree Traversal</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Binary Search Trees</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Tree Construction</span>
                  <div className="w-4 h-4 rounded-full border-2 border-primary" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Advanced Tree Problems</span>
                  <div className="w-4 h-4 rounded-full border-2 border-muted" />
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-primary hover:opacity-90">
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card className="hover:shadow-soft transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Timeline
            </CardTitle>
            <CardDescription>Your planned activities for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    task.completed 
                      ? "bg-success border-success" 
                      : "border-primary"
                  }`}>
                    {task.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{task.due}</p>
                  </div>
                  <Badge variant={task.due === "Today" ? "default" : "secondary"} className="text-xs">
                    {task.due}
                  </Badge>
                </div>
              ))}
              
              <Button variant="outline" className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                View Full Planner
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};