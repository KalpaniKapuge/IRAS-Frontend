import type { ApplicationStatus, ImportanceLevel } from "@/types/enums";

export interface SkillGapDto {
  skillId: number;
  skillName: string;
  importance: ImportanceLevel;
  suggestion: string | null;
}

export interface ApplicationDto {
  applicationId: number;
  jobId: number;
  jobTitle: string;
  companyName: string | null;
  status: ApplicationStatus;
  totalScore: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  semanticSimilarity: number;
  appliedAt: string;
  skillGaps: SkillGapDto[];
}

export interface RankedApplicantDto {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  status: ApplicationStatus;
  totalScore: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  semanticSimilarity: number;
  appliedAt: string;
  skillGaps: SkillGapDto[];
}

export interface ApplyForJobRequest {
  jobId: number;
  resumeId: number;
}

export type EmployerSettableStatus = Extract<
  ApplicationStatus,
  "Screened" | "Shortlisted" | "Interview" | "Rejected" | "Hired"
>;
