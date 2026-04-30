import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Trophy, Search, ChevronRight,
  Clock, FileText, HelpCircle, MessageSquare, Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";

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
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
};

const TOPIC_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
  green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
  red: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
  slate: { bg: 'bg-slate-500', text: 'text-slate-600', light: 'bg-slate-50' },
};

const getColor = (color: string) => TOPIC_COLORS[color] || TOPIC_COLORS.blue;

export const TopicProgress = ({ onNavigateToSection }: TopicProgressProps) => {
  const [topics, setTopics] = useState<TopicWithCounts[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [topicsData, progressData] = await Promise.all([
        apiService.getTopics(),
        apiService.getProgress()
      ]);
      setTopics(topicsData);
      setProgress(progressData.progress || progressData);
    } catch (error) {
      console.error('Error loading topic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopicProgress = (topic: TopicWithCounts) => {
    if (!progress) return { theory: 0, practice: 0, quiz: 0, interview: 0, overall: 0 };

    const subtopicCount = topic.subtopics?.length || 1;
    const articlesRead = progress.articlesRead?.filter((a: any) => a.topicSlug === topic.slug).length || 0;
    const theory = Math.min((articlesRead / subtopicCount) * 100, 100);

    const problemsSolved = progress.topicProgress?.[topic.slug] || 0;
    const practice = Math.min(problemsSolved * 20, 100);

    const quizData = progress.quizScores?.[topic.slug];
    const quiz = quizData ? Math.min((quizData.bestScore / (quizData.totalQuestions || topic.mcqCount || 1)) * 100, 100) : 0;

    const interviewViewed = progress.interviewQuestionsViewed?.[topic.slug] || 0;
    const interview = topic.interviewQuestionCount > 0
      ? Math.min((interviewViewed / topic.interviewQuestionCount) * 100, 100)
      : 0;

    const overall = (theory + practice + quiz + interview) / 4;
    return { theory, practice, quiz, interview, overall };
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

  const navigateToTopic = (slug: string) => {
    onNavigateToSection?.(`topic-detail&topicId=${slug}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-muted-foreground">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Topic Progress</h1>
        <p className="text-muted-foreground">Master DSA topics with theory, practice, quizzes & interview prep</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Topics Mastered</p>
              <p className="text-2xl font-bold">{topicsMastered}<span className="text-sm font-normal text-muted-foreground">/{totalTopics}</span></p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Problems Solved</p>
              <p className="text-2xl font-bold">{totalProblemsSolved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
              <p className="text-2xl font-bold">{avgQuizScore}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{currentRating}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-44">
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

      {/* Topics Grid */}
      {filteredTopics.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">No topics found. Try a different search or filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map(topic => {
            const prog = getTopicProgress(topic);
            const tc = getColor(topic.color);

            return (
              <Card
                key={topic._id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group overflow-hidden",
                  prog.overall >= 80 && "ring-2 ring-green-300"
                )}
                onClick={() => navigateToTopic(topic.slug)}
              >
                <CardContent className="p-0">
                  <div className={cn("h-1.5", tc.bg)} />
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-xl", tc.light)}>
                          {topic.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{topic.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", DIFFICULTY_COLORS[topic.difficulty])}>
                              {topic.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {topic.estimatedHours}h
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{topic.description}</p>

                    {/* Progress Ring + Breakdown */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/30" />
                          <circle
                            cx="28" cy="28" r="24"
                            stroke="currentColor" strokeWidth="4" fill="none"
                            strokeDasharray={`${2 * Math.PI * 24}`}
                            strokeDashoffset={`${2 * Math.PI * 24 * (1 - prog.overall / 100)}`}
                            strokeLinecap="round"
                            className={tc.text}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">{Math.round(prog.overall)}%</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <ProgressMini label="Theory" value={prog.theory} icon={<FileText className="h-3 w-3" />} />
                        <ProgressMini label="Practice" value={prog.practice} icon={<Code className="h-3 w-3" />} />
                        <ProgressMini label="Quiz" value={prog.quiz} icon={<HelpCircle className="h-3 w-3" />} />
                        <ProgressMini label="Interview" value={prog.interview} icon={<MessageSquare className="h-3 w-3" />} />
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                      <div className="flex gap-3">
                        <span>{topic.subtopics?.length || 0} articles</span>
                        <span>{topic.mcqCount || 0} MCQs</span>
                        <span>{topic.interviewQuestionCount || 0} IQs</span>
                      </div>
                      <Button variant="ghost" size="sm" className={cn("h-7 text-xs gap-1 px-2", tc.text)}>
                        {prog.overall > 0 ? 'Continue' : 'Start'} <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProgressMini = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <div className="text-muted-foreground/60">{icon}</div>
    <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          value >= 80 ? "bg-green-500" : value > 0 ? "bg-primary" : "bg-transparent"
        )}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
    <span className="text-[10px] text-muted-foreground w-7 text-right">{Math.round(value)}%</span>
  </div>
);
