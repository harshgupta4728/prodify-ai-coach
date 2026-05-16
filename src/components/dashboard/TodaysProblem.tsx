import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CodeEditor } from './CodeEditor';
import { CodeOutput } from './CodeOutput';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { Calendar, Trophy, Target, CheckCircle, Play, ExternalLink, Flame, RotateCcw, Eye, History, Send, Loader2, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { SubmissionHistory } from './SubmissionHistory';

interface TodaysProblemData {
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
  const [todaysProblem, setTodaysProblem] = useState<TodaysProblemData | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState('');
  const [language, setLanguage] = useState('python');
  const [timeSpent, setTimeSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [showSavedSolution, setShowSavedSolution] = useState(false);
  const [savedSolution, setSavedSolution] = useState<any>(null);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [activeOutputTab, setActiveOutputTab] = useState('output');
  const { toast } = useToast();

  const {
    isRunning,
    stdout,
    stderr,
    exitCode,
    compileOutput,
    testCaseResults,
    error: execError,
    isTimeout,
    runCode,
    submitCode,
    clearOutput,
  } = useCodeExecution({ examples: todaysProblem?.examples || [] });

  useEffect(() => {
    fetchTodaysProblem();
  }, []);

  useEffect(() => {
    if (todaysProblem && todaysProblem.isSolved) {
      fetchSavedSolution();
      setShowSavedSolution(false);
    }
  }, [todaysProblem]);

  const fetchTodaysProblem = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTodaysProblem();
      setTodaysProblem(response.todaysProblem);
      setStreak(response.streak);
    } catch (error) {
      console.error('Error fetching today\'s problem:', error);
      toast({ title: "Error", description: "Failed to fetch today's problem", variant: "destructive" });
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
        solution, language,
        timeSpent: parseInt(timeSpent) || 0,
        notes
      });
      toast({ title: "Success!", description: "Today's problem solved successfully! Your streak has been updated." });
      setTodaysProblem(prev => prev ? { ...prev, isSolved: true } : null);
      setStreak(response.progress);
      setSolution(''); setTimeSpent(''); setNotes('');
      clearOutput();
      await fetchTodaysProblem();
    } catch (error: any) {
      console.error('Error solving today\'s problem:', error);
      toast({ title: "Error", description: error.message || "Failed to solve today's problem", variant: "destructive" });
    } finally {
      setSolving(false);
    }
  };

  const handleRunCode = async () => {
    if (!solution.trim()) return;
    setActiveOutputTab('output');
    await runCode(solution, language, customInput);
  };

  const handleSubmitCode = async () => {
    if (!solution.trim()) return;
    setActiveOutputTab('testcases');
    await submitCode(solution, language);
  };

  const fetchSavedSolution = async () => {
    if (!todaysProblem) return;
    try {
      const response = await apiService.getProblems();
      if (response.problems && response.problems.length > 0) {
        const savedProblem = response.problems.find((p: any) => p.problemId === todaysProblem.problemId);
        if (savedProblem) setSavedSolution(savedProblem);
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
        return `# Write your Python solution here\ndef solve():\n    # Your code here\n    pass`;
      case 'javascript':
        return `// Write your JavaScript solution here\nfunction solve() {\n    // Your code here\n}`;
      case 'java':
        return `// Write your Java solution here\nimport java.util.*;\n\nclass Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`;
      case 'cpp':
        return `// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`;
      default:
        return `// Write your solution here`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Problem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
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
            <Button onClick={fetchTodaysProblem} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4">
      {/* Left Side - Problem Description */}
      <div className="lg:w-1/2">
        <Card className="h-full">
          <CardHeader className="pb-3">
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
            <CardDescription>Solve today's problem to maintain your streak!</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{todaysProblem.title}</h3>
                <Badge className={getDifficultyColor(todaysProblem.difficulty)}>
                  {todaysProblem.difficulty}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {todaysProblem.topics?.map((topic, index) => (
                  <Badge key={index} variant="secondary">{topic}</Badge>
                )) || null}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open(todaysProblem.problemUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Problem
                </Button>
                {todaysProblem.isSolved && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Solved
                  </Badge>
                )}
              </div>

              {todaysProblem.description && (
                <div className="space-y-2">
                  <h4 className="font-medium">Problem Description</h4>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <p className="whitespace-pre-wrap">{todaysProblem.description}</p>
                  </div>
                </div>
              )}

              {todaysProblem.examples && todaysProblem.examples.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Examples</h4>
                  {todaysProblem.examples.map((example, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-3 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Input:</p>
                          <code className="bg-background px-2 py-1 rounded text-xs">{example.input}</code>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Output:</p>
                          <code className="bg-background px-2 py-1 rounded text-xs">{example.output}</code>
                        </div>
                      </div>
                      {example.explanation && (
                        <div className="mt-2">
                          <p className="font-medium text-muted-foreground mb-1">Explanation:</p>
                          <p className="text-sm">{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {todaysProblem.constraints && todaysProblem.constraints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Constraints</h4>
                  <div className="bg-muted/50 rounded-lg p-3">
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

              {todaysProblem.hints && todaysProblem.hints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Hints</h4>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <ul className="space-y-1 text-sm">
                      {todaysProblem.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {todaysProblem.approach && (
                <div className="space-y-2">
                  <h4 className="font-medium">Suggested Approach</h4>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="whitespace-pre-wrap">{todaysProblem.approach}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Code Editor */}
      <div className="lg:w-1/2">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                <CardTitle>Code Editor</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {todaysProblem.isSolved && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setShowSubmissionHistory(true)} className="gap-1 text-xs h-7">
                      <History className="h-3 w-3" /> History
                    </Button>
                    {savedSolution && (
                      <Button variant="outline" size="sm" onClick={() => setShowSavedSolution(!showSavedSolution)} className="gap-1 text-xs h-7">
                        <Eye className="h-3 w-3" /> {showSavedSolution ? 'Hide' : 'View Saved'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            <CardDescription>Write and submit your solution</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col space-y-3 min-h-0">
            {todaysProblem.isSolved && !showSavedSolution ? (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Problem Solved!</h3>
                  <p className="text-muted-foreground">
                    Great job! Come back tomorrow for the next challenge.
                  </p>
                </div>
              </div>
            ) : showSavedSolution && savedSolution ? (
              <div className="border rounded-lg bg-muted/20 p-4 flex-1 overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{savedSolution.solution?.language || 'python'}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Solved on {new Date(savedSolution.solvedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-background rounded p-3 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{savedSolution.solution?.code || 'No code saved'}</pre>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Select value={language} onValueChange={(val) => { setLanguage(val); if (!solution.trim()) setSolution(getLanguageSampleCode(val)); }}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Time (min)"
                      value={timeSpent}
                      onChange={(e) => setTimeSpent(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <CodeEditor
                  language={language}
                  value={solution || getLanguageSampleCode(language)}
                  onChange={setSolution}
                  height="300px"
                />

                <div className="h-[200px]">
                  <CodeOutput
                    stdout={stdout}
                    stderr={stderr}
                    compileOutput={compileOutput}
                    exitCode={exitCode}
                    isRunning={isRunning}
                    isTimeout={isTimeout}
                    error={execError}
                    testCaseResults={testCaseResults}
                    customInput={customInput}
                    onCustomInputChange={setCustomInput}
                    activeTab={activeOutputTab}
                    onTabChange={setActiveOutputTab}
                  />
                </div>

                <Textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="text-xs"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRunCode}
                    disabled={isRunning || !solution.trim()}
                    className="gap-1"
                  >
                    {isRunning && activeOutputTab === 'output' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Run
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleSubmitCode}
                    disabled={isRunning || !solution.trim()}
                    className="gap-1"
                  >
                    {isRunning && activeOutputTab === 'testcases' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit
                  </Button>
                  <Button
                    onClick={handleSolve}
                    disabled={solving || !solution.trim()}
                    className="flex-1 gap-1"
                  >
                    {solving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Mark Solved
                  </Button>
                </div>
              </>
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
