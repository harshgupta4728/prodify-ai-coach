import { cn } from "@/lib/utils";

// Difficulty always uses the same three colours: easy green, medium amber, hard red.
// Topics use beginner / intermediate / advanced, which map onto the same three.
const TONE: Record<string, "success" | "warning" | "destructive"> = {
  easy: "success",
  beginner: "success",
  medium: "warning",
  intermediate: "warning",
  hard: "destructive",
  advanced: "destructive",
};

const TEXT = { success: "text-success", warning: "text-warning", destructive: "text-destructive" };
const BADGE = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const toneOf = (difficulty?: string) => TONE[(difficulty || "").toLowerCase()];

export const difficultyTextClass = (difficulty?: string) => {
  const tone = toneOf(difficulty);
  return tone ? TEXT[tone] : "text-muted-foreground";
};

export const DifficultyBadge = ({ difficulty, className }: { difficulty?: string; className?: string }) => {
  const key = (difficulty || "").toLowerCase();
  if (!key) return null;
  const tone = toneOf(key);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium capitalize leading-4",
        tone ? BADGE[tone] : "bg-muted text-muted-foreground",
        className
      )}
    >
      {key}
    </span>
  );
};
