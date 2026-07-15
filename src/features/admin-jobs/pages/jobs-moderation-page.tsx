import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { ApiError } from "@/types/common";
import { JOB_STATUSES } from "@/types/enums";
import { adminJobsApi } from "../api";
import type { JobSummaryDto } from "@/features/jobs/types";

export function JobsModerationPage() {
  const [jobs, setJobs] = useState<JobSummaryDto[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = () => adminJobsApi.getAll(statusFilter === "all" ? undefined : statusFilter).then(setJobs);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleForceClose = async (job: JobSummaryDto) => {
    try {
      await adminJobsApi.forceClose(job.jobId);
      toast.success(`"${job.title}" has been closed.`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to close job.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Postings"
        description="Platform-wide visibility into every employer's job postings."
        actions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {JOB_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {jobs === null ? (
        <RowSkeletonList count={6} />
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No job postings found" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.jobId}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell className="text-muted-foreground">{job.companyName ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{titleCase(job.employmentType)}</TableCell>
                <TableCell><StatusBadge enumName="JobStatus" value={job.status} /></TableCell>
                <TableCell className="text-muted-foreground">{job.postedAt ? formatDate(job.postedAt) : "—"}</TableCell>
                <TableCell className="text-right">
                  {job.status === "Published" && (
                    <ConfirmAction
                      trigger={<Button variant="outline" size="sm">Force close</Button>}
                      title={`Force close "${job.title}"?`}
                      description="Candidates will no longer be able to apply."
                      variant="destructive"
                      confirmLabel="Close job"
                      onConfirm={() => handleForceClose(job)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
