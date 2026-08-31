import { ArrowRight, Check } from "lucide-react";
import { cn, titleCase } from "@/lib/utils";
import { CANDIDATE_SETTABLE_PLAN_STATUSES } from "@/types/enums";

// Renders "Not Started -> Learning -> Practicing -> Partially Completed -> Completed" as a
// read-only progress indicator, matching the roadmap diagram directly. Not clickable — the
// candidate can't self-report a stage their actual checklist completion doesn't back up;
// this always reflects what the backend derived from real task completion (see
// SkillImprovementPlanService.DeriveStatusFromProgress), the same way a package tracker
// shows delivery stages without letting you tap ahead to "Delivered".
export function ProgressStepper({ status }: { status: string }) {
  const currentIndex = CANDIDATE_SETTABLE_PLAN_STATUSES.indexOf(
    status as (typeof CANDIDATE_SETTABLE_PLAN_STATUSES)[number],
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      {CANDIDATE_SETTABLE_PLAN_STATUSES.map((stage, i) => {
        const isCurrent = stage === status;
        const isPast = currentIndex >= 0 && i < currentIndex;

        return (
          <div key={stage} className="flex items-center">
            <span
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : isPast
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border bg-card text-muted-foreground",
              )}
            >
              {isPast && <Check className="h-3 w-3" />}
              {titleCase(stage)}
            </span>
            {i < CANDIDATE_SETTABLE_PLAN_STATUSES.length - 1 && (
              <ArrowRight className="mx-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}
