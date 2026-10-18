import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, SkipForward, CheckCircle2, X, Timer, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusTask {
  _id: string;
  title: string;
  category: string;
  priority: string;
}

interface FocusModeProps {
  task: FocusTask;
  onStop: (elapsedMinutes: number) => void;
  onComplete: (elapsedMinutes: number) => void;
  onClose: () => void;
}

interface PomodoroSettings {
  workMin: number;
  breakMin: number;
  longBreakMin: number;
  sessionsBeforeLong: number;
  // When off, the timer waits after a break instead of starting the next work session
  autoStart: boolean;
}

// Saved by Settings > Focus Timer ("prodify-pomodoro" is the old key)
const loadPomodoroSettings = (): PomodoroSettings => {
  try {
    const saved = localStorage.getItem("prodify-pomodoro-settings") || localStorage.getItem("prodify-pomodoro");
    if (saved) return { workMin: 25, breakMin: 5, longBreakMin: 15, sessionsBeforeLong: 4, autoStart: false, ...JSON.parse(saved) };
  } catch {
    // Fall back to defaults if saved settings are unreadable
  }
  return { workMin: 25, breakMin: 5, longBreakMin: 15, sessionsBeforeLong: 4, autoStart: false };
};

// Saved by Settings > Sound ("prodify-sounds" is the old key)
const loadSoundEnabled = (): boolean => {
  try {
    const saved = localStorage.getItem("prodify-sound-settings") || localStorage.getItem("prodify-sounds");
    if (saved) {
      const s = JSON.parse(saved);
      return s.master !== false;
    }
  } catch {
    // Fall back to sound on if saved settings are unreadable
  }
  return true;
};

export const FocusMode = ({ task, onStop, onComplete, onClose }: FocusModeProps) => {
  const settings = useRef(loadPomodoroSettings());
  const soundEnabled = useRef(loadSoundEnabled());

  const [timeLeft, setTimeLeft] = useState(settings.current.workMin * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [totalElapsed, setTotalElapsed] = useState(0); // total work seconds

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playBeep = useCallback(() => {
    if (!soundEnabled.current) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio can be unavailable (autoplay rules, no audio device)
    }
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timer done
          playBeep();
          if (!isBreak) {
            // Work session ended → start break
            const isLongBreak = sessionCount % settings.current.sessionsBeforeLong === 0;
            setIsBreak(true);
            return (isLongBreak ? settings.current.longBreakMin : settings.current.breakMin) * 60;
          } else {
            // Break ended → start new work session
            setIsBreak(false);
            setSessionCount(s => s + 1);
            if (!settings.current.autoStart) setIsPaused(true);
            return settings.current.workMin * 60;
          }
        }
        return prev - 1;
      });

      // Track total work time
      if (!isBreak) {
        setTotalElapsed(prev => prev + 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isBreak, sessionCount, playBeep]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const elapsedMinutes = Math.round(totalElapsed / 60);

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onStop(elapsedMinutes);
  };

  const handleComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onComplete(elapsedMinutes);
  };

  const skipBreak = () => {
    if (isBreak) {
      setIsBreak(false);
      setSessionCount(s => s + 1);
      setTimeLeft(settings.current.workMin * 60);
    }
  };

  const progress = isBreak
    ? 1 - timeLeft / ((sessionCount % settings.current.sessionsBeforeLong === 0 ? settings.current.longBreakMin : settings.current.breakMin) * 60)
    : 1 - timeLeft / (settings.current.workMin * 60);

  // The bar only accepts 0-100
  const progressPercent = Number.isFinite(progress) ? Math.min(Math.max(progress * 100, 0), 100) : 0;

  // Stays at the top of the page while the user scrolls their task list
  return (
    <div className="sticky top-0 z-40">
      <section aria-label="Focus mode" className="overflow-hidden rounded-lg border bg-card">
        {/* Progress through the current session */}
        <Progress
          value={progressPercent}
          aria-label={isBreak ? "Break progress" : "Session progress"}
          className="h-1 rounded-none"
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
          {/* Task info */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
              {isBreak ? (
                <Coffee className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Timer className="h-4 w-4 text-primary" />
              )}
            </span>
            <div className="min-w-0">
              <p className="eyebrow truncate">
                {isBreak ? "Break Time" : `Focus Session #${sessionCount}`}
                {isPaused && " · Paused"}
              </p>
              <p className="truncate text-sm font-medium">{task.title}</p>
            </div>
          </div>

          {/* Timer */}
          <p className={cn(
            "font-mono text-3xl font-semibold leading-none tracking-tight tabular-nums sm:text-5xl",
            isPaused ? "text-muted-foreground" : "text-foreground"
          )}>
            {formatTime(timeLeft)}
          </p>

          {/* Controls */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsPaused(!isPaused)}
              className="h-9 w-9"
              title={isPaused ? "Resume" : "Pause"}
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>

            {isBreak && (
              <Button
                variant="secondary"
                size="icon"
                onClick={skipBreak}
                className="h-9 w-9"
                title="Skip break"
                aria-label="Skip break"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleComplete}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleStop}
              className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Stop & save time"
              aria-label="Stop and save time"
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              title="Close without saving"
              aria-label="Close without saving"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sessions */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: settings.current.sessionsBeforeLong }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i < sessionCount
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span>
            <span className="font-mono tabular-nums text-foreground">{sessionCount}/{settings.current.sessionsBeforeLong}</span> until long break
          </span>
          <span className="ml-auto">
            {elapsedMinutes > 0 ? (
              <><span className="font-mono tabular-nums text-foreground">{elapsedMinutes}</span> min focused</>
            ) : "Just started"}
          </span>
        </div>
      </section>
    </div>
  );
};
