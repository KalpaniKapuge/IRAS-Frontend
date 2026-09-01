import { http } from "@/lib/api-client";
import type {
  AssessmentResultDto,
  AssessmentStatusDto,
  StartAssessmentResponse,
  SubmitAssessmentRequest,
} from "./types";

export const assessmentsApi = {
  getStatus: (jobId: number) =>
    http.get<AssessmentStatusDto>(`/api/jobs/${jobId}/assessment/status`).then((r) => r.data),

  start: (jobId: number) =>
    http.post<StartAssessmentResponse>(`/api/jobs/${jobId}/assessment/start`).then((r) => r.data),

  submit: (jobId: number, payload: SubmitAssessmentRequest) =>
    http.post<AssessmentResultDto>(`/api/jobs/${jobId}/assessment/submit`, payload).then((r) => r.data),
};
