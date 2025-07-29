import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);

  const handleLogin = (user: { name: string; email: string }) => {
    setUserData(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
  };

  if (!isAuthenticated || !userData) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard userData={userData} onLogout={handleLogout} />;
};

export default Index;
