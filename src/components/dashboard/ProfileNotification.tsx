import { AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ProfileNotificationProps {
  hasLeetCode: boolean;
  hasGeeksForGeeks: boolean;
  onAddLeetCode: () => void;
  onAddGeeksForGeeks: () => void;
}

export const ProfileNotification = ({ 
  hasLeetCode, 
  hasGeeksForGeeks, 
  onAddLeetCode,
  onAddGeeksForGeeks
}: ProfileNotificationProps) => {
  // Only show notification if NO profiles are connected
  if (hasLeetCode || hasGeeksForGeeks) {
    return null;
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium mb-1">Connect your coding profiles!</p>
            <p className="text-sm">
              Add your LeetCode and GeeksForGeeks profiles to track your DSA progress and get personalized recommendations.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAddLeetCode}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Go to Profiles
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}; 