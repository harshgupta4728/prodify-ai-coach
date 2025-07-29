import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, BookOpen, Brain } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.jpg";

interface LoginFormProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: "John Doe", email: loginData.email });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: signupData.name, email: signupData.email });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <Brain className="h-10 w-10" />
              Prodify
            </h1>
            <p className="text-xl mb-6 text-white/90">
              Master DSA, Manage Time, and Ace Your Goals with AI-Powered Recommendations
            </p>
            <div className="space-y-4 text-white/80">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <span>Track your DSA progress with personalized insights</span>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5" />
                <span>Get AI-powered study recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5" />
                <span>Connect with a community of learners</span>
              </div>
            </div>
          </div>
          <img 
            src={heroIllustration} 
            alt="Students learning with AI" 
            className="max-w-md rounded-lg shadow-strong"
          />
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2 mb-2">
              <Brain className="h-8 w-8" />
              Prodify
            </h1>
            <p className="text-muted-foreground">Your AI-Powered Study Companion</p>
          </div>

          <Card className="shadow-medium border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Continue your journey to master data structures and algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                      Login to Dashboard
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          className="pl-10"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          className="pl-10"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};