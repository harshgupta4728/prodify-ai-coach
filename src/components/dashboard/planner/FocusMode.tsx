import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, SkipForward, CheckCircle, X, Timer, Zap } from "lucide-react";
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
}

const loadPomodoroSettings = (): PomodoroSettings => {
  try {
    const saved = localStorage.getItem("prodify-pomodoro");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { workMin: 25, breakMin: 5, longBreakMin: 15, sessionsBeforeLong: 4 };
};

const loadSoundEnabled = (): boolean => {
  try {
    const saved = localStorage.getItem("prodify-sounds");
    if (saved) {
      const s = JSON.parse(saved);
      return s.master !== false;
    }
  } catch {}
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
    } catch {}
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

  return (
    <div className="sticky top-0 z-40 mb-4">
      <div className={cn(
        "rounded-xl p-4 shadow-lg border backdrop-blur-sm transition-colors duration-500",
        isBreak
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-primary/10 border-primary/30"
      )}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl overflow-hidden bg-black/10">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              isBreak ? "bg-emerald-500" : "bg-primary"
            )}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Left: Task info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              isBreak ? "bg-emerald-500/20" : "bg-primary/20"
            )}>
              {isBreak ? (
                <Zap className={cn("h-5 w-5", isBreak ? "text-emerald-600" : "text-primary")} />
              ) : (
                <Timer className="h-5 w-5 text-primary animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {isBreak ? "Break Time" : `Focus Session #${sessionCount}`}
              </p>
              <p className="font-semibold truncate">{task.title}</p>
            </div>
          </div>

          {/* Center: Timer */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={cn(
                "text-3xl font-mono font-bold tabular-nums",
                isBreak ? "text-emerald-600" : "text-primary",
                !isPaused && "animate-pulse"
              )}>
                {formatTime(timeLeft)}
              </p>
              <p className="text-xs text-muted-foreground">
                {elapsedMinutes > 0 ? `${elapsedMinutes} min focused` : "Just started"}
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="h-9 w-9 p-0"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>

            {isBreak && (
              <Button
                variant="outline"
                size="sm"
                onClick={skipBreak}
                className="h-9 w-9 p-0"
                title="Skip break"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Complete
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleStop}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
              title="Stop & save time"
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 text-muted-foreground"
              title="Close without saving"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Session dots */}
        <div className="flex items-center gap-1.5 mt-3 justify-center">
          {Array.from({ length: settings.current.sessionsBeforeLong }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < sessionCount
                  ? "bg-primary"
                  : "bg-muted-foreground/20"
              )}
            />
          ))}
          <Badge variant="outline" className="ml-2 text-xs">
            {sessionCount}/{settings.current.sessionsBeforeLong} until long break
          </Badge>
        </div>
      </div>
    </div>
  );
};
