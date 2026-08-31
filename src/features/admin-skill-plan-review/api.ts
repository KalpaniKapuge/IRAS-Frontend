import { http } from "@/lib/api-client";
import type { EvidenceVerificationStatus } from "@/types/enums";
import type { AdminEvidenceReviewDto, SkillPlanEvidenceDto } from "@/features/skill-improvement-plans/types";

export type EvidenceDecision = "Approve" | "Reject" | "RequestRevision";

// Draft is excluded — it's the candidate's own not-yet-submitted copy, never something an
// admin reviews or has a decision to show for.
export type AdminReviewableStatus = Exclude<EvidenceVerificationStatus, "Draft">;

export const adminSkillPlanReviewApi = {
  getByStatus: (status: AdminReviewableStatus) =>
    http.get<AdminEvidenceReviewDto[]>("/api/admin/skill-plan-evidence", { params: { status } }).then((r) => r.data),

  verify: (evidenceId: number, decision: EvidenceDecision, verifierNotes?: string) =>
    http
      .put<SkillPlanEvidenceDto>(`/api/admin/skill-plan-evidence/${evidenceId}/verify`, { decision, verifierNotes })
      .then((r) => r.data),
};
