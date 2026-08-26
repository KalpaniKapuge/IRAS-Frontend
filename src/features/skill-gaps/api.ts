import { http } from "@/lib/api-client";
import type { CandidateSkillGapDto, SkillGapSummaryDto, TargetSkillDto } from "./types";

export const skillGapsApi = {
  getMine: (candidateId: number) =>
    http.get<CandidateSkillGapDto[]>(`/api/candidates/${candidateId}/skill-gaps`).then((r) => r.data),

  getMySummary: (candidateId: number) =>
    http.get<SkillGapSummaryDto[]>(`/api/candidates/${candidateId}/skill-gaps/summary`).then((r) => r.data),

  getMyTargetSkills: (candidateId: number) =>
    http.get<TargetSkillDto[]>(`/api/candidates/${candidateId}/skill-gaps/target-skills`).then((r) => r.data),

  addTargetSkill: (candidateId: number, skillId: number) =>
    http
      .post<TargetSkillDto>(`/api/candidates/${candidateId}/skill-gaps/target-skills`, { skillId })
      .then((r) => r.data),

  completeTargetSkill: (candidateId: number, skillId: number) =>
    http.put(`/api/candidates/${candidateId}/skill-gaps/target-skills/${skillId}/complete`, {}).then((r) => r.data),

  removeTargetSkill: (candidateId: number, skillId: number) =>
    http.delete(`/api/candidates/${candidateId}/skill-gaps/target-skills/${skillId}`).then((r) => r.data),
};
