import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, Edit } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface LeetCodeProfileEditorProps {
  userData: {
    name: string;
    email: string;
    leetcodeProfile?: string;
    geeksforgeeksProfile?: string;
  };
  onProfileUpdate: (updatedUser: any) => void;
}

export const LeetCodeProfileEditor = React.forwardRef<{ open: () => void }, LeetCodeProfileEditorProps>(
  ({ userData, onProfileUpdate }, ref) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [leetcodeProfile, setLeetCodeProfile] = useState(userData.leetcodeProfile || "");

  // Update profile when userData changes
  React.useEffect(() => {
    setLeetCodeProfile(userData.leetcodeProfile || "");
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.updateProfile({
        leetcodeProfile: leetcodeProfile,
        geeksforgeeksProfile: userData.geeksforgeeksProfile // Keep existing GFG profile
      });

      onProfileUpdate(response.user);
      setIsOpen(false);
      
      toast({
        title: "LeetCode profile updated!",
        description: "Your LeetCode profile has been successfully updated.",
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
      console.log('LeetCode editor open method called');
      setIsOpen(true);
    }
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Edit className="h-4 w-4 mr-2" />
          {userData.leetcodeProfile ? "Edit LeetCode Profile" : "Add LeetCode Profile"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>LeetCode Profile</DialogTitle>
          <DialogDescription>
            Add or update your LeetCode profile link to track your progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leetcode-profile">LeetCode Profile Link</Label>
            <div className="relative">
              <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="leetcode-profile"
                type="url"
                placeholder="https://leetcode.com/your-username"
                className="pl-10"
                value={leetcodeProfile}
                onChange={(e) => setLeetCodeProfile(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Connect your LeetCode profile to track your progress
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