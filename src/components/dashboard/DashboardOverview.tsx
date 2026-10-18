import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Lightbulb,
  ArrowRight,
  Code,
  Trophy,
  Plus,
  Flame,
  CheckCircle2,
  RotateCcw,
  Target,
} from "lucide-react";
import { apiService } from "@/lib/api";
import aiAssistant from "@/assets/ai-assistant.jpg";

interface DashboardOverviewProps {
  userName: string;
  onNavigateToSection?: (section: string) => void;
}

export const DashboardOverview = ({ userName, onNavigateToSection }: DashboardOverviewProps) => {
  const [progress, setProgress] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [todaysProblem, setTodaysProblem] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      const [progressData, recommendationsData, todaysProblemData] = await Promise.all([
        apiService.getProgress(),
        apiService.getRecommendations().catch(() => ({ recommendations: [] })),
        apiService.getTodaysProblem().catch(() => ({ todaysProblem: null }))
      ]);

      setProgress(progressData.progress);
      setRecommendations(recommendationsData.recommendations || []);
      setTodaysProblem(todaysProblemData.todaysProblem);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const go = (section: string) => onNavigateToSection?.(section);

  const handleRecommendationAction = (recommendation: any) => {
    go(recommendation.type === 'streak' ? 'todays-problem' : 'topic-progress');
  };

  const firstName = userName.split(' ')[0] || userName;

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <p className="font-medium">Couldn't load your dashboard</p>
          <p className="text-sm text-muted-foreground">Check your internet connection and try again.</p>
          <Button onClick={loadDashboardData} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStreak = progress?.currentStreak || 0;
  const dailyStreak = progress?.todaysProblemStreak || 0;
  const problemsSolved = progress?.totalProblemsSolved || 0;
  const rating = progress?.currentRating || 1200;
  const solvedThisWeek = progress?.problemsSolvedThisWeek || 0;
  const weeklyGoal = progress?.weeklyGoal || 15;
  const solvedToday = Boolean(todaysProblem?.isSolved);

  const subtitle = solvedToday
    ? "Today's problem is done. Keep the momentum going!"
    : problemsSolved === 0
      ? "Start with today's problem: one problem a day builds a streak."
      : currentStreak > 0
        ? `You're on a ${currentStreak}-day streak. Solve something today to keep it going!`
        : "Today's problem is waiting for you.";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-secondary to-muted rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground sm:text-lg">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
            <Badge variant="secondary" className="gap-1.5 py-1" title="Days in a row with at least one solved problem">
              <Flame className="h-4 w-4 text-orange-500" />
              {currentStreak} day streak
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1" title="Days in a row you solved today's problem">
              <Calendar className="h-4 w-4" />
              {dailyStreak} daily-problem streak
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1">
              <Code className="h-4 w-4" />
              {problemsSolved} solved
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1">
              <Trophy className="h-4 w-4" />
              Rating {rating}
            </Badge>
          </div>
        </div>
      </div>

      {/* Today's Problem Card */}
      <Card className={solvedToday ? "border-2 border-green-200" : "border-2 border-primary/20 hover:border-primary/40 transition-colors"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Problem of the Day
          </CardTitle>
          <CardDescription>
            {solvedToday ? "Solved! A new problem arrives at midnight." : "Solve today's problem to grow your daily streak!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todaysProblem ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  {solvedToday && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                  <span className="truncate">{todaysProblem.title}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={todaysProblem.difficulty === 'easy' ? 'default' : todaysProblem.difficulty === 'medium' ? 'secondary' : 'destructive'}
                    className="capitalize"
                  >
                    {todaysProblem.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {todaysProblem.topics?.[0] || 'DSA'}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => go('todays-problem')}
                variant={solvedToday ? "outline" : "default"}
                className={solvedToday ? "gap-2" : "gap-2 bg-gradient-primary hover:opacity-90"}
              >
                <Code className="h-4 w-4" />
                {solvedToday ? "Review solution" : "Solve now"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">No problem is available today. Practice a topic instead!</p>
              <Button variant="outline" onClick={() => go('topic-progress')} className="gap-2">
                Browse topics <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly goal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> This Week
            </CardTitle>
            <CardDescription>Problems solved in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{solvedThisWeek}</span>
              <span className="text-muted-foreground">/ {weeklyGoal} goal</span>
            </div>
            <Progress value={Math.min((solvedThisWeek / weeklyGoal) * 100, 100)} />
            <p className="text-xs text-muted-foreground">
              {solvedThisWeek >= weeklyGoal ? "Goal reached. Amazing! 🎉" : `${weeklyGoal - solvedThisWeek} more to reach your goal. Change it in Settings.`}
            </p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-accent/5 to-primary/5 hover:shadow-soft transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-lg">Smart Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <img
                      src={aiAssistant}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
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
                    alt=""
                    className="w-12 h-12 rounded-full object-cover shrink-0"
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
                      onClick={() => go('topic-progress')}
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
