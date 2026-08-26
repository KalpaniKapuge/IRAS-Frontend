import { http } from "@/lib/api-client";
import type { SkillResourceDto, UpsertSkillResourceRequest } from "./types";

export const skillResourcesApi = {
  getAll: () => http.get<SkillResourceDto[]>("/api/skill-resources").then((r) => r.data),
  create: (payload: UpsertSkillResourceRequest) =>
    http.post<SkillResourceDto>("/api/skill-resources", payload).then((r) => r.data),
  update: (resourceId: number, payload: UpsertSkillResourceRequest) =>
    http.put(`/api/skill-resources/${resourceId}`, payload).then((r) => r.data),
  remove: (resourceId: number) => http.delete(`/api/skill-resources/${resourceId}`).then((r) => r.data),
};
