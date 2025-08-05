import React, { useState } from "react";
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  Trash2, 
  Palette,
  User,
  Mail,
  Clock,
  Smartphone,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle,
  X,
  RotateCcw
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
import { getNotificationSettings } from "@/lib/notification-utils";

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
  const [notifications, setNotifications] = useState(() => {
    // Load saved notification settings from localStorage
    const saved = localStorage.getItem('prodify-notification-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing saved notification settings:', error);
      }
    }
    // Default values
    return {
      email: true,
      browserNotifications: true,
    };
  });



  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    if (key === 'browserNotifications') {
      if (!notifications.browserNotifications) {
        // Request browser notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: "Permission Denied",
            description: "Browser notifications are disabled. Please enable them in your browser settings.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    const newSettings = {
      ...notifications,
      [key]: !notifications[key]
    };
    
    setNotifications(newSettings);
    
    // Save to localStorage
    localStorage.setItem('prodify-notification-settings', JSON.stringify(newSettings));
    
    toast({
      title: "Notification settings updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${!notifications[key] ? 'enabled' : 'disabled'}`,
    });
  };



  const handleResetProgress = async () => {
    setIsResetting(true);
    try {
      await apiService.resetProgress();
      toast({
        title: "Progress Reset",
        description: "Your progress has been reset successfully. All solved problems and stats have been cleared.",
      });
    } catch (error) {
      console.error('Reset progress error:', error);
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
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
             <ThemeToggle />
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
                  <p className="text-sm font-medium">Browser Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive notifications in your browser</p>
                </div>
                <Switch 
                  checked={notifications.browserNotifications}
                  onCheckedChange={() => handleNotificationChange('browserNotifications')}
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
            <CardDescription>Reset or delete your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Reset Progress</p>
                <p className="text-xs text-muted-foreground">Clear all your solved problems and stats</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isResetting}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isResetting ? "Resetting..." : "Reset Progress"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Reset Progress
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reset your progress? This action will:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Delete all your solved problems</li>
                        <li>Reset your streak to 0</li>
                        <li>Clear all topic progress</li>
                        <li>Reset your rating to 1200</li>
                        <li>Remove all achievements</li>
                      </ul>
                      <strong className="text-destructive">This action cannot be undone!</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetProgress}
                      disabled={isResetting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isResetting ? "Resetting..." : "Reset Progress"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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