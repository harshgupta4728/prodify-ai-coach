import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User as UserIcon, BookOpen, Brain, AlertCircle, ArrowLeft, KeyRound, Sparkles, Rocket, Code2, Trophy, Zap } from "lucide-react";
import { apiService, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (userData: User) => void;
}

// Cartoon owl mascot that reacts to user actions
const Mascot = ({ mood, isLoading }: { mood: string; isLoading: boolean }) => {
  const messages: Record<string, string> = {
    idle: "Hey! Ready to code?",
    typing: "Keep going...",
    otp: "Check your email!",
    success: "Welcome aboard!",
    error: "Oops! Try again",
  };

  // Eye styles per mood
  const getEyes = (m: string) => {
    switch (m) {
      case "typing":
        return { leftPupilX: 38, leftPupilY: 44, rightPupilX: 62, rightPupilY: 44, leftEyeScaleY: 1, rightEyeScaleY: 1, pupilSize: 4 };
      case "otp":
        return { leftPupilX: 40, leftPupilY: 42, rightPupilX: 60, rightPupilY: 42, leftEyeScaleY: 1, rightEyeScaleY: 1, pupilSize: 5.5 };
      case "success":
        return { leftPupilX: 40, leftPupilY: 42, rightPupilX: 60, rightPupilY: 42, leftEyeScaleY: 0.15, rightEyeScaleY: 0.15, pupilSize: 4 };
      case "error":
        return { leftPupilX: 40, leftPupilY: 44, rightPupilX: 60, rightPupilY: 44, leftEyeScaleY: 0.7, rightEyeScaleY: 0.7, pupilSize: 3.5 };
      default:
        return { leftPupilX: 40, leftPupilY: 42, rightPupilX: 60, rightPupilY: 42, leftEyeScaleY: 1, rightEyeScaleY: 1, pupilSize: 4.5 };
    }
  };

  const eyes = getEyes(mood);
  const bodyColor = mood === "success" ? "#22c55e" : mood === "error" ? "#ef4444" : "#f97316";
  const bodyColorLight = mood === "success" ? "#4ade80" : mood === "error" ? "#f87171" : "#fb923c";

  return (
    <div className={`mascot-container ${mood === "success" ? "mascot-celebrate" : ""} ${isLoading ? "mascot-loading" : ""}`}>
      <div className="mascot-body">
        <svg viewBox="0 0 100 110" width="90" height="99" xmlns="http://www.w3.org/2000/svg">
          {/* Ear tufts */}
          <ellipse cx="28" cy="18" rx="10" ry="14" fill={bodyColor} transform="rotate(-20 28 18)" />
          <ellipse cx="72" cy="18" rx="10" ry="14" fill={bodyColor} transform="rotate(20 72 18)" />
          <ellipse cx="28" cy="16" rx="6" ry="9" fill={bodyColorLight} transform="rotate(-20 28 16)" />
          <ellipse cx="72" cy="16" rx="6" ry="9" fill={bodyColorLight} transform="rotate(20 72 16)" />

          {/* Body */}
          <ellipse cx="50" cy="58" rx="34" ry="36" fill={bodyColor} />
          <ellipse cx="50" cy="60" rx="28" ry="28" fill={bodyColorLight} opacity="0.35" />

          {/* Belly */}
          <ellipse cx="50" cy="68" rx="20" ry="18" fill="#fff" opacity="0.9" />

          {/* Eye whites */}
          <ellipse cx="38" cy="42" rx="13" ry="13" fill="white" stroke={bodyColor} strokeWidth="1.5"
            style={{ transform: `scaleY(${eyes.leftEyeScaleY})`, transformOrigin: '38px 42px', transition: 'all 0.3s ease' }} />
          <ellipse cx="62" cy="42" rx="13" ry="13" fill="white" stroke={bodyColor} strokeWidth="1.5"
            style={{ transform: `scaleY(${eyes.rightEyeScaleY})`, transformOrigin: '62px 42px', transition: 'all 0.3s ease' }} />

          {/* Pupils */}
          {eyes.leftEyeScaleY > 0.2 && (
            <>
              <circle cx={eyes.leftPupilX} cy={eyes.leftPupilY} r={eyes.pupilSize} fill="#1f2937"
                style={{ transition: 'all 0.3s ease' }} />
              <circle cx={eyes.leftPupilX - 1.5} cy={eyes.leftPupilY - 1.5} r={1.5} fill="white" />
              <circle cx={eyes.rightPupilX} cy={eyes.rightPupilY} r={eyes.pupilSize} fill="#1f2937"
                style={{ transition: 'all 0.3s ease' }} />
              <circle cx={eyes.rightPupilX - 1.5} cy={eyes.rightPupilY - 1.5} r={1.5} fill="white" />
            </>
          )}

          {/* Beak */}
          <path d="M 46 52 L 50 58 L 54 52 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5" />

          {/* Blush */}
          <circle cx="26" cy="52" r="5" fill="#fda4af" opacity="0.5" />
          <circle cx="74" cy="52" r="5" fill="#fda4af" opacity="0.5" />

          {/* Mouth / expression */}
          {mood === "success" && (
            <path d="M 43 62 Q 50 68 57 62" fill="none" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
          )}
          {mood === "error" && (
            <path d="M 43 66 Q 50 62 57 66" fill="none" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
          )}
          {mood === "otp" && (
            <ellipse cx="50" cy="64" rx="4" ry="3" fill="#1f2937" />
          )}

          {/* Feet */}
          <ellipse cx="40" cy="92" rx="8" ry="4" fill={bodyColor} />
          <ellipse cx="60" cy="92" rx="8" ry="4" fill={bodyColor} />

          {/* Glasses (coding owl!) */}
          <circle cx="38" cy="42" r="15" fill="none" stroke="#374151" strokeWidth="2" opacity="0.6"
            style={{ transform: `scaleY(${Math.max(eyes.leftEyeScaleY, 0.4)})`, transformOrigin: '38px 42px', transition: 'all 0.3s ease' }} />
          <circle cx="62" cy="42" r="15" fill="none" stroke="#374151" strokeWidth="2" opacity="0.6"
            style={{ transform: `scaleY(${Math.max(eyes.rightEyeScaleY, 0.4)})`, transformOrigin: '62px 42px', transition: 'all 0.3s ease' }} />
          <line x1="53" y1="42" x2="47" y2="42" stroke="#374151" strokeWidth="2" opacity="0.6" />

          {/* Wing wave on success */}
          {mood === "success" && (
            <path d="M 80 50 Q 90 40 95 50 Q 90 45 85 55" fill={bodyColor} className="wing-wave" />
          )}
        </svg>
      </div>
      <div className="mascot-speech">
        <span className="speech-arrow" />
        {messages[mood] || messages.idle}
      </div>
    </div>
  );
};

// Floating particles on hero
const FloatingShapes = () => (
  <div className="floating-shapes">
    {[...Array(15)].map((_, i) => (
      <div key={i} className={`floating-shape shape-${i % 5}`} style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${8 + Math.random() * 12}s`,
      }} />
    ))}
  </div>
);

// Confetti on success
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="confetti-container">
      {[...Array(50)].map((_, i) => (
        <div key={i} className="confetti-piece" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 0.5}s`,
          backgroundColor: ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][i % 6],
        }} />
      ))}
    </div>
  );
};

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [mascotMood, setMascotMood] = useState("idle");

  // Login state
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginOtpStep, setLoginOtpStep] = useState<"email" | "otp">("email");
  const [loginOtpEmail, setLoginOtpEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState(["", "", "", "", "", ""]);

  // Signup state
  const [signupStep, setSignupStep] = useState<"form" | "otp">("form");
  const [signupData, setSignupData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [signupOtp, setSignupOtp] = useState(["", "", "", "", "", ""]);

  const [cooldown, setCooldown] = useState(0);
  const signupOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const loginOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => { if (error) setMascotMood("error"); }, [error]);

  const triggerSuccess = useCallback(() => {
    setMascotMood("success");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  // OTP handlers
  const handleOtpChange = (i: number, v: string, otp: string[], set: React.Dispatch<React.SetStateAction<string[]>>, refs: React.MutableRefObject<(HTMLInputElement | null)[]>) => {
    if (v && !/^\d$/.test(v)) return;
    const n = [...otp]; n[i] = v; set(n);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent, otp: string[], _: any, refs: React.MutableRefObject<(HTMLInputElement | null)[]>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent, set: React.Dispatch<React.SetStateAction<string[]>>, refs: React.MutableRefObject<(HTMLInputElement | null)[]>) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { set(p.split("")); refs.current[5]?.focus(); }
  };

  // Signup handlers
  const handleSendSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (signupData.password !== signupData.confirmPassword) { setError("Passwords do not match."); return; }
    if (signupData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setIsLoading(true);
    try {
      await apiService.sendOtp({ email: signupData.email, purpose: "signup" });
      setSignupStep("otp"); setCooldown(60); setMascotMood("otp");
      toast({ title: "OTP Sent!", description: `Check your email ${signupData.email}` });
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to send OTP"); }
    finally { setIsLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = signupOtp.join("");
    if (otp.length !== 6) { setError("Please enter the 6-digit OTP."); return; }
    setIsLoading(true); setError("");
    try {
      const response = await apiService.signup({
        name: signupData.name, email: signupData.email, password: signupData.password, otp,
      });
      apiService.setToken(response.token); triggerSuccess();
      toast({ title: "Account created!", description: "Welcome to Prodify." });
      setTimeout(() => onLogin(response.user), 1500);
    } catch (err) { setError(err instanceof Error ? err.message : "Signup failed"); }
    finally { setIsLoading(false); }
  };

  const handleResendSignupOtp = async () => {
    if (cooldown > 0) return; setIsLoading(true); setError("");
    try {
      await apiService.sendOtp({ email: signupData.email, purpose: "signup" });
      setCooldown(60); setSignupOtp(["", "", "", "", "", ""]);
      toast({ title: "OTP Resent!", description: `New code sent to ${signupData.email}` });
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to resend OTP"); }
    finally { setIsLoading(false); }
  };

  // Login handlers
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError("");
    try {
      const response = await apiService.signin(loginData);
      apiService.setToken(response.token); triggerSuccess();
      toast({ title: "Login successful!", description: "Welcome back to Prodify." });
      setTimeout(() => onLogin(response.user), 1500);
    } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setIsLoading(false); }
  };

  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError("");
    try {
      await apiService.sendOtp({ email: loginOtpEmail, purpose: "signin" });
      setLoginOtpStep("otp"); setCooldown(60); setMascotMood("otp");
      toast({ title: "OTP Sent!", description: `Check your email ${loginOtpEmail}` });
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to send OTP"); }
    finally { setIsLoading(false); }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = loginOtp.join("");
    if (otp.length !== 6) { setError("Please enter the 6-digit OTP."); return; }
    setIsLoading(true); setError("");
    try {
      const response = await apiService.signinWithOtp({ email: loginOtpEmail, otp });
      apiService.setToken(response.token); triggerSuccess();
      toast({ title: "Login successful!", description: "Welcome back to Prodify." });
      setTimeout(() => onLogin(response.user), 1500);
    } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setIsLoading(false); }
  };

  const handleResendLoginOtp = async () => {
    if (cooldown > 0) return; setIsLoading(true); setError("");
    try {
      await apiService.sendOtp({ email: loginOtpEmail, purpose: "signin" });
      setCooldown(60); setLoginOtp(["", "", "", "", "", ""]);
      toast({ title: "OTP Resent!", description: `New code sent to ${loginOtpEmail}` });
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to resend OTP"); }
    finally { setIsLoading(false); }
  };

  const handleTabChange = () => {
    setError(""); setSignupStep("form"); setLoginOtpStep("email");
    setSignupOtp(["", "", "", "", "", ""]); setLoginOtp(["", "", "", "", "", ""]);
    setMascotMood("idle");
  };

  const onFormFocus = () => { if (!["otp", "success"].includes(mascotMood)) setMascotMood("typing"); };
  const onFormBlur = () => { if (!["otp", "success", "error"].includes(mascotMood)) setMascotMood("idle"); };

  const OtpInputBoxes = ({ otp, setOtp, refs, disabled }: {
    otp: string[]; setOtp: React.Dispatch<React.SetStateAction<string[]>>;
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>; disabled: boolean;
  }) => (
    <div className="flex justify-center gap-3">
      {otp.map((digit, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={(e) => handleOtpChange(i, e.target.value, otp, setOtp, refs)}
          onKeyDown={(e) => handleOtpKeyDown(i, e, otp, setOtp, refs)}
          onPaste={(e) => handleOtpPaste(e, setOtp, refs)}
          className={`otp-input ${digit ? "otp-filled" : ""}`} disabled={disabled} />
      ))}
    </div>
  );

  const ErrorAlert = () => error ? (
    <div className="error-alert animate-shake">
      <AlertCircle className="h-4 w-4 shrink-0" />{error}
    </div>
  ) : null;

  return (
    <div className="login-page">
      <Confetti active={showConfetti} />

      {/* Left - Animated Hero */}
      <div className="hero-panel">
        <FloatingShapes />
        <div className="hero-content">
          <div className="hero-badge animate-float">
            <Sparkles className="h-5 w-5" /><span>AI-Powered Learning</span>
          </div>
          <h1 className="hero-title">
            <Brain className="h-12 w-12 animate-pulse-slow" /><span>Prodify</span>
          </h1>
          <p className="hero-subtitle">Master DSA, Manage Time, and Ace Your Goals</p>

          <div className="hero-features">
            <div className="hero-feature animate-slide-in" style={{ animationDelay: "0.2s" }}>
              <div className="feature-icon"><Code2 className="h-5 w-5" /></div>
              <div><div className="feature-title">Smart Problem Tracking</div><div className="feature-desc">Track your coding progress & streaks</div></div>
            </div>
            <div className="hero-feature animate-slide-in" style={{ animationDelay: "0.4s" }}>
              <div className="feature-icon"><Trophy className="h-5 w-5" /></div>
              <div><div className="feature-title">Streaks & Achievements</div><div className="feature-desc">Stay motivated with daily goals</div></div>
            </div>
            <div className="hero-feature animate-slide-in" style={{ animationDelay: "0.6s" }}>
              <div className="feature-icon"><Zap className="h-5 w-5" /></div>
              <div><div className="feature-title">AI Recommendations</div><div className="feature-desc">Personalized study plans just for you</div></div>
            </div>
          </div>

          <div className="stats-ticker">
            <div className="stat-item"><Rocket className="h-4 w-4" /><span>1000+ Problems</span></div>
            <div className="stat-item"><BookOpen className="h-4 w-4" /><span>20+ Topics</span></div>
            <div className="stat-item"><UserIcon className="h-4 w-4" /><span>Free Forever</span></div>
          </div>
        </div>
      </div>

      {/* Mascot - between panels */}
      <div className="mascot-divider">
        <Mascot mood={mascotMood} isLoading={isLoading} />
      </div>

      {/* Right - Auth Form */}
      <div className="auth-panel">
        <div className="auth-container" onFocus={onFormFocus} onBlur={onFormBlur}>
          <div className="text-center mb-6 lg:hidden">
            <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2 mb-2">
              <Brain className="h-8 w-8" />Prodify
            </h1>
            <p className="text-muted-foreground text-sm">Your AI-Powered Study Companion</p>
          </div>

          <Card className="auth-card">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">
                {mascotMood === "success" ? "You're In!" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {mascotMood === "success" ? "Redirecting to your dashboard..." : "Continue your journey to master DSA"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 mb-6 h-11">
                  <TabsTrigger value="login" className="text-sm font-medium">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm font-medium">Sign Up</TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login" className="animate-fade-in">
                  <ErrorAlert />
                  {loginMode === "password" ? (
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative group">
                          <Mail className="input-icon" />
                          <Input id="email" type="email" placeholder="Enter your email" className="auth-input"
                            value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required disabled={isLoading} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative group">
                          <Lock className="input-icon" />
                          <Input id="password" type="password" placeholder="Enter your password" className="auth-input"
                            value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required disabled={isLoading} />
                        </div>
                      </div>
                      <Button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? <><span className="spinner" /> Logging in...</> : "Login to Dashboard"}
                      </Button>
                      <button type="button" className="alt-auth-link" onClick={() => { setLoginMode("otp"); setError(""); }}>
                        <KeyRound className="h-3.5 w-3.5" /> Login with OTP instead
                      </button>
                    </form>
                  ) : loginOtpStep === "email" ? (
                    <form onSubmit={handleSendLoginOtp} className="space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label htmlFor="otp-email">Email</Label>
                        <div className="relative group">
                          <Mail className="input-icon" />
                          <Input id="otp-email" type="email" placeholder="Enter your email" className="auth-input"
                            value={loginOtpEmail} onChange={(e) => setLoginOtpEmail(e.target.value)} required disabled={isLoading} />
                        </div>
                      </div>
                      <Button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? <><span className="spinner" /> Sending...</> : "Send OTP"}
                      </Button>
                      <button type="button" className="alt-auth-link" onClick={() => { setLoginMode("password"); setError(""); setLoginOtpStep("email"); }}>
                        <Lock className="h-3.5 w-3.5" /> Login with password instead
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleOtpLogin} className="space-y-5 animate-fade-in">
                      <button type="button" className="back-link" onClick={() => { setLoginOtpStep("email"); setError(""); setLoginOtp(["","","","","",""]); }}>
                        <ArrowLeft className="h-3.5 w-3.5" /> Back
                      </button>
                      <div className="otp-header">
                        <div className="otp-icon-wrapper"><Mail className="h-6 w-6 text-primary" /></div>
                        <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to</p>
                        <p className="font-semibold">{loginOtpEmail}</p>
                      </div>
                      <OtpInputBoxes otp={loginOtp} setOtp={setLoginOtp} refs={loginOtpRefs} disabled={isLoading} />
                      <Button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? <><span className="spinner" /> Verifying...</> : "Verify & Login"}
                      </Button>
                      <div className="text-center text-sm">
                        {cooldown > 0 ? <span className="text-muted-foreground">Resend in <span className="font-mono font-bold text-primary">{cooldown}s</span></span>
                          : <button type="button" className="text-primary hover:underline font-medium" onClick={handleResendLoginOtp} disabled={isLoading}>Resend OTP</button>}
                      </div>
                    </form>
                  )}
                </TabsContent>

                {/* SIGNUP TAB */}
                <TabsContent value="signup" className="animate-fade-in">
                  <ErrorAlert />
                  {signupStep === "form" ? (
                    <form onSubmit={handleSendSignupOtp} className="space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative group"><UserIcon className="input-icon" />
                          <Input id="signup-name" type="text" placeholder="Enter your full name" className="auth-input"
                            value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} required disabled={isLoading} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative group"><Mail className="input-icon" />
                          <Input id="signup-email" type="email" placeholder="Enter your email" className="auth-input"
                            value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} required disabled={isLoading} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative group"><Lock className="input-icon" />
                            <Input id="signup-password" type="password" placeholder="Min 6 chars" className="auth-input"
                              value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} required disabled={isLoading} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-confirm-password">Confirm</Label>
                          <div className="relative group"><Lock className="input-icon" />
                            <Input id="signup-confirm-password" type="password" placeholder="Re-enter" className="auth-input"
                              value={signupData.confirmPassword} onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })} required disabled={isLoading} />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? <><span className="spinner" /> Sending OTP...</> : <><Sparkles className="h-4 w-4" /> Send OTP & Verify Email</>}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-5 animate-fade-in">
                      <button type="button" className="back-link" onClick={() => { setSignupStep("form"); setError(""); setSignupOtp(["","","","","",""]); setMascotMood("typing"); }}>
                        <ArrowLeft className="h-3.5 w-3.5" /> Back
                      </button>
                      <div className="otp-header">
                        <div className="otp-icon-wrapper animate-bounce-slow"><Mail className="h-6 w-6 text-primary" /></div>
                        <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to</p>
                        <p className="font-semibold">{signupData.email}</p>
                      </div>
                      <OtpInputBoxes otp={signupOtp} setOtp={setSignupOtp} refs={signupOtpRefs} disabled={isLoading} />
                      <Button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? <><span className="spinner" /> Creating Account...</> : <><Rocket className="h-4 w-4" /> Verify & Create Account</>}
                      </Button>
                      <div className="text-center text-sm">
                        {cooldown > 0 ? <span className="text-muted-foreground">Resend in <span className="font-mono font-bold text-primary">{cooldown}s</span></span>
                          : <button type="button" className="text-primary hover:underline font-medium" onClick={handleResendSignupOtp} disabled={isLoading}>Resend OTP</button>}
                      </div>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <div className="text-center mt-4 text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>

      <style>{`
        .login-page { min-height:100vh; display:flex; overflow:hidden; background:hsl(var(--background)); position:relative; }

        /* HERO */
        .hero-panel { display:none; width:50%; position:relative; background:linear-gradient(135deg,#f97316,#ea580c,#c2410c); overflow:hidden; }
        @media(min-width:1024px){.hero-panel{display:flex;}}
        .hero-content { position:relative; z-index:10; display:flex; flex-direction:column; justify-content:center; padding:3rem; color:white; width:100%; }
        .hero-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,.2); backdrop-filter:blur(10px); padding:8px 16px; border-radius:999px; font-size:14px; font-weight:500; width:fit-content; margin-bottom:24px; border:1px solid rgba(255,255,255,.3); }
        .hero-title { display:flex; align-items:center; gap:16px; font-size:3rem; font-weight:800; margin-bottom:12px; letter-spacing:-1px; }
        .hero-subtitle { font-size:1.2rem; opacity:.9; margin-bottom:2.5rem; line-height:1.5; }
        .hero-features { display:flex; flex-direction:column; gap:16px; margin-bottom:2.5rem; }
        .hero-feature { display:flex; align-items:center; gap:14px; background:rgba(255,255,255,.1); backdrop-filter:blur(8px); padding:14px 18px; border-radius:12px; border:1px solid rgba(255,255,255,.15); transition:all .3s; }
        .hero-feature:hover { background:rgba(255,255,255,.2); transform:translateX(8px); }
        .feature-icon { width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .feature-title { font-weight:600; font-size:15px; }
        .feature-desc { font-size:13px; opacity:.8; }
        .stats-ticker { display:flex; gap:20px; padding-top:12px; border-top:1px solid rgba(255,255,255,.2); }
        .stat-item { display:flex; align-items:center; gap:6px; font-size:13px; opacity:.85; font-weight:500; }

        /* MASCOT */
        .mascot-divider { display:none; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:50; transition:all .5s cubic-bezier(.34,1.56,.64,1); filter:drop-shadow(0 6px 16px rgba(0,0,0,.18)); }
        @media(min-width:1024px){.mascot-divider{display:block;}}
        .mascot-container { text-align:center; transition:all .5s; }
        .mascot-body { width:100px; height:110px; display:flex; align-items:center; justify-content:center; margin:0 auto 6px; transition:transform .3s; }
        .mascot-celebrate .mascot-body { animation:mascot-jump .5s ease infinite; }
        .mascot-loading .mascot-body { animation:mascot-wobble .6s ease infinite; }
        .mascot-speech { position:relative; background:linear-gradient(135deg,#fff,#fff5eb); padding:6px 14px; border-radius:12px; font-size:12px; font-weight:600; color:#1f2937; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,.1); border:1px solid rgba(249,115,22,.15); }
        .speech-arrow { position:absolute; top:-6px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-bottom:6px solid #fff; }
        .wing-wave { animation:wingWave .4s ease infinite alternate; transform-origin:80px 50px; }
        @keyframes wingWave { 0%{transform:rotate(0deg)} 100%{transform:rotate(-20deg)} }

        /* FLOATING */
        .floating-shapes { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
        .floating-shape { position:absolute; border-radius:50%; background:rgba(255,255,255,.08); animation:float-around linear infinite; }
        .shape-0{width:60px;height:60px;border-radius:12px;transform:rotate(45deg)} .shape-1{width:40px;height:40px} .shape-2{width:80px;height:80px;border-radius:16px} .shape-3{width:30px;height:30px} .shape-4{width:50px;height:50px;border-radius:10px;transform:rotate(30deg)}

        /* AUTH */
        .auth-panel { width:100%; display:flex; align-items:center; justify-content:center; padding:2rem; }
        @media(min-width:1024px){.auth-panel{width:50%;}}
        .auth-container { width:100%; max-width:420px; }
        .auth-card { border:none!important; box-shadow:0 4px 32px rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.04)!important; border-radius:16px!important; overflow:hidden; }

        .input-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:hsl(var(--muted-foreground)); transition:color .2s; z-index:1; }
        .group:focus-within .input-icon { color:hsl(var(--primary)); }

        .auth-input { padding-left:40px!important; height:42px!important; border-radius:10px!important; transition:all .2s!important; border:1.5px solid hsl(var(--border))!important; }
        .auth-input:focus { border-color:hsl(var(--primary))!important; box-shadow:0 0 0 3px hsl(var(--primary)/.1)!important; }

        .auth-button { width:100%; height:44px!important; border-radius:10px!important; font-weight:600!important; font-size:15px!important; background:linear-gradient(135deg,#f97316,#ea580c)!important; color:white!important; border:none!important; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .3s!important; position:relative; overflow:hidden; }
        .auth-button:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(249,115,22,.4); }
        .auth-button:active:not(:disabled) { transform:translateY(0); }
        .auth-button:disabled { opacity:.7; }

        .alt-auth-link { width:100%; display:flex; align-items:center; justify-content:center; gap:6px; padding-top:4px; font-size:13px; color:hsl(var(--primary)); transition:all .2s; background:none; border:none; cursor:pointer; }
        .alt-auth-link:hover { text-decoration:underline; }
        .back-link { display:flex; align-items:center; gap:4px; font-size:13px; color:hsl(var(--muted-foreground)); background:none; border:none; cursor:pointer; transition:color .2s; }
        .back-link:hover { color:hsl(var(--foreground)); }

        /* OTP */
        .otp-header { text-align:center; }
        .otp-icon-wrapper { width:56px; height:56px; border-radius:16px; background:hsl(var(--primary)/.1); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; }
        .otp-input { width:48px!important; height:56px!important; text-align:center; font-size:22px; font-weight:700; border:2px solid hsl(var(--border)); border-radius:12px; background:hsl(var(--background)); color:hsl(var(--foreground)); outline:none; transition:all .2s; caret-color:hsl(var(--primary)); }
        .otp-input:focus { border-color:hsl(var(--primary)); box-shadow:0 0 0 3px hsl(var(--primary)/.15); transform:translateY(-2px); }
        .otp-filled { border-color:hsl(var(--primary)); background:hsl(var(--primary)/.05); }

        .error-alert { margin-bottom:16px; padding:12px; background:hsl(var(--destructive)/.08); border:1px solid hsl(var(--destructive)/.2); border-radius:10px; display:flex; align-items:center; gap:8px; color:hsl(var(--destructive)); font-size:13px; }
        .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .6s linear infinite; display:inline-block; }

        /* CONFETTI */
        .confetti-container { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:9999; overflow:hidden; }
        .confetti-piece { position:absolute; top:-10px; width:10px; height:10px; border-radius:2px; animation:confetti-fall 3s ease-out forwards; }

        /* ANIMATIONS */
        @keyframes float-around { 0%,100%{transform:translate(0,0) rotate(0);opacity:.6} 25%{transform:translate(50px,-80px) rotate(90deg);opacity:.4} 50%{transform:translate(-30px,-160px) rotate(180deg);opacity:.8} 75%{transform:translate(60px,-80px) rotate(270deg);opacity:.5} }
        @keyframes confetti-fall { 0%{transform:translateY(-10px) rotate(0) scale(1);opacity:1} 100%{transform:translateY(100vh) rotate(720deg) scale(.3);opacity:0} }
        @keyframes mascot-jump { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes mascot-wobble { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .animate-fade-in { animation:fadeIn .3s ease-out; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .animate-slide-in { animation:slideIn .5s ease-out both; }
        @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        .animate-shake { animation:shake .4s ease-out; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        .animate-float { animation:floatBadge 3s ease-in-out infinite; }
        @keyframes floatBadge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .animate-pulse-slow { animation:pulseSlow 3s ease-in-out infinite; }
        @keyframes pulseSlow { 0%,100%{opacity:1} 50%{opacity:.7} }
        .animate-bounce-slow { animation:bounceSlow 2s ease-in-out infinite; }
        @keyframes bounceSlow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
};
