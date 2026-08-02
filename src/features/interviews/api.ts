import { http } from "@/lib/api-client";
import type {
  CancelInterviewRequest,
  InterviewDto,
  RescheduleInterviewRequest,
  ScheduleInterviewRequest,
  UpdateInterviewOutcomeRequest,
} from "./types";

const applicantBase = (employerId: number, jobId: number, applicationId: number) =>
  `/api/employers/${employerId}/jobs/${jobId}/applicants/${applicationId}/interviews`;

export const interviewsApi = {
  // Candidate: every interview across all of their applications.
  getMine: () => http.get<InterviewDto[]>("/api/applications/interviews").then((r) => r.data),

  // Employer: every interview across every job this employer owns.
  getForEmployer: (employerId: number) =>
    http.get<InterviewDto[]>(`/api/employers/${employerId}/interviews`).then((r) => r.data),

  // Employer: interviews for one specific application.
  getForApplication: (employerId: number, jobId: number, applicationId: number) =>
    http.get<InterviewDto[]>(applicantBase(employerId, jobId, applicationId)).then((r) => r.data),

  schedule: (employerId: number, jobId: number, applicationId: number, payload: ScheduleInterviewRequest) =>
    http.post<InterviewDto>(applicantBase(employerId, jobId, applicationId), payload).then((r) => r.data),

  reschedule: (
    employerId: number,
    jobId: number,
    applicationId: number,
    interviewId: number,
    payload: RescheduleInterviewRequest,
  ) =>
    http
      .put<InterviewDto>(`${applicantBase(employerId, jobId, applicationId)}/${interviewId}`, payload)
      .then((r) => r.data),

  cancel: (
    employerId: number,
    jobId: number,
    applicationId: number,
    interviewId: number,
    payload: CancelInterviewRequest,
  ) => http.post(`${applicantBase(employerId, jobId, applicationId)}/${interviewId}/cancel`, payload).then((r) => r.data),

  updateOutcome: (
    employerId: number,
    jobId: number,
    applicationId: number,
    interviewId: number,
    payload: UpdateInterviewOutcomeRequest,
  ) =>
    http
      .put(`${applicantBase(employerId, jobId, applicationId)}/${interviewId}/outcome`, payload)
      .then((r) => r.data),
};
