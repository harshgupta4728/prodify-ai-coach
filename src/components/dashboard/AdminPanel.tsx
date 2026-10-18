import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { apiService as api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  BookOpen,
  HelpCircle,
  MessageSquare,
  ArrowLeft,
  Search,
  AlertTriangle,
  Check,
} from "lucide-react";

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = "topics" | "mcqs" | "interview";
type EditMode = "none" | "topic" | "subtopic" | "mcq" | "interview";

// ---------- Presentational helpers (kept outside the component so inputs keep focus while typing) ----------

// Topics are rated beginner / intermediate / advanced and questions easy / medium / hard;
// both get the same three difficulty colours
const LEVEL_TINT: Record<string, string> = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-warning/10 text-warning",
  advanced: "bg-destructive/10 text-destructive",
};

const LevelBadge = ({ level }: { level?: string }) => (
  <DifficultyBadge difficulty={level} className={LEVEL_TINT[(level || "").toLowerCase()]} />
);

const OVERLAY_CLASS =
  "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm";

interface FormModalProps {
  titleId: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Centered panel that holds one edit form
const FormModal = ({ titleId, title, onClose, children }: FormModalProps) => (
  <div className={OVERLAY_CLASS}>
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border bg-card p-5 shadow-lg sm:p-6"
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 id={titleId} className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  </div>
);

interface FieldProps {
  id: string;
  label: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

// A label above its control
const Field = ({ id, label, className, children }: FieldProps) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
);

// A native <select> drawn like the shadcn Select trigger
const NativeSelect = ({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select
      className={cn(
        "flex h-10 w-full appearance-none rounded-md border border-input bg-background py-2 pl-3 pr-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
      aria-hidden="true"
    />
  </div>
);

// Cancel + confirm buttons at the bottom of a dialog (stacked on phones, main button on top)
const DialogActions = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}>{children}</div>
);

export const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [tab, setTab] = useState<Tab>("topics");
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [editData, setEditData] = useState<any>(null);
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [interviewQs, setInterviewQs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  // Failed saves and deletes are shown, not just logged
  const reportError = (action: string, err: unknown) => {
    console.error(`Failed to ${action}:`, err);
    toast({ title: `Couldn't ${action}`, description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
  };

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      loadTopicContent(selectedTopic.slug);
    }
  }, [selectedTopic, tab]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await api.getTopics();
      setTopics(data);
    } catch (err) {
      console.error("Failed to load topics:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopicContent = async (slug: string) => {
    try {
      if (tab === "mcqs") {
        const data = await api.getMCQs(slug);
        setMcqs(data);
      } else if (tab === "interview") {
        const data = await api.getInterviewQuestions(slug);
        setInterviewQs(data);
      }
    } catch (err) {
      console.error("Failed to load content:", err);
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedTopics);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTopics(next);
  };

  // ========== SAVE HANDLERS ==========
  const saveTopic = async () => {
    setSaving(true);
    try {
      if (editData._id) {
        await api.updateTopic(editData._id, editData);
      } else {
        await api.createTopic(editData);
      }
      await loadTopics();
      setEditMode("none");
      setEditData(null);
    } catch (err) {
      reportError("save the topic", err);
    } finally {
      setSaving(false);
    }
  };

  const saveMCQ = async () => {
    setSaving(true);
    try {
      if (editData._id) {
        await api.updateMCQ(editData._id, editData);
      } else {
        await api.createMCQ(selectedTopic.slug, editData);
      }
      await loadTopicContent(selectedTopic.slug);
      setEditMode("none");
      setEditData(null);
    } catch (err) {
      reportError("save the question", err);
    } finally {
      setSaving(false);
    }
  };

  const saveInterviewQ = async () => {
    setSaving(true);
    try {
      // The companies field keeps raw comma-separated text while typing
      const question = { ...editData, companies: (editData.companies || []).map((c: string) => c.trim()).filter(Boolean) };
      if (question._id) {
        await api.updateInterviewQuestion(question._id, question);
      } else {
        await api.createInterviewQuestion(selectedTopic.slug, question);
      }
      await loadTopicContent(selectedTopic.slug);
      setEditMode("none");
      setEditData(null);
    } catch (err) {
      reportError("save the interview question", err);
    } finally {
      setSaving(false);
    }
  };

  // ========== DELETE HANDLERS ==========
  const deleteTopic = async (id: string) => {
    try {
      await api.deleteTopic(id);
      await loadTopics();
      if (selectedTopic?._id === id) setSelectedTopic(null);
    } catch (err) {
      reportError("delete the topic", err);
    }
    setDeleteConfirm(null);
  };

  const deleteMCQ = async (id: string) => {
    try {
      await api.deleteMCQ(id);
      await loadTopicContent(selectedTopic.slug);
    } catch (err) {
      reportError("delete the question", err);
    }
    setDeleteConfirm(null);
  };

  const deleteInterviewQ = async (id: string) => {
    try {
      await api.deleteInterviewQuestion(id);
      await loadTopicContent(selectedTopic.slug);
    } catch (err) {
      reportError("delete the interview question", err);
    }
    setDeleteConfirm(null);
  };

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  // ========== TOPIC EDIT FORM ==========
  const renderTopicForm = () => {
    if (editMode !== "topic" || !editData) return null;
    return (
      <FormModal
        titleId="admin-topic-form-title"
        title={editData._id ? "Edit Topic" : "New Topic"}
        onClose={() => {
          setEditMode("none");
          setEditData(null);
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="admin-topic-name" label="Name">
              <Input
                id="admin-topic-name"
                value={editData.name || ""}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                placeholder="e.g., Arrays"
              />
            </Field>
            <Field id="admin-topic-slug" label="Slug">
              <Input
                id="admin-topic-slug"
                className="font-mono"
                value={editData.slug || ""}
                onChange={(e) =>
                  setEditData({ ...editData, slug: e.target.value })
                }
                placeholder="e.g., arrays"
              />
            </Field>
            <Field
              id="admin-topic-icon"
              label={
                <>
                  Icon <span className="font-normal text-muted-foreground">(emoji)</span>
                </>
              }
            >
              <Input
                id="admin-topic-icon"
                value={editData.icon || ""}
                onChange={(e) =>
                  setEditData({ ...editData, icon: e.target.value })
                }
              />
            </Field>
            <Field id="admin-topic-color" label="Color">
              <Input
                id="admin-topic-color"
                value={editData.color || ""}
                onChange={(e) =>
                  setEditData({ ...editData, color: e.target.value })
                }
                placeholder="blue"
              />
            </Field>
            <Field id="admin-topic-difficulty" label="Difficulty">
              <NativeSelect
                id="admin-topic-difficulty"
                value={editData.difficulty || "intermediate"}
                onChange={(e) =>
                  setEditData({ ...editData, difficulty: e.target.value })
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </NativeSelect>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="admin-topic-hours" label="Estimated Hours">
                <Input
                  id="admin-topic-hours"
                  type="number"
                  value={editData.estimatedHours || 10}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      estimatedHours: parseInt(e.target.value),
                    })
                  }
                />
              </Field>
              <Field id="admin-topic-order" label="Order">
                <Input
                  id="admin-topic-order"
                  type="number"
                  value={editData.order || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      order: parseInt(e.target.value),
                    })
                  }
                />
              </Field>
            </div>
            <Field id="admin-topic-description" label="Description" className="sm:col-span-2">
              <Textarea
                id="admin-topic-description"
                value={editData.description || ""}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                placeholder="Topic description..."
              />
            </Field>
          </div>
          <DialogActions className="pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditMode("none");
                setEditData(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveTopic} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Topic"}
            </Button>
          </DialogActions>
        </div>
      </FormModal>
    );
  };

  // ========== MCQ EDIT FORM ==========
  const renderMCQForm = () => {
    if (editMode !== "mcq" || !editData) return null;
    return (
      <FormModal
        titleId="admin-mcq-form-title"
        title={editData._id ? "Edit MCQ" : "New MCQ"}
        onClose={() => {
          setEditMode("none");
          setEditData(null);
        }}
      >
        <div className="space-y-4">
          <Field id="admin-mcq-question" label="Question">
            <Textarea
              id="admin-mcq-question"
              value={editData.question || ""}
              onChange={(e) =>
                setEditData({ ...editData, question: e.target.value })
              }
            />
          </Field>
          <fieldset>
            <legend className="text-sm font-medium">Options</legend>
            <p className="mt-1 text-xs text-muted-foreground">
              Select the circle next to the correct answer.
            </p>
            <div className="mt-2 space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correctIndex"
                    checked={editData.correctIndex === i}
                    onChange={() => setEditData({ ...editData, correctIndex: i })}
                    aria-label={`Mark option ${String.fromCharCode(65 + i)} as correct`}
                    className="h-4 w-4 shrink-0 accent-primary"
                  />
                  <Input
                    value={editData.options?.[i] || ""}
                    onChange={(e) => {
                      const opts = [...(editData.options || ["", "", "", ""])];
                      opts[i] = e.target.value;
                      setEditData({ ...editData, options: opts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    aria-label={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </fieldset>
          <Field id="admin-mcq-explanation" label="Explanation">
            <Textarea
              id="admin-mcq-explanation"
              value={editData.explanation || ""}
              onChange={(e) =>
                setEditData({ ...editData, explanation: e.target.value })
              }
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="admin-mcq-difficulty" label="Difficulty">
              <NativeSelect
                id="admin-mcq-difficulty"
                value={editData.difficulty || "medium"}
                onChange={(e) =>
                  setEditData({ ...editData, difficulty: e.target.value })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </NativeSelect>
            </Field>
            <Field id="admin-mcq-order" label="Order">
              <Input
                id="admin-mcq-order"
                type="number"
                value={editData.order || 0}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    order: parseInt(e.target.value),
                  })
                }
              />
            </Field>
          </div>
          <DialogActions className="pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditMode("none");
                setEditData(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveMCQ} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save MCQ"}
            </Button>
          </DialogActions>
        </div>
      </FormModal>
    );
  };

  // ========== INTERVIEW Q EDIT FORM ==========
  const renderInterviewForm = () => {
    if (editMode !== "interview" || !editData) return null;
    return (
      <FormModal
        titleId="admin-iq-form-title"
        title={editData._id ? "Edit Interview Question" : "New Interview Question"}
        onClose={() => {
          setEditMode("none");
          setEditData(null);
        }}
      >
        <div className="space-y-4">
          <Field id="admin-iq-question" label="Question">
            <Textarea
              id="admin-iq-question"
              value={editData.question || ""}
              onChange={(e) =>
                setEditData({ ...editData, question: e.target.value })
              }
            />
          </Field>
          <Field id="admin-iq-answer" label="Answer">
            <Textarea
              id="admin-iq-answer"
              className="min-h-[120px]"
              value={editData.answer || ""}
              onChange={(e) =>
                setEditData({ ...editData, answer: e.target.value })
              }
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="admin-iq-difficulty" label="Difficulty">
              <NativeSelect
                id="admin-iq-difficulty"
                value={editData.difficulty || "medium"}
                onChange={(e) =>
                  setEditData({ ...editData, difficulty: e.target.value })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </NativeSelect>
            </Field>
            <Field id="admin-iq-frequency" label="Frequency">
              <NativeSelect
                id="admin-iq-frequency"
                value={editData.frequency || "medium"}
                onChange={(e) =>
                  setEditData({ ...editData, frequency: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </NativeSelect>
            </Field>
          </div>
          <Field
            id="admin-iq-companies"
            label={
              <>
                Companies <span className="font-normal text-muted-foreground">(comma-separated)</span>
              </>
            }
          >
            <Input
              id="admin-iq-companies"
              value={(editData.companies || []).join(",")}
              onChange={(e) => setEditData({ ...editData, companies: e.target.value.split(",") })}
              placeholder="Google, Amazon, Microsoft"
            />
          </Field>
          <DialogActions className="pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditMode("none");
                setEditData(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveInterviewQ} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Question"}
            </Button>
          </DialogActions>
        </div>
      </FormModal>
    );
  };

  // ========== DELETE CONFIRMATION ==========
  const renderDeleteConfirm = () => {
    if (!deleteConfirm) return null;
    return (
      <div className={OVERLAY_CLASS}>
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="admin-delete-title"
          aria-describedby="admin-delete-description"
          className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-destructive/30 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </span>
            <div className="min-w-0 space-y-1">
              <h3 id="admin-delete-title" className="text-base font-semibold leading-8">
                Confirm Delete
              </h3>
              <p id="admin-delete-description" className="text-sm text-muted-foreground">
                Are you sure you want to delete this item? This action cannot be
                undone.
              </p>
            </div>
          </div>
          <DialogActions className="mt-6">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const [type, id] = deleteConfirm.split(":");
                if (type === "topic") deleteTopic(id);
                else if (type === "mcq") deleteMCQ(id);
                else if (type === "interview") deleteInterviewQ(id);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogActions>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <span className="sr-only">Loading content</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderTopicForm()}
      {renderMCQForm()}
      {renderInterviewForm()}
      {renderDeleteConfirm()}

      {/* Header */}
      <PageHeader
        eyebrow="Content"
        title="Admin"
        description="Manage topics, MCQs, and interview questions"
        actions={
          <>
            <span className="mr-2 font-mono text-xs tabular-nums text-muted-foreground">
              <span className="text-foreground">{topics.length}</span> topics
              {" · "}
              <span className="text-foreground">
                {topics.reduce((s, t) => s + (t.mcqCount || 0), 0)}
              </span>{" "}
              MCQs
              {" · "}
              <span className="text-foreground">
                {topics.reduce((s, t) => s + (t.interviewQuestionCount || 0), 0)}
              </span>{" "}
              IQs
            </span>
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </>
        }
      />

      {/* Two-column layout on laptops, stacked on phones and tablets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Topic List */}
        <Card className="min-w-0 self-start overflow-hidden lg:col-span-5 xl:col-span-4">
          <div className="flex items-center gap-2 border-b p-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                aria-label="Search topics"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="New topic"
              title="New topic"
              onClick={() => {
                setEditMode("topic");
                setEditData({
                  name: "",
                  slug: "",
                  icon: "📚",
                  color: "blue",
                  difficulty: "intermediate",
                  estimatedHours: 10,
                  description: "",
                  order: topics.length + 1,
                });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {filteredTopics.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {topics.length === 0 ? "No topics yet." : "No topics match your search."}
            </p>
          ) : (
            <ul className="max-h-80 divide-y overflow-auto lg:max-h-[calc(100vh-280px)]">
              {filteredTopics.map((topic) => {
                const isSelected = selectedTopic?._id === topic._id;
                return (
                  <li
                    key={topic._id}
                    className={cn(
                      "relative flex items-center transition-colors",
                      isSelected ? "bg-accent" : "hover:bg-accent/50"
                    )}
                  >
                    {isSelected && (
                      <span
                        className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    )}
                    <button
                      type="button"
                      aria-current={isSelected ? "true" : undefined}
                      onClick={() => setSelectedTopic(topic)}
                      className="min-w-0 flex-1 py-3 pl-4 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="block truncate text-sm font-medium">{topic.name}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <LevelBadge level={topic.difficulty} />
                        <span className="flex items-center gap-3 font-mono text-xs tabular-nums text-muted-foreground">
                          {[
                            { label: "subtopics", icon: BookOpen, count: topic.subtopics?.length || 0 },
                            { label: "MCQs", icon: HelpCircle, count: topic.mcqCount || 0 },
                            { label: "interview questions", icon: MessageSquare, count: topic.interviewQuestionCount || 0 },
                          ].map(({ label, icon: Icon, count }) => (
                            <span key={label} className="inline-flex items-center gap-1" title={`${count} ${label}`}>
                              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                              {count}
                              <span className="sr-only"> {label}</span>
                            </span>
                          ))}
                        </span>
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5 pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        aria-label={`Edit ${topic.name}`}
                        title="Edit topic"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditMode("topic");
                          setEditData({ ...topic });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${topic.name}`}
                        title="Delete topic"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(`topic:${topic._id}`);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Right: Content View */}
        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          {!selectedTopic ? (
            <EmptyState icon={BookOpen} title="Select a topic to manage its content" />
          ) : (
            <div className="space-y-4">
              {/* Topic Header */}
              <Card className="p-5">
                <h2 className="text-lg font-semibold leading-snug">{selectedTopic.name}</h2>
                {selectedTopic.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedTopic.description}
                  </p>
                )}
              </Card>

              {/* Content Tabs */}
              <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
                <TabsList className="w-full">
                  {([
                    { id: "topics" as Tab, label: "Subtopics", icon: BookOpen },
                    { id: "mcqs" as Tab, label: "MCQs", icon: HelpCircle },
                    {
                      id: "interview" as Tab,
                      label: "Interview Qs",
                      icon: MessageSquare,
                    },
                  ] as const).map((t) => (
                    <TabsTrigger key={t.id} value={t.id} className="flex-1 gap-2">
                      <t.icon className="hidden h-4 w-4 sm:block" />
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Subtopics Tab */}
                <TabsContent value="topics" className="mt-4">
                  <Card className="overflow-hidden">
                    {!selectedTopic.subtopics ||
                    selectedTopic.subtopics.length === 0 ? (
                      <EmptyState
                        icon={BookOpen}
                        title="No subtopics yet"
                        description="Add subtopics when editing the topic."
                        className="border-0"
                      />
                    ) : (
                      <ul className="divide-y">
                        {(selectedTopic.subtopics || []).map(
                          (sub: any, idx: number) => {
                            const isOpen = expandedTopics.has(sub._id || String(idx));
                            return (
                              <li key={sub._id || idx}>
                                <button
                                  type="button"
                                  aria-expanded={isOpen}
                                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                                  onClick={() => toggleExpand(sub._id || String(idx))}
                                >
                                  {isOpen ? (
                                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                  )}
                                  <span className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                    <span className="min-w-0 break-words text-sm font-medium">
                                      <span className="mr-1 font-mono text-xs tabular-nums text-muted-foreground">
                                        {idx + 1}.
                                      </span>{" "}
                                      {sub.title}
                                    </span>
                                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                                      {sub.timeComplexity && (
                                        <span className="chip">{sub.timeComplexity}</span>
                                      )}
                                      <span>
                                        <span className="font-mono tabular-nums text-foreground">
                                          {sub.concepts?.length || 0}
                                        </span>{" "}
                                        concepts
                                      </span>
                                    </span>
                                  </span>
                                </button>
                                {isOpen && (
                                  <div className="space-y-4 border-t bg-muted/20 px-4 py-4 text-sm sm:pl-11">
                                    <div>
                                      <p className="eyebrow mb-2">Concepts</p>
                                      <ul className="list-inside list-disc space-y-1 marker:text-muted-foreground">
                                        {(sub.concepts || []).map(
                                          (c: string, ci: number) => (
                                            <li key={ci}>{c}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                    {sub.codeExample && (
                                      <div>
                                        <p className="mb-2 flex flex-wrap items-baseline gap-x-2">
                                          <span className="eyebrow">Code</span>
                                          <span className="text-xs text-muted-foreground">
                                            {sub.codeExample.title}
                                          </span>
                                        </p>
                                        <pre className="max-h-48 overflow-auto rounded-md border bg-background p-3 font-mono text-xs leading-relaxed">
                                          <code>{sub.codeExample.code}</code>
                                        </pre>
                                        {sub.codeExample.explanation && (
                                          <p className="mt-2 text-xs text-muted-foreground">
                                            {sub.codeExample.explanation}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </li>
                            );
                          }
                        )}
                      </ul>
                    )}
                  </Card>
                </TabsContent>

                {/* MCQs Tab */}
                <TabsContent value="mcqs" className="mt-4">
                  <Card className="overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono tabular-nums text-foreground">{mcqs.length}</span>{" "}
                        MCQs
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditMode("mcq");
                          setEditData({
                            question: "",
                            options: ["", "", "", ""],
                            correctIndex: 0,
                            explanation: "",
                            difficulty: "medium",
                            order: mcqs.length,
                          });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add MCQ
                      </Button>
                    </div>
                    {mcqs.length === 0 ? (
                      <EmptyState icon={HelpCircle} title="No MCQs yet" className="border-0" />
                    ) : (
                      <ul className="divide-y">
                        {mcqs.map((mcq, idx) => (
                          <li key={mcq._id} className="flex items-start gap-3 px-4 py-4">
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                                  Q{idx + 1}
                                </span>
                                <LevelBadge level={mcq.difficulty} />
                              </div>
                              <p className="break-words text-sm font-medium">
                                {mcq.question}
                              </p>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {mcq.options?.map((opt: string, oi: number) => (
                                  <div
                                    key={oi}
                                    className={cn(
                                      "flex items-start gap-2 rounded-md border px-3 py-1.5 text-xs",
                                      oi === mcq.correctIndex &&
                                        "border-success/30 bg-success/10 text-success"
                                    )}
                                  >
                                    <span className="min-w-0 flex-1 break-words">
                                      <span className="font-mono">{String.fromCharCode(65 + oi)}.</span>{" "}
                                      {opt}
                                    </span>
                                    {oi === mcq.correctIndex && (
                                      <>
                                        <Check className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                        <span className="sr-only">(correct answer)</span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex shrink-0 gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                aria-label={`Edit MCQ ${idx + 1}`}
                                title="Edit MCQ"
                                onClick={() => {
                                  setEditMode("mcq");
                                  setEditData({ ...mcq });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Delete MCQ ${idx + 1}`}
                                title="Delete MCQ"
                                onClick={() =>
                                  setDeleteConfirm(`mcq:${mcq._id}`)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </TabsContent>

                {/* Interview Questions Tab */}
                <TabsContent value="interview" className="mt-4">
                  <Card className="overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono tabular-nums text-foreground">{interviewQs.length}</span>{" "}
                        Interview Questions
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditMode("interview");
                          setEditData({
                            question: "",
                            answer: "",
                            difficulty: "medium",
                            frequency: "medium",
                            companies: [],
                          });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                    {interviewQs.length === 0 ? (
                      <EmptyState
                        icon={MessageSquare}
                        title="No interview questions yet"
                        className="border-0"
                      />
                    ) : (
                      <ul className="divide-y">
                        {interviewQs.map((iq, idx) => {
                          const isOpen = expandedTopics.has(`iq-${iq._id}`);
                          return (
                            <li key={iq._id} className="flex items-start gap-3 px-4 py-4">
                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                                    #{idx + 1}
                                  </span>
                                  <LevelBadge level={iq.difficulty} />
                                  <Badge variant="outline">{iq.frequency} freq</Badge>
                                </div>
                                <p className="break-words text-sm font-medium">
                                  {iq.question}
                                </p>
                                {iq.companies?.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {iq.companies.map((c: string) => (
                                      <span key={c} className="chip">
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  aria-expanded={isOpen}
                                  className="inline-flex items-center gap-1 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  onClick={() =>
                                    toggleExpand(`iq-${iq._id}`)
                                  }
                                >
                                  {isOpen ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                  {isOpen ? "Hide Answer" : "Show Answer"}
                                </button>
                                {isOpen && (
                                  <div className="rounded-md border bg-muted/40 px-3 py-2.5">
                                    <p className="whitespace-pre-wrap break-words text-sm">
                                      {iq.answer}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex shrink-0 gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground"
                                  aria-label={`Edit interview question ${idx + 1}`}
                                  title="Edit question"
                                  onClick={() => {
                                    setEditMode("interview");
                                    setEditData({ ...iq });
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  aria-label={`Delete interview question ${idx + 1}`}
                                  title="Delete question"
                                  onClick={() =>
                                    setDeleteConfirm(`interview:${iq._id}`)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
