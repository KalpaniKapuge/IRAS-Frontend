import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { PageSpinner } from "@/components/shared/loading-state";
import { useAuthStore } from "@/features/auth/store";
import { useJobsStore } from "../../store";

export function JobEditPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const employerId = useAuthStore((s) => s.user!.userId);
  const {
    currentJob,
    isLoadingDetail,
    isGeneratingJd,
    isMutating,
    loadMyJob,
    generateJd,
    updateJd,
    publish,
    close,
    deleteDraft,
    clearCurrentJob,
  } = useJobsStore();

  const [notes, setNotes] = useState("");
  const [jdDraft, setJdDraft] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (jobId) loadMyJob(employerId, Number(jobId));
    return () => clearCurrentJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, employerId]);

  useEffect(() => {
    setJdDraft(currentJob?.generatedJd ?? "");
    setDirty(false);
  }, [currentJob?.generatedJd]);

  if (isLoadingDetail || !currentJob) return <PageSpinner label="Loading job…" />;

  const job = currentJob;
  const isDraft = job.status === "Draft";

  const handleGenerate = async () => {
    await generateJd(employerId, job.jobId, { additionalNotes: notes || undefined });
  };

  const handleSaveJd = async () => {
    await updateJd(employerId, job.jobId, { jdText: jdDraft });
    setDirty(false);
  };

  const handlePublish = async () => {
    const ok = await publish(employerId, job.jobId);
    if (ok) navigate(`/employer/jobs/${job.jobId}/applicants`);
  };

  const handleDelete = async () => {
    const ok = await deleteDraft(employerId, job.jobId);
    if (ok) navigate("/employer/jobs");
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={() => navigate("/employer/jobs")}>
        <ArrowLeft className="h-4 w-4" /> All jobs
      </Button>

      <PageHeader
        title={job.title}
        description={`${job.seniorityLevel} · ${job.location ?? "Location not specified"}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge enumName="JobStatus" value={job.status} />
            {job.status === "Published" && (
              <Button variant="outline" asChild>
                <Link to={`/employer/jobs/${job.jobId}/applicants`}><Users className="h-4 w-4" /> View applicants</Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {isDraft && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Generate job description</CardTitle>
                <CardDescription>Add any extra context — team size, tech stack details, work arrangement — then let AI draft it.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Team of 6 engineers, fintech product, hybrid 2 days/week in office"
                />
                <Button onClick={handleGenerate} loading={isGeneratingJd} variant="secondary">
                  <Sparkles className="h-4 w-4" /> {job.generatedJd ? "Regenerate description" : "Generate description"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job description {job.isAiGenerated && <Badge variant="info" className="ml-2">AI-generated</Badge>}</CardTitle>
              <CardDescription>Review and edit before publishing — you're always in control of what candidates see.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={16}
                value={jdDraft}
                onChange={(e) => {
                  setJdDraft(e.target.value);
                  setDirty(true);
                }}
                disabled={!isDraft}
                className="font-mono text-xs leading-relaxed"
                placeholder="No description yet — generate one above."
              />
              {isDraft && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveJd} loading={isMutating} disabled={!dirty || !jdDraft.trim()}>
                    Save description
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Required skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {job.requiredSkills.map((s) => (
                <Badge key={s.skillId} variant={s.importance === "MustHave" ? "destructive" : "muted"}>
                  {s.skillName}
                  {s.minYears > 0 && <span className="opacity-70"> · {s.minYears}y+</span>}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lifecycle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isDraft && (
                <>
                  <ConfirmAction
                    trigger={<Button className="w-full" disabled={!job.generatedJd}>Publish job</Button>}
                    title="Publish this job?"
                    description="It will become visible to all candidates and trigger automatic matching."
                    confirmLabel="Publish"
                    onConfirm={handlePublish}
                  />
                  <ConfirmAction
                    trigger={
                      <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" /> Delete draft
                      </Button>
                    }
                    title="Delete this draft?"
                    description="This cannot be undone."
                    variant="destructive"
                    confirmLabel="Delete"
                    onConfirm={handleDelete}
                  />
                </>
              )}
              {job.status === "Published" && (
                <ConfirmAction
                  trigger={<Button variant="outline" className="w-full">Close job</Button>}
                  title="Close this job posting?"
                  description="Candidates will no longer be able to apply."
                  confirmLabel="Close job"
                  onConfirm={() => close(employerId, job.jobId)}
                />
              )}
              {job.status === "Closed" && <p className="text-sm text-muted-foreground">This job is closed.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
