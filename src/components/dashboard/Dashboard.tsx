import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DashboardOverview } from "./DashboardOverview";
import { Planner } from "./Planner";
import { Chatbot } from "@/components/ui/chatbot";
import { ProfileSection } from "./ProfileSection";
import { SettingsSection } from "./SettingsSection";
import { TodaysProblem } from "./TodaysProblem";
import { TopicProgress } from "./TopicProgress";
import { ProblemInterface } from "./ProblemInterface";
import { TopicDetailView } from "./TopicDetailView";
import { AdminPanel } from "./AdminPanel";

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
  };
  onLogout: () => void;
}

export const Dashboard = ({ userData, onLogout }: DashboardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUserData, setCurrentUserData] = useState(userData);

  const activeSection = searchParams.get("section") || "dashboard";
  const topicId = searchParams.get("topicId") || "";

  const setActiveSection = (section: string) => {
    // Support "topic-detail&topicId=arrays" format from TopicProgress navigation
    if (section.includes('&topicId=')) {
      const [sec, param] = section.split('&topicId=');
      setSearchParams({ section: sec, topicId: param });
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
        return <TodaysProblem />;

      case "topic-progress":
        return <TopicProgress onNavigateToSection={setActiveSection} />;

      case "topic-detail":
        return <TopicDetailView topicId={topicId || "arrays"} onBack={() => setActiveSection("topic-progress")} />;

      case "problem-interface":
        return <ProblemInterface onBack={() => setActiveSection("topic-progress")} />;

      case "profile":
        return <ProfileSection userData={currentUserData} onProfileUpdate={handleProfileUpdate} />;

      case "settings":
        return <SettingsSection userData={currentUserData} onLogout={onLogout} onNavigateToSection={setActiveSection} />;

      case "admin":
        return <AdminPanel onBack={() => setActiveSection("settings")} />;

      default:
        return <DashboardOverview userName={userData.name} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-64 flex-shrink-0">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={onLogout}
        />
      </div>

      <main className="flex-1 overflow-auto bg-background">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      <Chatbot userData={currentUserData} />
    </div>
  );
};
