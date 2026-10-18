import { cn } from "@/lib/utils";

// Terminal-prompt mark (same drawing as public/favicon.svg), in the accent colour
export const LogoMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={cn("h-7 w-7 shrink-0", className)} aria-hidden="true">
    <rect x="0.5" y="0.5" width="31" height="31" rx="7" className="fill-card stroke-border" />
    <path d="M9 11l5 5-5 5" fill="none" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.5 21.5h7" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

export const Logo = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-2", className)}>
    <LogoMark />
    <span className="font-mono text-[15px] font-semibold tracking-tight text-foreground">prodify</span>
  </span>
);
