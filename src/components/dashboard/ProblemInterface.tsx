import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
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
  SUPPORTED_LANGUAGES, starterCode, loadDraft, saveDraft, clearDraft, preferredLanguage, rememberLanguage,
} from "@/lib/starterCode";
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
  RotateCcw,
  Copy,
} from "lucide-react";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TAB_STRIP, TAB_STRIP_TRIGGER } from "@/components/common/tabStrip";

// "10^5" / "2^31", plus the same limits whose "^" was lost when the problems were imported ("105", "231")
const POWER = /\b(?:(10|2)\^(\d+)|10([3-9])|2(3[12]))\b/g;

const formatConstraint = (text: string) => {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(POWER)) {
    const [whole, base, exponent, lostTen, lostTwo] = match;
    const start = match.index ?? 0;
    parts.push(text.slice(last, start));
    parts.push(
      <span key={start}>
        {base ?? (lostTen ? "10" : "2")}
        <sup>{exponent ?? lostTen ?? lostTwo}</sup>
      </span>
    );
    last = start + whole.length;
  }
  parts.push(text.slice(last));
  return parts;
};

interface ProblemInterfaceProps {
  problemId?: string;
  topic?: string;
  onBack?: () => void;
  onProblemSolved?: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ProblemInterface = ({ problemId, topic, onBack, onProblemSolved }: ProblemInterfaceProps) => {
  const { toast } = useToast();
  const [problem, setProblem] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [solution, setSolution] = useState("");
  const [language, setLanguage] = useState(preferredLanguage);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [activeOutputTab, setActiveOutputTab] = useState("output");
  const [leftTab, setLeftTab] = useState("description");
  const [justSolved, setJustSolved] = useState(false);

  // Today's Problem specific state
  const [streak, setStreak] = useState<any>(null);
  const isTodaysProblem = topic === 'todays-problem';

  // Submissions state (inline in left panel)
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Ref to track if user clicked Submit (to auto-mark solved)
  const submitAttemptRef = useRef(false);

  const {
    isRunning,
    stdout,
    stderr,
    exitCode,
    compileOutput,
    testCaseResults,
    error: execError,
    isTimeout,
    runInfo,
    runCode,
    submitCode,
    clearOutput,
  } = useCodeExecution({ examples: problem?.examples || [] });

  const problemKey = problem?.problemId as string | undefined;

  // ═══ Code: starter code or the saved draft for this problem + language ═══

  useEffect(() => {
    if (!problemKey) return;
    setSolution(loadDraft(problemKey, language) ?? starterCode(language, problem?.examples));
    // problem.examples belong to problemKey, so they don't need to be a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemKey, language]);

  const handleCodeChange = (code: string) => {
    setSolution(code);
    if (problemKey) saveDraft(problemKey, language, code);
  };

  const handleLanguageChange = (newLang: string) => {
    if (problemKey) saveDraft(problemKey, language, solution);
    setLanguage(newLang);
    rememberLanguage(newLang);
  };

  const handleResetCode = () => {
    if (!problemKey) return;
    if (!window.confirm("Replace your code with the starter code? Your current code will be lost.")) return;
    clearDraft(problemKey, language);
    setSolution(starterCode(language, problem?.examples));
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
          description: "Pick a topic on the Topics page first.",
          variant: "destructive",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCaseResults, isRunning]);

  // Fetch submissions when switching to submissions tab
  useEffect(() => {
    if (leftTab === "submissions" && problem) {
      fetchSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftTab, problem]);

  const loadTodaysProblem = async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
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
      setLoadFailed(true);
      setProblems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProblemsByTopic = async (selectedTopic: string) => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      const data = await apiService.getProblemsByTopic(selectedTopic);
      setProblems(data.problems);
      setCurrentProblemIndex(0);
    } catch (error) {
      console.error('Error loading problems:', error);
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecificProblem = async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
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
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const retryLoad = () => {
    if (isTodaysProblem) loadTodaysProblem();
    else if (topic && problemId) loadSpecificProblem();
    else if (topic) loadProblemsByTopic(topic);
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

  const handleRunCode = useCallback(async () => {
    if (!solution.trim() || isRunning) return;
    setActiveOutputTab("output");
    await runCode(solution, language, customInput);
  }, [solution, isRunning, language, customInput, runCode]);

  const handleSubmitCode = useCallback(async () => {
    if (!solution.trim() || isRunning) return;
    setActiveOutputTab("testcases");
    setJustSolved(false);
    submitAttemptRef.current = true;
    await submitCode(solution, language);
  }, [solution, isRunning, language, submitCode]);

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
        toast({
          title: "Accepted",
          description: `Today's problem solved. Daily streak: ${response.progress?.todaysProblemStreak ?? 1} day${response.progress?.todaysProblemStreak === 1 ? '' : 's'}.`,
        });
      } else {
        await apiService.markProblemSolved({
          problemId: problem.problemId,
          solution,
          language,
          timeSpent: Math.floor(timeSpent / 60),
          notes: ""
        });
        toast({
          title: "Accepted",
          description: `All test cases passed. "${problem.title}" is solved.`,
        });
      }
      setProblem((prev: any) => prev ? { ...prev, isSolved: true } : prev);
      setProblems((prev) => prev.map((p, i) => i === currentProblemIndex ? { ...p, isSolved: true } : p));
      setJustSolved(true);
      if (onProblemSolved) onProblemSolved();
    } catch (error) {
      // e.g. today's problem already solved: still a correct answer, just not counted twice
      toast({
        title: "All test cases passed",
        description: error instanceof Error ? error.message : "Your solution is correct, but it couldn't be saved.",
      });
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
    setTimeSpent(0);
    setShowHints(false);
    clearOutput();
    setSelectedSubmission(null);
    setSubmissions([]);
    setLeftTab("description");
    setJustSolved(false);
  };

  const loadSubmissionIntoEditor = (sub: any) => {
    const code = sub.solution?.code;
    if (!code || !problemKey) return;
    const subLanguage = SUPPORTED_LANGUAGES.some(l => l.value === sub.solution?.language) ? sub.solution.language : language;
    if (subLanguage !== language) {
      // Keep the current work, and store the submission as the other language's draft;
      // switching language then loads it
      saveDraft(problemKey, language, solution);
      saveDraft(problemKey, subLanguage, code);
      setLanguage(subLanguage);
      rememberLanguage(subLanguage);
    } else {
      handleCodeChange(code);
    }
    toast({ title: "Loaded into the editor" });
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Code copied" });
    } catch {
      toast({ title: "Couldn't copy", description: "Select the code and copy it manually.", variant: "destructive" });
    }
  };

  // ═══ Render States ═══

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 h-full min-h-[50vh] text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading problem...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] p-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {loadFailed ? "Couldn't load the problem. Check your connection and try again." : "No problem found."}
          </p>
          <div className="flex justify-center gap-2">
            {loadFailed && (
              <Button onClick={retryLoad} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            )}
            {onBack && (
              <Button variant="secondary" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Go back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const hasNext = currentProblemIndex < problems.length - 1;

  // ═══ Main Layout ═══

  return (
    <div className="h-full flex flex-col bg-background">

      {/* ═══ TOP TOOLBAR ═══ */}
      <div className="min-h-12 flex flex-wrap items-center justify-between gap-2 px-2 sm:px-3 py-1.5 border-b shrink-0">
        {/* Left: Back + Title + Difficulty */}
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={onBack} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Problem Navigation (prev/next) */}
          {problems.length > 1 && (
            <div className="flex items-center gap-0.5 shrink-0 rounded-md border px-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevProblem} disabled={currentProblemIndex === 0} aria-label="Previous problem">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-mono text-xs text-muted-foreground w-10 text-center tabular-nums">
                {currentProblemIndex + 1}/{problems.length}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextProblem} disabled={!hasNext} aria-label="Next problem">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 min-w-0">
            {isTodaysProblem && <Badge className="shrink-0">Daily</Badge>}
            <h2 className="font-semibold text-sm truncate max-w-[160px] sm:max-w-[320px]">{problem.title}</h2>
            <DifficultyBadge difficulty={problem.difficulty} className="shrink-0" />
            {problem.isSolved && (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-label="Solved" />
            )}
          </div>
        </div>

        {/* Right: Streak (if today's problem) + Timer + Run + Submit */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {isTodaysProblem && streak && (
            <div className="hidden sm:flex items-center gap-3 mr-1 font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-1" title="Daily streak">
                <Flame className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground">{streak.todaysProblemStreak || 0}</span>
              </span>
              <span className="flex items-center gap-1" title="Best daily streak">
                <Trophy className="h-3.5 w-3.5" />
                <span className="text-foreground">{streak.longestTodaysProblemStreak || 0}</span>
              </span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-1" title="Time on this problem">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono tabular-nums">{formatTime(timeSpent)}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleRunCode}
            disabled={isRunning || !solution.trim()}
            title="Run with Example 1 or your custom input (Ctrl+Enter)"
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
            className="h-8 gap-1.5 text-xs"
            onClick={handleSubmitCode}
            disabled={isRunning || !solution.trim()}
            title="Check every example (Ctrl+Shift+Enter)"
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

      {/* ═══ SUCCESS BANNER ═══ */}
      {justSolved && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-success/10 border-b border-success/30 shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" />
            Accepted! <span className="font-normal text-foreground">{isTodaysProblem ? "Today's problem is done. Come back tomorrow for the next one." : "Nice work."}</span>
          </div>
          {hasNext ? (
            <Button size="sm" className="h-7 gap-1 text-xs" onClick={handleNextProblem}>
              Next problem <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : onBack && (
            <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={onBack}>
              {isTodaysProblem ? "Back to dashboard" : "Back to topic"}
            </Button>
          )}
        </div>
      )}

      {/* ═══ SPLIT CONTENT (stacked on small screens) ═══ */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-auto lg:overflow-hidden">

        {/* ─── LEFT PANEL: Description / Submissions ─── */}
        <div className="lg:w-[45%] border-b lg:border-b-0 lg:border-r flex flex-col min-h-0 max-h-[45vh] lg:max-h-none shrink-0 lg:shrink">
          <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full min-h-0">
            <TabsList className={TAB_STRIP}>
              <TabsTrigger value="description" className={TAB_STRIP_TRIGGER}>
                <FileText className="h-3.5 w-3.5" />
                Description
              </TabsTrigger>
              <TabsTrigger value="submissions" className={TAB_STRIP_TRIGGER}>
                <History className="h-3.5 w-3.5" />
                Submissions
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="flex-1 overflow-auto m-0 px-5 py-4 space-y-5">
              <div className="space-y-2.5">
                <h1 className="text-xl font-semibold tracking-tight">{problem.title}</h1>
                <div className="flex flex-wrap items-center gap-1.5">
                  <DifficultyBadge difficulty={problem.difficulty} />
                  {(problem.topics || []).map((t: string) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                  {problem.isSolved && (
                    <span className="flex items-center gap-1 text-xs text-success ml-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Solved
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{problem.description}</p>

              {/* Examples */}
              {problem.examples && problem.examples.length > 0 && (
                <div className="space-y-4">
                  {problem.examples.map((example: any, index: number) => (
                    <div key={index}>
                      <h4 className="font-semibold text-sm mb-2">Example {index + 1}</h4>
                      <div className="rounded-md border bg-card p-3 space-y-1 font-mono text-xs leading-5 break-all">
                        <div><span className="text-muted-foreground">Input: </span>{example.input}</div>
                        <div><span className="text-muted-foreground">Output: </span>{example.output}</div>
                        {example.explanation && (
                          <div className="pt-1 font-sans break-normal text-muted-foreground">
                            <span className="text-foreground">Explanation: </span>{example.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Your program gets each example's input on stdin. In Python and JavaScript just fill in <code className="rounded bg-muted px-1 py-0.5 text-foreground">solve()</code>; the starter code reads the input and prints your answer.
                  </p>
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && problem.constraints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Constraints</h4>
                  <ul className="space-y-1.5">
                    {problem.constraints.map((constraint: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                        <code className="font-mono text-xs bg-muted text-foreground px-1.5 py-0.5 rounded">{formatConstraint(constraint)}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowHints(!showHints)}
                    className="gap-1.5 text-xs h-7"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    {showHints ? 'Hide Hints' : `Show Hints (${problem.hints.length})`}
                  </Button>
                  {showHints && (
                    <ol className="mt-2 divide-y rounded-md border bg-card">
                      {problem.hints.map((hint: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 px-3 py-2.5 text-sm">
                          <span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0">#{index + 1}</span>
                          <span className="text-foreground/90">{hint}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {/* External Link */}
              {problem.problemUrl && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs p-0 h-auto gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => window.open(problem.problemUrl, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-3 w-3" />
                  View on original platform
                </Button>
              )}
            </TabsContent>

            {/* Submissions Tab */}
            <TabsContent value="submissions" className="flex-1 overflow-auto m-0 p-4">
              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : submissions.length === 0 ? (
                <EmptyState icon={History} title="No submissions yet" description="Accepted solutions appear here." className="border-0" />
              ) : (
                <div className="rounded-md border divide-y">
                  {submissions.map((sub: any, index: number) => {
                    const isOpen = selectedSubmission?._id === sub._id;
                    return (
                      <div key={sub._id || index} className={isOpen ? "bg-card" : undefined}>
                        <button
                          className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-accent/50 transition-colors"
                          onClick={() => setSelectedSubmission(isOpen ? null : sub)}
                          aria-expanded={isOpen}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            <span className="text-xs font-medium text-success">Accepted</span>
                            <span className="chip">{sub.solution?.language || sub.language}</span>
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            #{submissions.length - index} · {new Date(sub.solvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </button>

                        {/* Expanded submission code */}
                        {isOpen && (
                          <div className="px-3 pb-3">
                            <pre className="bg-background border rounded-md p-3 text-xs font-mono leading-5 overflow-auto max-h-[300px] whitespace-pre-wrap select-text">
                              {sub.solution?.code || 'No code saved'}
                            </pre>
                            {sub.solution?.code && (
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => loadSubmissionIntoEditor(sub)}>
                                  <Code className="h-3 w-3" /> Load into editor
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => copyCode(sub.solution.code)}>
                                  <Copy className="h-3 w-3" /> Copy
                                </Button>
                              </div>
                            )}
                            {sub.notes && (
                              <p className="text-xs text-muted-foreground mt-2 italic">{sub.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ─── RIGHT PANEL: Code Editor + Output ─── */}
        <div className="lg:w-[55%] flex flex-col min-h-[70vh] lg:min-h-0 lg:flex-1">
          {/* Language selector bar */}
          <div className="h-10 flex items-center justify-between gap-2 px-2 border-b shrink-0 bg-card">
            <div className="flex items-center gap-2 min-w-0">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[132px] h-7 text-xs font-mono bg-background" aria-label="Language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="hidden sm:inline text-[11px] text-muted-foreground truncate">Saved automatically</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={handleResetCode} title="Replace your code with the starter code">
              <RotateCcw className="h-3 w-3" /> Reset code
            </Button>
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-[280px]">
            <CodeEditor
              language={language}
              value={solution}
              onChange={handleCodeChange}
              height="100%"
              onRun={handleRunCode}
              onSubmit={handleSubmitCode}
            />
          </div>

          {/* Output Panel */}
          <div className="h-[240px] border-t shrink-0">
            <CodeOutput
              stdout={stdout}
              stderr={stderr}
              compileOutput={compileOutput}
              exitCode={exitCode}
              isRunning={isRunning}
              isTimeout={isTimeout}
              error={execError}
              testCaseResults={testCaseResults}
              runInfo={runInfo}
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
