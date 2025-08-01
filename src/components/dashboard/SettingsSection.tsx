import React, { useState } from "react";
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  Download, 
  Trash2, 
  Shield, 
  Palette,
  User,
  Mail,
  Clock,
  Smartphone,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { apiService } from "@/lib/api";

interface SettingsSectionProps {
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
    geeksforgeeksProfile?: string;
  };
  onLogout: () => void;
}

export const SettingsSection = ({ userData, onLogout }: SettingsSectionProps) => {
  const [notifications, setNotifications] = useState({
    email: true,
    studyReminders: true,
    progressUpdates: false,
    weeklyReports: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showProgress: true,
    allowAnalytics: true,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast({
      title: "Notification settings updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${!notifications[key] ? 'enabled' : 'disabled'}`,
    });
  };

  const handlePrivacyChange = (key: keyof typeof privacy, value: any) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
    toast({
      title: "Privacy settings updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleExportData = async () => {
    try {
      // Simulate data export
      const data = {
        user: userData,
        settings: { notifications, privacy },
        timestamp: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prodify-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      console.log('Attempting to delete account...');
      const response = await apiService.deleteAccount();
      console.log('Delete account response:', response);
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      onLogout();
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and privacy</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm">{userData.name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{userData.email}</p>
              </div>
              {userData.university && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">University</label>
                  <p className="text-sm">{userData.university}</p>
                </div>
              )}
              {userData.major && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Major</label>
                  <p className="text-sm">{userData.major}</p>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the app looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Compact Mode</p>
                <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Show Animations</p>
                <p className="text-xs text-muted-foreground">Enable smooth transitions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch 
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange('email')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Study Reminders</p>
                <p className="text-xs text-muted-foreground">Daily reminders to practice DSA</p>
              </div>
              <Switch 
                checked={notifications.studyReminders}
                onCheckedChange={() => handleNotificationChange('studyReminders')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Progress Updates</p>
                <p className="text-xs text-muted-foreground">Weekly progress summaries</p>
              </div>
              <Switch 
                checked={notifications.progressUpdates}
                onCheckedChange={() => handleNotificationChange('progressUpdates')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Weekly Reports</p>
                <p className="text-xs text-muted-foreground">Detailed weekly performance reports</p>
              </div>
              <Switch 
                checked={notifications.weeklyReports}
                onCheckedChange={() => handleNotificationChange('weeklyReports')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Control your privacy and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Visibility</label>
              <div className="flex gap-2">
                <Button 
                  variant={privacy.profileVisibility === "public" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePrivacyChange('profileVisibility', 'public')}
                >
                  Public
                </Button>
                <Button 
                  variant={privacy.profileVisibility === "private" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePrivacyChange('profileVisibility', 'private')}
                >
                  Private
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Show Progress Publicly</p>
                <p className="text-xs text-muted-foreground">Allow others to see your progress</p>
              </div>
              <Switch 
                checked={privacy.showProgress}
                onCheckedChange={(checked) => handlePrivacyChange('showProgress', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">Help improve the app with usage data</p>
              </div>
              <Switch 
                checked={privacy.allowAnalytics}
                onCheckedChange={(checked) => handlePrivacyChange('allowAnalytics', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Export or delete your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground">Download all your data as JSON</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Connected Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Connected Services
            </CardTitle>
            <CardDescription>Manage your connected coding platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LC</span>
                </div>
                <div>
                  <p className="text-sm font-medium">LeetCode</p>
                  <p className="text-xs text-muted-foreground">
                    {userData.leetcodeProfile ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <Badge variant={userData.leetcodeProfile ? "default" : "secondary"}>
                {userData.leetcodeProfile ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GFG</span>
                </div>
                <div>
                  <p className="text-sm font-medium">GeeksForGeeks</p>
                  <p className="text-xs text-muted-foreground">
                    {userData.geeksforgeeksProfile ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <Badge variant={userData.geeksforgeeksProfile ? "default" : "secondary"}>
                {userData.geeksforgeeksProfile ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 