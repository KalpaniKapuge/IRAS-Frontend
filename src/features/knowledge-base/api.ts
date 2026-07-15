import { http } from "@/lib/api-client";
import type { KnowledgeBaseDto, UpsertKnowledgeBaseRequest } from "./types";

export const knowledgeBaseApi = {
  getAll: () => http.get<KnowledgeBaseDto[]>("/api/admin/knowledge-base").then((r) => r.data),
  create: (payload: UpsertKnowledgeBaseRequest) =>
    http.post<KnowledgeBaseDto>("/api/admin/knowledge-base", payload).then((r) => r.data),
  update: (kbId: number, payload: UpsertKnowledgeBaseRequest) =>
    http.put(`/api/admin/knowledge-base/${kbId}`, payload).then((r) => r.data),
  remove: (kbId: number) => http.delete(`/api/admin/knowledge-base/${kbId}`).then((r) => r.data),
};
