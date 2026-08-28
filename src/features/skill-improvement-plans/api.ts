import { http } from "@/lib/api-client";
import type { SkillImprovementPlanDto } from "./types";

const base = (candidateId: number) => `/api/candidates/${candidateId}/skill-improvement-plans`;

export const skillImprovementPlansApi = {
  getMine: (candidateId: number) =>
    http.get<SkillImprovementPlanDto[]>(base(candidateId)).then((r) => r.data),

  getById: (candidateId: number, planId: number) =>
    http.get<SkillImprovementPlanDto>(`${base(candidateId)}/${planId}`).then((r) => r.data),

  setStepCompletion: (candidateId: number, planId: number, stepId: number, isCompleted: boolean) =>
    http
      .put<SkillImprovementPlanDto>(`${base(candidateId)}/${planId}/steps/${stepId}/complete`, { isCompleted })
      .then((r) => r.data),
};
