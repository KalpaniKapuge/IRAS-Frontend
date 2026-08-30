import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, ExternalLink, FileCheck2, FolderGit2, Send, Sparkles, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { PageSpinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApiError } from "@/types/common";
import { titleCase } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";
import { skillResourcesApi } from "@/features/skill-resources/api";
import { ResourceLinksList } from "@/features/skill-resources/components/resource-links-list";
import type { SkillResourceDto } from "@/features/skill-resources/types";
import { skillImprovementPlansApi } from "../api";
import { AddEvidenceDialog } from "../components/add-evidence-dialog";
import { ProgressStepper } from "../components/progress-stepper";
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

  const reloadPlan = () => skillImprovementPlansApi.getById(candidateId, Number(planId)).then(setPlan);

  const handleRemoveEvidence = async (evidenceId: number) => {
    if (!plan) return;
    try {
      await skillImprovementPlansApi.removeEvidence(candidateId, plan.planId, evidenceId);
      reloadPlan();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove evidence.");
    }
  };

  const handleSubmitEvidence = async (evidenceId: number) => {
    if (!plan) return;
    try {
      await skillImprovementPlansApi.submitEvidence(candidateId, plan.planId, evidenceId);
      toast.success("Submitted for review.");
      reloadPlan();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit evidence for review.");
    }
  };

  const handleUpdateProgress = async (status: string) => {
    if (!plan) return;
    try {
      const updated = await skillImprovementPlansApi.updateProgress(candidateId, plan.planId, status);
      setPlan(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update progress.");
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
          <StatusBadge enumName="SkillPlanStatus" value={plan.status} />
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
            <p className="text-sm font-medium">Roadmap checklist</p>
            <p className="text-sm text-muted-foreground">{plan.progressPercent}%</p>
          </div>
          <Progress value={plan.progressPercent} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5">
          <Label className="text-sm font-medium text-foreground">Your progress</Label>
          {plan.status === "Verified" ? (
            <p className="text-sm text-muted-foreground">
              This skill has been verified — progress can no longer be changed.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">Click a stage to update where you are.</p>
              <ProgressStepper status={plan.status} onSelect={handleUpdateProgress} />
            </>
          )}
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-1.5 text-base">
                <FileCheck2 className="h-4 w-4" /> Evidence
              </CardTitle>
              <AddEvidenceDialog candidateId={candidateId} planId={plan.planId} onAdded={reloadPlan} />
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {plan.evidence.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No evidence added yet. Add proof (a GitHub link, screenshot, or file), then click
                  "Submit for Review" when you're ready for an admin to verify it.
                </p>
              ) : (
                plan.evidence.map((item) => (
                  <div
                    key={item.evidenceId}
                    className={
                      item.verificationStatus === "Draft"
                        ? "space-y-2 rounded-lg border-2 border-primary/40 bg-primary/5 p-3"
                        : "space-y-1.5 rounded-lg border border-border p-3"
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="muted">{titleCase(item.evidenceType)}</Badge>
                        <StatusBadge enumName="EvidenceVerificationStatus" value={item.verificationStatus} />
                      </div>
                      <ConfirmAction
                        trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                        title="Remove this evidence?"
                        variant="destructive"
                        confirmLabel="Remove"
                        onConfirm={() => handleRemoveEvidence(item.evidenceId)}
                      />
                    </div>
                    <a
                      href={item.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.evidenceUrl}</span>
                    </a>
                    {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                    {item.verificationStatus === "Draft" && (
                      <div className="flex items-center justify-between gap-2 rounded-md bg-primary/10 p-2">
                        <p className="text-xs text-foreground/80">Not submitted yet — only you can see this.</p>
                        <Button size="sm" className="h-7 shrink-0" onClick={() => handleSubmitEvidence(item.evidenceId)}>
                          <Send className="h-3.5 w-3.5" /> Submit for Review
                        </Button>
                      </div>
                    )}
                    {item.aiConfidenceScore !== null && (
                      <div className="flex items-start gap-1.5 rounded-md bg-muted/40 p-2">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            AI confidence: {item.aiConfidenceScore}/100
                            {item.autoReviewed
                              ? ` — auto-${item.verificationStatus.toLowerCase()}`
                              : " — awaiting admin review"}
                          </span>
                          {item.aiRationale && <> — {item.aiRationale}</>}
                        </p>
                      </div>
                    )}
                    {item.verificationStatus === "Rejected" && item.verifierNotes && !item.autoReviewed && (
                      <p className="text-xs text-destructive">Reviewer note: {item.verifierNotes}</p>
                    )}
                    {item.verificationStatus === "RevisionRequired" && (
                      <div className="rounded-md border border-info/30 bg-info/10 p-2">
                        {item.verifierNotes && (
                          <p className="text-xs text-foreground/90">
                            <span className="font-medium">Reviewer note:</span> {item.verifierNotes}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Address the feedback above and submit new evidence — this submission won't be reconsidered on its own.
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
