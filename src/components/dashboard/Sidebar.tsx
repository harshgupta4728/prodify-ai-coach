import { Brain, LayoutDashboard, Calendar, User, Settings, LogOut, Flame, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "todays-problem", label: "Today's Problem", icon: Flame },
  { id: "topic-progress", label: "Topic Progress", icon: BarChart3 },
  { id: "planner", label: "My Planner", icon: Calendar },
  { id: "profile", label: "Profile", icon: User },
];

// Pages opened from another page keep their parent highlighted
const navItemFor = (section: string) => {
  if (section === "topic-detail" || section === "problem-interface") return "topic-progress";
  if (section === "admin") return "settings";
  return section;
};

export const Sidebar = ({ activeSection, onSectionChange, onLogout }: SidebarProps) => {
  const current = navItemFor(activeSection);
  const activeClasses = "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-soft hover:opacity-90";

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-r border-border">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <button className="flex items-center gap-3 text-left" onClick={() => onSectionChange("dashboard")}>
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">Prodify</h2>
            <p className="text-xs text-muted-foreground">AI Study Coach</p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "w-full justify-start gap-3 h-11 transition-all duration-200",
                  isActive ? activeClasses : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant={current === "settings" ? "default" : "ghost"}
          aria-current={current === "settings" ? "page" : undefined}
          className={cn("w-full justify-start gap-3 h-11", current === "settings" ? activeClasses : "hover:bg-accent")}
          onClick={() => onSectionChange("settings")}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 hover:bg-destructive hover:text-destructive-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};
