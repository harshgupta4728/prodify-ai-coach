import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { ProblemInterface } from "./ProblemInterface";
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Target, 
  TrendingUp,
  Code,
  BookOpen,
  Trophy,
  Play,
  ExternalLink,
  Calendar
} from "lucide-react";

interface ProblemSolverProps {
  onProblemAdded?: () => void;
}

export const ProblemSolver = ({ onProblemAdded }: ProblemSolverProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [todaysProblems, setTodaysProblems] = useState<any[]>([]);
  const [isLoadingTodaysProblems, setIsLoadingTodaysProblems] = useState(false);

  const topics = [
    'arrays', 'strings', 'linkedLists', 'trees', 'graphs',
    'dynamicProgramming', 'greedy', 'backtracking', 'binarySearch',
    'twoPointers', 'slidingWindow', 'stack', 'queue', 'heap',
    'trie', 'unionFind', 'bitManipulation', 'math', 'geometry'
  ];

  useEffect(() => {
    loadProgress();
    loadRecommendations();
    loadTodaysProblems();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await apiService.getProgress();
      setProgress(data.progress);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await apiService.getRecommendations();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadTodaysProblems = async () => {
    try {
      setIsLoadingTodaysProblems(true);
      const data = await apiService.getTodaysProblem();
      if (data.todaysProblem) {
        setTodaysProblems([data.todaysProblem]);
      } else {
        setTodaysProblems([]);
      }
    } catch (error) {
      console.error('Error loading today\'s problems:', error);
      setTodaysProblems([]);
    } finally {
      setIsLoadingTodaysProblems(false);
    }
  };

  const handleStartTopic = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedProblemId(null);
  };

  const handleProblemSolved = () => {
    loadProgress();
    loadRecommendations();
    if (onProblemAdded) {
      onProblemAdded();
    }
  };

  const getTopicProgress = (topic: string) => {
    if (!progress?.topicProgress) return 0;
    return progress.topicProgress[topic] || 0;
  };

  // If a topic is selected, show the problem interface
  if (selectedTopic) {
    return (
      <ProblemInterface
        topic={selectedTopic}
        problemId={selectedProblemId}
        onBack={handleBackToTopics}
        onProblemSolved={handleProblemSolved}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Problem Solver</h1>
          <p className="text-muted-foreground">Solve DSA problems and track your progress</p>
        </div>
      </div>

      {/* Progress Overview */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{progress.totalProblemsSolved}</div>
                <p className="text-sm text-muted-foreground">Total Solved</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.currentStreak}</div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.currentRating}</div>
                <p className="text-sm text-muted-foreground">Current Rating</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{progress.problemsSolvedThisWeek}</div>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Recommended Problems */}
      {todaysProblems.length > 0 && (
        <Card className="border-2 border-primary/20">
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
            {isLoadingTodaysProblems ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysProblems.map((problem, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">{problem.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={problem.difficulty === 'easy' ? 'default' : problem.difficulty === 'medium' ? 'secondary' : 'destructive'}
                        >
                          {problem.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {problem.topics?.[0] || 'DSA'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {progress?.currentStreak > 0 ? `You're on a ${progress.currentStreak}-day streak!` : 'Start your learning journey today!'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleStartTopic('todays-problem')}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Solve Today's Problem
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(problem.problemUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>AI-powered suggestions based on your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {rec.type === 'topic' && <BookOpen className="h-5 w-5 text-primary" />}
                    {rec.type === 'streak' && <Trophy className="h-5 w-5 text-primary" />}
                    {rec.type === 'goal' && <Target className="h-5 w-5 text-primary" />}
                    {rec.type === 'difficulty' && <TrendingUp className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={rec.priority === 'high' ? 'default' : 'secondary'}>
                        {rec.priority} priority
                      </Badge>
                      <span className="text-xs text-muted-foreground">{rec.reason}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    {rec.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

              {/* Topic Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Topic Progress
            </CardTitle>
            <CardDescription>Track your progress across different DSA topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.slice(0, 12).map((topic) => {
                const solved = getTopicProgress(topic);
                const progress = Math.min((solved / 5) * 100, 100);
                
                return (
                  <div key={topic} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">{topic.replace(/([A-Z])/g, ' $1').trim()}</h3>
                      <Badge variant={solved >= 5 ? 'default' : 'secondary'}>
                        {solved}/5
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      {solved} problems solved
                    </p>
                    <Button 
                      onClick={() => handleStartTopic(topic)}
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                    >
                      <Play className="h-3 w-3" />
                      {solved === 0 ? 'Start Topic' : 'Continue Topic'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

    </div>
  );
}; 