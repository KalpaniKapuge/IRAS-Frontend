import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";
import { useJobsStore } from "../../store";

export function EmployerJobsPage() {
  const employerId = useAuthStore((s) => s.user!.userId);
  const { myJobs, isLoadingList, loadMyJobs } = useJobsStore();

  useEffect(() => {
    loadMyJobs(employerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employerId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Postings"
        description="Create, generate descriptions for, and manage your open roles."
        actions={
          <Button asChild>
            <Link to="/employer/jobs/new"><Plus className="h-4 w-4" /> New job</Link>
          </Button>
        }
      />

      {isLoadingList && myJobs.length === 0 ? (
        <RowSkeletonList count={4} />
      ) : myJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job postings yet"
          description="Create your first job posting and let AI draft the description for you."
          action={
            <Button asChild>
              <Link to="/employer/jobs/new"><Plus className="h-4 w-4" /> Create a job</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {myJobs.map((job) => (
            <Card key={job.jobId}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <Link to={`/employer/jobs/${job.jobId}`} className="font-semibold hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {job.seniorityLevel} · {titleCase(job.employmentType)}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {job.postedAt ? `Posted ${formatDate(job.postedAt)}` : "Not yet published"} · {job.requiredSkillCount} required skills
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge enumName="JobStatus" value={job.status} />
                  {job.status === "Published" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/employer/jobs/${job.jobId}/applicants`}><Users className="h-3.5 w-3.5" /> Applicants</Link>
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/employer/jobs/${job.jobId}`}>Manage</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
