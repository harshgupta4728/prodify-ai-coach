import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">This page doesn't exist</h1>
        <p className="mt-2 text-sm text-muted-foreground">The link may be broken, or the page may have moved.</p>
        <Button asChild className="mt-6">
          <a href="/">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </a>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;
