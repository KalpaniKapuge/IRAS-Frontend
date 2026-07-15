import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store";
import { ROLE_HOME } from "@/config/nav";
import { ApiError } from "@/types/common";
import { AuthLayout } from "../components/auth-layout";
import { FieldError } from "../components/field-error";
import { loginSchema, flattenZodErrors } from "../validation";

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

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

  return (
    <AuthLayout title="Welcome back" description="Sign in to continue to your IRAS dashboard.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : undefined}
          />
          {fieldErrors.email && <span id="email-error"><FieldError message={fieldErrors.email} /></span>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className={fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : undefined}
          />
          {fieldErrors.password && <span id="password-error"><FieldError message={fieldErrors.password} /></span>}
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          <LogIn className="h-4 w-4" /> Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
