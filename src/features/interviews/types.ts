import type { InterviewMode, InterviewStatus } from "@/types/enums";

export interface InterviewDto {
  interviewId: number;
  applicationId: number;
  jobId: number;
  jobTitle: string;
  companyName: string | null;
  candidateId: number;
  candidateName: string;

  scheduledAt: string;
  durationMinutes: number;
  mode: InterviewMode;
  location: string | null;
  meetingLink: string | null;
  interviewerNames: string | null;
  notes: string | null;

  status: InterviewStatus;
  cancellationReason: string | null;

  createdAt: string;
  updatedAt: string | null;
}

export interface ScheduleInterviewRequest {
  scheduledAt: string;
  durationMinutes: number;
  mode: InterviewMode;
  location?: string;
  meetingLink?: string;
  interviewerNames?: string;
  notes?: string;
}

export type RescheduleInterviewRequest = ScheduleInterviewRequest;

export interface CancelInterviewRequest {
  reason?: string;
}

export interface UpdateInterviewOutcomeRequest {
  status: Extract<InterviewStatus, "Completed" | "NoShow">;
}
