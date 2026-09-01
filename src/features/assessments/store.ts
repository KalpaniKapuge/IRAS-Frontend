import { create } from "zustand";
import { toast } from "sonner";
import { ApiError } from "@/types/common";
import { assessmentsApi } from "./api";
import type {
  AssessmentResultDto,
  AssessmentStatusDto,
  StartAssessmentResponse,
  SubmitAssessmentAnswer,
} from "./types";

interface AssessmentsState {
  status: AssessmentStatusDto | null;
  attempt: StartAssessmentResponse | null;
  result: AssessmentResultDto | null;
  isLoading: boolean;
  isStarting: boolean;
  isSubmitting: boolean;

  loadStatus: (jobId: number) => Promise<void>;
  startAssessment: (jobId: number) => Promise<void>;
  submitAssessment: (jobId: number, answers: SubmitAssessmentAnswer[]) => Promise<boolean>;
  reset: () => void;
}

function handle(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export const useAssessmentsStore = create<AssessmentsState>()((set) => ({
  status: null,
  attempt: null,
  result: null,
  isLoading: false,
  isStarting: false,
  isSubmitting: false,

  loadStatus: async (jobId) => {
    set({ isLoading: true });
    try {
      const status = await assessmentsApi.getStatus(jobId);
      set({ status, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      handle(err, "Failed to load assessment status.");
    }
  },

  startAssessment: async (jobId) => {
    set({ isStarting: true });
    try {
      const attempt = await assessmentsApi.start(jobId);
      set({ attempt, isStarting: false });
    } catch (err) {
      set({ isStarting: false });
      handle(err, "Failed to start the assessment.");
    }
  },

  submitAssessment: async (jobId, answers) => {
    set({ isSubmitting: true });
    try {
      const result = await assessmentsApi.submit(jobId, { answers });
      set({ result, isSubmitting: false });
      return true;
    } catch (err) {
      set({ isSubmitting: false });
      handle(err, "Failed to submit the assessment.");
      return false;
    }
  },

  reset: () => set({ status: null, attempt: null, result: null }),
}));
