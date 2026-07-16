import { create } from "zustand";
import { toast } from "sonner";
import { ApiError } from "@/types/common";
import type { ApplicationStatus } from "@/types/enums";
import { applicationsApi } from "./api";
import type { ApplicationDto, ApplyForJobRequest, RankedApplicantDto } from "./types";

interface ApplicationsState {
  myApplications: ApplicationDto[];
  rankedApplicants: RankedApplicantDto[];
  isLoading: boolean;
  isApplying: boolean;

  loadMine: () => Promise<void>;
  apply: (payload: ApplyForJobRequest) => Promise<boolean>;
  loadRanked: (employerId: number, jobId: number) => Promise<void>;
  updateStatus: (employerId: number, jobId: number, applicationId: number, status: ApplicationStatus) => Promise<void>;
}

function handle(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export const useApplicationsStore = create<ApplicationsState>()((set, get) => ({
  myApplications: [],
  rankedApplicants: [],
  isLoading: false,
  isApplying: false,

  loadMine: async () => {
    set({ isLoading: true });
    try {
      const myApplications = await applicationsApi.getMine();
      set({ myApplications, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      handle(err, "Failed to load your applications.");
    }
  },

  apply: async (payload) => {
    set({ isApplying: true });
    try {
      const existingApplications =
        get().myApplications.length > 0 ? get().myApplications : await applicationsApi.getMine();
      const existing = existingApplications.find((application) => application.jobId === payload.jobId);

      if (existing) {
        set({ myApplications: existingApplications });
        toast.info("You have already applied to this job.");
        return false;
      }

      const saved = await applicationsApi.apply(payload);
      set({ myApplications: [saved, ...existingApplications] });
      toast.success("Application submitted!");
      return true;
    } catch (err) {
      handle(err, "Failed to submit application.");
      return false;
    } finally {
      set({ isApplying: false });
    }
  },

  loadRanked: async (employerId, jobId) => {
    set({ isLoading: true });
    try {
      const rankedApplicants = await applicationsApi.getRanked(employerId, jobId);
      set({ rankedApplicants, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      handle(err, "Failed to load applicants.");
    }
  },

  updateStatus: async (employerId, jobId, applicationId, status) => {
    try {
      await applicationsApi.updateStatus(employerId, jobId, applicationId, status);
      set({
        rankedApplicants: get().rankedApplicants.map((a) => (a.applicationId === applicationId ? { ...a, status } : a)),
      });
      toast.success(`Application marked as ${status}.`);
    } catch (err) {
      handle(err, "Failed to update application status.");
    }
  },
}));
