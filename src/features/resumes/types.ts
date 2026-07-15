import type { ParseStatus, ResumeFormat } from "@/types/enums";

export interface ResumeDto {
  resumeId: number;
  fileFormat: ResumeFormat;
  isPrimary: boolean;
  parseStatus: ParseStatus;
  parseError: string | null;
  uploadedAt: string;
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
