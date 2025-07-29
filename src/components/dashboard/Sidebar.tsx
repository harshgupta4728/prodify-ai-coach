import { Brain, LayoutDashboard, Calendar, History, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "planner", label: "My Planner", icon: Calendar },
  { id: "history", label: "Practice History", icon: History },
  { id: "profile", label: "Profile", icon: User },
];

export const Sidebar = ({ activeSection, onSectionChange, onLogout }: SidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">Prodify</h2>
            <p className="text-xs text-muted-foreground">AI Study Coach</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11 transition-all duration-200",
                  isActive 
                    ? "bg-gradient-primary text-white shadow-soft hover:opacity-90" 
                    : "hover:bg-accent hover:text-accent-foreground"
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
          variant="ghost"
          className="w-full justify-start gap-3 h-11 hover:bg-accent"
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