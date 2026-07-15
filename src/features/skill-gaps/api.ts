import { http } from "@/lib/api-client";
import type { CandidateSkillGapDto, SkillGapSummaryDto } from "./types";

export const skillGapsApi = {
  getMine: (candidateId: number) =>
    http.get<CandidateSkillGapDto[]>(`/api/candidates/${candidateId}/skill-gaps`).then((r) => r.data),

  getMySummary: (candidateId: number) =>
    http.get<SkillGapSummaryDto[]>(`/api/candidates/${candidateId}/skill-gaps/summary`).then((r) => r.data),
};
