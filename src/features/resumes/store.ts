import { create } from "zustand";
import { toast } from "sonner";
import { ApiError } from "@/types/common";
import { resumesApi } from "./api";
import type { ParseResultDto, ResumeDto } from "./types";

interface ResumeState {
  resumes: ResumeDto[];
  isLoading: boolean;
  isUploading: boolean;
  pendingParseResult: ParseResultDto | null;
  load: () => Promise<void>;
  upload: (file: File) => Promise<ParseResultDto | null>;
  retryParse: (resumeId: number) => Promise<void>;
  confirmSkills: (resumeId: number, skillIds: number[]) => Promise<void>;
  setPrimary: (resumeId: number) => Promise<void>;
  remove: (resumeId: number) => Promise<void>;
  dismissParseResult: () => void;
}

function isTemporaryParseUnavailable(result: ParseResultDto) {
  return /temporarily unavailable|retry parsing later|analysis service/i.test(result.parseError ?? "");
}

export const useResumeStore = create<ResumeState>()((set, get) => ({
  resumes: [],
  isLoading: false,
  isUploading: false,
  pendingParseResult: null,

  load: async () => {
    set({ isLoading: true });
    try {
      const resumes = await resumesApi.getMine();
      set({ resumes, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      toast.error(err instanceof ApiError ? err.message : "Failed to load resumes.");
    }
  },

  upload: async (file) => {
    set({ isUploading: true });
    try {
      const result = await resumesApi.upload(file);
      await get().load();
      if (result.parseStatus === "Parsed" && result.suggestedSkills.length > 0) {
        set({ pendingParseResult: result });
      } else if (result.parseStatus === "Failed") {
        toast.success(
          isTemporaryParseUnavailable(result)
            ? "Resume uploaded. You can continue, and parsing can be retried later."
            : "Resume uploaded. You can retry parsing from the resume list.",
        );
      } else {
        toast.success("Resume uploaded.");
      }
      return result;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed.");
      return null;
    } finally {
      set({ isUploading: false });
    }
  },

  retryParse: async (resumeId) => {
    try {
      const result = await resumesApi.retryParse(resumeId);
      await get().load();
      if (result.parseStatus === "Parsed" && result.suggestedSkills.length > 0) {
        set({ pendingParseResult: result });
      } else if (result.parseStatus === "Failed") {
        toast.success(
          isTemporaryParseUnavailable(result)
            ? "Resume saved. Parsing can be retried later."
            : "Resume retry finished; you can continue with the saved file.",
        );
      } else {
        toast.success("Resume parsed successfully.");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Retry failed.");
    }
  },

  confirmSkills: async (resumeId, skillIds) => {
    try {
      await resumesApi.confirmSkills(resumeId, skillIds);
      await get().load();
      set({ pendingParseResult: null });
      toast.success("Skills added to your profile.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to confirm skills.");
    }
  },

  setPrimary: async (resumeId) => {
    try {
      await resumesApi.setPrimary(resumeId);
      await get().load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to set primary resume.");
    }
  },

  remove: async (resumeId) => {
    try {
      await resumesApi.remove(resumeId);
      await get().load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete resume.");
    }
  },

  dismissParseResult: () => set({ pendingParseResult: null }),
}));
