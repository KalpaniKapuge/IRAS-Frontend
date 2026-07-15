import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/features/auth/store";
import { useApplicationsStore } from "../../store";
import { ApplicantRow } from "../../components/applicant-row";

export function JobApplicantsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const employerId = useAuthStore((s) => s.user!.userId);
  const { rankedApplicants, isLoading, loadRanked, updateStatus } = useApplicationsStore();

  const numericJobId = Number(jobId);

  useEffect(() => {
    if (jobId) loadRanked(employerId, numericJobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, employerId]);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={() => navigate("/employer/jobs")}>
        <ArrowLeft className="h-4 w-4" /> All jobs
      </Button>

      <PageHeader title="Applicants" description="Ranked automatically by skill match, experience, education, and resume relevance." />

      {isLoading && rankedApplicants.length === 0 ? (
        <RowSkeletonList count={4} />
      ) : rankedApplicants.length === 0 ? (
        <EmptyState icon={Users} title="No applicants yet" description="Candidates who apply to this job will appear here, ranked by fit." />
      ) : (
        <div className="space-y-3">
          {rankedApplicants.map((applicant) => (
            <ApplicantRow
              key={applicant.applicationId}
              applicant={applicant}
              employerId={employerId}
              jobId={numericJobId}
              onStatusChange={(applicationId, status) => updateStatus(employerId, numericJobId, applicationId, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
