import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, Building2, Lock, Mail, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/features/auth/store";
import { ROLE_HOME } from "@/config/nav";
import { ApiError } from "@/types/common";
import type { UserRole } from "@/types/enums";
import { mapBackendFieldErrors } from "@/lib/field-errors";
import { sanitizeName } from "@/lib/validation";
import { useEnterKeyNav } from "@/hooks/use-enter-key-navigation";
import { FieldError } from "@/components/shared/field-error";
import { cn } from "@/lib/utils";
import { AuthLayout } from "../components/auth-layout";
import { InputIcon } from "../components/input-icon";
import { SocialAuth } from "../components/social-auth";
import { PasswordStrength } from "../components/password-strength";
import { flattenZodErrors, registerSchema } from "../validation";

type FormRole = Extract<UserRole, "Candidate" | "Employer">;

export function RegisterPage() {
  const register = useAuthStore((s) => s.register);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  const [role, setRole] = useState<FormRole>("Candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { ref, onKeyDown, onFocus } = useEnterKeyNav<HTMLFormElement>();

  const handleRoleChange = (value: string) => {
    setRole(value as FormRole);
    setFieldErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; 
    setFormError(null);
    setFieldErrors({});

    const parsed = registerSchema.safeParse({
      role,
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      companyName,
    });
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error));
      return;
    }

    try {
      await register({
        email: parsed.data.email,
        password: parsed.data.password,
        role,
        firstName: role === "Candidate" ? parsed.data.firstName : undefined,
        lastName: role === "Candidate" ? parsed.data.lastName : undefined,
        companyName: role === "Employer" ? parsed.data.companyName : undefined,
      });
      const user = useAuthStore.getState().user;
      navigate(user ? ROLE_HOME[user.role] : "/", { replace: true });
      toast.success("Account created — welcome to Merito!");
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setFormError("Registration failed. Please try again.");
        return;
      }

      const mapped = mapBackendFieldErrors(err.fieldErrors);
      if (Object.keys(mapped).length > 0) {
        setFieldErrors(mapped);
        return;
      }

     
      if (/email/i.test(err.message)) {
        setFieldErrors({ email: err.message });
        return;
      }

      setFormError(err.message);
    }
  };

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      setFormError(null);
      try {
        await loginWithGoogle({ idToken, role });
        const user = useAuthStore.getState().user;
        navigate(user ? ROLE_HOME[user.role] : "/", { replace: true });
        toast.success("Signed in with Google.");
      } catch (err) {
        setFormError(err instanceof ApiError ? err.message : "Google sign-in failed. Please try again.");
      }
    },
    [loginWithGoogle, navigate, role],
  );

  return (
    <AuthLayout
      title="Create your account"
      description="Get started with intelligent, transparent recruitment."
      panelHeadline="Recruit with confidence"
      panelDescription="Merito reads every résumé, ranks every applicant, and shows you exactly why — so hiring decisions are fast and defensible."
      panelPoints={["Automated résumé parsing", "Explainable candidate ranking", "Skill-gap analysis built in"]}
    >
      <Tabs value={role} onValueChange={handleRoleChange} className="mb-6">
        <TabsList className="grid h-12 w-full grid-cols-2 rounded-full p-1.5">
          <TabsTrigger value="Candidate" className="rounded-full font-semibold data-[state=active]:shadow-elevated">
            I'm a Candidate
          </TabsTrigger>
          <TabsTrigger value="Employer" className="rounded-full font-semibold data-[state=active]:shadow-elevated">
            I'm an Employer
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-6">
        <SocialAuth
          action="Sign up"
          onGoogleCredential={handleGoogleCredential}
          note={`Continue with Google to join as ${role === "Employer" ? "an employer" : "a candidate"}.`}
          busy={isLoading}
        />
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

        {role === "Candidate" ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <div className="relative">
                <InputIcon icon={User} />
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(sanitizeName(e.target.value))}
                  maxLength={60}
                  aria-invalid={!!fieldErrors.firstName}
                  className={cn("h-12 rounded-full pl-10", fieldErrors.firstName && "border-destructive focus-visible:ring-destructive")}
                />
              </div>
              <FieldError message={fieldErrors.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <div className="relative">
                <InputIcon icon={User} />
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(sanitizeName(e.target.value))}
                  maxLength={60}
                  aria-invalid={!!fieldErrors.lastName}
                  className={cn("h-12 rounded-full pl-10", fieldErrors.lastName && "border-destructive focus-visible:ring-destructive")}
                />
              </div>
              <FieldError message={fieldErrors.lastName} />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <div className="relative">
              <InputIcon icon={Building2} />
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={150}
                aria-invalid={!!fieldErrors.companyName}
                className={cn("h-12 rounded-full pl-10", fieldErrors.companyName && "border-destructive focus-visible:ring-destructive")}
              />
            </div>
            <FieldError message={fieldErrors.companyName} />
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
              className={cn("h-12 rounded-full pl-10", fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
            />
          </div>
          <FieldError message={fieldErrors.email} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <InputIcon icon={Lock} />
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              aria-invalid={!!fieldErrors.password}
              className={cn("h-12 rounded-full pl-10", fieldErrors.password && "border-destructive focus-visible:ring-destructive")}
            />
          </div>
          <FieldError message={fieldErrors.password} />
          <PasswordStrength password={password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <InputIcon icon={Lock} />
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              aria-invalid={!!fieldErrors.confirmPassword}
              className={cn("h-12 rounded-full pl-10", fieldErrors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
            />
          </div>
          <FieldError message={fieldErrors.confirmPassword} />
        </div>

        <Button type="submit" className="h-12 w-full rounded-full" loading={isLoading}>
          <UserPlus className="h-4 w-4" /> Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
