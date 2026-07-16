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
    <div className="space-y-5">
      <div className="rounded-lg border border-border/80 bg-background/70 p-4">
        <ScoreBar value={totalScore} label="Overall match score" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border/80 bg-background/70 p-4">
          <ScoreBar value={skillMatch} label="Skill match" />
        </div>
        <div className="rounded-lg border border-border/80 bg-background/70 p-4">
          <ScoreBar value={experienceMatch} label="Experience" />
        </div>
        <div className="rounded-lg border border-border/80 bg-background/70 p-4">
          <ScoreBar value={educationMatch} label="Education" />
        </div>
        <div className="rounded-lg border border-border/80 bg-background/70 p-4">
          <ScoreBar value={semanticSimilarity} label="Resume relevance" />
        </div>
      </div>

      {skillGaps.length > 0 && (
        <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Skill gaps to improve</p>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((gap) => (
              <Badge key={gap.skillId} variant={gap.importance === "MustHave" ? "destructive" : "muted"}>
                {gap.skillName}
                <span className="opacity-70">- {titleCase(gap.importance)}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
