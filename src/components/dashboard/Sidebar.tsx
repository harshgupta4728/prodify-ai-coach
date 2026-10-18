import { LayoutDashboard, Calendar, User, Settings, LogOut, Flame, BarChart3, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/Logo";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  user?: { name: string; email: string };
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "todays-problem", label: "Today's Problem", icon: Flame },
  { id: "topic-progress", label: "Topics", icon: BarChart3 },
  { id: "planner", label: "Planner", icon: Calendar },
  { id: "profile", label: "Profile", icon: User },
];

// Pages opened from another page keep their parent highlighted
const navItemFor = (section: string) => {
  if (section === "topic-detail" || section === "problem-interface") return "topic-progress";
  if (section === "admin") return "settings";
  return section;
};

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    aria-current={active ? "page" : undefined}
    onClick={onClick}
    className={cn(
      "relative flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
      active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
    )}
  >
    {active && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" aria-hidden="true" />}
    <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
    {label}
  </button>
);

export const Sidebar = ({ activeSection, onSectionChange, onLogout, user }: SidebarProps) => {
  const current = navItemFor(activeSection);

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <button type="button" onClick={() => onSectionChange("dashboard")} aria-label="Prodify home" className="rounded-md">
          <Logo />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {sidebarItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={current === item.id}
            onClick={() => onSectionChange(item.id)}
          />
        ))}
      </nav>

      <div className="space-y-0.5 border-t p-2">
        <NavItem icon={Settings} label="Settings" active={current === "settings"} onClick={() => onSectionChange("settings")} />
      </div>

      <div className="flex items-center gap-2.5 border-t p-3">
        {user && (
          <>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted font-mono text-xs font-medium">
              {initialsOf(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-5">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onLogout}
          title="Log out"
          aria-label="Log out"
          className={cn(
            "flex h-8 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            !user && "w-full"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!user && "Log out"}
        </button>
      </div>
    </div>
  );
};
