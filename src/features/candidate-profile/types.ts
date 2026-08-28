import type { EducationLevel, ProficiencyLevel, SkillSource } from "@/types/enums";

export interface EducationDto {
  educationId: number;
  degree: string;
  institution: string;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  grade: string | null;
}

export interface WorkExperienceDto {
  experienceId: number;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}

export interface CertificationDto {
  certificationId: number;
  name: string;
  issuingOrg: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  certificateFileUrl?: string | null;
  certificateFileName?: string | null;
  certificateContentType?: string | null;
}

export interface LanguageDto {
  languageId: number;
  languageName: string;
  proficiency: string;
}

export interface ProjectDto {
  projectId: number;
  title: string;
  description: string | null;
  projectUrl: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface CandidateSkillDto {
  skillId: number;
  skillName: string;
  proficiency: ProficiencyLevel;
  yearsExp: number;
  source: SkillSource;
  isVerified: boolean;
}

export interface CandidateProfileDto {
  candidateId: number;
  firstName: string;
  lastName: string;
  citizenship: string | null;
  phone: string | null;
  headline: string | null;
  profilePictureUrl?: string | null;
  githubUrl: string | null;
  linkedInUrl: string | null;
  totalExpYears: number;
  educationLevel: EducationLevel;
  optInMatching: boolean;
  educations: EducationDto[];
  workExperiences: WorkExperienceDto[];
  certifications: CertificationDto[];
  languages: LanguageDto[];
  projects: ProjectDto[];
  skills: CandidateSkillDto[];
}

export interface UpdateCandidateProfileRequest {
  firstName: string;
  lastName: string;
  citizenship?: string;
  phone?: string;
  headline?: string;
  githubUrl?: string;
  linkedInUrl?: string;
  educationLevel: EducationLevel;
  optInMatching: boolean;
}

export type EducationFormValues = Omit<EducationDto, "educationId"> & { educationId?: number };
export type WorkExperienceFormValues = Omit<WorkExperienceDto, "experienceId"> & { experienceId?: number };
export type CertificationFormValues = Omit<
  CertificationDto,
  "certificationId" | "certificateFileUrl" | "certificateFileName" | "certificateContentType"
> & {
  certificationId?: number;
  certificateFile?: File | null;
};

export type LanguageFormValues = Omit<LanguageDto, "languageId"> & { languageId?: number };
export type ProjectFormValues = Omit<ProjectDto, "projectId"> & { projectId?: number };

export interface UpsertCandidateSkillRequest {
  skillId: number;
  proficiency: ProficiencyLevel;
  yearsExp: number;
}
