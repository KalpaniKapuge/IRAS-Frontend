import { Badge, type BadgeProps } from "@/components/ui/badge";
import { ENUM_TONE_MAPS, type BadgeTone } from "@/types/enums";
import { titleCase } from "@/lib/utils";

const toneToVariant: Record<BadgeTone, BadgeProps["variant"]> = {
  default: "default",
  primary: "default",
  success: "success",
  warning: "warning",
  destructive: "destructive",
  info: "info",
  muted: "muted",
};

interface StatusBadgeProps {
  enumName: keyof typeof ENUM_TONE_MAPS;
  value: string;
  className?: string;
}

/** Renders any backend status enum (ApplicationStatus, JobStatus, ...) as a colored, human-readable badge. */
export function StatusBadge({ enumName, value, className }: StatusBadgeProps) {
  const toneMap = ENUM_TONE_MAPS[enumName] as Record<string, BadgeTone>;
  const tone = toneMap[value] ?? "muted";
  return (
    <Badge variant={toneToVariant[tone]} className={className}>
      {titleCase(value)}
    </Badge>
  );
}
