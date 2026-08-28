import { create } from "zustand";
import { toast } from "sonner";
import { ApiError } from "@/types/common";
import { cvApi } from "./api";
import type {
  CreateCvRequest,
  CvDetailDto,
  CvSummaryDto,
  CvTemplateDto,
  UpdateCvRequest,
  UpdateCvSectionItemsRequest,
} from "./types";

interface CvState {
  cvs: CvSummaryDto[];
  templates: CvTemplateDto[];
  currentCv: CvDetailDto | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  isSaving: boolean;
  isDownloading: boolean;
  isUploadingPhoto: boolean;

  loadTemplates: () => Promise<void>;
  loadMine: () => Promise<void>;
  loadDetail: (cvId: number) => Promise<void>;
  create: (payload: CreateCvRequest) => Promise<CvDetailDto | null>;
  update: (cvId: number, payload: UpdateCvRequest) => Promise<void>;
  uploadPhoto: (cvId: number, file: File) => Promise<boolean>;
  updateItems: (cvId: number, payload: UpdateCvSectionItemsRequest) => Promise<void>;
  remove: (cvId: number) => Promise<boolean>;
  download: (cvId: number, fileName: string) => Promise<void>;
  clearCurrent: () => void;
}

function handle(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

export const useCvStore = create<CvState>()((set, get) => ({
  cvs: [],
  templates: [],
  currentCv: null,
  isLoadingList: false,
  isLoadingDetail: false,
  isSaving: false,
  isDownloading: false,
  isUploadingPhoto: false,

  loadTemplates: async () => {
    if (get().templates.length > 0) return;
    try {
      const templates = await cvApi.getTemplates();
      set({ templates });
    } catch (err) {
      handle(err, "Failed to load CV templates.");
    }
  },

  loadMine: async () => {
    set({ isLoadingList: true });
    try {
      const cvs = await cvApi.getMine();
      set({ cvs, isLoadingList: false });
    } catch (err) {
      set({ isLoadingList: false });
      handle(err, "Failed to load your CVs.");
    }
  },

  loadDetail: async (cvId) => {
    set({ isLoadingDetail: true, currentCv: null });
    try {
      const currentCv = await cvApi.getDetail(cvId);
      set({ currentCv, isLoadingDetail: false });
    } catch (err) {
      set({ isLoadingDetail: false });
      handle(err, "Failed to load this CV.");
    }
  },

  create: async (payload) => {
    set({ isSaving: true });
    try {
      const cv = await cvApi.create(payload);
      toast.success("CV created.");
      return cv;
    } catch (err) {
      handle(err, "Failed to create CV.");
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  update: async (cvId, payload) => {
    set({ isSaving: true });
    try {
      await cvApi.update(cvId, payload);
      await get().loadDetail(cvId);
      toast.success("CV saved.");
    } catch (err) {
      handle(err, "Failed to save CV.");
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  uploadPhoto: async (cvId, file) => {
    set({ isUploadingPhoto: true });
    try {
      const currentCv = await cvApi.uploadPhoto(cvId, file);
      set({ currentCv });
      toast.success("CV photo updated.");
      return true;
    } catch (err) {
      handle(err, "Failed to upload CV photo.");
      return false;
    } finally {
      set({ isUploadingPhoto: false });
    }
  },

  updateItems: async (cvId, payload) => {
    set({ isSaving: true });
    try {
      await cvApi.updateItems(cvId, payload);
      await get().loadDetail(cvId);
    } catch (err) {
      handle(err, "Failed to save section selection.");
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  remove: async (cvId) => {
    try {
      await cvApi.remove(cvId);
      toast.success("CV deleted.");
      return true;
    } catch (err) {
      handle(err, "Failed to delete CV.");
      return false;
    }
  },

  download: async (cvId, fileName) => {
    set({ isDownloading: true });
    try {
      const blob = await cvApi.downloadPdf(cvId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      handle(err, "Failed to download CV.");
    } finally {
      set({ isDownloading: false });
    }
  },

  clearCurrent: () => set({ currentCv: null }),
}));
