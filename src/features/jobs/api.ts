import { http } from "@/lib/api-client";
import type {
  CreateJobRequest,
  GenerateJdRequest,
  GenerateJdResponse,
  JobDto,
  JobSummaryDto,
  UpdateJdRequest,
} from "./types";

export const jobsApi = {
  // ---- Public / candidate browsing ----
  browsePublished: (query?: string) => http.get<JobSummaryDto[]>("/api/jobs", { params: { query } }).then((r) => r.data),
  getJob: (jobId: number) => http.get<JobDto>(`/api/jobs/${jobId}`).then((r) => r.data),

  // ---- Employer management ----
  create: (employerId: number, payload: CreateJobRequest) =>
    http.post<JobDto>(`/api/employers/${employerId}/jobs`, payload).then((r) => r.data),

  getMine: (employerId: number) => http.get<JobSummaryDto[]>(`/api/employers/${employerId}/jobs`).then((r) => r.data),

  getMyJob: (employerId: number, jobId: number) =>
    http.get<JobDto>(`/api/employers/${employerId}/jobs/${jobId}`).then((r) => r.data),

  generateJd: (employerId: number, jobId: number, payload: GenerateJdRequest) =>
    http.post<GenerateJdResponse>(`/api/employers/${employerId}/jobs/${jobId}/generate-jd`, payload).then((r) => r.data),

  updateJd: (employerId: number, jobId: number, payload: UpdateJdRequest) =>
    http.put(`/api/employers/${employerId}/jobs/${jobId}/jd`, payload).then((r) => r.data),

  publish: (employerId: number, jobId: number) =>
    http.post(`/api/employers/${employerId}/jobs/${jobId}/publish`).then((r) => r.data),

  close: (employerId: number, jobId: number) =>
    http.post(`/api/employers/${employerId}/jobs/${jobId}/close`).then((r) => r.data),

  deleteDraft: (employerId: number, jobId: number) =>
    http.delete(`/api/employers/${employerId}/jobs/${jobId}`).then((r) => r.data),
};
