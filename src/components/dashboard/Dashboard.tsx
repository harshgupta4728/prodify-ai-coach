import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardOverview } from "./DashboardOverview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, History, User, Settings } from "lucide-react";

interface DashboardProps {
  userData: { name: string; email: string };
  onLogout: () => void;
}

export const Dashboard = ({ userData, onLogout }: DashboardProps) => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview userName={userData.name} />;
      
      case "planner":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Planner
              </CardTitle>
              <CardDescription>Plan your study schedule and track deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Planner functionality coming soon!</p>
              </div>
            </CardContent>
          </Card>
        );
      
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
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Practice history will be displayed here!</p>
              </div>
            </CardContent>
          </Card>
        );
      
      case "profile":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-lg">{userData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-lg">{userData.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>Configure your application preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Settings panel coming soon!</p>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return <DashboardOverview userName={userData.name} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 flex-shrink-0">
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={onLogout}
        />
      </div>
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};