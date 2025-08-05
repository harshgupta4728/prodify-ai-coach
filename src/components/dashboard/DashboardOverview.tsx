import React, { useState, useEffect } from "react";
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
  Trophy,
  Plus,
  RotateCcw,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import aiAssistant from "@/assets/ai-assistant.jpg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DashboardOverviewProps {
  userName: string;
  onNavigateToSection?: (section: string) => void;
}

export const DashboardOverview = ({ userName, onNavigateToSection }: DashboardOverviewProps) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todaysProblem, setTodaysProblem] = useState<any>(null);



  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [progressData, recommendationsData, todaysProblemData] = await Promise.all([
        apiService.getProgress(),
        apiService.getRecommendations(),
        apiService.getTodaysProblem().catch(() => ({ todaysProblem: null }))
      ]);
      
      setProgress(progressData.progress);
      setRecommendations(recommendationsData.recommendations || []);
      setTodaysProblem(todaysProblemData.todaysProblem);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your progress data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetProgress = async () => {
    try {
      await apiService.resetProgress();
      toast({
        title: "Progress Reset",
        description: "Your progress has been reset successfully. All solved problems and stats have been cleared.",
      });
      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast({
        title: "Error",
        description: "Failed to reset progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddProblem = () => {
    if (onNavigateToSection) {
      onNavigateToSection('topic-progress');
    }
  };

  const handleRecommendationAction = (recommendation: any) => {
    if (onNavigateToSection) {
      if (recommendation.type === 'topic') {
        onNavigateToSection('topic-progress');
      } else if (recommendation.type === 'streak') {
        onNavigateToSection('todays-problem');
      } else {
        onNavigateToSection('topic-progress');
      }
    }
  };

  const handleSolveTodaysProblem = () => {
    if (onNavigateToSection) {
      onNavigateToSection('todays-problem');
    }
  };

  // Use real data or fallback to defaults
  const currentStreak = progress?.todaysProblemStreak || 0;
  const problemsSolved = progress?.totalProblemsSolved || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-secondary to-muted rounded-xl p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Start your learning journey today!
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
      </div>

      {/* Today's Problem Card */}
      <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Problem of the Day
          </CardTitle>
          <CardDescription>
            Solve today's problem to maintain your streak!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todaysProblem ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">{todaysProblem.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={todaysProblem.difficulty === 'easy' ? 'default' : todaysProblem.difficulty === 'medium' ? 'secondary' : 'destructive'}
                    >
                      {todaysProblem.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {todaysProblem.topics?.[0] || 'DSA'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start your learning journey today!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSolveTodaysProblem}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Solve Now
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium">Loading today's problem...</p>
                <p className="text-xs text-muted-foreground">
                  Start your learning journey today!
                </p>
              </div>
              <Button 
                onClick={handleSolveTodaysProblem}
                className="bg-gradient-primary hover:opacity-90"
                disabled
              >
                <Code className="h-4 w-4 mr-2" />
                Loading...
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* AI Recommendations */}
        <Card className="border-primary/20 bg-gradient-to-br from-accent/5 to-primary/5 hover:shadow-soft transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Smart Recommendations</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <img 
                      src={aiAssistant} 
                      alt="AI Assistant" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{rec.title}</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec.description}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => handleRecommendationAction(rec)}
                      >
                        {rec.action}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3">
                  <img 
                    src={aiAssistant} 
                    alt="AI Assistant" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Start Your Journey! 🚀</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Begin with basic array problems to build your foundation.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-2"
                      onClick={handleAddProblem}
                    >
                      View Topics
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};