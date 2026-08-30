import type {
  EvidenceVerificationStatus,
  SkillEvidenceType,
  SkillPlanPriority,
  SkillPlanStatus,
  SkillTargetLevel,
} from "@/types/enums";

export interface SkillPlanStepDto {
  stepId: number;
  stepOrder: number;
  title: string;
  description: string;
  activity: string;
  output: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface SkillPlanEvidenceDto {
  evidenceId: number;
  planId: number;
  evidenceType: SkillEvidenceType;
  evidenceUrl: string;
  notes: string | null;
  uploadedAt: string;
  verificationStatus: EvidenceVerificationStatus;
  verifiedAt: string | null;
  verifierNotes: string | null;

  // Null for file-backed evidence — automatic review only runs on link-type submissions.
  aiConfidenceScore: number | null;
  aiRationale: string | null;
  autoReviewed: boolean;
}

export interface AddEvidenceLinkRequest {
  evidenceType: SkillEvidenceType;
  evidenceUrl: string;
  notes?: string;
}

export interface SkillImprovementPlanDto {
  planId: number;
  skillId: number;
  skillName: string;
  jobId: number | null;
  jobTitle: string | null;

  priority: SkillPlanPriority;
  targetLevel: SkillTargetLevel;
  estimatedDays: number;

  overview: string;
  gapReason: string;

  projectTitle: string;
  projectTask: string;
  projectExpectedOutput: string;

  status: SkillPlanStatus;
  generatedBy: string;
  createdAt: string;

  progressPercent: number;
  steps: SkillPlanStepDto[];
  evidence: SkillPlanEvidenceDto[];
}

// Admin review-queue row — see AdminEvidenceReviewDto on the backend.
export interface AdminEvidenceReviewDto {
  evidenceId: number;
  planId: number;
  candidateId: number;
  candidateName: string;
  skillId: number;
  skillName: string;
  evidenceType: SkillEvidenceType;
  evidenceUrl: string;
  notes: string | null;
  uploadedAt: string;
  verificationStatus: EvidenceVerificationStatus;
  aiConfidenceScore: number | null;
  aiRationale: string | null;
}
