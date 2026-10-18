import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowDownWideNarrow, ArrowLeftRight, BookOpen, Brackets, CheckCircle2, ChevronRight, Coins,
  GalleryHorizontal, Gauge, Grid3x3, Hash, HelpCircle, Layers, Link2, Network, RotateCcw, Search,
  SearchCode, Share2, Triangle, Type, Undo2, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { StatTile } from "@/components/common/StatTile";
import { EmptyState } from "@/components/common/EmptyState";

interface TopicProgressProps {
  onNavigateToSection?: (section: string) => void;
}

interface TopicWithCounts {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  description: string;
  subtopics: any[];
  mcqCount: number;
  interviewQuestionCount: number;
  order: number;
  // Problem-bank topic names whose solved problems count as this topic's practice
  practiceTopics?: string[];
}

// A topic's own icon is an emoji; the list shows a plain line icon for it instead
const TOPIC_ICONS: Record<string, LucideIcon> = {
  arrays: Brackets,
  strings: Type,
  'linked-lists': Link2,
  'stack-queue': Layers,
  trees: Network,
  graphs: Share2,
  'dynamic-programming': Grid3x3,
  'binary-search': SearchCode,
  greedy: Coins,
  backtracking: Undo2,
  'two-pointers': ArrowLeftRight,
  'sliding-window': GalleryHorizontal,
  heap: Triangle,
  hashing: Hash,
  sorting: ArrowDownWideNarrow,
};

export const TopicProgress = ({ onNavigateToSection }: TopicProgressProps) => {
  const [topics, setTopics] = useState<TopicWithCounts[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadFailed(false);
      const [topicsData, progressData] = await Promise.all([
        apiService.getTopics(),
        apiService.getProgress()
      ]);
      setTopics(topicsData);
      setProgress(progressData.progress || progressData);
    } catch (error) {
      console.error('Error loading topic data:', error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const getTopicProgress = (topic: TopicWithCounts) => {
    if (!progress) return { theory: 0, practice: 0, quiz: 0, interview: 0, overall: 0, hasPractice: false };

    const subtopicCount = topic.subtopics?.length || 1;
    const articlesRead = progress.articlesRead?.filter((a: any) => a.topicSlug === topic.slug).length || 0;
    const theory = Math.min((articlesRead / subtopicCount) * 100, 100);

    // Solved problems are counted under the problem bank's names (e.g. "linkedLists")
    const practiceTopics = topic.practiceTopics ?? [topic.slug];
    const hasPractice = practiceTopics.length > 0;
    const problemsSolved = practiceTopics.reduce((sum, key) => sum + (progress.topicProgress?.[key] || 0), 0);
    const practice = Math.min(problemsSolved * 20, 100);

    const quizData = progress.quizScores?.[topic.slug];
    const quiz = quizData ? Math.min((quizData.bestScore / (quizData.totalQuestions || topic.mcqCount || 1)) * 100, 100) : 0;

    const interviewViewed = progress.interviewQuestionsViewed?.[topic.slug] || 0;
    const interview = topic.interviewQuestionCount > 0
      ? Math.min((interviewViewed / topic.interviewQuestionCount) * 100, 100)
      : 0;

    // Topics without practice problems yet are scored on the other three parts
    const parts = hasPractice ? [theory, practice, quiz, interview] : [theory, quiz, interview];
    const overall = parts.reduce((sum, value) => sum + value, 0) / parts.length;
    return { theory, practice, quiz, interview, overall, hasPractice };
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = !searchQuery ||
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || topic.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const totalTopics = topics.length;
  const topicsMastered = topics.filter(t => getTopicProgress(t).overall >= 80).length;
  const totalProblemsSolved = progress?.totalProblemsSolved || 0;
  const avgQuizScore = (() => {
    if (!progress?.quizScores) return 0;
    const scores = Object.values(progress.quizScores) as any[];
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum: number, s: any) => sum + (s.bestScore / (s.totalQuestions || 1)) * 100, 0) / scores.length);
  })();
  const currentRating = progress?.currentRating || 1200;

  // Summary numbers for the stat row, from the same per-topic scores as the list
  const allTopicProgress = topics.map(getTopicProgress);
  const topicsStarted = allTopicProgress.filter(p => p.overall > 0).length;
  const overallProgress = totalTopics > 0
    ? Math.round(allTopicProgress.reduce((sum, p) => sum + p.overall, 0) / totalTopics)
    : 0;
  const quizzesTaken = Object.keys(progress?.quizScores || {}).length;

  const navigateToTopic = (slug: string) => {
    onNavigateToSection?.(`topic-detail&topicId=${slug}`);
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <p className="sr-only" role="status">Loading topics...</p>
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[104px]" />)}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <Card className="p-8 text-center space-y-3">
        <p className="font-medium">Couldn't load topics</p>
        <p className="text-sm text-muted-foreground">Check your internet connection and try again.</p>
        <Button onClick={loadData} variant="secondary" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Topics"
        description="Learn each topic through articles, practice problems, a quiz and interview questions."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Overall"
          value={`${overallProgress}%`}
          hint="Average across all topics"
          icon={Gauge}
          highlight={overallProgress > 0}
        />
        <StatTile
          label="Topics started"
          value={topicsStarted}
          unit={`/ ${totalTopics}`}
          hint={`${topicsMastered} mastered`}
          icon={BookOpen}
          title="A topic counts as mastered at 80% or more"
        />
        <StatTile
          label="Avg quiz score"
          value={`${avgQuizScore}%`}
          hint={quizzesTaken === 0 ? "No quizzes taken yet" : `${quizzesTaken} ${quizzesTaken === 1 ? "quiz" : "quizzes"} taken`}
          icon={HelpCircle}
        />
        <StatTile
          label="Solved"
          value={totalProblemsSolved}
          unit={totalProblemsSolved === 1 ? "problem" : "problems"}
          hint={`Rating ${currentRating}`}
          icon={CheckCircle2}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search topics..."
            aria-label="Search topics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by level">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Topics */}
      {filteredTopics.length === 0 ? (
        <EmptyState icon={Search} title="No topics found" description="Try a different search or filter." />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y">
            {filteredTopics.map(topic => {
              const prog = getTopicProgress(topic);
              const percent = Math.round(prog.overall);
              const mastered = prog.overall >= 80;
              const Icon = TOPIC_ICONS[topic.slug] || BookOpen;

              return (
                <li key={topic._id}>
                  <button
                    type="button"
                    onClick={() => navigateToTopic(topic.slug)}
                    className="group flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-6 sm:px-5"
                  >
                    {/* Name, level and the four parts */}
                    <span className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-sm font-medium">{topic.name}</span>
                          <span className="text-xs text-muted-foreground">
                            <span className="capitalize">{topic.difficulty}</span>
                            {" · "}
                            <span className="font-mono tabular-nums">{topic.estimatedHours}h</span>
                          </span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:line-clamp-1">{topic.description}</span>
                        <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          <ProgressMini label="Theory" value={prog.theory} />
                          {prog.hasPractice && <ProgressMini label="Practice" value={prog.practice} />}
                          <ProgressMini label="Quiz" value={prog.quiz} />
                          <ProgressMini label="Interview" value={prog.interview} />
                        </span>
                      </span>
                    </span>

                    {/* Overall progress */}
                    <span className="flex w-full shrink-0 flex-col gap-1.5 pl-11 sm:w-52 sm:pl-0">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "flex items-center gap-1 font-mono text-sm font-medium tabular-nums",
                            mastered ? "text-success" : percent === 0 && "text-muted-foreground"
                          )}
                        >
                          {mastered && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                          {percent}%
                        </span>
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors group-hover:text-primary">
                          {prog.overall > 0 ? 'Continue' : 'Start'}
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </span>
                      <Progress value={prog.overall} />
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {topic.subtopics?.length || 0} articles · {topic.mcqCount || 0} MCQs · {topic.interviewQuestionCount || 0} IQs
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
};

const ProgressMini = ({ label, value }: { label: string; value: number }) => (
  <span
    className="inline-flex items-center gap-1 font-mono text-[11px] leading-4 text-muted-foreground"
    title={`${label}: ${Math.round(value)}%`}
    aria-label={`${label}: ${Math.round(value)}%`}
  >
    {label}
    <span className={cn("tabular-nums", value >= 80 ? "text-success" : value > 0 && "text-foreground")}>
      {Math.round(value)}%
    </span>
  </span>
);
