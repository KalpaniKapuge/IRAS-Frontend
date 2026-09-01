import { http } from "@/lib/api-client";
import { ApiError } from "@/types/common";
import type { ApplicationDto, ApplyForJobRequest, RankedApplicantDto } from "./types";
import type { ApplicationStatus } from "@/types/enums";
import type { EmployerAssessmentReviewDto } from "@/features/assessments/types";

export const applicationsApi = {
  apply: (payload: ApplyForJobRequest) => http.post<ApplicationDto>("/api/applications", payload).then((r) => r.data),

  getMine: () => http.get<ApplicationDto[]>("/api/applications/mine").then((r) => r.data),

  getRanked: (employerId: number, jobId: number) =>
    http.get<RankedApplicantDto[]>(`/api/employers/${employerId}/jobs/${jobId}/applicants`).then((r) => r.data),

  updateStatus: (employerId: number, jobId: number, applicationId: number, status: ApplicationStatus) =>
    http
      .put(`/api/employers/${employerId}/jobs/${jobId}/applicants/${applicationId}/status`, { status })
      .then((r) => r.data),

  // 404 (returned as null here) when the candidate never completed an assessment for this job.
  getAssessmentReview: (employerId: number, jobId: number, applicationId: number) =>
    http
      .get<EmployerAssessmentReviewDto>(`/api/employers/${employerId}/jobs/${jobId}/applicants/${applicationId}/assessment`)
      .then((r) => r.data)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }),
};
