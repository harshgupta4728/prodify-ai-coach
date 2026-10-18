import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { AlertCircle, ArrowLeft, CalendarCheck, Code2, Eye, EyeOff, Flame, Loader2, Mail } from "lucide-react";
import { apiService, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/common/Logo";

interface LoginFormProps {
  onLogin: (userData: User) => void;
}

// A short terminal session that shows what Prodify is about (decorative)
const TerminalDemo = () => (
  <div className="rounded-lg border bg-card font-mono text-[13px] leading-6 shadow-2xl shadow-black/50" aria-hidden="true">
    <div className="flex items-center gap-1.5 border-b px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
      <span className="ml-2 text-xs text-muted-foreground">~/prodify</span>
    </div>
    <div className="px-4 py-3">
      <p><span className="text-primary">$</span> prodify today</p>
      <p className="text-muted-foreground">  Product of Array Except Self · <span className="text-warning">medium</span></p>
      <p className="mt-2"><span className="text-primary">$</span> prodify submit solution.py</p>
      <p className="text-muted-foreground">  running 3 test cases...</p>
      <p className="text-success">  ✓ Accepted · 3/3 passed</p>
      <p className="mt-2"><span className="text-primary">$</span> prodify streak</p>
      <p className="text-muted-foreground">  12 days in a row · best 21</p>
      <p className="mt-2 flex items-center gap-2">
        <span className="text-primary">$</span>
        <span className="inline-block h-4 w-2 animate-caret-blink bg-primary" />
      </p>
    </div>
  </div>
);

const FEATURES = [
  { icon: Code2, text: "A real editor: Python, JavaScript, C++, Java, C#, Go and Rust" },
  { icon: Flame, text: "Streaks and a GitHub-style activity graph" },
  { icon: CalendarCheck, text: "A planner and focus timer for your prep" },
];

// Password input with a show/hide toggle
const PasswordInput = ({ id, value, onChange, placeholder, autoComplete, disabled }: {
  id: string; value: string; onChange: (value: string) => void;
  placeholder: string; autoComplete: string; disabled: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={visible ? "text" : "password"} placeholder={placeholder} className="pr-10"
        value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required disabled={disabled} />
      <button type="button" onClick={() => setVisible(!visible)} tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground">
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

// Six code boxes; pasting or autofilling the whole code fills every box
const OtpBoxes = ({ value, onChange, onComplete, disabled }: {
  value: string; onChange: (value: string) => void; onComplete: (code: string) => void; disabled: boolean;
}) => (
  <InputOTP maxLength={6} value={value} onChange={onChange} onComplete={onComplete}
    pattern={REGEXP_ONLY_DIGITS} pasteTransformer={(text) => text.replace(/\D/g, "")}
    inputMode="numeric" autoComplete="one-time-code" autoFocus disabled={disabled}>
    <InputOTPGroup>
      {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
    </InputOTPGroup>
  </InputOTP>
);

const Spinner = () => <Loader2 className="h-4 w-4 animate-spin" />;

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDone, setIsDone] = useState(false);

  // Login state
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginOtpStep, setLoginOtpStep] = useState<"email" | "otp">("email");
  const [loginOtpEmail, setLoginOtpEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");

  // Signup state
  const [signupStep, setSignupStep] = useState<"form" | "otp">("form");
  const [signupData, setSignupData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [signupOtp, setSignupOtp] = useState("");

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Typing again clears the last error
  const clearError = () => { if (error) setError(""); };

  const finishLogin = useCallback((user: User, token: string, title: string, description: string) => {
    apiService.setToken(token);
    setIsDone(true);
    toast({ title, description });
    setTimeout(() => onLogin(user), 500);
  }, [onLogin, toast]);

  // Signup handlers
  const handleSendSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (signupData.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (signupData.password !== signupData.confirmPassword) { setError("Passwords do not match."); return; }
    setIsLoading(true);
    try {
      await apiService.sendOtp({ email: signupData.email, purpose: "signup" });
      setSignupOtp(""); setSignupStep("otp"); setCooldown(60);
      toast({ title: "Code sent", description: `Check your inbox at ${signupData.email}` });
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to send OTP"); }
    finally { setIsLoading(false); }
  };

  const verifySignup = async (code: string) => {
    if (code.length !== 6 || isLoading || isDone) return;
    setIsLoading(true); setError("");
    try {
      const response = await apiService.signup({
        name: signupData.name, email: signupData.email, password: signupData.password, otp: code,
      });
      finishLogin(response.user, response.token, "Account created", "Welcome to Prodify.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      setSignupOtp("");
    } finally { setIsLoading(false); }
  };

  const handleResendSignupOtp = async () => {
    if (cooldown > 0) return; setIsLoading(true); setError("");
    try {
      await apiService.sendOtp({ email: signupData.email, purpose: "signup" });
      setCooldown(60); setSignupOtp("");
      toast({ title: "New code sent", description: `Check your inbox at ${signupData.email}` });
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to resend OTP"); }
    finally { setIsLoading(false); }
  };

  // Login handlers
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError("");
    try {
      const response = await apiService.signin(loginData);
      finishLogin(response.user, response.token, "Logged in", "Welcome back to Prodify.");
    } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setIsLoading(false); }
  };

  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError("");
    try {
      await apiService.sendOtp({ email: loginOtpEmail, purpose: "signin" });
      setLoginOtp(""); setLoginOtpStep("otp"); setCooldown(60);
      toast({ title: "Code sent", description: `Check your inbox at ${loginOtpEmail}` });
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to send OTP"); }
    finally { setIsLoading(false); }
  };

  const verifyLoginOtp = async (code: string) => {
    if (code.length !== 6 || isLoading || isDone) return;
    setIsLoading(true); setError("");
    try {
      const response = await apiService.signinWithOtp({ email: loginOtpEmail, otp: code });
      finishLogin(response.user, response.token, "Logged in", "Welcome back to Prodify.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoginOtp("");
    } finally { setIsLoading(false); }
  };

  const handleResendLoginOtp = async () => {
    if (cooldown > 0) return; setIsLoading(true); setError("");
    try {
      await apiService.sendOtp({ email: loginOtpEmail, purpose: "signin" });
      setCooldown(60); setLoginOtp("");
      toast({ title: "New code sent", description: `Check your inbox at ${loginOtpEmail}` });
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to resend OTP"); }
    finally { setIsLoading(false); }
  };

  // Switch to "sign in with a code", carrying over the email already typed
  const switchToOtpLogin = () => {
    setLoginMode("otp"); setLoginOtpStep("email"); setError("");
    if (!loginOtpEmail) setLoginOtpEmail(loginData.email);
  };

  const handleTabChange = (value: string) => {
    setTab(value as "login" | "signup");
    setError(""); setSignupStep("form"); setLoginOtpStep("email");
    setSignupOtp(""); setLoginOtp("");
  };

  // "Account already exists" on sign-up: offer to log in with the same email
  const goToLogin = () => {
    setLoginData({ email: signupData.email, password: "" });
    setLoginOtpEmail(signupData.email);
    setLoginMode("password");
    handleTabChange("login");
  };

  const errorAlert = error ? (
    <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1">{error}</span>
      {tab === "signup" && /already exists/i.test(error) && (
        <button type="button" className="whitespace-nowrap font-medium underline underline-offset-2" onClick={goToLogin}>Log in instead</button>
      )}
    </div>
  ) : null;

  const codeHeader = (email: string) => (
    <div className="space-y-1 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
        <Mail className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to</p>
      <p className="break-all font-mono text-sm font-medium">{email}</p>
    </div>
  );

  const resendLine = (onResend: () => void) => (
    <div className="space-y-1 text-center text-sm">
      {cooldown > 0 ? (
        <p className="text-muted-foreground">Didn't get it? Resend in <span className="font-mono text-foreground">{cooldown}s</span></p>
      ) : (
        <button type="button" className="font-medium text-primary hover:underline" onClick={onResend} disabled={isLoading}>Resend code</button>
      )}
      <p className="text-xs text-muted-foreground">Check your spam folder too. You can paste the whole code.</p>
    </div>
  );

  const backLink = (label: string, onClick: () => void) => (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-3.5 w-3.5" /> {label}
    </button>
  );

  const title = isDone ? "You're in" : tab === "signup" ? "Create your account" : "Welcome back";
  const subtitle = isDone
    ? "Opening your dashboard..."
    : tab === "signup" ? "Start a daily practice habit. It's free." : "Log in to continue your practice.";

  return (
    <div className="grid min-h-[100dvh] bg-background lg:grid-cols-2">
      {/* Left: what Prodify is (large screens only) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-dots p-10 lg:flex xl:p-14">
        <Logo />
        <div className="max-w-lg space-y-8">
          <div className="space-y-3">
            <p className="eyebrow">Daily DSA practice</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              One problem a day.<br />Every day.
            </h1>
            <p className="text-muted-foreground">
              Solve problems in a real code editor, keep your streak alive, and plan your interview prep in one place.
            </p>
          </div>
          <TerminalDemo />
          <ul className="space-y-3 text-sm">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-muted-foreground">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-card">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="font-mono text-xs text-muted-foreground">50+ problems · 15 topics · free</p>
      </aside>

      {/* Right: the form */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden"><Logo /></div>

          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

          <Tabs value={tab} className="mt-6 w-full" onValueChange={handleTabChange}>
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="login" disabled={isDone}>Log in</TabsTrigger>
              <TabsTrigger value="signup" disabled={isDone}>Sign up</TabsTrigger>
            </TabsList>

            {/* LOG IN */}
            <TabsContent value="login" className="mt-0">
              {errorAlert}
              {loginMode === "password" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" autoComplete="email"
                      value={loginData.email} onChange={(e) => { clearError(); setLoginData({ ...loginData, email: e.target.value }); }}
                      required disabled={isLoading || isDone} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={switchToOtpLogin}>Forgot password?</button>
                    </div>
                    <PasswordInput id="password" placeholder="Your password" autoComplete="current-password"
                      value={loginData.password} onChange={(v) => { clearError(); setLoginData({ ...loginData, password: v }); }} disabled={isLoading || isDone} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || isDone}>
                    {isLoading || isDone ? <><Spinner /> {isDone ? "Opening dashboard..." : "Logging in..."}</> : "Log in"}
                  </Button>
                  <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={switchToOtpLogin}>
                    Email me a login code instead
                  </button>
                </form>
              ) : loginOtpStep === "email" ? (
                <form onSubmit={handleSendLoginOtp} className="space-y-4">
                  <p className="text-sm text-muted-foreground">We'll email you a 6-digit code. No password needed.</p>
                  <div className="space-y-2">
                    <Label htmlFor="otp-email">Email</Label>
                    <Input id="otp-email" type="email" placeholder="you@example.com" autoComplete="email"
                      value={loginOtpEmail} onChange={(e) => { clearError(); setLoginOtpEmail(e.target.value); }} required disabled={isLoading} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Spinner /> Sending...</> : "Send code"}
                  </Button>
                  <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => { setLoginMode("password"); setError(""); setLoginOtpStep("email"); }}>
                    Log in with a password instead
                  </button>
                </form>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); verifyLoginOtp(loginOtp); }} className="space-y-5">
                  {backLink("Change email", () => { setLoginOtpStep("email"); setError(""); setLoginOtp(""); })}
                  {codeHeader(loginOtpEmail)}
                  <div className="flex justify-center">
                    <OtpBoxes value={loginOtp} onChange={(v) => { clearError(); setLoginOtp(v); }} onComplete={verifyLoginOtp} disabled={isLoading || isDone} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || isDone || loginOtp.length !== 6}>
                    {isLoading || isDone ? <><Spinner /> {isDone ? "Opening dashboard..." : "Verifying..."}</> : "Verify and log in"}
                  </Button>
                  {resendLine(handleResendLoginOtp)}
                </form>
              )}
            </TabsContent>

            {/* SIGN UP */}
            <TabsContent value="signup" className="mt-0">
              {errorAlert}
              {signupStep === "form" ? (
                <form onSubmit={handleSendSignupOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input id="signup-name" type="text" placeholder="Your full name" autoComplete="name"
                      value={signupData.name} onChange={(e) => { clearError(); setSignupData({ ...signupData, name: e.target.value }); }} required disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" autoComplete="email"
                      value={signupData.email} onChange={(e) => { clearError(); setSignupData({ ...signupData, email: e.target.value }); }} required disabled={isLoading} />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <PasswordInput id="signup-password" placeholder="8+ characters" autoComplete="new-password"
                        value={signupData.password} onChange={(v) => { clearError(); setSignupData({ ...signupData, password: v }); }} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm</Label>
                      <PasswordInput id="signup-confirm-password" placeholder="Repeat it" autoComplete="new-password"
                        value={signupData.confirmPassword} onChange={(v) => { clearError(); setSignupData({ ...signupData, confirmPassword: v }); }} disabled={isLoading} />
                    </div>
                  </div>
                  {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                    <p className="text-xs text-destructive">Passwords don't match yet.</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Spinner /> Sending code...</> : "Send code"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">We'll email you a code to confirm your address.</p>
                </form>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); verifySignup(signupOtp); }} className="space-y-5">
                  {backLink("Edit details", () => { setSignupStep("form"); setError(""); setSignupOtp(""); })}
                  {codeHeader(signupData.email)}
                  <div className="flex justify-center">
                    <OtpBoxes value={signupOtp} onChange={(v) => { clearError(); setSignupOtp(v); }} onComplete={verifySignup} disabled={isLoading || isDone} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || isDone || signupOtp.length !== 6}>
                    {isLoading || isDone ? <><Spinner /> {isDone ? "Opening dashboard..." : "Creating account..."}</> : "Verify and create account"}
                  </Button>
                  {resendLine(handleResendSignupOtp)}
                </form>
              )}
            </TabsContent>
          </Tabs>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
          {import.meta.env.DEV && (
            // Only shown by `npm run dev`: the local backend uses the practice database
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Local test copy: accounts here are separate from the live site.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};
