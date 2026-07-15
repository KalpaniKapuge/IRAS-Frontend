import { http } from "@/lib/api-client";
import type { FeedbackDto, ReviewFeedbackRequest } from "./types";

export const feedbackApi = {
  getMyFeedback: (applicationId: number) =>
    http.get<FeedbackDto | null>(`/api/applications/${applicationId}/feedback`).then((r) => (r.status === 204 ? null : r.data)),

  getForEmployer: (employerId: number, jobId: number, applicationId: number) =>
    http
      .get<FeedbackDto>(`/api/employers/${employerId}/jobs/${jobId}/applicants/${applicationId}/feedback`)
      .then((r) => r.data),

  review: (employerId: number, jobId: number, applicationId: number, payload: ReviewFeedbackRequest) =>
    http
      .put<FeedbackDto>(`/api/employers/${employerId}/jobs/${jobId}/applicants/${applicationId}/feedback`, payload)
      .then((r) => r.data),
};
