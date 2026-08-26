import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, ExternalLink, Target, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { ApiError } from "@/types/common";
import { useAuthStore } from "@/features/auth/store";
import { skillResourcesApi } from "@/features/skill-resources/api";
import type { SkillResourceDto } from "@/features/skill-resources/types";
import { skillGapsApi } from "../api";
import type { CandidateSkillGapDto, SkillGapSummaryDto, TargetSkillDto } from "../types";

export function SkillGapsPage() {
  const candidateId = useAuthStore((s) => s.user!.userId);
  const [summary, setSummary] = useState<SkillGapSummaryDto[] | null>(null);
  const [details, setDetails] = useState<CandidateSkillGapDto[] | null>(null);
  const [resources, setResources] = useState<SkillResourceDto[]>([]);
  const [targetSkills, setTargetSkills] = useState<TargetSkillDto[] | null>(null);

  const loadTargetSkills = () => skillGapsApi.getMyTargetSkills(candidateId).then(setTargetSkills);

  useEffect(() => {
    skillGapsApi.getMySummary(candidateId).then(setSummary);
    skillGapsApi.getMine(candidateId).then(setDetails);
    skillResourcesApi.getAll().then((all) => setResources(all.filter((r) => r.isActive)));
    loadTargetSkills();
  }, [candidateId]);

  const maxOccurrences = Math.max(1, ...(summary?.map((s) => s.totalOccurrences) ?? [1]));
  const resourcesForSkill = (skillId: number) => resources.filter((r) => r.skillId === skillId);
  const targetStatus = (skillId: number) => targetSkills?.find((t) => t.skillId === skillId)?.status;

  const handleTrack = async (skillId: number) => {
    try {
      await skillGapsApi.addTargetSkill(candidateId, skillId);
      toast.success("Added to your learning list.");
      loadTargetSkills();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to track skill.");
    }
  };

  const handleComplete = async (skillId: number) => {
    try {
      await skillGapsApi.completeTargetSkill(candidateId, skillId);
      toast.success("Marked as learned — nice work.");
      loadTargetSkills();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update skill.");
    }
  };

  const handleRemove = async (skillId: number) => {
    try {
      await skillGapsApi.removeTargetSkill(candidateId, skillId);
      loadTargetSkills();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove skill.");
    }
  };

  const renderResources = (skillId: number) => {
    const items = resourcesForSkill(skillId);
    if (items.length === 0) return null;
    return (
      <div className="space-y-1.5 border-t border-border pt-2">
        {items.map((r) => (
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
  };

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
          <TabsTrigger value="learning">My Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          {summary === null ? (
            <RowSkeletonList count={4} />
          ) : summary.length === 0 ? (
            <EmptyState icon={Target} title="No skill gaps detected" description="Apply to jobs to see which skills would improve your match rate." />
          ) : (
            <div className="space-y-3">
              {summary.map((gap) => {
                const status = targetStatus(gap.skillId);
                return (
                  <Card key={gap.skillId}>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{gap.skillName}</p>
                        <div className="flex items-center gap-2">
                          {gap.mustHaveCount > 0 && <Badge variant="destructive">{gap.mustHaveCount} must-have</Badge>}
                          {gap.niceToHaveCount > 0 && <Badge variant="muted">{gap.niceToHaveCount} nice-to-have</Badge>}
                          {status ? (
                            <Badge variant={status === "Completed" ? "success" : "warning"}>
                              {status === "Completed" ? "Learned" : "Learning"}
                            </Badge>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleTrack(gap.skillId)}>
                              Track this skill
                            </Button>
                          )}
                        </div>
                      </div>
                      <Progress value={(gap.totalOccurrences / maxOccurrences) * 100} />
                      {renderResources(gap.skillId)}
                    </CardContent>
                  </Card>
                );
              })}
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

        <TabsContent value="learning">
          {targetSkills === null ? (
            <RowSkeletonList count={3} />
          ) : targetSkills.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Not tracking any skills yet"
              description="Click 'Track this skill' on any gap in the By Skill tab to start building a learning path."
            />
          ) : (
            <div className="space-y-3">
              {targetSkills.map((target) => (
                <Card key={target.skillId}>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{target.skillName}</p>
                        <Badge variant={target.status === "Completed" ? "success" : "warning"}>
                          {target.status === "Completed" ? "Learned" : "Learning"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {target.status !== "Completed" && (
                          <Button size="sm" variant="outline" onClick={() => handleComplete(target.skillId)}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark as learned
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleRemove(target.skillId)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added {formatDate(target.addedAt)}
                      {target.completedAt ? ` · Completed ${formatDate(target.completedAt)}` : ""}
                    </p>
                    {renderResources(target.skillId)}
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
