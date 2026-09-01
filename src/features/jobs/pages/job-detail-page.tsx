import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useJobsStore } from "../store";
import { JOB_TEMPLATES } from "../components/templates";
import { ApplyDialog } from "@/features/applications/components/apply-dialog";
import { useAssessmentsStore } from "@/features/assessments/store";
import type { JobTemplateKey } from "../types";

export function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentJob, isLoadingDetail, loadJob, clearCurrentJob } = useJobsStore();
  const assessmentStatus = useAssessmentsStore((s) => s.status);
  const loadAssessmentStatus = useAssessmentsStore((s) => s.loadStatus);

  useEffect(() => {
    if (jobId) loadJob(Number(jobId));
    return () => clearCurrentJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    if (jobId && currentJob?.requireAssessment) loadAssessmentStatus(Number(jobId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, currentJob?.requireAssessment]);

  if (isLoadingDetail) return <PageSpinner label="Loading job..." />;
  if (!currentJob) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Job not found"
        description="This position may have been closed or removed."
        action={<Button onClick={() => navigate("/candidate/jobs")}>Back to jobs</Button>}
      />
    );
  }

  const job = currentJob;
  const Template = JOB_TEMPLATES[(job.templateKey as JobTemplateKey) ?? "modern"] ?? JOB_TEMPLATES.modern;

  const needsAssessment = job.requireAssessment && !assessmentStatus?.isCompleted;
  const actionSlot = needsAssessment ? (
    <Button size="lg" className="gap-2" onClick={() => navigate(`/candidate/jobs/${job.jobId}/assessment`)}>
      <ClipboardList className="h-4 w-4" /> Take skill assessment to apply
    </Button>
  ) : (
    <ApplyDialog jobId={job.jobId} jobTitle={job.title} />
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Template job={job} actionSlot={actionSlot} />
    </div>
  );
}
