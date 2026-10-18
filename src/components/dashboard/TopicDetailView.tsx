import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Clock, FileText, Code, HelpCircle, MessageSquare,
  ChevronDown, ChevronRight, Check, CheckCircle2, Circle, XCircle, Play, RotateCcw,
  Trophy, Building2, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { EmptyState } from "@/components/common/EmptyState";

interface TopicDetailViewProps {
  topicId: string;
  onBack: () => void;
  onNavigateToSection?: (section: string) => void;
}

// Shared look of the clickable rows in the Learn and Interview lists
const ROW_BUTTON =
  "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

export const TopicDetailView = ({ topicId, onBack, onNavigateToSection }: TopicDetailViewProps) => {
  const [topic, setTopic] = useState<any>(null);
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  // Learn tab state
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());
  const [readSubtopics, setReadSubtopics] = useState<Set<string>>(new Set());

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);

  // Interview state
  const [expandedIQs, setExpandedIQs] = useState<Set<string>>(new Set());
  const [viewedIQCount, setViewedIQCount] = useState(0);

  // Practice filter
  const [practiceFilter, setPracticeFilter] = useState<string>('all');

  useEffect(() => {
    loadTopicData();
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      setLoadFailed(false);
      const [topicData, mcqData, iqData, progressData] = await Promise.all([
        apiService.getTopic(topicId),
        apiService.getMCQs(topicId),
        apiService.getInterviewQuestions(topicId),
        apiService.getProgress()
      ]);

      setTopic(topicData);
      setMcqs(mcqData);
      setInterviewQuestions(iqData);
      const prog = progressData.progress || progressData;
      setProgress(prog);

      // Load problems if topic matches existing problem bank
      try {
        const probData = await apiService.getProblemsByTopic(topicId);
        setProblems(probData.problems || []);
      } catch { setProblems([]); }

      // Set read subtopics from progress
      const readArticles = prog.articlesRead?.filter((a: any) => a.topicSlug === topicId) || [];
      setReadSubtopics(new Set(readArticles.map((a: any) => a.subtopicId)));

      // Set viewed IQ count
      setViewedIQCount(prog.interviewQuestionsViewed?.[topicId] || 0);
    } catch (error) {
      console.error('Error loading topic:', error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // ===== Learn Tab Handlers =====
  const toggleSubtopic = (id: string) => {
    setExpandedSubtopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markAsRead = async (subtopicId: string) => {
    try {
      await apiService.markArticleRead({ topicSlug: topicId, subtopicId });
      setReadSubtopics(prev => new Set(prev).add(subtopicId));
    } catch (error) {
      console.error('Error marking article read:', error);
    }
  };

  // ===== Quiz Handlers =====
  const startQuiz = () => {
    setQuizStarted(true);
    setQuizFinished(false);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizAnswers(new Array(mcqs.length).fill(null));
  };

  const selectAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    const isCorrect = index === mcqs[currentQ].correctIndex;
    if (isCorrect) setQuizScore(prev => prev + 1);
    setQuizAnswers(prev => { const next = [...prev]; next[currentQ] = index; return next; });
  };

  const nextQuestion = () => {
    if (currentQ < mcqs.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    // Show the new best score / attempts right away, without reloading the page
    apiService.saveQuizScore({ topicSlug: topicId, score: quizScore, totalQuestions: mcqs.length })
      .then((res) => setProgress((prev: any) => prev ? { ...prev, quizScores: { ...(prev.quizScores || {}), [topicId]: res.quizScore } } : prev))
      .catch(console.error);
  };

  // ===== Interview Handlers =====
  const toggleIQ = (id: string) => {
    setExpandedIQs(prev => {
      const next = new Set(prev);
      if (!next.has(id)) {
        next.add(id);
        const newCount = next.size;
        if (newCount > viewedIQCount) {
          setViewedIQCount(newCount);
          apiService.markInterviewViewed({ topicSlug: topicId, count: newCount }).catch(console.error);
        }
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  // ===== Practice Helpers =====
  const filteredProblems = problems.filter(p =>
    practiceFilter === 'all' || p.difficulty === practiceFilter
  );

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <p className="sr-only" role="status">Loading topic...</p>
        <Skeleton className="h-8 w-36" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-3 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Topics
        </Button>
        <Card className="p-8 text-center space-y-3">
          <p className="text-sm font-medium">
            {loadFailed ? "Couldn't load this topic. Check your connection and try again." : "Topic not found."}
          </p>
          {loadFailed && (
            <Button onClick={loadTopicData} variant="secondary" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Try again
            </Button>
          )}
        </Card>
      </div>
    );
  }

  const quizBestScore = progress?.quizScores?.[topicId];
  const subtopicCount = topic.subtopics?.length || 0;
  const readCount = readSubtopics.size;
  const solvedCount = problems.filter(p => p.isSolved).length;

  // Overall progress for the header, scored the same way as the topic list so both pages agree
  const practiceTopics: string[] = topic.practiceTopics ?? [topicId];
  const practiceSolved = practiceTopics.reduce((sum, key) => sum + (progress?.topicProgress?.[key] || 0), 0);
  const progressParts = [
    Math.min((readCount / (subtopicCount || 1)) * 100, 100),
    ...(practiceTopics.length > 0 ? [Math.min(practiceSolved * 20, 100)] : []),
    quizBestScore ? Math.min((quizBestScore.bestScore / (quizBestScore.totalQuestions || topic.mcqCount || 1)) * 100, 100) : 0,
    topic.interviewQuestionCount > 0 ? Math.min((viewedIQCount / topic.interviewQuestionCount) * 100, 100) : 0,
  ];
  const overallProgress = Math.round(progressParts.reduce((sum, value) => sum + value, 0) / progressParts.length);

  const quizScoreTone =
    quizScore >= mcqs.length * 0.8 ? "text-success" :
    quizScore >= mcqs.length * 0.5 ? "text-warning" :
    "text-destructive";
  const wrongCount = mcqs.length - quizScore;

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-3 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Topics
        </Button>
        <PageHeader
          title={topic.name}
          description={topic.description}
          actions={
            <div className="w-full space-y-2 sm:w-56">
              <div className="flex items-baseline justify-between gap-3">
                <span className="eyebrow">Overall progress</span>
                <span className="font-mono text-sm font-medium tabular-nums">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} aria-label="Overall progress" />
            </div>
          }
        />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {topic.difficulty && <span className="chip">{topic.difficulty}</span>}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span><span className="font-mono tabular-nums text-foreground">{topic.estimatedHours}h</span> estimated</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span><span className="font-mono tabular-nums text-foreground">{subtopicCount}</span> articles</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span><span className="font-mono tabular-nums text-foreground">{mcqs.length}</span> MCQs</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span><span className="font-mono tabular-nums text-foreground">{interviewQuestions.length}</span> interview Qs</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="learn" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="learn" className="gap-1.5 text-xs sm:text-sm"><FileText className="h-4 w-4 hidden sm:block" /> Learn</TabsTrigger>
          <TabsTrigger value="practice" className="gap-1.5 text-xs sm:text-sm"><Code className="h-4 w-4 hidden sm:block" /> Practice</TabsTrigger>
          <TabsTrigger value="quiz" className="gap-1.5 text-xs sm:text-sm"><HelpCircle className="h-4 w-4 hidden sm:block" /> Quiz</TabsTrigger>
          <TabsTrigger value="interview" className="gap-1.5 text-xs sm:text-sm"><MessageSquare className="h-4 w-4 hidden sm:block" /> Interview</TabsTrigger>
        </TabsList>

        {/* ============ LEARN TAB ============ */}
        <TabsContent value="learn" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {readCount}/{subtopicCount} articles read
            </p>
            <Progress
              value={subtopicCount > 0 ? Math.min((readCount / subtopicCount) * 100, 100) : 0}
              className="w-32"
              aria-label="Articles read"
            />
          </div>

          {subtopicCount > 0 && (
            <Card className="overflow-hidden">
              <ul className="divide-y">
                {topic.subtopics?.map((st: any, idx: number) => {
                  const stId = st._id || `st-${idx}`;
                  const isExpanded = expandedSubtopics.has(stId);
                  const isRead = readSubtopics.has(stId);

                  return (
                    <li key={stId}>
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        className={cn(ROW_BUTTON, "items-center")}
                        onClick={() => toggleSubtopic(stId)}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] tabular-nums",
                            isRead ? "border-success/30 bg-success/10 text-success" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isRead ? (
                            <>
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              <span className="sr-only">Read</span>
                            </>
                          ) : idx + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{st.title}</span>
                          {st.timeComplexity && (
                            <span className="mt-1 flex flex-wrap gap-1.5">
                              <span className="chip">Time: {st.timeComplexity}</span>
                              {st.spaceComplexity && <span className="chip">Space: {st.spaceComplexity}</span>}
                            </span>
                          )}
                        </span>
                        {isExpanded
                          ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-4 border-t px-4 py-4 sm:pl-[52px]">
                          {/* Concepts */}
                          {st.concepts?.length > 0 && (
                            <div>
                              <p className="eyebrow mb-2">Key Concepts</p>
                              <ul className="space-y-1.5">
                                {st.concepts.map((c: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm">
                                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                                    <span className="min-w-0 break-words">{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Code Example */}
                          {st.codeExample?.code && (
                            <div>
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <p className="eyebrow">{st.codeExample.title || 'Code Example'}</p>
                                {st.codeExample.language && <span className="chip">{st.codeExample.language}</span>}
                              </div>
                              <pre className="overflow-x-auto rounded-md border bg-background p-4 font-mono text-[13px] leading-relaxed text-foreground">
                                <code>{st.codeExample.code}</code>
                              </pre>
                              {st.codeExample.explanation && (
                                <p className="mt-2 text-sm text-muted-foreground">{st.codeExample.explanation}</p>
                              )}
                            </div>
                          )}

                          {/* Mark as Read */}
                          {!isRead && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => markAsRead(stId)}
                              className="gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Mark as Read
                            </Button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {subtopicCount === 0 && (
            <EmptyState icon={FileText} title="No articles yet for this topic." />
          )}
        </TabsContent>

        {/* ============ PRACTICE TAB ============ */}
        <TabsContent value="practice" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by difficulty">
              {['all', 'easy', 'medium', 'hard'].map(d => (
                <Button
                  key={d}
                  variant={practiceFilter === d ? 'secondary' : 'ghost'}
                  size="sm"
                  aria-pressed={practiceFilter === d}
                  onClick={() => setPracticeFilter(d)}
                  className={cn(
                    "h-8 px-3 text-xs capitalize",
                    practiceFilter !== d && "border border-transparent text-muted-foreground"
                  )}
                >
                  {d === 'all' ? 'All' : d}
                </Button>
              ))}
            </div>
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {solvedCount}/{problems.length} solved
            </p>
          </div>

          {filteredProblems.length === 0 ? (
            <EmptyState icon={Code} title="No practice problems available for this topic yet." />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y">
                {filteredProblems.map((prob: any) => (
                  <li key={prob._id || prob.problemId} className="flex items-center gap-3 px-4 py-3">
                    {prob.isSolved ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    )}
                    <span className="sr-only">{prob.isSolved ? 'Solved' : 'Not solved'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{prob.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <DifficultyBadge difficulty={prob.difficulty} />
                        {(prob.topics || []).slice(0, 3).map((t: string) => (
                          <span key={t} className="chip">{t}</span>
                        ))}
                        {prob.acceptanceRate > 0 && (
                          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{prob.acceptanceRate}% acceptance</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 px-3"
                      onClick={() => onNavigateToSection?.(`problem-interface&topicId=${topicId}&problemId=${prob.problemId}`)}
                    >
                      <Play className="h-4 w-4" /> Solve
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* ============ QUIZ TAB ============ */}
        <TabsContent value="quiz" className="space-y-4">
          {mcqs.length === 0 ? (
            <EmptyState icon={HelpCircle} title="No quiz questions available for this topic yet." />
          ) : !quizStarted ? (
            // Quiz intro
            <Card className="p-6 sm:p-8">
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{topic.name} Quiz</h2>
                  <p className="text-sm text-muted-foreground">{mcqs.length} questions to test your understanding</p>
                </div>
                {quizBestScore && (
                  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground tabular-nums">
                    <span className="inline-flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" aria-hidden="true" /> Best: {quizBestScore.bestScore}/{quizBestScore.totalQuestions}</span>
                    <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" aria-hidden="true" /> Attempts: {quizBestScore.attempts}</span>
                  </div>
                )}
                <Button onClick={startQuiz} className="gap-2">
                  <Play className="h-4 w-4" /> Start Quiz
                </Button>
              </div>
            </Card>
          ) : quizFinished ? (
            // Quiz results
            <Card className="p-6 sm:p-8">
              <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
                <div className="space-y-1">
                  <p className="eyebrow">Your score</p>
                  <p className={cn("font-mono text-4xl font-semibold tabular-nums", quizScoreTone)}>
                    {quizScore}/{mcqs.length}
                  </p>
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">
                    {quizScore >= mcqs.length * 0.8 ? 'Excellent!' :
                     quizScore >= mcqs.length * 0.5 ? 'Good effort!' : 'Keep practicing!'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    You scored {Math.round((quizScore / mcqs.length) * 100)}% on {topic.name}
                  </p>
                </div>
                <dl className="grid w-full grid-cols-3 divide-x rounded-md border">
                  <div className="px-3 py-2">
                    <dt className="eyebrow">Correct</dt>
                    <dd className={cn("mt-0.5 font-mono text-sm font-medium tabular-nums", quizScore > 0 && "text-success")}>{quizScore}</dd>
                  </div>
                  <div className="px-3 py-2">
                    <dt className="eyebrow">Wrong</dt>
                    <dd className={cn("mt-0.5 font-mono text-sm font-medium tabular-nums", wrongCount > 0 && "text-destructive")}>{wrongCount}</dd>
                  </div>
                  <div className="px-3 py-2">
                    <dt className="eyebrow">Best</dt>
                    <dd className="mt-0.5 font-mono text-sm font-medium tabular-nums">
                      {quizBestScore ? `${quizBestScore.bestScore}/${quizBestScore.totalQuestions}` : '—'}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="secondary" onClick={() => { setQuizStarted(false); setQuizFinished(false); }}>
                    Back
                  </Button>
                  <Button onClick={startQuiz} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Retry
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            // Quiz in progress
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">Question {currentQ + 1} of {mcqs.length}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">Score: {quizScore}</span>
                  <DifficultyBadge difficulty={mcqs[currentQ].difficulty} />
                </div>
              </div>
              <Progress value={((currentQ + 1) / mcqs.length) * 100} aria-label="Quiz progress" />

              {/* Question */}
              <Card className="p-5 space-y-4">
                <h3 className="text-base font-semibold leading-relaxed">{mcqs[currentQ].question}</h3>

                <div className="space-y-2">
                  {mcqs[currentQ].options.map((opt: string, i: number) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === mcqs[currentQ].correctIndex;
                    const showResult = showExplanation;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectAnswer(i)}
                        disabled={showExplanation}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          !showResult && "hover:bg-accent/50",
                          !showResult && isSelected && "border-primary bg-primary/10",
                          showResult && isCorrect && "border-success/40 bg-success/10 text-success",
                          showResult && isSelected && !isCorrect && "border-destructive/40 bg-destructive/10 text-destructive",
                          showResult && !isCorrect && !isSelected && "opacity-50"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs",
                            showResult && isCorrect ? "border-success/40" :
                            showResult && isSelected ? "border-destructive/40" :
                            isSelected ? "border-primary text-primary" :
                            "bg-muted text-muted-foreground"
                          )}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="min-w-0 flex-1 break-words">{opt}</span>
                        {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && mcqs[currentQ].explanation && (
                  <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                    <p
                      className={cn(
                        "mb-1 flex items-center gap-2 font-medium",
                        selectedAnswer === mcqs[currentQ].correctIndex ? "text-success" : "text-destructive"
                      )}
                    >
                      {selectedAnswer === mcqs[currentQ].correctIndex
                        ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                        : <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />}
                      {selectedAnswer === mcqs[currentQ].correctIndex ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p className="text-muted-foreground">{mcqs[currentQ].explanation}</p>
                  </div>
                )}

                {/* Next button */}
                {showExplanation && (
                  <div className="flex justify-end">
                    <Button onClick={currentQ < mcqs.length - 1 ? nextQuestion : finishQuiz} className="gap-2">
                      {currentQ < mcqs.length - 1 ? 'Next Question' : 'See Results'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ============ INTERVIEW TAB ============ */}
        <TabsContent value="interview" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-xs text-muted-foreground tabular-nums">{viewedIQCount}/{interviewQuestions.length} questions explored</p>
            <Progress
              value={interviewQuestions.length > 0 ? Math.min((viewedIQCount / interviewQuestions.length) * 100, 100) : 0}
              className="w-32"
              aria-label="Interview questions explored"
            />
          </div>

          {interviewQuestions.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No interview questions available for this topic yet." />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y">
                {interviewQuestions.map((iq: any, idx: number) => {
                  const iqId = iq._id || `iq-${idx}`;
                  const isExpanded = expandedIQs.has(iqId);

                  return (
                    <li key={iqId}>
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        className={cn(ROW_BUTTON, "items-start")}
                        onClick={() => toggleIQ(iqId)}
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-muted font-mono text-[11px] tabular-nums text-muted-foreground">
                          {idx + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{iq.question}</span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <DifficultyBadge difficulty={iq.difficulty} />
                            <span className="chip">
                              {iq.frequency === 'high' ? 'Frequently Asked' : iq.frequency === 'medium' ? 'Sometimes Asked' : 'Rarely Asked'}
                            </span>
                            {iq.companies?.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Building2 className="h-3 w-3" aria-hidden="true" />
                                {iq.companies.slice(0, 3).join(', ')}
                              </span>
                            )}
                          </span>
                        </span>
                        {isExpanded
                          ? <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          : <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 sm:pl-[52px]">
                          <p className="eyebrow mb-2">Answer</p>
                          <div className="whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-3 text-sm leading-relaxed">
                            {iq.answer}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
