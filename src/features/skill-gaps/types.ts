import type { ImportanceLevel, TargetSkillStatus } from "@/types/enums";

export interface CandidateSkillGapDto {
  skillId: number;
  skillName: string;
  importance: ImportanceLevel;
  suggestion: string | null;
  jobId: number;
  jobTitle: string;
  companyName: string | null;
  detectedAt: string;
}

export interface SkillGapSummaryDto {
  skillId: number;
  skillName: string;
  mustHaveCount: number;
  niceToHaveCount: number;
  totalOccurrences: number;
}

// A skill the candidate has chosen to work on after seeing it flagged as a gap.
export interface TargetSkillDto {
  skillId: number;
  skillName: string;
  status: TargetSkillStatus;
  addedAt: string;
  completedAt: string | null;
}
