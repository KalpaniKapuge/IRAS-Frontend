import type { ParseStatus, ResumeFormat } from "@/types/enums";

export interface ResumeDto {
  resumeId: number;
  fileFormat: ResumeFormat;
  isPrimary: boolean;
  parseStatus: ParseStatus;
  parseError: string | null;
  uploadedAt: string;
  // Set only when this resume was generated from a CV-builder CV rather than uploaded —
  // the CV's own title, for display (e.g. "My Software Engineer CV" instead of "PDF Resume").
  sourceCvTitle: string | null;
}

export interface SuggestedSkillDto {
  skillId: number;
  skillName: string;
  matchedText: string;
  occurrences: number;
  alreadyOnProfile: boolean;
}

export interface ParseResultDto {
  resumeId: number;
  parseStatus: ParseStatus;
  parseError: string | null;
  suggestedSkills: SuggestedSkillDto[];
  detectedEmails: string[];
  detectedPhones: string[];
}
