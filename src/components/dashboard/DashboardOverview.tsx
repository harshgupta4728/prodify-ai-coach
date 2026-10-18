import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Code2,
  Flame,
  Gauge,
  RotateCcw,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { StatTile } from "@/components/common/StatTile";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { ActivityHeatmap } from "@/components/common/ActivityHeatmap";

interface DashboardOverviewProps {
  userName: string;
  onNavigateToSection?: (section: string) => void;
}

const RECOMMENDATION_ICONS: Record<string, LucideIcon> = {
  streak: Flame,
  goal: Target,
  difficulty: Gauge,
  topic: BookOpen,
};

export const DashboardOverview = ({ userName, onNavigateToSection }: DashboardOverviewProps) => {
  const [progress, setProgress] = useState<any>(null);
  const [activity, setActivity] = useState<Record<string, number>>({});
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
      setActivity(progressData.activity || {});
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
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[104px]" />)}
        </div>
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <Card className="p-8 text-center space-y-3">
        <p className="font-medium">Couldn't load your dashboard</p>
        <p className="text-sm text-muted-foreground">Check your internet connection and try again.</p>
        <Button onClick={loadDashboardData} variant="secondary" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
      </Card>
    );
  }

  const currentStreak = progress?.currentStreak || 0;
  const longestStreak = Math.max(progress?.longestStreak || 0, currentStreak);
  const dailyStreak = progress?.todaysProblemStreak || 0;
  const longestDailyStreak = Math.max(progress?.longestTodaysProblemStreak || 0, dailyStreak);
  const problemsSolved = progress?.totalProblemsSolved || 0;
  const solvedThisMonth = progress?.problemsSolvedThisMonth || 0;
  const rating = progress?.currentRating || 1200;
  const highestRating = Math.max(progress?.highestRating || 0, rating);
  const solvedThisWeek = progress?.problemsSolvedThisWeek || 0;
  const weeklyGoal = progress?.weeklyGoal || 15;
  const solvedToday = Boolean(todaysProblem?.isSolved);
  const days = (n: number) => (n === 1 ? "day" : "days");

  const subtitle = solvedToday
    ? "Today's problem is done. Keep the momentum going."
    : problemsSolved === 0
      ? "Start with today's problem: one problem a day builds a streak."
      : currentStreak > 0
        ? `You're on a ${currentStreak}-day streak. Solve something today to keep it going.`
        : "Today's problem is waiting for you.";

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back, ${firstName}`} description={subtitle} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Streak"
          value={currentStreak}
          unit={days(currentStreak)}
          hint={`Best: ${longestStreak} ${days(longestStreak)}`}
          icon={Flame}
          highlight={currentStreak > 0}
          title="Days in a row with at least one solved problem"
        />
        <StatTile
          label="Daily problem"
          value={dailyStreak}
          unit={days(dailyStreak)}
          hint={`Best: ${longestDailyStreak} ${days(longestDailyStreak)}`}
          icon={CalendarCheck}
          title="Days in a row you solved the problem of the day"
        />
        <StatTile
          label="Solved"
          value={problemsSolved}
          unit={problemsSolved === 1 ? "problem" : "problems"}
          hint={`${solvedThisMonth} in the last 30 days`}
          icon={CheckCircle2}
        />
        <StatTile
          label="Rating"
          value={rating}
          hint={`Highest: ${highestRating}`}
          icon={Trophy}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problem of the day */}
        <Card className="lg:col-span-2 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">Problem of the day</p>
            <span className="font-mono text-xs text-muted-foreground">{todayLabel}</span>
          </div>
          {todaysProblem ? (
            <>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold leading-snug">{todaysProblem.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <DifficultyBadge difficulty={todaysProblem.difficulty} />
                  {(todaysProblem.topics || []).slice(0, 3).map((topic: string) => (
                    <span key={topic} className="chip">{topic}</span>
                  ))}
                </div>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => go('todays-problem')}
                  variant={solvedToday ? "secondary" : "default"}
                  className="gap-2"
                >
                  <Code2 className="h-4 w-4" />
                  {solvedToday ? "Review solution" : "Solve now"}
                </Button>
                {solvedToday ? (
                  <span className="flex items-center gap-1.5 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" /> Solved today
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">A new problem every day at midnight</span>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">No problem is available today. Practice a topic instead.</p>
              <Button variant="secondary" onClick={() => go('topic-progress')} className="gap-2">
                Browse topics <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>

        {/* Weekly goal */}
        <Card className="p-5 flex flex-col gap-3">
          <p className="eyebrow">This week</p>
          <p className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-semibold tabular-nums">{solvedThisWeek}</span>
            <span className="text-sm text-muted-foreground">/ {weeklyGoal} problems</span>
          </p>
          <Progress value={Math.min((solvedThisWeek / weeklyGoal) * 100, 100)} />
          <p className="text-xs text-muted-foreground mt-auto">
            {solvedThisWeek >= weeklyGoal
              ? "Weekly goal reached. Nice work."
              : `${weeklyGoal - solvedThisWeek} more to reach your goal. You can change it in Settings.`}
          </p>
        </Card>
      </div>

      {/* Activity calendar */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Activity</p>
          <span className="text-xs text-muted-foreground">
            Longest streak <span className="font-mono text-foreground">{longestStreak}</span> {days(longestStreak)}
          </span>
        </div>
        <ActivityHeatmap activity={activity} />
      </Card>

      {/* Recommendations */}
      <Card className="p-5">
        <p className="eyebrow mb-1">Up next</p>
        <ul className="divide-y">
          {(recommendations.length > 0 ? recommendations.slice(0, 3) : [{
            type: 'topic',
            title: 'Start with the basics',
            description: 'Begin with array problems to build your foundation.',
            action: 'View topics',
          }]).map((rec: any, index: number) => {
            const Icon = RECOMMENDATION_ICONS[rec.type] || BookOpen;
            return (
              <li key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 last:pb-0">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="gap-1.5 self-start sm:self-auto" onClick={() => handleRecommendationAction(rec)}>
                  {rec.action} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
};
