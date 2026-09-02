import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, Lock, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store";
import { ROLE_HOME } from "@/config/nav";
import { ApiError } from "@/types/common";
import { useEnterKeyNav } from "@/hooks/use-enter-key-navigation";
import { FieldError } from "@/components/shared/field-error";
import { cn } from "@/lib/utils";
import { AuthLayout } from "../components/auth-layout";
import { InputIcon } from "../components/input-icon";
import { SocialAuth } from "../components/social-auth";
import { loginSchema, flattenZodErrors } from "../validation";

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { ref, onKeyDown, onFocus } = useEnterKeyNav<HTMLFormElement>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; 

    setFormError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error));
      return;
    }

    try {
      await login(parsed.data);
      const user = useAuthStore.getState().user;
      const redirectTo = (location.state as { from?: Location })?.from?.pathname;
      navigate(redirectTo || (user ? ROLE_HOME[user.role] : "/"), { replace: true });
      toast.success("Welcome back!");
    } catch (err) {
      
      setFormError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    }
  };

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      setFormError(null);
      try {
        await loginWithGoogle({ idToken });
        const user = useAuthStore.getState().user;
        const redirectTo = (location.state as { from?: Location })?.from?.pathname;
        navigate(redirectTo || (user ? ROLE_HOME[user.role] : "/"), { replace: true });
        toast.success("Signed in with Google.");
      } catch (err) {
        setFormError(err instanceof ApiError ? err.message : "Google sign-in failed. Please try again.");
      }
    },
    [loginWithGoogle, navigate, location.state],
  );

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to your Merito dashboard."
      panelHeadline="Pick up right where you left off"
      panelDescription="Your shortlists, rankings, and skill-gap insights are waiting — sign in to keep hiring moving."
      panelPoints={["Live application tracking", "One dashboard for every role", "Decisions you can explain"]}
    >
      <div className="mb-6">
        <SocialAuth action="Sign in" onGoogleCredential={handleGoogleCredential} busy={isLoading} />
      </div>

      <form ref={ref} onKeyDownCapture={onKeyDown} onFocus={onFocus} onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <InputIcon icon={Mail} />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className={cn("h-12 rounded-full pl-10", fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
            />
          </div>
          {fieldErrors.email && <span id="email-error"><FieldError message={fieldErrors.email} /></span>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <InputIcon icon={Lock} />
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              className={cn("h-12 rounded-full pl-10", fieldErrors.password && "border-destructive focus-visible:ring-destructive")}
            />
          </div>
          {fieldErrors.password && <span id="password-error"><FieldError message={fieldErrors.password} /></span>}
        </div>

        <Button type="submit" className="h-12 w-full rounded-full" loading={isLoading}>
          <LogIn className="h-4 w-4" /> Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
