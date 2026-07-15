import { http } from "@/lib/api-client";
import type { JobMatchDto } from "./types";

export const jobMatchesApi = {
  getMine: (candidateId: number) => http.get<JobMatchDto[]>(`/api/candidates/${candidateId}/job-matches`).then((r) => r.data),
};
