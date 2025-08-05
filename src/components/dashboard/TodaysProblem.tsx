import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Trophy, Target, CheckCircle, Play, ExternalLink, Flame, RotateCcw, Eye, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { SubmissionHistory } from './SubmissionHistory';

interface TodaysProblem {
  problemId: string;
  title: string;
  difficulty?: string;
  topics?: string[];
  problemUrl: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints: string[];
  hints: string[];
  approach: string;
  currentDay: number;
  totalDays: number;
  isSolved: boolean;
}

interface Streak {
  currentStreak: number;
  todaysProblemStreak: number;
  longestStreak: number;
  longestTodaysProblemStreak: number;
}

export const TodaysProblem = () => {
  console.log('TodaysProblem component rendered');
  
  const [todaysProblem, setTodaysProblem] = useState<TodaysProblem | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState('');
  const [language, setLanguage] = useState('python');
  const [timeSpent, setTimeSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [showSavedSolution, setShowSavedSolution] = useState(false);
  const [savedSolution, setSavedSolution] = useState<any>(null);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodaysProblem();
  }, []);

  // Check if user has already solved this problem
  useEffect(() => {
    if (todaysProblem && todaysProblem.isSolved) {
      fetchSavedSolution();
      setShowSavedSolution(false); // Reset saved solution view when problem changes
    }
  }, [todaysProblem]);

  const fetchTodaysProblem = async () => {
    console.log('Fetching today\'s problem...');
    try {
      setLoading(true);
      const response = await apiService.getTodaysProblem();
      console.log('Today\'s problem response:', response);
      setTodaysProblem(response.todaysProblem);
      setStreak(response.streak);
    } catch (error) {
      console.error('Error fetching today\'s problem:', error);
      toast({
        title: "Error",
        description: "Failed to fetch today's problem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSolve = async () => {
    if (!todaysProblem) return;

    try {
      setSolving(true);
      const response = await apiService.solveTodaysProblem({
        problemId: todaysProblem.problemId,
        solution,
        language,
        timeSpent: parseInt(timeSpent) || 0,
        notes
      });

      toast({
        title: "Success!",
        description: "Today's problem solved successfully! Your streak has been updated.",
      });

      // Update local state
      setTodaysProblem(prev => prev ? { ...prev, isSolved: true } : null);
      setStreak(response.progress);
      setShowSolution(false);
      setSolution('');
      setTimeSpent('');
      setNotes('');
      
      // Refresh the problem data
      await fetchTodaysProblem();
    } catch (error: any) {
      console.error('Error solving today\'s problem:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to solve today's problem",
        variant: "destructive",
      });
    } finally {
      setSolving(false);
    }
  };

  const fetchSavedSolution = async () => {
    if (!todaysProblem) return;
    
    try {
      const response = await apiService.getProblems();
      
      if (response.problems && response.problems.length > 0) {
        const savedProblem = response.problems.find((p: any) => p.problemId === todaysProblem.problemId);
        if (savedProblem) {
          setSavedSolution(savedProblem);
        }
      }
    } catch (error) {
      console.error('Error fetching saved solution:', error);
    }
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageSampleCode = (lang: string) => {
    switch (lang) {
      case 'python':
        return `# Write your Python solution here...
# Example:
def solve():
    # Your code here
    pass`;
      case 'javascript':
        return `// Write your JavaScript solution here...
// Example:
function solve() {
    // Your code here
}`;
      case 'java':
        return `// Write your Java solution here...
// Example:
public class Solution {
    public void solve() {
        // Your code here
    }
}`;
      case 'cpp':
        return `// Write your C++ solution here...
// Example:
#include <iostream>
using namespace std;

class Solution {
public:
    void solve() {
        // Your code here
    }
};`;
      default:
        return `// Write your solution here...
// Example:
def solve():
    # Your code here
    pass`;
    }
  };

  if (loading) {
    console.log('TodaysProblem: Loading state');
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Problem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            <Separator />
            
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!todaysProblem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Problem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Problem Available</h3>
            <p className="text-muted-foreground mb-4">
              There's no problem available for today. Please check back later or contact support.
            </p>
            <Button 
              onClick={fetchTodaysProblem}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('TodaysProblem: Rendering main content');
  
  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6">
      {/* Left Side - Problem Description */}
      <div className="lg:w-1/2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>Today's Problem</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {streak?.todaysProblemStreak || 0} day streak
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Best: {streak?.longestTodaysProblemStreak || 0}
                </Badge>
              </div>
            </div>
            <CardDescription>
              Solve today's problem to maintain your streak!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {/* Problem Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{todaysProblem.title}</h3>
                <Badge className={getDifficultyColor(todaysProblem.difficulty)}>
                  {todaysProblem.difficulty}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {todaysProblem.topics?.map((topic, index) => (
                  <Badge key={index} variant="secondary">
                    {topic}
                  </Badge>
                )) || null}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(todaysProblem.problemUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on LeetCode
                </Button>
                {todaysProblem.isSolved && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Solved
                  </Badge>
                )}
              </div>

              {/* Problem Description */}
              {todaysProblem.description && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Problem Description</h4>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <p className="whitespace-pre-wrap">{todaysProblem.description}</p>
                  </div>
                </div>
              )}

              {/* Examples */}
              {todaysProblem.examples && todaysProblem.examples.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Examples</h4>
                  <div className="space-y-3">
                    {todaysProblem.examples.map((example, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-muted-foreground mb-1">Input:</p>
                            <code className="bg-background px-2 py-1 rounded text-xs">
                              {example.input}
                            </code>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground mb-1">Output:</p>
                            <code className="bg-background px-2 py-1 rounded text-xs">
                              {example.output}
                            </code>
                          </div>
                        </div>
                        {example.explanation && (
                          <div className="mt-3">
                            <p className="font-medium text-muted-foreground mb-1">Explanation:</p>
                            <p className="text-sm">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {todaysProblem.constraints && todaysProblem.constraints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Constraints</h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <ul className="space-y-1 text-sm">
                      {todaysProblem.constraints.map((constraint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Hints */}
              {todaysProblem.hints && todaysProblem.hints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Hints</h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <ul className="space-y-1 text-sm">
                      {todaysProblem.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">💡</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Approach */}
              {todaysProblem.approach && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Suggested Approach</h4>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <p className="whitespace-pre-wrap">{todaysProblem.approach}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Code Editor/IDE */}
      <div className="lg:w-1/2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <CardTitle>Code Editor</CardTitle>
            </div>
            <CardDescription>
              Write and submit your solution
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 h-full">
            {!todaysProblem.isSolved ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
                    <Input
                      id="timeSpent"
                      type="number"
                      placeholder="30"
                      value={timeSpent}
                      onChange={(e) => setTimeSpent(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="solution">Your Solution</Label>
                  </div>
                  
                  <div className="border rounded-lg bg-muted/20">
                    <Textarea
                      id="solution"
                      placeholder={getLanguageSampleCode(language)}
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="min-h-[300px] font-mono text-sm border-0 bg-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any notes about your approach, time complexity, space complexity..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSolve}
                  disabled={solving || !solution.trim()}
                  className="w-full"
                  size="lg"
                >
                  {solving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Submit Solution
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Problem Solved!</h3>
                  <p className="text-muted-foreground">
                    Great job! You've maintained your streak. Come back tomorrow for the next challenge.
                  </p>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubmissionHistory(true)}
                    className="gap-2"
                  >
                    <History className="h-4 w-4" />
                    View All Submissions
                  </Button>
                  {savedSolution && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSavedSolution(!showSavedSolution)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {showSavedSolution ? 'Hide Saved' : 'View Saved'}
                    </Button>
                  )}
                </div>
                
                {showSavedSolution && savedSolution && (
                  <div className="space-y-4">
                    <div className="border rounded-lg bg-muted/20 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{savedSolution.solution?.language || 'python'}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Solved on {new Date(savedSolution.solvedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="bg-background rounded p-3 font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{savedSolution.solution?.code || 'No code saved'}</pre>
                      </div>
                      {savedSolution.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <h4 className="font-medium mb-2">Notes:</h4>
                          <p className="text-sm text-muted-foreground">{savedSolution.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission History Dialog */}
      {todaysProblem && (
        <SubmissionHistory
          problemId={todaysProblem.problemId}
          problemTitle={todaysProblem.title}
          isOpen={showSubmissionHistory}
          onClose={() => setShowSubmissionHistory(false)}
        />
      )}
    </div>
  );
}; 