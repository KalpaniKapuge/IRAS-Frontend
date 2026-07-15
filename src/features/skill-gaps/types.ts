import type { ImportanceLevel } from "@/types/enums";

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
