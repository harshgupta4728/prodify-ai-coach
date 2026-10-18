import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Menu } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { DashboardOverview } from "./DashboardOverview";
import { Planner } from "./Planner";
import { Chatbot } from "@/components/ui/chatbot";
import { ProfileSection } from "./ProfileSection";
import { SettingsSection } from "./SettingsSection";
import { TopicProgress } from "./TopicProgress";
import { ProblemInterface } from "./ProblemInterface";
import { TopicDetailView } from "./TopicDetailView";

// Only admins ever open it, so it's downloaded on demand
const AdminPanel = lazy(() => import("./AdminPanel").then((m) => ({ default: m.AdminPanel })));

interface DashboardProps {
  userData: {
    name: string;
    email: string;
    bio?: string;
    university?: string;
    major?: string;
    graduationYear?: string;
    location?: string;
    portfolio?: string;
    isAdmin?: boolean;
  };
  onLogout: () => void;
}

// Full-height coding screens: no page padding, no floating chat button over the editor
const WORKSPACE_SECTIONS = ["todays-problem", "problem-interface"];

export const Dashboard = ({ userData, onLogout }: DashboardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUserData, setCurrentUserData] = useState(userData);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const activeSection = searchParams.get("section") || "dashboard";
  const topicId = searchParams.get("topicId") || "";
  const problemId = searchParams.get("problemId") || "";
  const isWorkspace = WORKSPACE_SECTIONS.includes(activeSection);

  // Each new page starts at the top instead of the previous page's scroll position
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeSection, topicId, problemId]);

  const setActiveSection = (section: string) => {
    setMobileNavOpen(false);
    // Support "section&key=value&key2=value2" format for navigation
    if (section.includes('&')) {
      const parts = section.split('&');
      const sec = parts[0];
      const params: Record<string, string> = { section: sec };
      for (let i = 1; i < parts.length; i++) {
        const [key, value] = parts[i].split('=');
        if (key && value) params[key] = value;
      }
      setSearchParams(params);
    } else {
      setSearchParams({ section });
    }
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setCurrentUserData(updatedUser);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardOverview
            userName={currentUserData.name}
            onNavigateToSection={setActiveSection}
          />
        );

      case "planner":
        return <Planner userEmail={currentUserData.email} />;

      case "todays-problem":
        return (
          <ProblemInterface
            topic="todays-problem"
            onBack={() => setActiveSection("dashboard")}
          />
        );

      case "topic-progress":
        return <TopicProgress onNavigateToSection={setActiveSection} />;

      case "topic-detail":
        return (
          <TopicDetailView
            topicId={topicId || "arrays"}
            onBack={() => setActiveSection("topic-progress")}
            onNavigateToSection={setActiveSection}
          />
        );

      case "problem-interface":
        return (
          <ProblemInterface
            topic={topicId || undefined}
            problemId={problemId || undefined}
            onBack={() => topicId ? setActiveSection(`topic-detail&topicId=${topicId}`) : setActiveSection("topic-progress")}
          />
        );

      case "profile":
        return <ProfileSection userData={currentUserData} onProfileUpdate={handleProfileUpdate} />;

      case "settings":
        return <SettingsSection userData={currentUserData} onLogout={onLogout} onNavigateToSection={setActiveSection} />;

      case "admin":
        // Hidden for non-admins; the server also rejects their content changes
        if (!currentUserData.isAdmin) {
          return <DashboardOverview userName={currentUserData.name} onNavigateToSection={setActiveSection} />;
        }
        return (
          <Suspense fallback={<p className="text-muted-foreground">Loading admin panel...</p>}>
            <AdminPanel onBack={() => setActiveSection("settings")} />
          </Suspense>
        );

      default:
        return <DashboardOverview userName={currentUserData.name} onNavigateToSection={setActiveSection} />;
    }
  };

  const sidebar = (
    <Sidebar
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={onLogout}
      user={{ name: currentUserData.name, email: currentUserData.email }}
    />
  );

  return (
    <div className="flex h-[100dvh] bg-background text-foreground">
      {/* Desktop: fixed sidebar */}
      <div className="hidden md:block w-60 flex-shrink-0">
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Phones and small tablets: top bar with a slide-in menu */}
        <header className="md:hidden flex items-center gap-2 h-14 px-3 border-b bg-background/95 backdrop-blur shrink-0">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
          <button type="button" aria-label="Prodify home" onClick={() => setActiveSection("dashboard")}>
            <Logo />
          </button>
        </header>

        <main ref={mainRef} className="flex-1 overflow-auto bg-background">
          <div className={isWorkspace ? "h-full" : "mx-auto w-full max-w-6xl p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24"}>
            {renderContent()}
          </div>
        </main>
      </div>

      {!isWorkspace && <Chatbot userData={currentUserData} />}
    </div>
  );
};
