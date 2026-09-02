import type { ParseStatus, ResumeFormat } from "@/types/enums";

export interface ResumeDto {
  resumeId: number;
  fileFormat: ResumeFormat;
  isPrimary: boolean;
  parseStatus: ParseStatus;
  parseError: string | null;
  uploadedAt: string;
  // The original uploaded file name, or a CV-derived name (e.g. "My Software Engineer
  // CV.pdf") for resumes generated from the CV builder — prefer this over a generic
  // "{fileFormat} Resume" label wherever a resume is displayed.
  fileName: string | null;
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
