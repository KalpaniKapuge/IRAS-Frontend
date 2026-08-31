import { http } from "@/lib/api-client";
import type { AddEvidenceLinkRequest, SkillPlanEvidenceDto, SkillImprovementPlanDto } from "./types";

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

  addEvidenceLink: (candidateId: number, planId: number, payload: AddEvidenceLinkRequest) =>
    http
      .post<SkillPlanEvidenceDto>(`${base(candidateId)}/${planId}/evidence`, payload)
      .then((r) => r.data),

  addEvidenceFile: (candidateId: number, planId: number, evidenceType: string, notes: string | undefined, file: File) => {
    const form = new FormData();
    form.append("evidenceType", evidenceType);
    if (notes) form.append("notes", notes);
    form.append("file", file);
    return http
      .post<SkillPlanEvidenceDto>(`${base(candidateId)}/${planId}/evidence`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  removeEvidence: (candidateId: number, planId: number, evidenceId: number) =>
    http.delete(`${base(candidateId)}/${planId}/evidence/${evidenceId}`).then((r) => r.data),

  submitEvidence: (candidateId: number, planId: number, evidenceId: number) =>
    http
      .put<SkillPlanEvidenceDto>(`${base(candidateId)}/${planId}/evidence/${evidenceId}/submit`, {})
      .then((r) => r.data),
};
