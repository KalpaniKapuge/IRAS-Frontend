import { z } from "zod";

// Mirrors the backend's actual password rule (RegisterRequest: [MinLength(8)]) plus a
// couple of client-side-only strength requirements surfaced via PASSWORD_RULES below —
// the backend is still the source of truth and is re-validated on submit regardless.
const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .min(8, "Use at least 8 characters.");

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    role: z.enum(["Candidate", "Employer"]),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    companyName: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }

    if (data.role === "Candidate") {
      if (!data.firstName?.trim())
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "First name is required.", path: ["firstName"] });
      if (!data.lastName?.trim())
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Last name is required.", path: ["lastName"] });
    } else {
      if (!data.companyName?.trim())
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Company name is required.", path: ["companyName"] });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Drives the live password-strength checklist on the register form.
export const PASSWORD_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "At least one letter", test: (v) => /[a-zA-Z]/.test(v) },
  { label: "At least one number", test: (v) => /[0-9]/.test(v) },
];

/** Flattens a Zod safeParse failure into the same `{ field: message }` shape the
 *  backend's mapped field errors use, so both sources render through one code path. */
export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) result[key] = issue.message;
  }
  return result;
}
