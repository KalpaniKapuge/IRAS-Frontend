import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, Sparkles, Target, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { ApiError } from "@/types/common";
import { useAuthStore } from "@/features/auth/store";
import { skillResourcesApi } from "@/features/skill-resources/api";
import { ResourceLinksList } from "@/features/skill-resources/components/resource-links-list";
import type { SkillResourceDto } from "@/features/skill-resources/types";
import { skillImprovementPlansApi } from "@/features/skill-improvement-plans/api";
import { buildLocalSkillPlan, getLocalSkillPlans, removeLocalSkillPlan, saveLocalSkillPlan } from "@/features/skill-improvement-plans/local-plans";
import type { SkillImprovementPlanDto } from "@/features/skill-improvement-plans/types";
import { skillGapsApi } from "../api";
import type { CandidateSkillGapDto, SkillGapSummaryDto, TargetSkillDto } from "../types";

export function SkillGapsPage() {
  const candidateId = useAuthStore((s) => s.user!.userId);
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SkillGapSummaryDto[] | null>(null);
  const [details, setDetails] = useState<CandidateSkillGapDto[] | null>(null);
  const [resources, setResources] = useState<SkillResourceDto[]>([]);
  const [targetSkills, setTargetSkills] = useState<TargetSkillDto[] | null>(null);
  const [plans, setPlans] = useState<SkillImprovementPlanDto[] | null>(null);
  const [generatingSkillId, setGeneratingSkillId] = useState<number | null>(null);

  const loadTargetSkills = () => skillGapsApi.getMyTargetSkills(candidateId).then(setTargetSkills);
  const loadPlans = () =>
    skillImprovementPlansApi
      .getMine(candidateId)
      .then((remotePlans) => setPlans([...getLocalSkillPlans(candidateId), ...remotePlans]))
      .catch(() => setPlans(getLocalSkillPlans(candidateId)));

  useEffect(() => {
    skillGapsApi.getMySummary(candidateId).then(setSummary);
    skillGapsApi.getMine(candidateId).then(setDetails);
    skillResourcesApi.getAll().then((all) => setResources(all.filter((r) => r.isActive)));
    loadTargetSkills();
    loadPlans();
  }, [candidateId]);

  const maxOccurrences = Math.max(1, ...(summary?.map((s) => s.totalOccurrences) ?? [1]));
  const resourcesForSkill = (skillId: number) => resources.filter((r) => r.skillId === skillId);
  const targetStatus = (skillId: number) => targetSkills?.find((t) => t.skillId === skillId)?.status;
  const planForSkill = (skillId: number, jobId?: number) =>
    plans?.find((p) => p.skillId === skillId && (jobId == null || p.jobId === jobId || p.jobId === null));

  const handleGeneratePlan = async (params: {
    skillId: number;
    skillName: string;
    jobId?: number;
    jobTitle?: string | null;
    suggestion?: string | null;
  }) => {
    const { skillId, skillName, jobId, jobTitle, suggestion } = params;
    setGeneratingSkillId(skillId);
    try {
      const plan = await skillGapsApi.generatePlan(candidateId, skillId, jobId);
      navigate(`/candidate/skill-plans/${plan.planId}`);
    } catch (err) {
      const fallbackPlan = saveLocalSkillPlan(
        candidateId,
        buildLocalSkillPlan({ skillId, skillName, jobId, jobTitle, suggestion }),
      );
      setPlans((current) => [fallbackPlan, ...(current ?? []).filter((plan) => plan.planId !== fallbackPlan.planId)]);
      navigate(`/candidate/skill-plans/${fallbackPlan.planId}`);
    } finally {
      setGeneratingSkillId(null);
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
      removeLocalSkillPlan(candidateId, skillId);
      loadTargetSkills();
      loadPlans();
    } catch (err) {
      removeLocalSkillPlan(candidateId, skillId);
      loadPlans();
      toast.error(err instanceof ApiError ? err.message : "Failed to remove skill.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Gaps"
        description="Skills that would strengthen your fit for the jobs you've applied to — generate a full improvement plan to close any gap."
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
                const plan = planForSkill(gap.skillId);
                const status = targetStatus(gap.skillId);
                return (
                  <Card key={gap.skillId}>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{gap.skillName}</p>
                        <div className="flex items-center gap-2">
                          {gap.mustHaveCount > 0 && <Badge variant="destructive">{gap.mustHaveCount} must-have</Badge>}
                          {gap.niceToHaveCount > 0 && <Badge variant="muted">{gap.niceToHaveCount} nice-to-have</Badge>}
                          {plan ? (
                            <Button size="sm" variant="outline" onClick={() => navigate(`/candidate/skill-plans/${plan.planId}`)}>
                              View plan ({plan.progressPercent}%)
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              loading={generatingSkillId === gap.skillId}
                              disabled={generatingSkillId !== null}
                              onClick={() => handleGeneratePlan({ skillId: gap.skillId, skillName: gap.skillName })}
                            >
                              {generatingSkillId !== gap.skillId && <Sparkles className="h-3.5 w-3.5" />}
                              Generate Improvement Plan
                            </Button>
                          )}
                          {!plan && status && (
                            <Badge variant={status === "Completed" ? "success" : "warning"}>
                              {status === "Completed" ? "Learned" : "Learning"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={(gap.totalOccurrences / maxOccurrences) * 100} />
                      <ResourceLinksList resources={resourcesForSkill(gap.skillId)} />
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
              {details.map((gap, i) => {
                const plan = planForSkill(gap.skillId, gap.jobId);
                return (
                  <Card key={`${gap.jobId}-${gap.skillId}-${i}`}>
                    <CardContent className="space-y-1 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{gap.skillName}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={gap.importance === "MustHave" ? "destructive" : "muted"}>
                            {gap.importance === "MustHave" ? "Must-have" : "Nice-to-have"}
                          </Badge>
                          {plan ? (
                            <Button size="sm" variant="outline" onClick={() => navigate(`/candidate/skill-plans/${plan.planId}`)}>
                              View plan
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              loading={generatingSkillId === gap.skillId}
                              disabled={generatingSkillId !== null}
                              onClick={() =>
                                handleGeneratePlan({
                                  skillId: gap.skillId,
                                  skillName: gap.skillName,
                                  jobId: gap.jobId,
                                  jobTitle: gap.jobTitle,
                                  suggestion: gap.suggestion,
                                })
                              }
                            >
                              <Sparkles className="h-3.5 w-3.5" /> Generate Plan
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        For {gap.jobTitle}
                        {gap.companyName ? ` at ${gap.companyName}` : ""} · {formatDate(gap.detectedAt)}
                      </p>
                      {gap.suggestion && <p className="text-sm text-foreground/80">{gap.suggestion}</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="learning">
          {plans === null ? (
            <RowSkeletonList count={3} />
          ) : plans.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No improvement plans yet"
              description="Generate a plan from the By Skill or By Application tab to start a learning path."
            />
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => {
                return (
                  <Card key={plan.planId}>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{plan.skillName}</p>
                          <StatusBadge enumName="SkillPlanStatus" value={plan.status} />
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/candidate/skill-plans/${plan.planId}`)}>
                            View plan ({plan.progressPercent}%)
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleRemove(plan.skillId)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <Progress value={plan.progressPercent} />
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(plan.createdAt)}
                        {plan.jobTitle ? ` - For ${plan.jobTitle}` : ""}
                      </p>
                      <ResourceLinksList resources={resourcesForSkill(plan.skillId)} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
