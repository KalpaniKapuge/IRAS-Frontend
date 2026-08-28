import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, FolderGit2, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { PageSpinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ApiError } from "@/types/common";
import { titleCase } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";
import { skillResourcesApi } from "@/features/skill-resources/api";
import { ResourceLinksList } from "@/features/skill-resources/components/resource-links-list";
import type { SkillResourceDto } from "@/features/skill-resources/types";
import { skillImprovementPlansApi } from "../api";
import type { SkillImprovementPlanDto } from "../types";

export function PlanDetailPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const candidateId = useAuthStore((s) => s.user!.userId);

  const [plan, setPlan] = useState<SkillImprovementPlanDto | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [resources, setResources] = useState<SkillResourceDto[]>([]);

  useEffect(() => {
    if (!planId) return;
    skillImprovementPlansApi
      .getById(candidateId, Number(planId))
      .then(setPlan)
      .catch(() => setNotFound(true));
    skillResourcesApi.getAll().then((all) => setResources(all.filter((r) => r.isActive)));
  }, [candidateId, planId]);

  const handleToggleStep = async (stepId: number, isCompleted: boolean) => {
    if (!plan) return;
    try {
      const updated = await skillImprovementPlansApi.setStepCompletion(candidateId, plan.planId, stepId, isCompleted);
      setPlan(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update step.");
    }
  };

  if (notFound) {
    return (
      <EmptyState
        icon={Target}
        title="Skill plan not found"
        action={<Button onClick={() => navigate("/candidate/skill-gaps")}>Back to Skill Gaps</Button>}
      />
    );
  }

  if (!plan) return <PageSpinner label="Loading skill plan…" />;

  const skillResources = resources.filter((r) => r.skillId === plan.skillId);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{plan.skillName} Improvement Plan</h1>
          <Badge variant={plan.priority === "High" ? "destructive" : plan.priority === "Medium" ? "warning" : "muted"}>
            {plan.priority} priority
          </Badge>
          <Badge
            variant={
              plan.status === "Completed" || plan.status === "Verified"
                ? "success"
                : plan.status === "Practicing"
                  ? "warning"
                  : plan.status === "Learning"
                    ? "info"
                    : "muted"
            }
          >
            {titleCase(plan.status)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {plan.jobTitle ? `For ${plan.jobTitle}` : "General skill development"} · Target level: {titleCase(plan.targetLevel)}
          {" · "}
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" /> {plan.estimatedDays} days
          </span>
          {plan.generatedBy === "Gemini" && (
            <span className="ml-2 inline-flex items-center gap-1 text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-generated
            </span>
          )}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Roadmap progress</p>
            <p className="text-sm text-muted-foreground">{plan.progressPercent}%</p>
          </div>
          <Progress value={plan.progressPercent} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-sm text-foreground/90">{plan.overview}</p>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs font-medium text-muted-foreground">Why this is a gap</p>
                <p className="mt-1 text-sm text-foreground/80">{plan.gapReason}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learning Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {plan.steps.map((step) => (
                <div
                  key={step.stepId}
                  className="flex gap-3 rounded-lg border border-border p-3"
                >
                  <Checkbox
                    checked={step.isCompleted}
                    onCheckedChange={(checked) => handleToggleStep(step.stepId, checked === true)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <p className={`text-sm font-medium ${step.isCompleted ? "text-muted-foreground line-through" : ""}`}>
                      {step.stepOrder}. {step.title}
                    </p>
                    <p className="text-sm text-foreground/80">{step.description}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Activity:</span> {step.activity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Output:</span> {step.output}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-base">
                <FolderGit2 className="h-4 w-4" /> Mini Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <p className="text-sm font-medium">{plan.projectTitle}</p>
              <p className="text-sm text-foreground/80">{plan.projectTask}</p>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs font-medium text-muted-foreground">Expected output</p>
                <p className="mt-1 text-sm text-foreground/80">{plan.projectExpectedOutput}</p>
              </div>
            </CardContent>
          </Card>

          {skillResources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended Resources</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResourceLinksList resources={skillResources} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
