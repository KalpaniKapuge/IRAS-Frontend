import type { EducationLevel, EmploymentType, ImportanceLevel, JobStatus } from "@/types/enums";

export interface JobRequiredSkillDto {
  skillId: number;
  skillName?: string;
  importance: ImportanceLevel;
  weight?: number | null;
  minYears: number;
}

export const JOB_TEMPLATE_KEYS = ["modern", "classic", "bold"] as const;
export type JobTemplateKey = (typeof JOB_TEMPLATE_KEYS)[number];

export interface JobDto {
  jobId: number;
  employerId: number;
  companyName: string | null;
  title: string;
  seniorityLevel: string;
  requirementInput: string | null;
  generatedJd: string | null;
  isAiGenerated: boolean;
  minExpYears: number;
  educationReq: EducationLevel;
  employmentType: EmploymentType;
  location: string | null;
  status: JobStatus;
  postedAt: string | null;
  closingDate: string | null;
  templateKey: string | null;
  applicationCount: number;
  requiredSkills: JobRequiredSkillDto[];
}

export interface JobSummaryDto {
  jobId: number;
  title: string;
  companyName: string | null;
  seniorityLevel: string;
  employmentType: EmploymentType;
  location: string | null;
  status: JobStatus;
  postedAt: string | null;
  closingDate: string | null;
  templateKey: string | null;
  requiredSkillCount: number;
  applicationCount: number;
}

export interface CreateJobRequest {
  title: string;
  seniorityLevel: string;
  minExpYears: number;
  educationReq: EducationLevel;
  employmentType: EmploymentType;
  location?: string;
  closingDate?: string | null;
  requiredSkills: JobRequiredSkillDto[];
}

export interface UpdateJobRequest {
  title: string;
  seniorityLevel: string;
  minExpYears: number;
  educationReq: EducationLevel;
  employmentType: EmploymentType;
  location?: string | null;
  closingDate?: string | null;
  requiredSkills: JobRequiredSkillDto[];
  templateKey?: string | null;
}

export interface GenerateJdRequest {
  additionalNotes?: string;
}

export interface GenerateJdResponse {
  generatedJd: string;
  isAiGenerated: boolean;
  generatorUsed: string;
}

export interface UpdateJdRequest {
  jdText: string;
}
