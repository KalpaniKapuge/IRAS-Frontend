import type { LucideIcon } from "lucide-react";

// Positions an icon inside a relatively-positioned wrapper around an <Input>/<PasswordInput>
// — pair with `className="pl-10"` on the field itself. Same pattern already used for the
// search icon in SkillPicker, just extracted here since auth forms use it on every field.
export function InputIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />;
}
