import { http } from "@/lib/api-client";
import type { ApplicationDto, ApplyForJobRequest, RankedApplicantDto } from "./types";
import type { ApplicationStatus } from "@/types/enums";

export const applicationsApi = {
  apply: (payload: ApplyForJobRequest) => http.post<ApplicationDto>("/api/applications", payload).then((r) => r.data),

  getMine: () => http.get<ApplicationDto[]>("/api/applications/mine").then((r) => r.data),

  getRanked: (employerId: number, jobId: number) =>
    http.get<RankedApplicantDto[]>(`/api/employers/${employerId}/jobs/${jobId}/applicants`).then((r) => r.data),

  updateStatus: (employerId: number, jobId: number, applicationId: number, status: ApplicationStatus) =>
    http
      .put(`/api/employers/${employerId}/jobs/${jobId}/applicants/${applicationId}/status`, { status })
      .then((r) => r.data),
};
