import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, UserPlus } from "lucide-react";
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
import { AuthLayout } from "../components/auth-layout";
import { FieldError } from "../components/field-error";
import { PasswordStrength } from "../components/password-strength";
import { flattenZodErrors, registerSchema } from "../validation";

type FormRole = Extract<UserRole, "Candidate" | "Employer">;

export function RegisterPage() {
  const register = useAuthStore((s) => s.register);
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
      toast.success("Account created — welcome to IRAS!");
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

  return (
    <AuthLayout title="Create your account" description="Get started with intelligent, transparent recruitment.">
      <Tabs value={role} onValueChange={handleRoleChange} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Candidate">I'm a Candidate</TabsTrigger>
          <TabsTrigger value="Employer">I'm an Employer</TabsTrigger>
        </TabsList>
      </Tabs>

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

        {role === "Candidate" ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                aria-invalid={!!fieldErrors.firstName}
                className={fieldErrors.firstName ? "border-destructive focus-visible:ring-destructive" : undefined}
              />
              <FieldError message={fieldErrors.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                aria-invalid={!!fieldErrors.lastName}
                className={fieldErrors.lastName ? "border-destructive focus-visible:ring-destructive" : undefined}
              />
              <FieldError message={fieldErrors.lastName} />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              aria-invalid={!!fieldErrors.companyName}
              className={fieldErrors.companyName ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            <FieldError message={fieldErrors.companyName} />
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
            className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : undefined}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            aria-invalid={!!fieldErrors.password}
            className={fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : undefined}
          />
          <FieldError message={fieldErrors.password} />
          <PasswordStrength password={password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            aria-invalid={!!fieldErrors.confirmPassword}
            className={fieldErrors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : undefined}
          />
          <FieldError message={fieldErrors.confirmPassword} />
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          <UserPlus className="h-4 w-4" /> Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
