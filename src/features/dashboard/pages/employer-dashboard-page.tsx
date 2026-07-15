import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, CheckCircle2, FileEdit, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/features/auth/store";
import { jobsApi } from "@/features/jobs/api";
import type { JobSummaryDto } from "@/features/jobs/types";

export function EmployerDashboardPage() {
  const employerId = useAuthStore((s) => s.user!.userId);
  const [jobs, setJobs] = useState<JobSummaryDto[] | null>(null);

  useEffect(() => {
    jobsApi.getMine(employerId).then(setJobs);
  }, [employerId]);

  const counts = {
    draft: jobs?.filter((j) => j.status === "Draft").length ?? 0,
    published: jobs?.filter((j) => j.status === "Published").length ?? 0,
    closed: jobs?.filter((j) => j.status === "Closed" || j.status === "Archived").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employer Dashboard"
        description="Manage your job postings and review candidates."
        actions={
          <Button asChild>
            <Link to="/employer/jobs/new"><Plus className="h-4 w-4" /> New job</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Draft postings" value={jobs === null ? "—" : counts.draft} icon={FileEdit} tone="muted" />
        <StatCard label="Published postings" value={jobs === null ? "—" : counts.published} icon={CheckCircle2} tone="success" />
        <StatCard label="Total postings" value={jobs === null ? "—" : jobs.length} icon={Briefcase} tone="primary" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Your job postings</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/employer/jobs">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {jobs === null ? (
            <RowSkeletonList count={3} />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No job postings yet"
              action={
                <Button asChild>
                  <Link to="/employer/jobs/new"><Plus className="h-4 w-4" /> Create your first job</Link>
                </Button>
              }
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 6).map((job) => (
                <div key={job.jobId} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <Link to={`/employer/jobs/${job.jobId}`} className="text-sm font-medium hover:underline">
                      {job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {job.postedAt ? `Posted ${formatDate(job.postedAt)}` : "Not yet published"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge enumName="JobStatus" value={job.status} />
                    {job.status === "Published" && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/employer/jobs/${job.jobId}/applicants`}>
                          <Users className="h-3.5 w-3.5" /> Applicants
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
