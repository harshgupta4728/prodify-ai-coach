import React, { useState, useEffect } from "react";
import {
  Settings, Bell, Trash2, Palette, User, Database,
  AlertTriangle, RotateCcw, Volume2, VolumeX, Timer, Target,
  Shield, Download, Monitor, Code2, Type, Sparkles, Zap,
  Brain, MessageSquare, Coffee, Flame, CheckCircle, Lock,
  LogOut, ChevronRight, Moon, Sun
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { apiService } from "@/lib/api";

interface SettingsSectionProps {
  userData: {
    name: string;
    email: string;
    bio?: string;
    university?: string;
    major?: string;
    graduationYear?: string;
    location?: string;
    portfolio?: string;
    lastLogin?: string;
    createdAt?: string;
  };
  onLogout: () => void;
  onNavigateToSection?: (section: string) => void;
}

// --- Helpers ---
const ACCENT_COLORS = [
  { name: "Orange", hsl: "24 95% 53%", hex: "#f97316" },
  { name: "Blue", hsl: "221 83% 53%", hex: "#3b82f6" },
  { name: "Purple", hsl: "262 83% 58%", hex: "#8b5cf6" },
  { name: "Green", hsl: "142 71% 45%", hex: "#22c55e" },
  { name: "Rose", hsl: "347 77% 50%", hex: "#e11d48" },
  { name: "Pink", hsl: "330 81% 60%", hex: "#ec4899" },
  { name: "Teal", hsl: "172 66% 50%", hex: "#14b8a6" },
  { name: "Amber", hsl: "38 92% 50%", hex: "#f59e0b" },
];

const AI_PERSONALITIES = [
  { id: "friendly", label: "Friendly Buddy", icon: MessageSquare, desc: "Warm, encouraging, celebrates your wins", emoji: "😊" },
  { id: "strict", label: "Strict Mentor", icon: Target, desc: "No-nonsense, pushes you to do better", emoji: "🎯" },
  { id: "motivational", label: "Hype Coach", icon: Flame, desc: "Super energetic, keeps you pumped up", emoji: "🔥" },
  { id: "chill", label: "Chill Sensei", icon: Coffee, desc: "Relaxed, zen-like, wisdom with calm vibes", emoji: "🧘" },
];

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "typescript", label: "TypeScript" },
];

function loadSetting<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`prodify-${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function saveSetting(key: string, value: any) {
  localStorage.setItem(`prodify-${key}`, JSON.stringify(value));
}

// Apply accent color to ALL related CSS variables
function applyAccentColor(hsl: string) {
  const root = document.documentElement;
  // Parse "H S% L%" format
  const parts = hsl.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!parts) return;
  const h = parts[1], s = parts[2], l = parts[3];

  // Light mode variables
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--ring", hsl);
  root.style.setProperty("--secondary", `${h} 100% 97%`);
  root.style.setProperty("--secondary-foreground", hsl);
  root.style.setProperty("--accent", `${h} 100% 95%`);
  root.style.setProperty("--accent-foreground", hsl);

  // Gradients & shadows
  root.style.setProperty("--gradient-primary", `linear-gradient(135deg, hsl(${hsl}), hsl(${h} ${s}% 63%))`);
  root.style.setProperty("--gradient-secondary", `linear-gradient(135deg, hsl(${h} 100% 97%), hsl(20 14% 96%))`);
  root.style.setProperty("--gradient-accent", `linear-gradient(135deg, hsl(${hsl}), hsl(45 93% 47%))`);
  root.style.setProperty("--shadow-soft", `0 4px 20px hsl(${hsl} / 0.1)`);
  root.style.setProperty("--shadow-medium", `0 8px 30px hsl(${hsl} / 0.15)`);
  root.style.setProperty("--shadow-strong", `0 12px 40px hsl(${hsl} / 0.2)`);
}

export const SettingsSection = ({ userData, onLogout, onNavigateToSection }: SettingsSectionProps) => {
  // --- State ---
  const [notifications, setNotifications] = useState(() => loadSetting("notification-settings", { email: true, browserNotifications: true }));
  const [accentColor, setAccentColor] = useState(() => loadSetting("accent-color", "24 95% 53%"));
  const [aiPersonality, setAiPersonality] = useState(() => loadSetting("ai-personality", "friendly"));
  const [pomodoro, setPomodoro] = useState(() => loadSetting("pomodoro-settings", { workMin: 25, breakMin: 5, autoStart: false, longBreakMin: 15, sessionsBeforeLong: 4 }));
  const [sounds, setSounds] = useState(() => loadSetting("sound-settings", { master: true, achievements: true, streak: true, notifications: true, keypress: false }));
  const [preferredLang, setPreferredLang] = useState(() => loadSetting("preferred-language", "python"));
  const [dailyGoal, setDailyGoal] = useState(() => loadSetting("daily-goal", { daily: 3, weekly: 15 }));
  const [streakShield, setStreakShield] = useState(() => loadSetting("streak-shield", { enabled: true, shieldsRemaining: 2, maxShields: 3 }));
  const [editorPrefs, setEditorPrefs] = useState(() => loadSetting("editor-prefs", { fontSize: 14, tabSize: 2, lineNumbers: true, wordWrap: true, minimap: false }));

  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Apply accent color to all CSS variables
  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  // --- Handlers ---
  const handleAccentChange = (hsl: string) => {
    setAccentColor(hsl);
    saveSetting("accent-color", hsl);
    toast({ title: "Theme Updated", description: "Your accent color has been changed." });
  };

  const handleAiPersonality = (id: string) => {
    setAiPersonality(id);
    saveSetting("ai-personality", id);
    const p = AI_PERSONALITIES.find(p => p.id === id);
    toast({ title: `AI Coach: ${p?.label}`, description: p?.desc });
  };

  const handlePomodoroChange = (key: string, value: any) => {
    const next = { ...pomodoro, [key]: value };
    setPomodoro(next);
    saveSetting("pomodoro-settings", next);
  };

  const handleSoundChange = (key: string) => {
    const next = { ...sounds, [key]: !sounds[key as keyof typeof sounds] };
    if (key === "master" && !sounds.master) {
      // turning master on
    } else if (key === "master" && sounds.master) {
      // turning master off — mute all
    }
    setSounds(next);
    saveSetting("sound-settings", next);
  };

  const handleLanguageChange = (lang: string) => {
    setPreferredLang(lang);
    saveSetting("preferred-language", lang);
    toast({ title: "Language Updated", description: `Default language set to ${LANGUAGES.find(l => l.value === lang)?.label}` });
  };

  const handleDailyGoalChange = (key: "daily" | "weekly", value: number) => {
    const next = { ...dailyGoal, [key]: value };
    setDailyGoal(next);
    saveSetting("daily-goal", next);
  };

  const handleSaveDailyGoal = async () => {
    try {
      await apiService.updateGoals({ dailyGoal: dailyGoal.daily, weeklyGoal: dailyGoal.weekly });
      toast({ title: "Goals Saved", description: `Daily: ${dailyGoal.daily} problems, Weekly: ${dailyGoal.weekly} problems` });
    } catch {
      toast({ title: "Saved Locally", description: "Goals saved. Will sync when connected." });
    }
  };

  const handleStreakShieldToggle = () => {
    const next = { ...streakShield, enabled: !streakShield.enabled };
    setStreakShield(next);
    saveSetting("streak-shield", next);
    toast({ title: streakShield.enabled ? "Streak Shield Disabled" : "Streak Shield Enabled", description: streakShield.enabled ? "Your streak won't be protected on off days." : `You have ${streakShield.shieldsRemaining} shield(s) remaining.` });
  };

  const handleEditorPrefChange = (key: string, value: any) => {
    const next = { ...editorPrefs, [key]: value };
    setEditorPrefs(next);
    saveSetting("editor-prefs", next);
  };

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    if (key === "browserNotifications" && !notifications.browserNotifications) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({ title: "Permission Denied", description: "Enable browser notifications in your browser settings.", variant: "destructive" });
        return;
      }
    }
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    saveSetting("notification-settings", next);
    toast({ title: "Notifications Updated" });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      let progressData = null;
      let tasksData = null;
      try { progressData = await apiService.getProgress(); } catch {}
      try { tasksData = await apiService.getTasks(); } catch {}

      const exportObj = {
        exportDate: new Date().toISOString(),
        platform: "Prodify AI Coach",
        user: { name: userData.name, email: userData.email, university: userData.university, major: userData.major, graduationYear: userData.graduationYear, location: userData.location, portfolio: userData.portfolio },
        progress: progressData,
        tasks: tasksData,
        settings: { accentColor, aiPersonality, pomodoro, sounds, preferredLang, dailyGoal, streakShield, editorPrefs, notifications },
      };

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prodify-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Data Exported", description: "Your data has been downloaded as JSON." });
    } catch (err: any) {
      toast({ title: "Export Failed", description: err.message || "Could not export data.", variant: "destructive" });
    } finally { setIsExporting(false); }
  };

  const handleResetProgress = async () => {
    setIsResetting(true);
    try {
      await apiService.resetProgress();
      toast({ title: "Progress Reset", description: "All solved problems and stats have been cleared." });
    } catch (error: any) {
      toast({ title: "Reset Failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally { setIsResetting(false); }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiService.deleteAccount();
      toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
      onLogout();
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally { setIsDeleting(false); }
  };

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Personalize your Prodify experience</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">

        {/* ═══════════════ 1. ACCOUNT INFO ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Account Information</CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                <p className="text-sm font-medium">{userData.name}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                <p className="text-sm font-medium">{userData.email}</p>
              </div>
              {userData.university && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">University</label>
                  <p className="text-sm font-medium">{userData.university}</p>
                </div>
              )}
              {userData.major && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Major</label>
                  <p className="text-sm font-medium">{userData.major}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 2. APPEARANCE + ACCENT COLOR ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
            <CardDescription>Customize how the app looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Theme Mode</Label>
              <ThemeToggle />
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium mb-1 block">Accent Color</Label>
              <p className="text-xs text-muted-foreground mb-3">Choose your vibe — this color will be used across the entire app</p>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((c) => (
                  <button key={c.hsl} onClick={() => handleAccentChange(c.hsl)}
                    className="group relative flex flex-col items-center gap-1.5 transition-all"
                    title={c.name}>
                    <div className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${accentColor === c.hsl ? "scale-110 border-foreground shadow-lg" : "border-transparent hover:scale-105"}`}
                      style={{ backgroundColor: c.hex }}>
                      {accentColor === c.hsl && (
                        <CheckCircle className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <span className={`text-[10px] font-medium ${accentColor === c.hsl ? "text-foreground" : "text-muted-foreground"}`}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 3. AI COACH PERSONALITY ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> AI Coach Personality</CardTitle>
            <CardDescription>Choose how your AI coach talks to you — no other platform has this!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AI_PERSONALITIES.map((p) => {
                const Icon = p.icon;
                const selected = aiPersonality === p.id;
                return (
                  <button key={p.id} onClick={() => handleAiPersonality(p.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <p className="font-semibold text-sm">{p.label}</p>
                        {selected && <Badge variant="default" className="text-[10px] px-1.5 py-0 mt-0.5">Active</Badge>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 4. FOCUS / POMODORO ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5" /> Focus Timer (Pomodoro)</CardTitle>
            <CardDescription>Configure your study session intervals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Work Duration</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" min={10} max={90} value={pomodoro.workMin}
                    onChange={(e) => handlePomodoroChange("workMin", Math.max(10, Math.min(90, parseInt(e.target.value) || 25)))}
                    className="w-20 text-center" />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Short Break</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" min={1} max={30} value={pomodoro.breakMin}
                    onChange={(e) => handlePomodoroChange("breakMin", Math.max(1, Math.min(30, parseInt(e.target.value) || 5)))}
                    className="w-20 text-center" />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Long Break</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" min={5} max={60} value={pomodoro.longBreakMin}
                    onChange={(e) => handlePomodoroChange("longBreakMin", Math.max(5, Math.min(60, parseInt(e.target.value) || 15)))}
                    className="w-20 text-center" />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Sessions Before Long Break</p>
                <p className="text-xs text-muted-foreground">Number of work sessions before a long break</p>
              </div>
              <Input type="number" min={2} max={8} value={pomodoro.sessionsBeforeLong}
                onChange={(e) => handlePomodoroChange("sessionsBeforeLong", Math.max(2, Math.min(8, parseInt(e.target.value) || 4)))}
                className="w-16 text-center" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Auto-start Next Session</p>
                <p className="text-xs text-muted-foreground">Automatically begin work after break ends</p>
              </div>
              <Switch checked={pomodoro.autoStart} onCheckedChange={(v) => handlePomodoroChange("autoStart", v)} />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
              <Timer className="h-5 w-5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Your cycle:</strong> {pomodoro.workMin}min work → {pomodoro.breakMin}min break → repeat {pomodoro.sessionsBeforeLong}x → {pomodoro.longBreakMin}min long break
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 5. SOUND & HAPTICS ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {sounds.master ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              Sound & Effects
            </CardTitle>
            <CardDescription>Control audio feedback for gamification events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {sounds.master ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-semibold">Master Sound</p>
                  <p className="text-xs text-muted-foreground">Toggle all sounds on/off</p>
                </div>
              </div>
              <Switch checked={sounds.master} onCheckedChange={() => handleSoundChange("master")} />
            </div>
            <div className={`space-y-3 transition-opacity ${!sounds.master ? "opacity-40 pointer-events-none" : ""}`}>
              {[
                { key: "achievements", label: "Achievement Unlocked", desc: "Sound when you earn a badge or complete a milestone" },
                { key: "streak", label: "Streak Celebrations", desc: "Sound for maintaining or hitting streak goals" },
                { key: "notifications", label: "Notification Sound", desc: "Sound for task reminders and alerts" },
                { key: "keypress", label: "Typing Feedback", desc: "Subtle click sound while coding (experimental)" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={sounds[key as keyof typeof sounds] as boolean} onCheckedChange={() => handleSoundChange(key)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 6. PREFERRED LANGUAGE ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5" /> Preferred Language</CardTitle>
            <CardDescription>Default coding language across all problems & editors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={preferredLang} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">This will be pre-selected when you open any problem editor</p>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 7. DAILY GOALS ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Daily & Weekly Goals</CardTitle>
            <CardDescription>Set your problem-solving targets to stay on track</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Daily Goal</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button className="px-3 py-2 hover:bg-muted transition-colors text-lg font-bold"
                      onClick={() => handleDailyGoalChange("daily", Math.max(1, dailyGoal.daily - 1))}>−</button>
                    <span className="px-4 py-2 text-lg font-bold min-w-[48px] text-center border-x">{dailyGoal.daily}</span>
                    <button className="px-3 py-2 hover:bg-muted transition-colors text-lg font-bold"
                      onClick={() => handleDailyGoalChange("daily", Math.min(20, dailyGoal.daily + 1))}>+</button>
                  </div>
                  <span className="text-sm text-muted-foreground">problems/day</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Weekly Goal</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button className="px-3 py-2 hover:bg-muted transition-colors text-lg font-bold"
                      onClick={() => handleDailyGoalChange("weekly", Math.max(1, dailyGoal.weekly - 1))}>−</button>
                    <span className="px-4 py-2 text-lg font-bold min-w-[48px] text-center border-x">{dailyGoal.weekly}</span>
                    <button className="px-3 py-2 hover:bg-muted transition-colors text-lg font-bold"
                      onClick={() => handleDailyGoalChange("weekly", Math.min(100, dailyGoal.weekly + 1))}>+</button>
                  </div>
                  <span className="text-sm text-muted-foreground">problems/week</span>
                </div>
              </div>
            </div>
            <Button onClick={handleSaveDailyGoal} variant="outline" size="sm" className="gap-2">
              <CheckCircle className="h-4 w-4" /> Save Goals
            </Button>
          </CardContent>
        </Card>

        {/* ═══════════════ 8. STREAK SHIELD ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Streak Shield</CardTitle>
            <CardDescription>Protect your streak on days you can't practice — like Duolingo freeze!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${streakShield.enabled ? "bg-primary/10" : "bg-muted"}`}>
                  <Shield className={`h-6 w-6 ${streakShield.enabled ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Streak Protection</p>
                  <p className="text-xs text-muted-foreground">Auto-use a shield when you miss a day</p>
                </div>
              </div>
              <Switch checked={streakShield.enabled} onCheckedChange={handleStreakShieldToggle} />
            </div>
            <div className="p-4 border rounded-xl bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Shields Available</span>
                <span className="text-sm font-bold">{streakShield.shieldsRemaining} / {streakShield.maxShields}</span>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: streakShield.maxShields }).map((_, i) => (
                  <div key={i} className={`h-3 flex-1 rounded-full transition-colors ${i < streakShield.shieldsRemaining ? "bg-primary" : "bg-muted-foreground/20"}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Shields recharge weekly. Complete 7 consecutive days to earn a bonus shield!</p>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 9. FONT & EDITOR PREFS ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5" /> Code Editor Preferences</CardTitle>
            <CardDescription>Customize the look of your coding editor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Font Size</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" min={10} max={24} value={editorPrefs.fontSize}
                    onChange={(e) => handleEditorPrefChange("fontSize", Math.max(10, Math.min(24, parseInt(e.target.value) || 14)))}
                    className="w-20 text-center" />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Tab Size</Label>
                <Select value={String(editorPrefs.tabSize)} onValueChange={(v) => handleEditorPrefChange("tabSize", parseInt(v))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="8">8 spaces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            {[
              { key: "lineNumbers", label: "Line Numbers", desc: "Show line numbers in the editor" },
              { key: "wordWrap", label: "Word Wrap", desc: "Wrap long lines to fit the editor width" },
              { key: "minimap", label: "Minimap", desc: "Show a minimap overview on the right side" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch checked={editorPrefs[key as keyof typeof editorPrefs] as boolean}
                  onCheckedChange={(v) => handleEditorPrefChange(key, v)} />
              </div>
            ))}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-mono text-muted-foreground" style={{ fontSize: `${Math.min(editorPrefs.fontSize, 16)}px` }}>
                {`// Preview: ${editorPrefs.fontSize}px font`}<br />
                {`function solve(arr) {`}<br />
                {`${" ".repeat(editorPrefs.tabSize)}return arr.sort((a, b) => a - b);`}<br />
                {`}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 10. NOTIFICATIONS ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive task reminders and updates via email</p>
              </div>
              <Switch checked={notifications.email} onCheckedChange={() => handleNotificationChange("email")} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Browser Notifications</p>
                <p className="text-xs text-muted-foreground">Receive push notifications in your browser</p>
              </div>
              <Switch checked={notifications.browserNotifications} onCheckedChange={() => handleNotificationChange("browserNotifications")} />
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 11. EXPORT DATA ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Export Your Data</CardTitle>
            <CardDescription>Download all your data — progress, tasks, settings, everything</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button onClick={handleExportData} disabled={isExporting} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Download as JSON"}
              </Button>
              <p className="text-xs text-muted-foreground">Your data, your ownership. Export anytime for portfolio or backup.</p>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ ADMIN PANEL ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Content Management</CardTitle>
            <CardDescription>Manage topics, MCQs, and interview questions for the learning platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button onClick={() => onNavigateToSection?.("admin")} variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Open Admin Panel
              </Button>
              <p className="text-xs text-muted-foreground">Add, edit, or remove learning content from the Topic Progress section</p>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ 13. SESSION SECURITY ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Session & Security</CardTitle>
            <CardDescription>View your active session and security info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-xl bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Session</p>
                    <p className="text-xs text-muted-foreground">This browser · Active now</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
              </div>
              {userData.lastLogin && (
                <div className="text-xs text-muted-foreground pl-[52px]">
                  Last login: {new Date(userData.lastLogin).toLocaleString()}
                </div>
              )}
              {userData.createdAt && (
                <div className="text-xs text-muted-foreground pl-[52px]">
                  Account created: {new Date(userData.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={onLogout}>
              <LogOut className="h-4 w-4" /> Sign Out of All Devices
            </Button>
          </CardContent>
        </Card>

        {/* ═══════════════ 14. DATA MANAGEMENT ═══════════════ */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><Database className="h-5 w-5" /> Danger Zone</CardTitle>
            <CardDescription>Irreversible actions — proceed with caution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">Reset Progress</p>
                <p className="text-xs text-muted-foreground">Clear all solved problems, streaks, and stats</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isResetting} className="border-destructive/40 text-destructive hover:bg-destructive/10">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isResetting ? "Resetting..." : "Reset"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" /> Reset Progress
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your solved problems, reset your streak, clear topic progress, and remove all achievements.
                      <br /><strong className="text-destructive">This cannot be undone!</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetProgress} disabled={isResetting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {isResetting ? "Resetting..." : "Reset Progress"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" /> Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
