import { http } from "@/lib/api-client";
import type { AdminEvidenceReviewDto, SkillPlanEvidenceDto } from "@/features/skill-improvement-plans/types";

export type EvidenceDecision = "Approve" | "Reject" | "RequestRevision";

export const adminSkillPlanReviewApi = {
  getPending: () =>
    http.get<AdminEvidenceReviewDto[]>("/api/admin/skill-plan-evidence/pending").then((r) => r.data),

  verify: (evidenceId: number, decision: EvidenceDecision, verifierNotes?: string) =>
    http
      .put<SkillPlanEvidenceDto>(`/api/admin/skill-plan-evidence/${evidenceId}/verify`, { decision, verifierNotes })
      .then((r) => r.data),
};
