import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/features/auth/store";
import { skillGapsApi } from "../api";
import type { CandidateSkillGapDto, SkillGapSummaryDto } from "../types";

export function SkillGapsPage() {
  const candidateId = useAuthStore((s) => s.user!.userId);
  const [summary, setSummary] = useState<SkillGapSummaryDto[] | null>(null);
  const [details, setDetails] = useState<CandidateSkillGapDto[] | null>(null);

  useEffect(() => {
    skillGapsApi.getMySummary(candidateId).then(setSummary);
    skillGapsApi.getMine(candidateId).then(setDetails);
  }, [candidateId]);

  const maxOccurrences = Math.max(1, ...(summary?.map((s) => s.totalOccurrences) ?? [1]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Gaps"
        description="Skills that would strengthen your fit for the jobs you've applied to — prioritize these to grow your employability."
      />

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">By Skill</TabsTrigger>
          <TabsTrigger value="details">By Application</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          {summary === null ? (
            <RowSkeletonList count={4} />
          ) : summary.length === 0 ? (
            <EmptyState icon={Target} title="No skill gaps detected" description="Apply to jobs to see which skills would improve your match rate." />
          ) : (
            <div className="space-y-3">
              {summary.map((gap) => (
                <Card key={gap.skillId}>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{gap.skillName}</p>
                      <div className="flex gap-2">
                        {gap.mustHaveCount > 0 && <Badge variant="destructive">{gap.mustHaveCount} must-have</Badge>}
                        {gap.niceToHaveCount > 0 && <Badge variant="muted">{gap.niceToHaveCount} nice-to-have</Badge>}
                      </div>
                    </div>
                    <Progress value={(gap.totalOccurrences / maxOccurrences) * 100} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          {details === null ? (
            <RowSkeletonList count={4} />
          ) : details.length === 0 ? (
            <EmptyState icon={Target} title="No skill gaps detected yet" />
          ) : (
            <div className="space-y-3">
              {details.map((gap, i) => (
                <Card key={`${gap.jobId}-${gap.skillId}-${i}`}>
                  <CardContent className="space-y-1 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{gap.skillName}</p>
                      <Badge variant={gap.importance === "MustHave" ? "destructive" : "muted"}>
                        {gap.importance === "MustHave" ? "Must-have" : "Nice-to-have"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      For {gap.jobTitle}
                      {gap.companyName ? ` at ${gap.companyName}` : ""} · {formatDate(gap.detectedAt)}
                    </p>
                    {gap.suggestion && <p className="text-sm text-foreground/80">{gap.suggestion}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
