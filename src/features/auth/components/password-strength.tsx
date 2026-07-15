import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PASSWORD_RULES } from "../validation";

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  return (
    <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-3">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              passed ? "text-success" : "text-muted-foreground",
            )}
          >
            {passed ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0 opacity-40" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
