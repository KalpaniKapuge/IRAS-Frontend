import { Progress } from "@/components/ui/progress";
import { cn, formatScore } from "@/lib/utils";

interface ScoreBarProps {
  value: number; // 0..1
  label?: string;
  className?: string;
}

function toneFor(value: number) {
  if (value >= 0.75) return "bg-success";
  if (value >= 0.5) return "bg-primary";
  if (value >= 0.25) return "bg-warning";
  return "bg-destructive";
}

export function ScoreBar({ value, label, className }: ScoreBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{formatScore(value)}%</span>
      </div>
      <Progress value={pct} indicatorClassName={toneFor(value)} />
    </div>
  );
}
