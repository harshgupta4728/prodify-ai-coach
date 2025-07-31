import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, Edit } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface GeeksForGeeksProfileEditorProps {
  userData: {
    name: string;
    email: string;
    leetcodeProfile?: string;
    geeksforgeeksProfile?: string;
  };
  onProfileUpdate: (updatedUser: any) => void;
}

export const GeeksForGeeksProfileEditor = React.forwardRef<{ open: () => void }, GeeksForGeeksProfileEditorProps>(
  ({ userData, onProfileUpdate }, ref) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [geeksforgeeksProfile, setGeeksForGeeksProfile] = useState(userData.geeksforgeeksProfile || "");

  // Update profile when userData changes
  React.useEffect(() => {
    setGeeksForGeeksProfile(userData.geeksforgeeksProfile || "");
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.updateProfile({
        leetcodeProfile: userData.leetcodeProfile, // Keep existing LeetCode profile
        geeksforgeeksProfile: geeksforgeeksProfile
      });

      onProfileUpdate(response.user);
      setIsOpen(false);
      
      toast({
        title: "GeeksForGeeks profile updated!",
        description: "Your GeeksForGeeks profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Expose open method via ref
  React.useImperativeHandle(ref, () => ({
    open: () => {
      console.log('GeeksForGeeks editor open method called');
      setIsOpen(true);
    }
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Edit className="h-4 w-4 mr-2" />
          {userData.geeksforgeeksProfile ? "Edit GeeksForGeeks Profile" : "Add GeeksForGeeks Profile"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>GeeksForGeeks Profile</DialogTitle>
          <DialogDescription>
            Add or update your GeeksForGeeks profile link to track your progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="geeksforgeeks-profile">GeeksForGeeks Profile Link</Label>
            <div className="relative">
              <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="geeksforgeeks-profile"
                type="url"
                placeholder="https://auth.geeksforgeeks.org/user/your-username"
                className="pl-10"
                value={geeksforgeeksProfile}
                onChange={(e) => setGeeksForGeeksProfile(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Connect your GeeksForGeeks profile to track your progress
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Save Profile"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}); 