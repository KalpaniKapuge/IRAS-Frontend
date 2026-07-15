import type { EducationLevel, EmploymentType, ImportanceLevel, JobStatus } from "@/types/enums";

export interface JobRequiredSkillDto {
  skillId: number;
  skillName?: string;
  importance: ImportanceLevel;
  weight?: number | null;
  minYears: number;
}

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
  requiredSkillCount: number;
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
