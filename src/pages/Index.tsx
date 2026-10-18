import { useState, useEffect, lazy, Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

// Loaded only after login, so the login page downloads much less JavaScript
const Dashboard = lazy(() => import("@/components/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })));
import { apiService, SESSION_EXPIRED_EVENT, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { applySavedAccentColor } from "@/lib/theme";

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Apply accent color + check auth on mount
  useEffect(() => {
    applySavedAccentColor();
  }, []);

  // Check for existing token on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = apiService.getToken();
        if (token) {
          const response = await apiService.getCurrentUser();
          setUserData(response.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token is invalid, clear it
        apiService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Any API call rejected with 401 (expired or revoked token) returns to the login screen
  useEffect(() => {
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setUserData(null);
      toast({
        title: "Session expired",
        description: "Please sign in again.",
      });
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [toast]);

  const handleLogin = (user: User) => {
    setUserData(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    apiService.clearToken();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const loadingScreen = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );

  if (isLoading) {
    return loadingScreen;
  }

  if (!isAuthenticated || !userData) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <Suspense fallback={loadingScreen}>
      <Dashboard userData={userData} onLogout={handleLogout} />
    </Suspense>
  );
};

export default Index;
