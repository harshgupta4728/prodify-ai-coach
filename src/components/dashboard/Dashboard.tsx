import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DashboardOverview } from "./DashboardOverview";
import { Planner } from "./Planner";
import { LeetCodeProfileEditor } from "./LeetCodeProfileEditor";
import { GeeksForGeeksProfileEditor } from "./GeeksForGeeksProfileEditor";
import { ProfileNotification } from "./ProfileNotification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Settings, ExternalLink, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chatbot } from "@/components/ui/chatbot";
import { ProfileSection } from "./ProfileSection";
import { SettingsSection } from "./SettingsSection";
import { TodaysProblem } from "./TodaysProblem";
import { TopicProgress } from "./TopicProgress";
import { ProblemInterface } from "./ProblemInterface";

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
    leetcodeProfile?: string; 
    geeksforgeeksProfile?: string 
  };
  onLogout: () => void;
}

export const Dashboard = ({ userData, onLogout }: DashboardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentUserData, setCurrentUserData] = useState(userData);
  const leetcodeEditorRef = React.useRef<{ open: () => void }>(null);
  const geeksforgeeksEditorRef = React.useRef<{ open: () => void }>(null);

  // Get active section from URL or default to dashboard
  const activeSection = searchParams.get("section") || "dashboard";

  // Update URL when section changes
  const setActiveSection = (section: string) => {
    setSearchParams({ section });
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setCurrentUserData(updatedUser);
  };

  const handleAddProfiles = () => {
    setActiveSection("profiles");
  };

  const openLeetCodeEditor = () => {
    console.log('Opening LeetCode editor...');
    console.log('Ref:', leetcodeEditorRef.current);
    if (leetcodeEditorRef.current) {
      leetcodeEditorRef.current.open();
    } else {
      alert('LeetCode editor ref not found!');
    }
  };

  const openGeeksForGeeksEditor = () => {
    console.log('Opening GeeksForGeeks editor...');
    console.log('Ref:', geeksforgeeksEditorRef.current);
    if (geeksforgeeksEditorRef.current) {
      geeksforgeeksEditorRef.current.open();
    } else {
      alert('GeeksForGeeks editor ref not found!');
    }
  };

  const goToProfiles = () => {
    setActiveSection("profiles");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div>
            <ProfileNotification
              hasLeetCode={!!currentUserData.leetcodeProfile}
              hasGeeksForGeeks={!!currentUserData.geeksforgeeksProfile}
              onAddLeetCode={goToProfiles}
              onAddGeeksForGeeks={goToProfiles}
            />
            <DashboardOverview 
              userName={currentUserData.name} 
              onNavigateToSection={setActiveSection}
            />
          </div>
        );
      
      case "planner":
        return <Planner userEmail={currentUserData.email} />;
      
      case "todays-problem":
        return <TodaysProblem />;
      
      case "topic-progress":
        return <TopicProgress onNavigateToSection={setActiveSection} />;
      
      case "problem-interface":
        return <ProblemInterface onBack={() => setActiveSection("topic-progress")} />;
      
      case "profiles":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Coding Profiles
              </CardTitle>
              <CardDescription>Your coding platform profiles and progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">LC</span>
                        </div>
                        LeetCode Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentUserData.leetcodeProfile ? (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">Your LeetCode profile is connected</p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => window.open(currentUserData.leetcodeProfile, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={openLeetCodeEditor}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">No LeetCode profile connected</p>
                          <Button 
                            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                            onClick={openLeetCodeEditor}
                          >
                            Connect Profile
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">GFG</span>
                        </div>
                        GeeksForGeeks Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentUserData.geeksforgeeksProfile ? (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">Your GeeksForGeeks profile is connected</p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => window.open(currentUserData.geeksforgeeksProfile, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={openGeeksForGeeksEditor}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">No GeeksForGeeks profile connected</p>
                          <Button 
                            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                            onClick={openGeeksForGeeksEditor}
                          >
                            Connect Profile
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Profile Benefits</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Track your DSA progress across platforms</li>
                    <li>• Get personalized study recommendations</li>
                    <li>• Analyze your problem-solving patterns</li>
                    <li>• Set goals and track achievements</li>
                  </ul>
                </div>

                {/* Profile editors for ref access */}
                <div style={{ position: 'absolute', left: '-9999px' }}>
                  <LeetCodeProfileEditor 
                    ref={leetcodeEditorRef}
                    userData={currentUserData}
                    onProfileUpdate={handleProfileUpdate}
                  />
                  <GeeksForGeeksProfileEditor 
                    ref={geeksforgeeksEditorRef}
                    userData={currentUserData}
                    onProfileUpdate={handleProfileUpdate}
                  />
                </div>

              </div>
            </CardContent>
          </Card>
        );
      
      case "profile":
        return <ProfileSection userData={currentUserData} onProfileUpdate={handleProfileUpdate} />;
      
      case "settings":
        return <SettingsSection userData={currentUserData} onLogout={onLogout} />;
      
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