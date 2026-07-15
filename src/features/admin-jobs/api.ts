import { http } from "@/lib/api-client";
import type { JobSummaryDto } from "@/features/jobs/types";

export const adminJobsApi = {
  getAll: (status?: string) =>
    http.get<JobSummaryDto[]>("/api/admin/jobs", { params: { status } }).then((r) => r.data),
  forceClose: (jobId: number) => http.post(`/api/admin/jobs/${jobId}/close`).then((r) => r.data),
};
