import { create } from "zustand";
import { toast } from "sonner";
import { ApiError } from "@/types/common";
import { jobsApi } from "./api";
import type {
  CreateJobRequest,
  GenerateJdRequest,
  JobDto,
  JobSummaryDto,
  UpdateJdRequest,
} from "./types";

interface JobsState {
  publishedJobs: JobSummaryDto[];
  myJobs: JobSummaryDto[];
  currentJob: JobDto | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  isGeneratingJd: boolean;
  isMutating: boolean;

  browsePublished: (query?: string) => Promise<void>;
  loadJob: (jobId: number) => Promise<void>;
  loadMyJobs: (employerId: number) => Promise<void>;
  loadMyJob: (employerId: number, jobId: number) => Promise<void>;
  createJob: (employerId: number, payload: CreateJobRequest) => Promise<JobDto | null>;
  generateJd: (employerId: number, jobId: number, payload: GenerateJdRequest) => Promise<void>;
  updateJd: (employerId: number, jobId: number, payload: UpdateJdRequest) => Promise<void>;
  publish: (employerId: number, jobId: number) => Promise<boolean>;
  close: (employerId: number, jobId: number) => Promise<void>;
  deleteDraft: (employerId: number, jobId: number) => Promise<boolean>;
  clearCurrentJob: () => void;
}

function handle(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export const useJobsStore = create<JobsState>()((set, get) => ({
  publishedJobs: [],
  myJobs: [],
  currentJob: null,
  isLoadingList: false,
  isLoadingDetail: false,
  isGeneratingJd: false,
  isMutating: false,

  browsePublished: async (query) => {
    set({ isLoadingList: true });
    try {
      const publishedJobs = await jobsApi.browsePublished(query);
      set({ publishedJobs, isLoadingList: false });
    } catch (err) {
      set({ isLoadingList: false });
      handle(err, "Failed to load jobs.");
    }
  },

  loadJob: async (jobId) => {
    set({ isLoadingDetail: true, currentJob: null });
    try {
      const currentJob = await jobsApi.getJob(jobId);
      set({ currentJob, isLoadingDetail: false });
    } catch (err) {
      set({ isLoadingDetail: false });
      handle(err, "Failed to load job.");
    }
  },

  loadMyJobs: async (employerId) => {
    set({ isLoadingList: true });
    try {
      const myJobs = await jobsApi.getMine(employerId);
      set({ myJobs, isLoadingList: false });
    } catch (err) {
      set({ isLoadingList: false });
      handle(err, "Failed to load your job postings.");
    }
  },

  loadMyJob: async (employerId, jobId) => {
    set({ isLoadingDetail: true, currentJob: null });
    try {
      const currentJob = await jobsApi.getMyJob(employerId, jobId);
      set({ currentJob, isLoadingDetail: false });
    } catch (err) {
      set({ isLoadingDetail: false });
      handle(err, "Failed to load job.");
    }
  },

  createJob: async (employerId, payload) => {
    set({ isMutating: true });
    try {
      const job = await jobsApi.create(employerId, payload);
      toast.success("Job draft created. Now generate a description.");
      return job;
    } catch (err) {
      handle(err, "Failed to create job.");
      return null;
    } finally {
      set({ isMutating: false });
    }
  },

  generateJd: async (employerId, jobId, payload) => {
    set({ isGeneratingJd: true });
    try {
      const res = await jobsApi.generateJd(employerId, jobId, payload);
      set((s) => (s.currentJob ? { currentJob: { ...s.currentJob, generatedJd: res.generatedJd, isAiGenerated: res.isAiGenerated } } : {}));
      toast.success(`Job description generated (${res.generatorUsed}).`);
    } catch (err) {
      handle(err, "Failed to generate job description.");
    } finally {
      set({ isGeneratingJd: false });
    }
  },

  updateJd: async (employerId, jobId, payload) => {
    set({ isMutating: true });
    try {
      await jobsApi.updateJd(employerId, jobId, payload);
      set((s) => (s.currentJob ? { currentJob: { ...s.currentJob, generatedJd: payload.jdText, isAiGenerated: false } } : {}));
      toast.success("Job description saved.");
    } catch (err) {
      handle(err, "Failed to save job description.");
    } finally {
      set({ isMutating: false });
    }
  },

  publish: async (employerId, jobId) => {
    set({ isMutating: true });
    try {
      await jobsApi.publish(employerId, jobId);
      await get().loadMyJob(employerId, jobId);
      toast.success("Job published! Matching candidates are being notified.");
      return true;
    } catch (err) {
      handle(err, "Failed to publish job.");
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  close: async (employerId, jobId) => {
    set({ isMutating: true });
    try {
      await jobsApi.close(employerId, jobId);
      await get().loadMyJob(employerId, jobId);
      toast.success("Job closed.");
    } catch (err) {
      handle(err, "Failed to close job.");
    } finally {
      set({ isMutating: false });
    }
  },

  deleteDraft: async (employerId, jobId) => {
    try {
      await jobsApi.deleteDraft(employerId, jobId);
      toast.success("Draft deleted.");
      return true;
    } catch (err) {
      handle(err, "Failed to delete draft.");
      return false;
    }
  },

  clearCurrentJob: () => set({ currentJob: null }),
}));
