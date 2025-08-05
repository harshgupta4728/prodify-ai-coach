import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Target, 
  Code,
  BookOpen,
  Trophy,
  ArrowLeft,
  Lightbulb,
  ExternalLink,
  Eye,
  History
} from "lucide-react";
import { SubmissionHistory } from './SubmissionHistory';

interface ProblemInterfaceProps {
  problemId?: string;
  topic?: string;
  onBack?: () => void;
  onProblemSolved?: () => void;
}

export const ProblemInterface = ({ problemId, topic, onBack, onProblemSolved }: ProblemInterfaceProps) => {
  const { toast } = useToast();
  const [problem, setProblem] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [solution, setSolution] = useState("");
  const [language, setLanguage] = useState("python");
  const [timeSpent, setTimeSpent] = useState(0);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [streak, setStreak] = useState<any>(null);
  const [showSavedSolution, setShowSavedSolution] = useState(false);
  const [savedSolution, setSavedSolution] = useState<any>(null);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false);

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' }
  ];

  useEffect(() => {
    // Get selected topic from localStorage if not provided
    const selectedTopic = topic || localStorage.getItem('selectedTopic');
    
    if (topic === 'todays-problem') {
      // Special case for today's problem
      loadTodaysProblem();
    } else if (selectedTopic && problemId) {
      // Both topic and problemId provided - load specific problem in topic context
      loadSpecificProblem();
    } else if (selectedTopic) {
      // Only topic provided - load all problems for topic
      loadProblemsByTopic(selectedTopic);
    } else if (problemId) {
      // Only problemId provided - load specific problem
      loadSpecificProblem();
    } else {
      // No topic or problemId - show error or redirect
      toast({
        title: "No topic selected",
        description: "Please select a topic from the Topic Progress page.",
        variant: "destructive",
      });
    }
  }, [topic, problemId]);

  useEffect(() => {
    if (problems.length > 0) {
      setProblem(problems[currentProblemIndex]);
      setShowSavedSolution(false); // Hide saved solution when problem changes
    }
  }, [problems, currentProblemIndex]);

  // Fetch saved solution for the current problem
  useEffect(() => {
    if (problem) {
      fetchSavedSolution();
    }
  }, [problem]);

  // Timer for tracking time spent
  useEffect(() => {
    if (problem) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [problem]);

  const loadTodaysProblem = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getTodaysProblem();
      if (data.todaysProblem) {
        setProblems([data.todaysProblem]);
        setCurrentProblemIndex(0);
        setStreak(data.streak);
      } else {
        setProblems([]);
      }
    } catch (error) {
      console.error('Error loading today\'s problem:', error);
      toast({
        title: "Error loading today's problem",
        description: "Failed to load today's problem.",
        variant: "destructive",
      });
      setProblems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProblemsByTopic = async (selectedTopic: string) => {
    try {
      setIsLoading(true);
      const data = await apiService.getProblemsByTopic(selectedTopic);
      setProblems(data.problems);
      setCurrentProblemIndex(0);
    } catch (error) {
      console.error('Error loading problems:', error);
      toast({
        title: "Error loading problems",
        description: "Failed to load problems for this topic.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecificProblem = async () => {
    try {
      setIsLoading(true);
      if (topic) {
        // Load problems by topic and find the specific problem
        const data = await apiService.getProblemsByTopic(topic);
        const targetProblem = data.problems.find((p: any) => p.problemId === problemId);
        if (targetProblem) {
          setProblems(data.problems);
          setCurrentProblemIndex(data.problems.findIndex((p: any) => p.problemId === problemId));
        } else {
          // If problem not found in topic, load all problems for the topic
          setProblems(data.problems);
          setCurrentProblemIndex(0);
        }
      } else {
        // Load from problem bank with topic filter
        const selectedTopic = localStorage.getItem('selectedTopic');
        if (selectedTopic) {
          const data = await apiService.getProblemBank({ topic: selectedTopic });
          if (data.problems.length > 0) {
            setProblems(data.problems);
            setCurrentProblemIndex(0);
          }
        }
      }
    } catch (error) {
      console.error('Error loading problem:', error);
      toast({
        title: "Error loading problem",
        description: "Failed to load the problem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedSolution = async () => {
    if (!problem) return;
    
    try {
      const response = await apiService.getProblemSubmissions(problem.problemId);
      
      if (response.submissions && response.submissions.length > 0) {
        // Get the most recent submission (first in the array since it's sorted by solvedAt desc)
        const mostRecentSubmission = response.submissions[0];
        setSavedSolution(mostRecentSubmission);
      } else {
        // No submissions found for this problem
        setSavedSolution(null);
      }
    } catch (error) {
      console.error('Error fetching saved solution:', error);
      setSavedSolution(null);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;

    setIsSubmitting(true);
    try {
      // Check if this is today's problem
      if (topic === 'todays-problem' || problem.problemId?.startsWith('TODAY_')) {
        await apiService.solveTodaysProblem({
          problemId: problem.problemId,
          solution,
          language,
          timeSpent: Math.floor(timeSpent / 60), // Convert to minutes
          notes
        });

        toast({
          title: "Today's problem solved! 🎉",
          description: `"${problem.title}" has been solved! Your streak is now ${streak?.todaysProblemStreak + 1} days!`,
        });
      } else {
        await apiService.markProblemSolved({
          problemId: problem.problemId,
          solution,
          language,
          timeSpent: Math.floor(timeSpent / 60), // Convert to minutes
          notes
        });

        toast({
          title: "Problem solved! 🎉",
          description: `"${problem.title}" has been marked as solved.`,
        });
      }

      // Reset form
      setSolution("");
      setTimeSpent(0);
      setNotes("");
      setShowHints(false);

      if (onProblemSolved) {
        onProblemSolved();
      }

      // Move to next problem if available
      if (problems.length > currentProblemIndex + 1) {
        setCurrentProblemIndex(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error submitting solution:', error);
      toast({
        title: "Error submitting solution",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      setSolution("");
      setTimeSpent(0);
      setNotes("");
      setShowHints(false);
      setSavedSolution(null); // Clear saved solution when navigating
      setShowSavedSolution(false); // Hide saved solution when navigating
    }
  };

  const handlePrevProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(prev => prev - 1);
      setSolution("");
      setTimeSpent(0);
      setNotes("");
      setShowHints(false);
      setSavedSolution(null); // Clear saved solution when navigating
      setShowSavedSolution(false); // Hide saved solution when navigating
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      case 'csharp':
        return `// Write your C# solution here...
// Example:
public class Solution {
    public void Solve() {
        // Your code here
    }
}`;
      case 'go':
        return `// Write your Go solution here...
// Example:
package main

func solve() {
    // Your code here
}`;
      case 'rust':
        return `// Write your Rust solution here...
// Example:
fn solve() {
    // Your code here
}`;
      default:
        return `// Write your solution here...
// Example:
def solve():
    # Your code here
    pass`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No problem found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {topic === 'todays-problem' ? `Today's Problem: ${problem.title}` : problem.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {topic === 'todays-problem' && (
                <Badge className="bg-orange-100 text-orange-800">
                  Problem of the Day
                </Badge>
              )}
              <Badge className={getDifficultyColor(problem.difficulty)}>
                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
              </Badge>
              {problem.topics.map((topic: string) => (
                <Badge key={topic} variant="outline">
                  {topic.charAt(0).toUpperCase() + topic.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {topic === 'todays-problem' && streak && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Current Streak</div>
              <div className="font-bold text-lg text-orange-600">{streak.todaysProblemStreak} days</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Time Spent</div>
            <div className="font-mono text-lg">{formatTime(timeSpent)}</div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.open(problem.problemUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on LeetCode
          </Button>
        </div>
      </div>

      {/* Today's Problem Motivation */}
      {topic === 'todays-problem' && (
        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
          <div className="text-center">
            <h3 className="font-semibold text-orange-800 mb-2">🔥 Keep Your Streak Alive!</h3>
            <p className="text-sm text-orange-700">
              {streak?.todaysProblemStreak > 0 
                ? `You're on a ${streak.todaysProblemStreak}-day streak! Solve today's problem to keep it going.`
                : "Start your daily problem-solving journey today!"
              }
            </p>
          </div>
        </div>
      )}

      {/* Problem Navigation */}
      {problems.length > 1 && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <Button 
            variant="outline" 
            onClick={handlePrevProblem}
            disabled={currentProblemIndex === 0}
          >
            Previous
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Problem Progress</div>
            <div className="font-medium">
              {currentProblemIndex + 1} of {problems.length}
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleNextProblem}
            disabled={currentProblemIndex === problems.length - 1}
          >
            Next
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Problem Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed">{problem.description}</p>
            </div>

            {/* Examples */}
            {problem.examples && problem.examples.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Examples:</h4>
                {problem.examples.map((example: any, index: number) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-lg mb-3">
                    <div className="text-sm">
                      <strong>Input:</strong> {example.input}
                    </div>
                    <div className="text-sm">
                      <strong>Output:</strong> {example.output}
                    </div>
                    {example.explanation && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Constraints:</h4>
                <ul className="text-sm space-y-1">
                  {problem.constraints.map((constraint: string, index: number) => (
                    <li key={index} className="text-muted-foreground">• {constraint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints */}
            {problem.hints && problem.hints.length > 0 && (
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowHints(!showHints)}
                  className="gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </Button>
                {showHints && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold mb-2 text-yellow-800">Hints:</h4>
                    <ul className="text-sm space-y-1 text-yellow-700">
                      {problem.hints.map((hint: string, index: number) => (
                        <li key={index}>• {hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Code Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Your Solution
            </CardTitle>
            <CardDescription>
              Write your solution in the language of your choice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
                             <div className="flex items-center justify-between mb-2">
                 <label className="text-sm font-medium block">Code</label>
                 {problem.isSolved && (
                   <div className="flex gap-2">
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
                         {showSavedSolution ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         {showSavedSolution ? 'Hide Saved' : 'View Saved'}
                       </Button>
                     )}
                   </div>
                 )}
               </div>
              
              {showSavedSolution && savedSolution ? (
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
              ) : (
                <Textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder={getLanguageSampleCode(language)}
                  rows={15}
                  className="font-mono text-sm"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about your approach, time complexity, etc..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !solution.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {topic === 'todays-problem' ? 'Solve Today\'s Problem' : 'Mark as Solved'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submission History Dialog */}
      {problem && (
        <SubmissionHistory
          problemId={problem.problemId}
          problemTitle={problem.title}
          isOpen={showSubmissionHistory}
          onClose={() => setShowSubmissionHistory(false)}
        />
      )}
    </div>
  );
}; 