import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { apiService, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard userData={userData} onLogout={handleLogout} />;
};

export default Index;
