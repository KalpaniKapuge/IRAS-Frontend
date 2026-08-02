import { http } from "@/lib/api-client";
import type { JobMatchDto, JobRecommendationDto } from "./types";

export const jobMatchesApi = {
  getMine: (candidateId: number) => http.get<JobMatchDto[]>(`/api/candidates/${candidateId}/job-matches`).then((r) => r.data),

  getRecommended: (candidateId: number) =>
    http.get<JobRecommendationDto[]>(`/api/candidates/${candidateId}/job-matches/recommended`).then((r) => r.data),
};
