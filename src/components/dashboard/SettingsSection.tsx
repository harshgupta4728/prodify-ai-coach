import { useState, useEffect, type ReactNode } from "react";
import {
  AlertTriangle, ArrowRight, Bell, Brain, Check, Code2, Coffee, Database,
  Download, GraduationCap, Lock, LogOut, MessageSquare, Minus, Monitor,
  Palette, Plus, RotateCcw, Shield, Target, Timer, Trash2, User, Zap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { apiService } from "@/lib/api";
import { ACCENT_COLORS, applyAccentColor, loadAccentColor, saveAccentColor } from "@/lib/theme";
import { SUPPORTED_LANGUAGES } from "@/lib/starterCode";
import { cn } from "@/lib/utils";

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
    isAdmin?: boolean;
  };
  onLogout: () => void;
  onNavigateToSection?: (section: string) => void;
}

// --- Helpers ---
const AI_PERSONALITIES = [
  { id: "friendly", label: "Friendly Buddy", icon: MessageSquare, desc: "Warm, encouraging, celebrates your wins" },
  { id: "strict", label: "Strict Mentor", icon: GraduationCap, desc: "No-nonsense, pushes you to do better" },
  { id: "motivational", label: "Hype Coach", icon: Zap, desc: "Super energetic, keeps you pumped up" },
  { id: "chill", label: "Chill Sensei", icon: Coffee, desc: "Relaxed, zen-like, wisdom with calm vibes" },
];

// Same languages the code runner supports
const LANGUAGES = SUPPORTED_LANGUAGES;

function loadSetting<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`prodify-${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function saveSetting(key: string, value: any) {
  localStorage.setItem(`prodify-${key}`, JSON.stringify(value));
}

// --- Layout pieces ---

// One group of settings: neutral icon, title and one line of context, with an optional
// action on the right (below the title on phones)
const SettingsCard = ({
  icon: Icon, title, description, badge, action, danger, className, children,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  danger?: boolean;
  className?: string;
  children?: ReactNode;
}) => (
  <Card className={cn(danger && "border-destructive/30", className)}>
    <CardHeader className="flex-row flex-wrap items-center justify-between gap-x-6 gap-y-3 space-y-0 p-5">
      <div className="min-w-0 grow basis-60 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className={cn("flex items-center gap-2 text-base font-semibold", danger && "text-destructive")}>
            <Icon className={cn("h-4 w-4 shrink-0", danger ? "text-destructive" : "text-muted-foreground")} />
            {title}
          </CardTitle>
          {badge}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </CardHeader>
    {children && <CardContent className="px-5 pb-5 pt-0">{children}</CardContent>}
  </Card>
);

// One setting inside a `divide-y` list: what it does on the left, its control on the right.
// Wide controls drop below the label on narrow screens.
const SettingRow = ({
  label, description, htmlFor, children,
}: {
  label: string;
  description?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 first:pt-0 last:pb-0">
    <div className="min-w-0 grow basis-40 space-y-0.5">
      {htmlFor ? (
        <Label htmlFor={htmlFor} className="block leading-5">{label}</Label>
      ) : (
        <p className="text-sm font-medium leading-5">{label}</p>
      )}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">{children}</div>
  </div>
);

// "- 3 +" number control used for the goals
const Stepper = ({
  value, label, onDecrement, onIncrement,
}: {
  value: number;
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) => {
  const buttonClass =
    "flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";
  return (
    <div className="inline-flex h-9 items-center overflow-hidden rounded-md border border-input">
      <button type="button" className={buttonClass} onClick={onDecrement} aria-label={`Decrease ${label}`}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="flex h-full min-w-[3rem] items-center justify-center border-x border-input px-2 font-mono text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={buttonClass} onClick={onIncrement} aria-label={`Increase ${label}`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

// A read-only account detail: small mono label above the value
const AccountField = ({ label, mono, children }: { label: string; mono?: boolean; children: ReactNode }) => (
  <div className="min-w-0 space-y-1">
    <dt className="eyebrow">{label}</dt>
    <dd className={cn("break-words text-sm", mono && "break-all font-mono tabular-nums")}>{children}</dd>
  </div>
);

const dangerOutline = "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive";

export const SettingsSection = ({ userData, onLogout, onNavigateToSection }: SettingsSectionProps) => {
  // --- State ---
  const [notifications, setNotifications] = useState(() => loadSetting("notification-settings", { email: true, browserNotifications: true }));
  const [accentColor, setAccentColor] = useState(loadAccentColor);
  const [aiPersonality, setAiPersonality] = useState(() => loadSetting("ai-personality", "friendly"));
  const [pomodoro, setPomodoro] = useState(() => loadSetting("pomodoro-settings", { workMin: 25, breakMin: 5, autoStart: false, longBreakMin: 15, sessionsBeforeLong: 4 }));
  const [sounds, setSounds] = useState(() => loadSetting("sound-settings", { master: true, achievements: true, streak: true, notifications: true, keypress: false }));
  const [preferredLang, setPreferredLang] = useState(() => loadSetting("preferred-language", "python"));
  const [dailyGoal, setDailyGoal] = useState(() => loadSetting("daily-goal", { daily: 3, weekly: 15 }));
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
    saveAccentColor(hsl);
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
      // Export whatever loads; a failed section is left out
      try { progressData = await apiService.getProgress(); } catch { /* skip */ }
      try { tasksData = await apiService.getTasks(); } catch { /* skip */ }

      const exportObj = {
        exportDate: new Date().toISOString(),
        platform: "Prodify AI Coach",
        user: { name: userData.name, email: userData.email, university: userData.university, major: userData.major, graduationYear: userData.graduationYear, location: userData.location, portfolio: userData.portfolio },
        progress: progressData,
        tasks: tasksData,
        settings: { accentColor, aiPersonality, pomodoro, sounds, preferredLang, dailyGoal, editorPrefs, notifications },
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

  // Revokes every login token for this account (other devices are signed out on their next request)
  const handleLogoutAllDevices = async () => {
    try {
      await apiService.logoutAllDevices();
      onLogout();
      toast({ title: "Signed out everywhere", description: "Every device, including this one, now needs to log in again." });
    } catch (error: any) {
      toast({ title: "Couldn't sign out other devices", description: error.message || "Please try again.", variant: "destructive" });
    }
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
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Personalize your Prodify experience" />

      {/* Account */}
      <SettingsCard icon={User} title="Account Information" description="Your basic account details">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <AccountField label="Name">{userData.name}</AccountField>
          <AccountField label="Email" mono>{userData.email}</AccountField>
          {userData.university && <AccountField label="University">{userData.university}</AccountField>}
          {userData.major && <AccountField label="Major">{userData.major}</AccountField>}
          {userData.createdAt && (
            <AccountField label="Account created" mono>{new Date(userData.createdAt).toLocaleDateString()}</AccountField>
          )}
        </dl>
      </SettingsCard>

      {/* Appearance: the app is dark-only, so the accent is the one thing to pick */}
      <SettingsCard icon={Palette} title="Appearance" description="Customize how the app looks and feels">
        <div className="divide-y">
          <SettingRow label="Accent Color" description="This color will be used across the entire app">
            <div role="group" aria-label="Accent color" className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((c) => {
                const selected = accentColor === c.hsl;
                return (
                  <button
                    key={c.hsl}
                    type="button"
                    onClick={() => handleAccentChange(c.hsl)}
                    title={c.name}
                    aria-pressed={selected}
                    className="group flex w-11 flex-col items-center gap-1.5 rounded-md py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md border",
                        selected && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      )}
                      style={{ backgroundColor: c.hex }}
                    >
                      {selected && <Check className="h-4 w-4 text-background" />}
                    </span>
                    <span className={cn("text-xs", selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingRow>
        </div>
      </SettingsCard>

      {/* AI coach personality */}
      <SettingsCard icon={Brain} title="AI Coach Personality" description="Choose how your AI coach talks to you">
        <div role="group" aria-label="AI coach personality" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {AI_PERSONALITIES.map((p) => {
            const Icon = p.icon;
            const selected = aiPersonality === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAiPersonality(p.id)}
                aria-pressed={selected}
                className={cn(
                  "flex items-start gap-3 rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  selected ? "border-primary bg-primary/10" : "hover:bg-accent/50"
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                  <Icon className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{p.label}</span>
                  <span className="block text-sm text-muted-foreground">{p.desc}</span>
                </span>
                {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      {/* Focus timer and its sound */}
      <SettingsCard icon={Timer} title="Focus Timer (Pomodoro)" description="Configure your study session intervals">
        <div className="space-y-4">
          <div className="divide-y">
            <SettingRow label="Work Duration" htmlFor="settings-work-min">
              <Input id="settings-work-min" type="number" min={10} max={90} value={pomodoro.workMin}
                onChange={(e) => handlePomodoroChange("workMin", Math.max(10, Math.min(90, parseInt(e.target.value) || 25)))}
                className="w-20 text-center font-mono tabular-nums" />
              <span className="text-sm text-muted-foreground">min</span>
            </SettingRow>
            <SettingRow label="Short Break" htmlFor="settings-break-min">
              <Input id="settings-break-min" type="number" min={1} max={30} value={pomodoro.breakMin}
                onChange={(e) => handlePomodoroChange("breakMin", Math.max(1, Math.min(30, parseInt(e.target.value) || 5)))}
                className="w-20 text-center font-mono tabular-nums" />
              <span className="text-sm text-muted-foreground">min</span>
            </SettingRow>
            <SettingRow label="Long Break" htmlFor="settings-long-break-min">
              <Input id="settings-long-break-min" type="number" min={5} max={60} value={pomodoro.longBreakMin}
                onChange={(e) => handlePomodoroChange("longBreakMin", Math.max(5, Math.min(60, parseInt(e.target.value) || 15)))}
                className="w-20 text-center font-mono tabular-nums" />
              <span className="text-sm text-muted-foreground">min</span>
            </SettingRow>
            <SettingRow label="Sessions Before Long Break" description="Number of work sessions before a long break" htmlFor="settings-sessions">
              <Input id="settings-sessions" type="number" min={2} max={8} value={pomodoro.sessionsBeforeLong}
                onChange={(e) => handlePomodoroChange("sessionsBeforeLong", Math.max(2, Math.min(8, parseInt(e.target.value) || 4)))}
                className="w-20 text-center font-mono tabular-nums" />
            </SettingRow>
            <SettingRow label="Auto-start Next Session" description="Automatically begin work after break ends" htmlFor="settings-auto-start">
              <Switch id="settings-auto-start" checked={pomodoro.autoStart} onCheckedChange={(v) => handlePomodoroChange("autoStart", v)} />
            </SettingRow>
            <SettingRow label="Focus Timer Sounds" description="Play a chime when a focus session or break ends" htmlFor="settings-timer-sounds">
              <Switch id="settings-timer-sounds" checked={sounds.master} onCheckedChange={() => handleSoundChange("master")} />
            </SettingRow>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
            <Timer className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">Your cycle:</strong>{" "}
              <span className="font-mono">
                {pomodoro.workMin}min work → {pomodoro.breakMin}min break → repeat {pomodoro.sessionsBeforeLong}x → {pomodoro.longBreakMin}min long break
              </span>
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Daily and weekly goals */}
      <SettingsCard icon={Target} title="Daily & Weekly Goals" description="Set your problem-solving targets to stay on track">
        <div className="divide-y">
          <SettingRow label="Daily Goal" description="Problems per day">
            <Stepper
              label="daily goal"
              value={dailyGoal.daily}
              onDecrement={() => handleDailyGoalChange("daily", Math.max(1, dailyGoal.daily - 1))}
              onIncrement={() => handleDailyGoalChange("daily", Math.min(20, dailyGoal.daily + 1))}
            />
          </SettingRow>
          <SettingRow label="Weekly Goal" description="Problems per week">
            <Stepper
              label="weekly goal"
              value={dailyGoal.weekly}
              onDecrement={() => handleDailyGoalChange("weekly", Math.max(1, dailyGoal.weekly - 1))}
              onIncrement={() => handleDailyGoalChange("weekly", Math.min(100, dailyGoal.weekly + 1))}
            />
          </SettingRow>
        </div>
        <div className="mt-4 flex justify-end border-t pt-4">
          <Button onClick={handleSaveDailyGoal} variant="outline" size="sm">
            <Check className="h-4 w-4" /> Save Goals
          </Button>
        </div>
      </SettingsCard>

      {/* Streak shield (not built yet) */}
      <SettingsCard
        icon={Shield}
        title="Streak Shield"
        badge={<Badge variant="secondary">Coming soon</Badge>}
        description="Protect your streak on days you can't practice, like a Duolingo streak freeze."
        className="border-dashed"
      >
        <p className="text-sm text-muted-foreground">
          Not available yet. For now, your streak stays alive until a whole day passes without a solved problem.
        </p>
      </SettingsCard>

      {/* Code editor, including the default language */}
      <SettingsCard icon={Code2} title="Code Editor Preferences" description="Customize the look of your coding editor">
        <div className="space-y-4">
          <div className="divide-y">
            <SettingRow label="Preferred Language" description="This will be pre-selected when you open any problem editor" htmlFor="settings-language">
              <Select value={preferredLang} onValueChange={handleLanguageChange}>
                <SelectTrigger id="settings-language" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Font Size" htmlFor="settings-font-size">
              <Input id="settings-font-size" type="number" min={10} max={24} value={editorPrefs.fontSize}
                onChange={(e) => handleEditorPrefChange("fontSize", Math.max(10, Math.min(24, parseInt(e.target.value) || 14)))}
                className="w-20 text-center font-mono tabular-nums" />
              <span className="text-sm text-muted-foreground">px</span>
            </SettingRow>
            <SettingRow label="Tab Size" htmlFor="settings-tab-size">
              <Select value={String(editorPrefs.tabSize)} onValueChange={(v) => handleEditorPrefChange("tabSize", parseInt(v))}>
                <SelectTrigger id="settings-tab-size" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="8">8 spaces</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            {[
              { key: "lineNumbers", label: "Line Numbers", desc: "Show line numbers in the editor" },
              { key: "wordWrap", label: "Word Wrap", desc: "Wrap long lines to fit the editor width" },
              { key: "minimap", label: "Minimap", desc: "Show a minimap overview on the right side" },
            ].map(({ key, label, desc }) => (
              <SettingRow key={key} label={label} description={desc} htmlFor={`settings-${key}`}>
                <Switch id={`settings-${key}`} checked={editorPrefs[key as keyof typeof editorPrefs] as boolean}
                  onCheckedChange={(v) => handleEditorPrefChange(key, v)} />
              </SettingRow>
            ))}
          </div>
          <pre
            className="overflow-x-auto rounded-md border bg-muted/40 p-4 font-mono leading-relaxed"
            style={{ fontSize: `${Math.min(editorPrefs.fontSize, 16)}px` }}
          >
            <span className="text-muted-foreground">{`// Preview: ${editorPrefs.fontSize}px font`}</span><br />
            {`function solve(arr) {`}<br />
            {`${" ".repeat(editorPrefs.tabSize)}return arr.sort((a, b) => a - b);`}<br />
            {`}`}
          </pre>
        </div>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard icon={Bell} title="Notifications" description="Choose what notifications you want to receive">
        <div className="divide-y">
          <SettingRow label="Email Notifications" description="Receive task reminders and updates via email" htmlFor="settings-notify-email">
            <Switch id="settings-notify-email" checked={notifications.email} onCheckedChange={() => handleNotificationChange("email")} />
          </SettingRow>
          <SettingRow label="Browser Notifications" description="Receive push notifications in your browser" htmlFor="settings-notify-browser">
            <Switch id="settings-notify-browser" checked={notifications.browserNotifications} onCheckedChange={() => handleNotificationChange("browserNotifications")} />
          </SettingRow>
        </div>
      </SettingsCard>

      {/* Export */}
      <SettingsCard
        icon={Download}
        title="Export Your Data"
        description="Download all your data (progress, tasks and settings) as one JSON file, for a backup or your portfolio."
        action={
          <Button onClick={handleExportData} disabled={isExporting} variant="outline" size="sm">
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Download as JSON"}
          </Button>
        }
      />

      {/* Admin panel (accounts in the server's ADMIN_EMAILS only) */}
      {userData.isAdmin && (
        <SettingsCard
          icon={Database}
          title="Content Management"
          description="Add, edit, or remove the topics, MCQs, and interview questions shown on the Topics page."
          action={
            <Button onClick={() => onNavigateToSection?.("admin")} variant="outline" size="sm">
              Open Admin Panel
              <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
      )}

      {/* Session and sign-out */}
      <SettingsCard icon={Lock} title="Session & Security" description="View your active session and security info">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">Current Session</p>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">This browser · Active now</p>
            {userData.lastLogin && (
              <p className="mt-1 text-xs text-muted-foreground">
                Last login: <span className="font-mono tabular-nums">{new Date(userData.lastLogin).toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogoutAllDevices}
            title="Use this if you logged in on a shared or lost device">
            <LogOut className="h-4 w-4" /> Sign out of all devices
          </Button>
        </div>
      </SettingsCard>

      {/* Danger zone */}
      <SettingsCard icon={AlertTriangle} title="Danger Zone" description="Irreversible actions — proceed with caution" danger>
        <div className="divide-y">
          <SettingRow label="Reset Progress" description="Clear all solved problems, streaks, and stats">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isResetting} className={dangerOutline}>
                  <RotateCcw className="h-4 w-4" />
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
                    <br /><strong className="font-medium text-destructive">This cannot be undone.</strong>
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
          </SettingRow>
          <SettingRow label="Delete Account" description="Permanently delete your account and all data">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className={dangerOutline}>
                  <Trash2 className="h-4 w-4" /> Delete
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
          </SettingRow>
        </div>
      </SettingsCard>
    </div>
  );
};
