import { create } from "zustand";
import { toast } from "sonner";
import { ApiError } from "@/types/common";
import { interviewsApi } from "./api";
import type {
  CancelInterviewRequest,
  InterviewDto,
  RescheduleInterviewRequest,
  ScheduleInterviewRequest,
  UpdateInterviewOutcomeRequest,
} from "./types";

interface InterviewsState {
  myInterviews: InterviewDto[];
  employerInterviews: InterviewDto[];
  // Keyed by applicationId so multiple expanded applicant rows don't clobber each other.
  byApplication: Record<number, InterviewDto[]>;
  isLoading: boolean;
  isMutating: boolean;

  loadMine: () => Promise<void>;
  loadForEmployer: (employerId: number) => Promise<void>;
  loadForApplication: (employerId: number, jobId: number, applicationId: number) => Promise<void>;
  schedule: (
    employerId: number,
    jobId: number,
    applicationId: number,
    payload: ScheduleInterviewRequest,
  ) => Promise<boolean>;
  reschedule: (
    employerId: number,
    jobId: number,
    applicationId: number,
    interviewId: number,
    payload: RescheduleInterviewRequest,
  ) => Promise<boolean>;
  cancel: (
    employerId: number,
    jobId: number,
    applicationId: number,
    interviewId: number,
    payload: CancelInterviewRequest,
  ) => Promise<void>;
  updateOutcome: (
    employerId: number,
    jobId: number,
    applicationId: number,
    interviewId: number,
    payload: UpdateInterviewOutcomeRequest,
  ) => Promise<void>;
}

function handle(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export const useInterviewsStore = create<InterviewsState>()((set, get) => ({
  myInterviews: [],
  employerInterviews: [],
  byApplication: {},
  isLoading: false,
  isMutating: false,

  loadMine: async () => {
    set({ isLoading: true });
    try {
      const myInterviews = await interviewsApi.getMine();
      set({ myInterviews, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      handle(err, "Failed to load your interviews.");
    }
  },

  loadForEmployer: async (employerId) => {
    set({ isLoading: true });
    try {
      const employerInterviews = await interviewsApi.getForEmployer(employerId);
      set({ employerInterviews, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      handle(err, "Failed to load interviews.");
    }
  },

  loadForApplication: async (employerId, jobId, applicationId) => {
    try {
      const interviews = await interviewsApi.getForApplication(employerId, jobId, applicationId);
      set((s) => ({ byApplication: { ...s.byApplication, [applicationId]: interviews } }));
    } catch (err) {
      handle(err, "Failed to load interviews for this application.");
    }
  },

  schedule: async (employerId, jobId, applicationId, payload) => {
    set({ isMutating: true });
    try {
      await interviewsApi.schedule(employerId, jobId, applicationId, payload);
      await get().loadForApplication(employerId, jobId, applicationId);
      toast.success("Interview scheduled.");
      return true;
    } catch (err) {
      handle(err, "Failed to schedule interview.");
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  reschedule: async (employerId, jobId, applicationId, interviewId, payload) => {
    set({ isMutating: true });
    try {
      await interviewsApi.reschedule(employerId, jobId, applicationId, interviewId, payload);
      await get().loadForApplication(employerId, jobId, applicationId);
      toast.success("Interview rescheduled.");
      return true;
    } catch (err) {
      handle(err, "Failed to reschedule interview.");
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  cancel: async (employerId, jobId, applicationId, interviewId, payload) => {
    try {
      await interviewsApi.cancel(employerId, jobId, applicationId, interviewId, payload);
      await get().loadForApplication(employerId, jobId, applicationId);
      toast.success("Interview cancelled.");
    } catch (err) {
      handle(err, "Failed to cancel interview.");
    }
  },

  updateOutcome: async (employerId, jobId, applicationId, interviewId, payload) => {
    try {
      await interviewsApi.updateOutcome(employerId, jobId, applicationId, interviewId, payload);
      await get().loadForApplication(employerId, jobId, applicationId);
      toast.success("Interview outcome recorded.");
    } catch (err) {
      handle(err, "Failed to update interview outcome.");
    }
  },
}));
