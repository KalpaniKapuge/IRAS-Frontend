import { http } from "@/lib/api-client";
import type {
  CreateCvRequest,
  CvDetailDto,
  CvSummaryDto,
  CvTemplateDto,
  UpdateCvRequest,
  UpdateCvSectionItemsRequest,
} from "./types";

export const cvApi = {
  getTemplates: () => http.get<CvTemplateDto[]>("/api/cv/templates").then((r) => r.data),

  getMine: () => http.get<CvSummaryDto[]>("/api/cv").then((r) => r.data),

  getDetail: (cvId: number) => http.get<CvDetailDto>(`/api/cv/${cvId}`).then((r) => r.data),

  create: (payload: CreateCvRequest) => http.post<CvDetailDto>("/api/cv", payload).then((r) => r.data),

  update: (cvId: number, payload: UpdateCvRequest) => http.put(`/api/cv/${cvId}`, payload).then((r) => r.data),

  updateItems: (cvId: number, payload: UpdateCvSectionItemsRequest) =>
    http.put(`/api/cv/${cvId}/items`, payload).then((r) => r.data),

  remove: (cvId: number) => http.delete(`/api/cv/${cvId}`).then((r) => r.data),

  downloadPdf: (cvId: number) =>
    http.get(`/api/cv/${cvId}/download`, { responseType: "blob" }).then((r) => r.data as Blob),
};
