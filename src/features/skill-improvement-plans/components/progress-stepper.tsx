import { ArrowRight, Check } from "lucide-react";
import { cn, titleCase } from "@/lib/utils";
import { CANDIDATE_SETTABLE_PLAN_STATUSES } from "@/types/enums";

// Renders "Not Started -> Learning -> Practicing -> Partially Completed -> Completed" as
// clickable stage buttons connected by arrows, matching the roadmap diagram directly —
// deliberately not a dropdown/combobox, so every stage the candidate can move to is always
// visible at a glance instead of hidden behind a click-to-open control.
export function ProgressStepper({
  status,
  onSelect,
  disabled,
}: {
  status: string;
  onSelect: (status: string) => void;
  disabled?: boolean;
}) {
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
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(stage)}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                disabled && "cursor-not-allowed opacity-60",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : isPast
                    ? "border-success/40 bg-success/10 text-success hover:border-success"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {isPast && <Check className="h-3 w-3" />}
              {titleCase(stage)}
            </button>
            {i < CANDIDATE_SETTABLE_PLAN_STATUSES.length - 1 && (
              <ArrowRight className="mx-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}
