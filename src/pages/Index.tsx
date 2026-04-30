import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { apiService, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Apply saved accent color on app load
function applySavedAccentColor() {
  try {
    const saved = localStorage.getItem("prodify-accent-color");
    if (!saved) return;
    const hsl = JSON.parse(saved);
    const parts = hsl.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
    if (!parts) return;
    const h = parts[1], s = parts[2];
    const root = document.documentElement;
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--ring", hsl);
    root.style.setProperty("--secondary", `${h} 100% 97%`);
    root.style.setProperty("--secondary-foreground", hsl);
    root.style.setProperty("--accent", `${h} 100% 95%`);
    root.style.setProperty("--accent-foreground", hsl);
    root.style.setProperty("--gradient-primary", `linear-gradient(135deg, hsl(${hsl}), hsl(${h} ${s}% 63%))`);
    root.style.setProperty("--gradient-secondary", `linear-gradient(135deg, hsl(${h} 100% 97%), hsl(20 14% 96%))`);
    root.style.setProperty("--gradient-accent", `linear-gradient(135deg, hsl(${hsl}), hsl(45 93% 47%))`);
    root.style.setProperty("--shadow-soft", `0 4px 20px hsl(${hsl} / 0.1)`);
    root.style.setProperty("--shadow-medium", `0 8px 30px hsl(${hsl} / 0.15)`);
    root.style.setProperty("--shadow-strong", `0 12px 40px hsl(${hsl} / 0.2)`);
  } catch {}
}

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
