import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import {
  Plus,
  Edit,
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
} from "lucide-react";

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = "topics" | "mcqs" | "interview";
type EditMode = "none" | "topic" | "subtopic" | "mcq" | "interview";

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
    next.has(id) ? next.delete(id) : next.add(id);
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
      console.error("Failed to save topic:", err);
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
      console.error("Failed to save MCQ:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveInterviewQ = async () => {
    setSaving(true);
    try {
      if (editData._id) {
        await api.updateInterviewQuestion(editData._id, editData);
      } else {
        await api.createInterviewQuestion(selectedTopic.slug, editData);
      }
      await loadTopicContent(selectedTopic.slug);
      setEditMode("none");
      setEditData(null);
    } catch (err) {
      console.error("Failed to save interview question:", err);
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
      console.error("Failed to delete:", err);
    }
    setDeleteConfirm(null);
  };

  const deleteMCQ = async (id: string) => {
    try {
      await api.deleteMCQ(id);
      await loadTopicContent(selectedTopic.slug);
    } catch (err) {
      console.error("Failed to delete MCQ:", err);
    }
    setDeleteConfirm(null);
  };

  const deleteInterviewQ = async (id: string) => {
    try {
      await api.deleteInterviewQuestion(id);
      await loadTopicContent(selectedTopic.slug);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
    setDeleteConfirm(null);
  };

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const diffBadge = (d: string) => {
    const colors: Record<string, string> = {
      easy: "bg-green-500/20 text-green-400",
      beginner: "bg-green-500/20 text-green-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      intermediate: "bg-yellow-500/20 text-yellow-400",
      hard: "bg-red-500/20 text-red-400",
      advanced: "bg-red-500/20 text-red-400",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          colors[d] || "bg-gray-500/20 text-gray-400"
        }`}
      >
        {d}
      </span>
    );
  };

  // ========== TOPIC EDIT FORM ==========
  const renderTopicForm = () => {
    if (editMode !== "topic" || !editData) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">
              {editData._id ? "Edit Topic" : "New Topic"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditMode("none");
                setEditData(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Name
                </label>
                <Input
                  value={editData.name || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  placeholder="e.g., Arrays"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Slug
                </label>
                <Input
                  value={editData.slug || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, slug: e.target.value })
                  }
                  placeholder="e.g., arrays"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Icon (emoji)
                </label>
                <Input
                  value={editData.icon || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, icon: e.target.value })
                  }
                  placeholder="📊"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Color
                </label>
                <Input
                  value={editData.color || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, color: e.target.value })
                  }
                  placeholder="blue"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Difficulty
                </label>
                <select
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={editData.difficulty || "intermediate"}
                  onChange={(e) =>
                    setEditData({ ...editData, difficulty: e.target.value })
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Estimated Hours
                </label>
                <Input
                  type="number"
                  value={editData.estimatedHours || 10}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      estimatedHours: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Order
                </label>
                <Input
                  type="number"
                  value={editData.order || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      order: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                value={editData.description || ""}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                placeholder="Topic description..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
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
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Topic"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== MCQ EDIT FORM ==========
  const renderMCQForm = () => {
    if (editMode !== "mcq" || !editData) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">
              {editData._id ? "Edit MCQ" : "New MCQ"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditMode("none");
                setEditData(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Question
              </label>
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px]"
                value={editData.question || ""}
                onChange={(e) =>
                  setEditData({ ...editData, question: e.target.value })
                }
              />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctIndex"
                  checked={editData.correctIndex === i}
                  onChange={() => setEditData({ ...editData, correctIndex: i })}
                  className="accent-primary"
                />
                <Input
                  value={editData.options?.[i] || ""}
                  onChange={(e) => {
                    const opts = [...(editData.options || ["", "", "", ""])];
                    opts[i] = e.target.value;
                    setEditData({ ...editData, options: opts });
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="flex-1"
                />
              </div>
            ))}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Explanation
              </label>
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px]"
                value={editData.explanation || ""}
                onChange={(e) =>
                  setEditData({ ...editData, explanation: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Difficulty
                </label>
                <select
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={editData.difficulty || "medium"}
                  onChange={(e) =>
                    setEditData({ ...editData, difficulty: e.target.value })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Order
                </label>
                <Input
                  type="number"
                  value={editData.order || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      order: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
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
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save MCQ"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== INTERVIEW Q EDIT FORM ==========
  const renderInterviewForm = () => {
    if (editMode !== "interview" || !editData) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">
              {editData._id ? "Edit Interview Question" : "New Interview Question"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditMode("none");
                setEditData(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Question
              </label>
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px]"
                value={editData.question || ""}
                onChange={(e) =>
                  setEditData({ ...editData, question: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Answer
              </label>
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[100px]"
                value={editData.answer || ""}
                onChange={(e) =>
                  setEditData({ ...editData, answer: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Difficulty
                </label>
                <select
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={editData.difficulty || "medium"}
                  onChange={(e) =>
                    setEditData({ ...editData, difficulty: e.target.value })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Frequency
                </label>
                <select
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={editData.frequency || "medium"}
                  onChange={(e) =>
                    setEditData({ ...editData, frequency: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Companies (comma-separated)
              </label>
              <Input
                value={(editData.companies || []).join(", ")}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    companies: e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Google, Amazon, Microsoft"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
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
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Question"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== DELETE CONFIRMATION ==========
  const renderDeleteConfirm = () => {
    if (!deleteConfirm) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h3 className="text-lg font-bold">Confirm Delete</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
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
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage topics, MCQs, and interview questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {topics.length} topics | {topics.reduce((s, t) => s + (t.mcqCount || 0), 0)} MCQs |{" "}
            {topics.reduce((s, t) => s + (t.interviewQuestionCount || 0), 0)} IQs
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Topic List */}
        <div className="col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              size="sm"
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

          <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-auto">
            {filteredTopics.map((topic) => (
              <div
                key={topic._id}
                className={`rounded-lg border transition-colors cursor-pointer ${
                  selectedTopic?._id === topic._id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent/50"
                }`}
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{topic.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{topic.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.subtopics?.length || 0} subtopics |{" "}
                        {topic.mcqCount || 0} MCQs | {topic.interviewQuestionCount || 0} IQs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {diffBadge(topic.difficulty)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditMode("topic");
                        setEditData({ ...topic });
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(`topic:${topic._id}`);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Content View */}
        <div className="col-span-8">
          {!selectedTopic ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a topic to manage its content</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Topic Header */}
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedTopic.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedTopic.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedTopic.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              <div className="flex gap-1 bg-card/50 p-1 rounded-lg border border-border">
                {([
                  { id: "topics" as Tab, label: "Subtopics", icon: BookOpen },
                  { id: "mcqs" as Tab, label: "MCQs", icon: HelpCircle },
                  {
                    id: "interview" as Tab,
                    label: "Interview Qs",
                    icon: MessageSquare,
                  },
                ] as const).map((t) => (
                  <Button
                    key={t.id}
                    variant={tab === t.id ? "default" : "ghost"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTab(t.id)}
                  >
                    <t.icon className="h-4 w-4 mr-2" />
                    {t.label}
                  </Button>
                ))}
              </div>

              {/* Subtopics Tab */}
              {tab === "topics" && (
                <div className="space-y-2">
                  {(selectedTopic.subtopics || []).map(
                    (sub: any, idx: number) => (
                      <div
                        key={sub._id || idx}
                        className="border border-border rounded-lg"
                      >
                        <button
                          className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                          onClick={() => toggleExpand(sub._id || String(idx))}
                        >
                          <div className="flex items-center gap-3">
                            {expandedTopics.has(sub._id || String(idx)) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="font-medium text-sm">
                              {idx + 1}. {sub.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {sub.timeComplexity && (
                              <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                                {sub.timeComplexity}
                              </span>
                            )}
                            <span>
                              {sub.concepts?.length || 0} concepts
                            </span>
                          </div>
                        </button>
                        {expandedTopics.has(sub._id || String(idx)) && (
                          <div className="border-t border-border p-4 space-y-3 text-sm">
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">
                                Concepts:
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                {(sub.concepts || []).map(
                                  (c: string, ci: number) => (
                                    <li key={ci}>{c}</li>
                                  )
                                )}
                              </ul>
                            </div>
                            {sub.codeExample && (
                              <div>
                                <p className="font-medium text-muted-foreground mb-1">
                                  Code: {sub.codeExample.title}
                                </p>
                                <pre className="bg-zinc-900 text-zinc-100 p-3 rounded-lg text-xs overflow-auto max-h-48">
                                  <code>{sub.codeExample.code}</code>
                                </pre>
                                {sub.codeExample.explanation && (
                                  <p className="mt-2 text-muted-foreground text-xs">
                                    {sub.codeExample.explanation}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                  {(!selectedTopic.subtopics ||
                    selectedTopic.subtopics.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                      No subtopics yet. Add subtopics when editing the topic.
                    </p>
                  )}
                </div>
              )}

              {/* MCQs Tab */}
              {tab === "mcqs" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {mcqs.length} MCQs
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
                      <Plus className="h-4 w-4 mr-2" />
                      Add MCQ
                    </Button>
                  </div>
                  {mcqs.map((mcq, idx) => (
                    <div
                      key={mcq._id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              Q{idx + 1}
                            </span>
                            {diffBadge(mcq.difficulty)}
                          </div>
                          <p className="text-sm font-medium mb-2">
                            {mcq.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {mcq.options?.map((opt: string, oi: number) => (
                              <div
                                key={oi}
                                className={`text-xs px-3 py-1.5 rounded border ${
                                  oi === mcq.correctIndex
                                    ? "border-green-500/50 bg-green-500/10 text-green-400"
                                    : "border-border"
                                }`}
                              >
                                {String.fromCharCode(65 + oi)}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setEditMode("mcq");
                              setEditData({ ...mcq });
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-400"
                            onClick={() =>
                              setDeleteConfirm(`mcq:${mcq._id}`)
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Interview Questions Tab */}
              {tab === "interview" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {interviewQs.length} Interview Questions
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
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  {interviewQs.map((iq, idx) => (
                    <div
                      key={iq._id}
                      className="border border-border rounded-lg"
                    >
                      <div className="flex items-start justify-between p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{idx + 1}
                            </span>
                            {diffBadge(iq.difficulty)}
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                iq.frequency === "high"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : iq.frequency === "medium"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {iq.frequency} freq
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            {iq.question}
                          </p>
                          {iq.companies?.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {iq.companies.map((c: string) => (
                                <span
                                  key={c}
                                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setEditMode("interview");
                              setEditData({ ...iq });
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-400"
                            onClick={() =>
                              setDeleteConfirm(`interview:${iq._id}`)
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <button
                        className="w-full border-t border-border px-4 py-2 text-left hover:bg-accent/30 transition-colors"
                        onClick={() =>
                          toggleExpand(`iq-${iq._id}`)
                        }
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {expandedTopics.has(`iq-${iq._id}`) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          {expandedTopics.has(`iq-${iq._id}`)
                            ? "Hide Answer"
                            : "Show Answer"}
                        </div>
                      </button>
                      {expandedTopics.has(`iq-${iq._id}`) && (
                        <div className="border-t border-border px-4 py-3 bg-accent/20">
                          <p className="text-sm whitespace-pre-wrap">
                            {iq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
