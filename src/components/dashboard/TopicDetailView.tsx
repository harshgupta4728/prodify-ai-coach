import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Clock, FileText, Code, HelpCircle, MessageSquare,
  ChevronDown, ChevronRight, CheckCircle, Circle, Play, BookOpen,
  Trophy, Star, Building2, BarChart3, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";

interface TopicDetailViewProps {
  topicId: string;
  onBack: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

const FREQUENCY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
};

export const TopicDetailView = ({ topicId, onBack }: TopicDetailViewProps) => {
  const [topic, setTopic] = useState<any>(null);
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  // ===== Learn Tab Handlers =====
  const toggleSubtopic = (id: string) => {
    setExpandedSubtopics(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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
      setQuizFinished(true);
      apiService.saveQuizScore({ topicSlug: topicId, score: quizScore + (selectedAnswer === mcqs[currentQ]?.correctIndex ? 0 : 0), totalQuestions: mcqs.length }).catch(console.error);
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    apiService.saveQuizScore({ topicSlug: topicId, score: quizScore, totalQuestions: mcqs.length }).catch(console.error);
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
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-muted-foreground">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Topics
        </Button>
        <p className="text-muted-foreground">Topic not found.</p>
      </div>
    );
  }

  const quizBestScore = progress?.quizScores?.[topicId];
  const subtopicCount = topic.subtopics?.length || 0;
  const readCount = readSubtopics.size;

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{topic.icon}</span>
            <h1 className="text-2xl font-bold">{topic.name}</h1>
            <Badge variant="outline" className={cn("text-xs", DIFFICULTY_COLORS[topic.difficulty])}>
              {topic.difficulty}
            </Badge>
          </div>
          <p className="text-muted-foreground">{topic.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {topic.estimatedHours}h estimated</span>
            <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {subtopicCount} articles</span>
            <span className="flex items-center gap-1"><HelpCircle className="h-4 w-4" /> {mcqs.length} MCQs</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {interviewQuestions.length} interview Qs</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="learn" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="learn" className="gap-1.5"><FileText className="h-4 w-4" /> Learn</TabsTrigger>
          <TabsTrigger value="practice" className="gap-1.5"><Code className="h-4 w-4" /> Practice</TabsTrigger>
          <TabsTrigger value="quiz" className="gap-1.5"><HelpCircle className="h-4 w-4" /> Quiz</TabsTrigger>
          <TabsTrigger value="interview" className="gap-1.5"><MessageSquare className="h-4 w-4" /> Interview</TabsTrigger>
        </TabsList>

        {/* ============ LEARN TAB ============ */}
        <TabsContent value="learn" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {readCount}/{subtopicCount} articles read
            </p>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${subtopicCount > 0 ? (readCount / subtopicCount) * 100 : 0}%` }} />
            </div>
          </div>

          {topic.subtopics?.map((st: any, idx: number) => {
            const stId = st._id || `st-${idx}`;
            const isExpanded = expandedSubtopics.has(stId);
            const isRead = readSubtopics.has(stId);

            return (
              <Card key={stId} className={cn("transition-all", isRead && "border-green-200 bg-green-50/30")}>
                <CardContent className="p-0">
                  <button
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-accent/50 transition-colors"
                    onClick={() => toggleSubtopic(stId)}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                      isRead ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                    )}>
                      {isRead ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{st.title}</h3>
                      {st.timeComplexity && (
                        <div className="flex gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">Time: {st.timeComplexity}</Badge>
                          {st.spaceComplexity && <Badge variant="outline" className="text-[10px]">Space: {st.spaceComplexity}</Badge>}
                        </div>
                      )}
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t">
                      {/* Concepts */}
                      {st.concepts?.length > 0 && (
                        <div className="pt-3">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Key Concepts</h4>
                          <ul className="space-y-1.5">
                            {st.concepts.map((c: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-1">•</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Code Example */}
                      {st.codeExample?.code && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            {st.codeExample.title || 'Code Example'}
                            {st.codeExample.language && (
                              <Badge variant="outline" className="ml-2 text-[10px]">{st.codeExample.language}</Badge>
                            )}
                          </h4>
                          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
                            <code>{st.codeExample.code}</code>
                          </pre>
                          {st.codeExample.explanation && (
                            <p className="text-sm text-muted-foreground mt-2 italic">{st.codeExample.explanation}</p>
                          )}
                        </div>
                      )}

                      {/* Mark as Read */}
                      {!isRead && (
                        <Button
                          size="sm"
                          onClick={() => markAsRead(stId)}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" /> Mark as Read
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {subtopicCount === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No articles yet for this topic.</CardContent></Card>
          )}
        </TabsContent>

        {/* ============ PRACTICE TAB ============ */}
        <TabsContent value="practice" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['all', 'easy', 'medium', 'hard'].map(d => (
                <Button
                  key={d}
                  variant={practiceFilter === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPracticeFilter(d)}
                  className="h-8 text-xs capitalize"
                >
                  {d === 'all' ? 'All' : d}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {problems.filter(p => p.isSolved).length}/{problems.length} solved
            </p>
          </div>

          {filteredProblems.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No practice problems available for this topic yet.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {filteredProblems.map((prob: any) => (
                <Card key={prob._id || prob.problemId} className={cn("transition-all hover:shadow-sm", prob.isSolved && "bg-green-50/50 border-green-200")}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {prob.isSolved ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <div>
                        <p className={cn("font-medium text-sm", prob.isSolved && "text-green-800")}>{prob.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={cn("text-[10px] px-1.5 py-0", DIFFICULTY_COLORS[prob.difficulty])}>
                            {prob.difficulty}
                          </Badge>
                          {prob.acceptanceRate && (
                            <span className="text-[10px] text-muted-foreground">{prob.acceptanceRate}% acceptance</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                      <Play className="h-3 w-3" /> Solve
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ============ QUIZ TAB ============ */}
        <TabsContent value="quiz" className="space-y-4">
          {mcqs.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No quiz questions available for this topic yet.</CardContent></Card>
          ) : !quizStarted ? (
            // Quiz intro
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{topic.name} Quiz</h2>
                <p className="text-muted-foreground">{mcqs.length} questions to test your understanding</p>
                {quizBestScore && (
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="flex items-center gap-1"><Trophy className="h-4 w-4 text-amber-500" /> Best: {quizBestScore.bestScore}/{quizBestScore.totalQuestions}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="h-4 w-4 text-blue-500" /> Attempts: {quizBestScore.attempts}</span>
                  </div>
                )}
                <Button onClick={startQuiz} size="lg" className="gap-2">
                  <Play className="h-5 w-5" /> Start Quiz
                </Button>
              </CardContent>
            </Card>
          ) : quizFinished ? (
            // Quiz results
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold",
                  quizScore >= mcqs.length * 0.8 ? "bg-green-100 text-green-700" :
                  quizScore >= mcqs.length * 0.5 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                )}>
                  {quizScore}/{mcqs.length}
                </div>
                <h2 className="text-xl font-bold">
                  {quizScore >= mcqs.length * 0.8 ? 'Excellent!' :
                   quizScore >= mcqs.length * 0.5 ? 'Good effort!' : 'Keep practicing!'}
                </h2>
                <p className="text-muted-foreground">
                  You scored {Math.round((quizScore / mcqs.length) * 100)}% on {topic.name}
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => { setQuizStarted(false); setQuizFinished(false); }}>
                    Back
                  </Button>
                  <Button onClick={startQuiz} className="gap-2">
                    <Play className="h-4 w-4" /> Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Quiz in progress
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Question {currentQ + 1} of {mcqs.length}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Score: {quizScore}</span>
                  <Badge variant="outline" className={cn("text-[10px]", DIFFICULTY_COLORS[mcqs[currentQ].difficulty])}>
                    {mcqs[currentQ].difficulty}
                  </Badge>
                </div>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentQ + 1) / mcqs.length) * 100}%` }} />
              </div>

              {/* Question */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">{mcqs[currentQ].question}</h3>

                  <div className="space-y-2">
                    {mcqs[currentQ].options.map((opt: string, i: number) => {
                      const isSelected = selectedAnswer === i;
                      const isCorrect = i === mcqs[currentQ].correctIndex;
                      const showResult = showExplanation;

                      return (
                        <button
                          key={i}
                          onClick={() => selectAnswer(i)}
                          disabled={showExplanation}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border-2 transition-all text-sm",
                            !showResult && "hover:border-primary/50 hover:bg-primary/5",
                            !showResult && isSelected && "border-primary bg-primary/10",
                            !showResult && !isSelected && "border-border",
                            showResult && isCorrect && "border-green-500 bg-green-50 text-green-800",
                            showResult && isSelected && !isCorrect && "border-red-500 bg-red-50 text-red-800",
                            showResult && !isCorrect && !isSelected && "border-border opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                              showResult && isCorrect ? "bg-green-200 text-green-800" :
                              showResult && isSelected ? "bg-red-200 text-red-800" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {showExplanation && mcqs[currentQ].explanation && (
                    <div className={cn(
                      "p-3 rounded-lg text-sm",
                      selectedAnswer === mcqs[currentQ].correctIndex ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
                    )}>
                      <p className="font-medium mb-1">
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
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ============ INTERVIEW TAB ============ */}
        <TabsContent value="interview" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{viewedIQCount}/{interviewQuestions.length} questions explored</p>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${interviewQuestions.length > 0 ? (viewedIQCount / interviewQuestions.length) * 100 : 0}%` }} />
            </div>
          </div>

          {interviewQuestions.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No interview questions available for this topic yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {interviewQuestions.map((iq: any, idx: number) => {
                const iqId = iq._id || `iq-${idx}`;
                const isExpanded = expandedIQs.has(iqId);

                return (
                  <Card key={iqId} className={cn("transition-all", isExpanded && "ring-1 ring-primary/30")}>
                    <CardContent className="p-0">
                      <button
                        className="w-full p-4 flex items-start gap-3 text-left hover:bg-accent/50 transition-colors"
                        onClick={() => toggleIQ(iqId)}
                      >
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{iq.question}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={cn("text-[10px] px-1.5 py-0", DIFFICULTY_COLORS[iq.difficulty])}>
                              {iq.difficulty}
                            </Badge>
                            <Badge className={cn("text-[10px] px-1.5 py-0", FREQUENCY_COLORS[iq.frequency])}>
                              {iq.frequency === 'high' ? 'Frequently Asked' : iq.frequency === 'medium' ? 'Sometimes Asked' : 'Rarely Asked'}
                            </Badge>
                            {iq.companies?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{iq.companies.slice(0, 3).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground mt-1" /> : <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t">
                          <div className="pl-10">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Answer</h4>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap bg-accent/30 p-3 rounded-lg">
                              {iq.answer}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
