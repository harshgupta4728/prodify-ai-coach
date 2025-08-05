import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, ExternalLink, CheckCircle2, Circle, Target, Clock, RefreshCw } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TopicProgressProps {
  onNavigateToSection?: (section: string) => void;
}

const topics = [
  { id: 'arrays', name: 'Arrays', color: 'bg-blue-500' },
  { id: 'strings', name: 'Strings', color: 'bg-green-500' },
  { id: 'linkedLists', name: 'Linked Lists', color: 'bg-purple-500' },
  { id: 'trees', name: 'Trees', color: 'bg-orange-500' },
  { id: 'graphs', name: 'Graphs', color: 'bg-red-500' },
  { id: 'dynamicProgramming', name: 'Dynamic Programming', color: 'bg-indigo-500' },
  { id: 'greedy', name: 'Greedy', color: 'bg-pink-500' },
  { id: 'backtracking', name: 'Backtracking', color: 'bg-yellow-500' },
  { id: 'binarySearch', name: 'Binary Search', color: 'bg-teal-500' },
  { id: 'twoPointers', name: 'Two Pointers', color: 'bg-cyan-500' },
  { id: 'slidingWindow', name: 'Sliding Window', color: 'bg-emerald-500' },
  { id: 'stack', name: 'Stack', color: 'bg-violet-500' }
];

export const TopicProgress = ({ onNavigateToSection }: TopicProgressProps) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState<any>(null);
  const [topicProblems, setTopicProblems] = useState<{[key: string]: any[]}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  // Refresh progress every 30 seconds to show real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadProgress();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      
      // Load user progress
      const progressData = await apiService.getProgress();
      setProgress(progressData.progress);
      
      // Load problems for each topic
      const topicProblemsData: {[key: string]: any[]} = {};
      
      for (const topic of topics) {
        try {
          // Get problems for this topic
          const problemsData = await apiService.getProblemsByTopic(topic.id);
          topicProblemsData[topic.id] = problemsData.problems || [];
        } catch (error) {
          console.error(`Error loading data for topic ${topic.id}:`, error);
          topicProblemsData[topic.id] = [];
        }
      }
      
      setTopicProblems(topicProblemsData);
      
    } catch (error) {
      console.error('Error loading progress:', error);
      toast({
        title: "Error loading progress",
        description: "Failed to load your topic progress. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTopic = (topicId: string) => {
    // Navigate to the problem interface with the selected topic
    if (onNavigateToSection) {
      onNavigateToSection('problem-interface');
    }
    // You can also store the selected topic in localStorage or context
    localStorage.setItem('selectedTopic', topicId);
  };

  const getTopicProgress = (topicId: string) => {
    if (!progress?.topicProgress) return 0;
    return progress.topicProgress[topicId] || 0;
  };

  const getProgressPercentage = (topicId: string) => {
    const solved = getTopicProgress(topicId);
    return Math.min((solved / 5) * 100, 100); // 5 problems per topic
  };

  const isProblemSolved = (problemId: string) => {
    // Check if this specific problem is solved
    if (!progress?.solvedProblems) return false;
    return progress.solvedProblems.includes(problemId);
  };

  const getCurrentTopic = () => {
    // Find the topic with most progress but not completed
    let currentTopic = topics[0];
    let maxProgress = 0;
    
    for (const topic of topics) {
      const progress = getTopicProgress(topic.id);
      if (progress > maxProgress && progress < 5) {
        maxProgress = progress;
        currentTopic = topic;
      }
    }
    
    // If all topics are completed, show the last one
    if (maxProgress === 0) {
      currentTopic = topics[topics.length - 1];
    }
    
    return currentTopic;
  };

  const getNextTopic = () => {
    const currentTopic = getCurrentTopic();
    const currentIndex = topics.findIndex(t => t.id === currentTopic.id);
    
    // If current topic is completed, move to next
    if (getTopicProgress(currentTopic.id) >= 5) {
      return topics[Math.min(currentIndex + 1, topics.length - 1)];
    }
    
    return currentTopic;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Topic Progress</h2>
          <p className="text-muted-foreground">Track your progress across different DSA topics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Topic Progress</h2>
        <p className="text-muted-foreground">Track your progress across different DSA topics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => {
          const solved = getTopicProgress(topic.id);
          const progressPercent = getProgressPercentage(topic.id);
          const problems = topicProblems[topic.id] || [];
          
          return (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{topic.name}</h3>
                  <Badge variant="outline" className="text-sm">
                    {solved}/5
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {solved} problems solved
                </p>

                <div className="space-y-3">
                  <Progress value={progressPercent} className="h-2" />
                  
                  <Button 
                    className="w-full gap-2"
                    onClick={() => handleStartTopic(topic.id)}
                  >
                    <Play className="h-4 w-4" />
                    {solved === 0 ? 'Start Topic' : 'Continue Topic'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Overall Progress Summary</CardTitle>
          <CardDescription>Your learning journey across all DSA topics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {topics.reduce((total, topic) => total + getTopicProgress(topic.id), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Problems Solved</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {topics.filter(topic => getTopicProgress(topic.id) >= 5).length}
              </div>
              <p className="text-sm text-muted-foreground">Topics Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(topics.reduce((total, topic) => total + getProgressPercentage(topic.id), 0) / topics.length)}%
              </div>
              <p className="text-sm text-muted-foreground">Average Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 