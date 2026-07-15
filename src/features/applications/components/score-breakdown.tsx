import { ScoreBar } from "@/components/shared/score-bar";
import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/utils";
import type { SkillGapDto } from "../types";

interface ScoreBreakdownProps {
  totalScore: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  semanticSimilarity: number;
  skillGaps: SkillGapDto[];
}

export function ScoreBreakdown({
  totalScore,
  skillMatch,
  experienceMatch,
  educationMatch,
  semanticSimilarity,
  skillGaps,
}: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      <ScoreBar value={totalScore} label="Overall match score" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <ScoreBar value={skillMatch} label="Skill match" />
        <ScoreBar value={experienceMatch} label="Experience" />
        <ScoreBar value={educationMatch} label="Education" />
        <ScoreBar value={semanticSimilarity} label="Resume relevance" />
      </div>

      {skillGaps.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skill gaps</p>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((gap) => (
              <Badge key={gap.skillId} variant={gap.importance === "MustHave" ? "destructive" : "muted"}>
                {gap.skillName}
                <span className="opacity-70">· {titleCase(gap.importance)}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
