import { http } from "@/lib/api-client";
import type {
  CreateSkillRequest,
  SkillDto,
  SkillPagedResult,
  SkillResolveResult,
  UpdateSkillRequest,
} from "./types";

export const skillTaxonomyApi = {
  search: (query?: string, category?: string, page = 1, pageSize = 20) =>
    http
      .get<SkillPagedResult>("/api/skills", { params: { query, category, page, pageSize } })
      .then((r) => r.data),

  resolve: (text: string) => http.get<SkillResolveResult>("/api/skills/resolve", { params: { text } }).then((r) => r.data),

  getById: (skillId: number) => http.get<SkillDto>(`/api/skills/${skillId}`).then((r) => r.data),

  create: (payload: CreateSkillRequest) => http.post<SkillDto>("/api/skills", payload).then((r) => r.data),

  update: (skillId: number, payload: UpdateSkillRequest) =>
    http.put(`/api/skills/${skillId}`, payload).then((r) => r.data),

  remove: (skillId: number) => http.delete(`/api/skills/${skillId}`).then((r) => r.data),

  addAlias: (skillId: number, aliasText: string) =>
    http.post(`/api/skills/${skillId}/aliases`, { aliasText }).then((r) => r.data),

  deleteAlias: (skillId: number, aliasId: number) =>
    http.delete(`/api/skills/${skillId}/aliases/${aliasId}`).then((r) => r.data),
};
