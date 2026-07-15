import { create } from "zustand";
import { toast } from "sonner";
import { ApiError } from "@/types/common";
import { candidateProfileApi } from "./api";
import type {
  CandidateProfileDto,
  CertificationFormValues,
  EducationFormValues,
  UpdateCandidateProfileRequest,
  UpsertCandidateSkillRequest,
  WorkExperienceFormValues,
} from "./types";

interface CandidateProfileState {
  profile: CandidateProfileDto | null;
  isLoading: boolean;
  isSaving: boolean;
  load: (candidateId: number) => Promise<void>;
  updateProfile: (candidateId: number, payload: UpdateCandidateProfileRequest) => Promise<void>;
  addEducation: (candidateId: number, payload: EducationFormValues) => Promise<void>;
  updateEducation: (candidateId: number, educationId: number, payload: EducationFormValues) => Promise<void>;
  deleteEducation: (candidateId: number, educationId: number) => Promise<void>;
  addExperience: (candidateId: number, payload: WorkExperienceFormValues) => Promise<void>;
  updateExperience: (candidateId: number, experienceId: number, payload: WorkExperienceFormValues) => Promise<void>;
  deleteExperience: (candidateId: number, experienceId: number) => Promise<void>;
  addCertification: (candidateId: number, payload: CertificationFormValues) => Promise<void>;
  deleteCertification: (candidateId: number, certificationId: number) => Promise<void>;
  upsertSkill: (candidateId: number, payload: UpsertCandidateSkillRequest) => Promise<void>;
  removeSkill: (candidateId: number, skillId: number) => Promise<void>;
}

function handle(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export const useCandidateProfileStore = create<CandidateProfileState>()((set, get) => ({
  profile: null,
  isLoading: false,
  isSaving: false,

  load: async (candidateId) => {
    set({ isLoading: true });
    try {
      const profile = await candidateProfileApi.getProfile(candidateId);
      set({ profile, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      handle(err, "Failed to load your profile.");
    }
  },

  updateProfile: async (candidateId, payload) => {
    set({ isSaving: true });
    try {
      await candidateProfileApi.updateProfile(candidateId, payload);
      await get().load(candidateId);
      toast.success("Profile updated.");
    } catch (err) {
      handle(err, "Failed to update profile.");
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  addEducation: async (candidateId, payload) => {
    try {
      await candidateProfileApi.addEducation(candidateId, payload);
      await get().load(candidateId);
      toast.success("Education added.");
    } catch (err) {
      handle(err, "Failed to add education.");
      throw err;
    }
  },

  updateEducation: async (candidateId, educationId, payload) => {
    try {
      await candidateProfileApi.updateEducation(candidateId, educationId, payload);
      await get().load(candidateId);
      toast.success("Education updated.");
    } catch (err) {
      handle(err, "Failed to update education.");
      throw err;
    }
  },

  deleteEducation: async (candidateId, educationId) => {
    try {
      await candidateProfileApi.deleteEducation(candidateId, educationId);
      await get().load(candidateId);
    } catch (err) {
      handle(err, "Failed to remove education.");
    }
  },

  addExperience: async (candidateId, payload) => {
    try {
      await candidateProfileApi.addExperience(candidateId, payload);
      await get().load(candidateId);
      toast.success("Work experience added.");
    } catch (err) {
      handle(err, "Failed to add work experience.");
      throw err;
    }
  },

  updateExperience: async (candidateId, experienceId, payload) => {
    try {
      await candidateProfileApi.updateExperience(candidateId, experienceId, payload);
      await get().load(candidateId);
      toast.success("Work experience updated.");
    } catch (err) {
      handle(err, "Failed to update work experience.");
      throw err;
    }
  },

  deleteExperience: async (candidateId, experienceId) => {
    try {
      await candidateProfileApi.deleteExperience(candidateId, experienceId);
      await get().load(candidateId);
    } catch (err) {
      handle(err, "Failed to remove work experience.");
    }
  },

  addCertification: async (candidateId, payload) => {
    try {
      await candidateProfileApi.addCertification(candidateId, payload);
      await get().load(candidateId);
      toast.success("Certification added.");
    } catch (err) {
      handle(err, "Failed to add certification.");
      throw err;
    }
  },

  deleteCertification: async (candidateId, certificationId) => {
    try {
      await candidateProfileApi.deleteCertification(candidateId, certificationId);
      await get().load(candidateId);
    } catch (err) {
      handle(err, "Failed to remove certification.");
    }
  },

  upsertSkill: async (candidateId, payload) => {
    try {
      await candidateProfileApi.upsertSkill(candidateId, payload);
      await get().load(candidateId);
    } catch (err) {
      handle(err, "Failed to save skill.");
      throw err;
    }
  },

  removeSkill: async (candidateId, skillId) => {
    try {
      await candidateProfileApi.removeSkill(candidateId, skillId);
      await get().load(candidateId);
    } catch (err) {
      handle(err, "Failed to remove skill.");
    }
  },
}));
