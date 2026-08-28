import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/utils";
import type { SkillResourceDto } from "../types";

// Shared between the Skill Gaps page and the Skill Plan detail page — one place that
// renders "here are the curated resources for this skill" so the two surfaces can't drift
// out of sync with each other.
export function ResourceLinksList({ resources }: { resources: SkillResourceDto[] }) {
  if (resources.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {resources.map((r) => (
        <a
          key={r.resourceId}
          href={r.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{r.title}</span>
          <Badge variant="muted" className="ml-auto shrink-0">{titleCase(r.resourceType)}</Badge>
        </a>
      ))}
    </div>
  );
}
