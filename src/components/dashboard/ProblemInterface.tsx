import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { CodeEditor } from "./CodeEditor";
import { CodeOutput } from "./CodeOutput";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import {
  Play,
  Clock,
  Code,
  ArrowLeft,
  Lightbulb,
  ExternalLink,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  History,
  FileText,
  Flame,
  Trophy,
} from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [activeOutputTab, setActiveOutputTab] = useState("output");
  const [leftTab, setLeftTab] = useState("description");

  // Today's Problem specific state
  const [streak, setStreak] = useState<any>(null);
  const isTodaysProblem = topic === 'todays-problem';

  // Submissions state (inline in left panel)
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Ref to track if user clicked Submit (to auto-mark solved)
  const submitAttemptRef = useRef(false);

  // Per-language code buffers: saves user's code when switching languages
  const codeBuffersRef = useRef<Record<string, string>>({});

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
  } = useCodeExecution({ examples: problem?.examples || [] });

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' }
  ];

  // ═══ Helpers ═══

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
      case 'csharp':
        return `// Write your C# solution here\nusing System;\n\nclass Main {\n    static void Main(string[] args) {\n        // Your code here\n    }\n}`;
      case 'go':
        return `// Write your Go solution here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n    fmt.Println("Hello")\n}`;
      case 'rust':
        return `// Write your Rust solution here\nfn main() {\n    // Your code here\n    println!("Hello");\n}`;
      default:
        return `// Write your solution here`;
    }
  };

  const handleLanguageChange = (newLang: string) => {
    // Save current code for the current language
    codeBuffersRef.current[language] = solution;
    // Switch language
    setLanguage(newLang);
    // Restore saved code for the new language, or use boilerplate
    const savedCode = codeBuffersRef.current[newLang];
    setSolution(savedCode !== undefined ? savedCode : getLanguageSampleCode(newLang));
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

  // ═══ Data Loading ═══

  useEffect(() => {
    if (isTodaysProblem) {
      loadTodaysProblem();
    } else {
      const selectedTopic = topic || localStorage.getItem('selectedTopic');
      if (selectedTopic && problemId) {
        loadSpecificProblem();
      } else if (selectedTopic) {
        loadProblemsByTopic(selectedTopic);
      } else if (problemId) {
        loadSpecificProblem();
      } else {
        toast({
          title: "No topic selected",
          description: "Please select a topic from the Topic Progress page.",
          variant: "destructive",
        });
      }
    }
  }, [topic, problemId]);

  useEffect(() => {
    if (problems.length > 0) {
      setProblem(problems[currentProblemIndex]);
    }
  }, [problems, currentProblemIndex]);

  // Timer
  useEffect(() => {
    if (problem) {
      const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [problem]);

  // Auto-mark solved when submit succeeds with all test cases passing
  useEffect(() => {
    if (submitAttemptRef.current && testCaseResults.length > 0 && !isRunning) {
      submitAttemptRef.current = false;
      const allPassed = testCaseResults.every(r => r.passed);
      if (allPassed) {
        autoMarkSolved();
      }
    }
  }, [testCaseResults, isRunning]);

  // Fetch submissions when switching to submissions tab
  useEffect(() => {
    if (leftTab === "submissions" && problem) {
      fetchSubmissions();
    }
  }, [leftTab, problem]);

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
      console.error("Error loading today's problem:", error);
      toast({ title: "Error", description: "Failed to load today's problem.", variant: "destructive" });
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
      toast({ title: "Error loading problems", description: "Failed to load problems for this topic.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecificProblem = async () => {
    try {
      setIsLoading(true);
      if (topic) {
        const data = await apiService.getProblemsByTopic(topic);
        const idx = data.problems.findIndex((p: any) => p.problemId === problemId);
        setProblems(data.problems);
        setCurrentProblemIndex(idx >= 0 ? idx : 0);
      } else {
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
      toast({ title: "Error loading problem", description: "Failed to load the problem.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!problem) return;
    try {
      setLoadingSubmissions(true);
      const response = await apiService.getProblemSubmissions(problem.problemId);
      setSubmissions(response.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // ═══ Actions ═══

  const handleRunCode = async () => {
    if (!solution.trim()) return;
    setActiveOutputTab("output");
    await runCode(solution, language, customInput);
  };

  const handleSubmitCode = async () => {
    if (!solution.trim()) return;
    setActiveOutputTab("testcases");
    submitAttemptRef.current = true;
    await submitCode(solution, language);
  };

  const autoMarkSolved = async () => {
    if (!problem) return;
    try {
      if (isTodaysProblem || problem.problemId?.startsWith('TODAY_')) {
        const response = await apiService.solveTodaysProblem({
          problemId: problem.problemId,
          solution,
          language,
          timeSpent: Math.floor(timeSpent / 60),
          notes: ""
        });
        setStreak(response.progress);
        setProblem((prev: any) => prev ? { ...prev, isSolved: true } : prev);
        toast({
          title: "Accepted",
          description: `Today's problem solved! Streak: ${(streak?.todaysProblemStreak || 0) + 1} days`,
        });
      } else {
        await apiService.markProblemSolved({
          problemId: problem.problemId,
          solution,
          language,
          timeSpent: Math.floor(timeSpent / 60),
          notes: ""
        });
        setProblem((prev: any) => prev ? { ...prev, isSolved: true } : prev);
        toast({
          title: "Accepted",
          description: `All test cases passed! "${problem.title}" has been solved.`,
        });
      }
      if (onProblemSolved) onProblemSolved();
    } catch (error) {
      console.error('Error auto-marking solved:', error);
    }
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      resetState();
    }
  };

  const handlePrevProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(prev => prev - 1);
      resetState();
    }
  };

  const resetState = () => {
    setSolution("");
    setTimeSpent(0);
    setShowHints(false);
    clearOutput();
    setSelectedSubmission(null);
    setSubmissions([]);
    setLeftTab("description");
    codeBuffersRef.current = {};
  };

  // ═══ Render States ═══

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <p className="text-muted-foreground">No problem found.</p>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ═══ Main Layout ═══

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col -mx-8 -mt-8 -mb-8">

      {/* ═══ TOP TOOLBAR ═══ */}
      <div className="h-12 flex items-center justify-between px-4 border-b bg-background shrink-0">
        {/* Left: Back + Title + Difficulty */}
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Problem Navigation (prev/next) */}
          {problems.length > 1 && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevProblem} disabled={currentProblemIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-8 text-center">
                {currentProblemIndex + 1}/{problems.length}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextProblem} disabled={currentProblemIndex === problems.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 min-w-0">
            {isTodaysProblem && (
              <Badge className="bg-primary/10 text-primary text-[10px] shrink-0">Daily</Badge>
            )}
            <h2 className="font-semibold text-sm truncate max-w-[280px]">{problem.title}</h2>
            <Badge className={`${getDifficultyColor(problem.difficulty)} text-[10px] shrink-0`}>
              {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
            </Badge>
            {problem.isSolved && (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Right: Streak (if today's problem) + Timer + Run + Submit */}
        <div className="flex items-center gap-2 shrink-0">
          {isTodaysProblem && streak && (
            <div className="flex items-center gap-3 mr-2">
              <div className="flex items-center gap-1 text-xs text-orange-500">
                <Flame className="h-3.5 w-3.5" />
                <span className="font-semibold">{streak.todaysProblemStreak || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Trophy className="h-3.5 w-3.5" />
                <span className="font-semibold">{streak.longestTodaysProblemStreak || 0}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">{formatTime(timeSpent)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleRunCode}
            disabled={isRunning || !solution.trim()}
          >
            {isRunning && activeOutputTab === "output" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Run
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSubmitCode}
            disabled={isRunning || !solution.trim()}
          >
            {isRunning && activeOutputTab === "testcases" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Submit
          </Button>
        </div>
      </div>

      {/* ═══ SPLIT CONTENT ═══ */}
      <div className="flex-1 flex min-h-0">

        {/* ─── LEFT PANEL: Description / Submissions ─── */}
        <div className="w-[45%] border-r flex flex-col min-h-0">
          <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-2 h-9 shrink-0">
              <TabsTrigger value="description" className="text-xs gap-1 data-[state=active]:bg-muted">
                <FileText className="h-3 w-3" />
                Description
              </TabsTrigger>
              <TabsTrigger value="submissions" className="text-xs gap-1 data-[state=active]:bg-muted">
                <History className="h-3 w-3" />
                Submissions
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="flex-1 overflow-auto m-0 p-4 space-y-4">
              {/* Topics */}
              {problem.topics && problem.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {problem.topics.map((t: string) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{problem.description}</p>
              </div>

              {/* Examples */}
              {problem.examples && problem.examples.length > 0 && (
                <div className="space-y-3">
                  {problem.examples.map((example: any, index: number) => (
                    <div key={index}>
                      <h4 className="font-semibold text-sm mb-2">Example {index + 1}:</h4>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                        <div><span className="font-semibold text-foreground">Input:</span> <span className="text-muted-foreground">{example.input}</span></div>
                        <div><span className="font-semibold text-foreground">Output:</span> <span className="text-muted-foreground">{example.output}</span></div>
                        {example.explanation && (
                          <div className="pt-1 font-sans">
                            <span className="font-semibold text-foreground text-xs">Explanation:</span>{" "}
                            <span className="text-muted-foreground text-xs">{example.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && problem.constraints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Constraints:</h4>
                  <ul className="text-sm space-y-1">
                    {problem.constraints.map((constraint: string, index: number) => (
                      <li key={index} className="text-muted-foreground flex items-start gap-1.5">
                        <span className="text-foreground mt-0.5">•</span>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{constraint}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHints(!showHints)}
                    className="gap-1.5 text-xs h-7"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    {showHints ? 'Hide Hints' : `Show Hints (${problem.hints.length})`}
                  </Button>
                  {showHints && (
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <ul className="text-sm space-y-1.5">
                        {problem.hints.map((hint: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
                            <span className="font-semibold shrink-0">Hint {index + 1}:</span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* External Link */}
              {problem.problemUrl && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs p-0 h-auto gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => window.open(problem.problemUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                  View on original platform
                </Button>
              )}
            </TabsContent>

            {/* Submissions Tab */}
            <TabsContent value="submissions" className="flex-1 overflow-auto m-0 p-4">
              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No submissions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Submit your solution to see it here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {submissions.map((sub: any, index: number) => (
                    <button
                      key={sub._id || index}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-colors hover:bg-muted/50 ${
                        selectedSubmission?._id === sub._id ? 'ring-2 ring-primary bg-muted/50' : ''
                      }`}
                      onClick={() => setSelectedSubmission(selectedSubmission?._id === sub._id ? null : sub)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <Badge variant="secondary" className="text-[10px]">{sub.language || sub.solution?.language}</Badge>
                          <span className="text-[10px] text-muted-foreground">#{submissions.length - index}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(sub.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Expanded submission code */}
                      {selectedSubmission?._id === sub._id && (
                        <div className="mt-2 pt-2 border-t">
                          <pre className="bg-[#1e1e1e] text-gray-300 rounded-lg p-3 text-xs font-mono overflow-auto max-h-[300px] whitespace-pre-wrap">
                            {sub.solution?.code || 'No code saved'}
                          </pre>
                          {sub.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">{sub.notes}</p>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ─── RIGHT PANEL: Code Editor + Output ─── */}
        <div className="w-[55%] flex flex-col min-h-0">
          {/* Language selector bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <Code className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[120px] h-7 text-xs border-0 bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              language={language}
              value={solution || getLanguageSampleCode(language)}
              onChange={setSolution}
              height="100%"
            />
          </div>

          {/* Output Panel */}
          <div className="h-[220px] border-t shrink-0">
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
        </div>
      </div>
    </div>
  );
};
