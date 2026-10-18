import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  icon?: LucideIcon;
  /** Shows the number in the accent colour, for the one stat that matters most right now */
  highlight?: boolean;
  title?: string;
  className?: string;
}

// One number with a small mono label, used in the stat rows on the dashboard and planner
export const StatTile = ({ label, value, unit, hint, icon: Icon, highlight, title, className }: StatTileProps) => (
  <div className={cn("rounded-lg border bg-card p-4", className)} title={title}>
    <div className="flex items-center justify-between gap-2">
      <p className="eyebrow truncate">{label}</p>
      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </div>
    <p className="mt-2 flex items-baseline gap-1.5">
      <span className={cn("font-mono text-2xl font-semibold tabular-nums", highlight && "text-primary")}>{value}</span>
      {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
    </p>
    {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
  </div>
);
