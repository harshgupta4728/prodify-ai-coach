import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardOverview } from "./DashboardOverview";
import { Planner } from "./Planner";
import { LeetCodeProfileEditor } from "./LeetCodeProfileEditor";
import { GeeksForGeeksProfileEditor } from "./GeeksForGeeksProfileEditor";
import { ProfileNotification } from "./ProfileNotification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, History, User, Settings, ExternalLink, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chatbot } from "@/components/ui/chatbot";
import { ProfileSection } from "./ProfileSection";
import { SettingsSection } from "./SettingsSection";

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
  const [activeSection, setActiveSection] = useState("dashboard");
  const [currentUserData, setCurrentUserData] = useState(userData);
  const leetcodeEditorRef = React.useRef<{ open: () => void }>(null);
  const geeksforgeeksEditorRef = React.useRef<{ open: () => void }>(null);

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
            <DashboardOverview userName={currentUserData.name} />
          </div>
        );
      
      case "planner":
        return <Planner userEmail={currentUserData.email} />;
      
      case "history":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Practice History
              </CardTitle>
              <CardDescription>Review your solved problems and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">0</p>
                      <p className="text-sm text-muted-foreground">Problems Solved</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">0</p>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent-foreground">0</p>
                      <p className="text-sm text-muted-foreground">Total Time</p>
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                              <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                            <span className="text-success font-bold">✓</span>
                          </div>
                        <div>
                          <p className="font-medium">No recent activity</p>
                          <p className="text-sm text-muted-foreground">Start solving problems to see your history</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Progress */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Platform Progress</h3>
                  <div className="space-y-3">
                    {currentUserData.leetcodeProfile ? (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <span className="text-orange-500 font-bold text-sm">LC</span>
                          </div>
                          <div>
                            <p className="font-medium">LeetCode</p>
                            <p className="text-sm text-muted-foreground">Connect your profile to see progress</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <span className="text-orange-500 font-bold text-sm">LC</span>
                          </div>
                          <div>
                            <p className="font-medium">LeetCode</p>
                            <p className="text-sm text-muted-foreground">Connect your profile to track progress</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveSection("profiles")}>
                          Connect
                        </Button>
                      </div>
                    )}

                    {currentUserData.geeksforgeeksProfile ? (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                            <span className="text-success font-bold text-sm">GFG</span>
                          </div>
                          <div>
                            <p className="font-medium">GeeksForGeeks</p>
                            <p className="text-sm text-muted-foreground">Connect your profile to see progress</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">GFG</span>
                          </div>
                          <div>
                            <p className="font-medium">GeeksForGeeks</p>
                            <p className="text-sm text-muted-foreground">Connect your profile to track progress</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveSection("profiles")}>
                          Connect
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
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