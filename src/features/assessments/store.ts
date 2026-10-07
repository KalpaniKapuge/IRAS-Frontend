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
  startError: string | null;

  loadStatus: (jobId: number) => Promise<void>;
  startAssessment: (jobId: number, fallbackAttempt?: StartAssessmentResponse) => Promise<boolean>;
  submitAssessment: (jobId: number, answers: SubmitAssessmentAnswer[]) => Promise<boolean>;
  clearAttempt: () => void;
  reset: () => void;
}

function handle(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

async function startWithFallbackTimeout(jobId: number, fallbackAttempt?: StartAssessmentResponse) {
  if (!fallbackAttempt) return assessmentsApi.start(jobId);

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<StartAssessmentResponse>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new ApiError("Assessment generation is taking too long.", 0));
    }, 8_000);
  });

  try {
    return await Promise.race([assessmentsApi.start(jobId), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export const useAssessmentsStore = create<AssessmentsState>()((set, get) => ({
  status: null,
  attempt: null,
  result: null,
  isLoading: false,
  isStarting: false,
  isSubmitting: false,
  startError: null,

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

  startAssessment: async (jobId, fallbackAttempt) => {
    set({ isStarting: true, startError: null });
    if (fallbackAttempt && fallbackAttempt.questions.length > 0) {
      set({ attempt: fallbackAttempt, result: null, status: null, isStarting: false, startError: null });
      return true;
    }

    try {
      const attempt = await startWithFallbackTimeout(jobId, fallbackAttempt);
      if (attempt.questions.length === 0) {
        throw new ApiError("No quiz questions were generated for this job. Please check the job's required skills and try again.", 0);
      }
      set({ attempt, result: null, status: null, isStarting: false });
      return true;
    } catch (err) {
      if (fallbackAttempt && fallbackAttempt.questions.length > 0) {
        set({ attempt: fallbackAttempt, result: null, status: null, isStarting: false, startError: null });
        toast.warning("AI quiz generation is unavailable, so a skill-based fallback quiz was created.");
        return true;
      }

      const message = err instanceof ApiError ? err.message : "Failed to start the assessment.";
      set({ isStarting: false, startError: message });
      toast.error(message);
      return false;
    }
  },

  submitAssessment: async (jobId, answers) => {
    set({ isSubmitting: true });
    try {
      const localAttempt = get().attempt;
      if (localAttempt && localAttempt.attemptId < 0) {
        const result = {
          score: 100,
          correctCount: answers.length,
          answeredCount: answers.length,
          totalQuestions: localAttempt.questions.length,
        };
        localStorage.setItem(`assessment-completed:${jobId}`, "true");
        set({ result, isSubmitting: false });
        toast.success("Assessment completed.");
        return true;
      }

      const result = await assessmentsApi.submit(jobId, { answers });
      set({ result, isSubmitting: false });
      return true;
    } catch (err) {
      set({ isSubmitting: false });
      handle(err, "Failed to submit the assessment.");
      return false;
    }
  },

  clearAttempt: () => set({ attempt: null }),
  reset: () => set({ status: null, attempt: null, result: null, startError: null }),
}));
