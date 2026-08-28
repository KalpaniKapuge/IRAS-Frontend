export const CV_SECTION_TYPES = ["Summary", "Skills", "Experience", "Education", "Certifications", "Languages", "Projects"] as const;
export type CvSectionType = (typeof CV_SECTION_TYPES)[number];

export const CV_REFERENCE_TYPES = ["Education", "Experience", "Certification", "Skill", "Language", "Project"] as const;
export type CvReferenceType = (typeof CV_REFERENCE_TYPES)[number];

export interface CvTemplateDto {
  name: string;
  description: string;
}

export interface CvSummaryDto {
  cvId: number;
  title: string;
  templateName: string;
  photoUrl: string | null;
  updatedAt: string;
}

export interface CvItemDto {
  referenceId: number;
  label: string;
  included: boolean;
  orderIndex: number;
}

export interface CvResolvedEducationDto {
  degree: string;
  institution: string;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  grade: string | null;
}

export interface CvResolvedExperienceDto {
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}

export interface CvResolvedCertificationDto {
  name: string;
  issuingOrg: string | null;
  issueDate: string | null;
}

export interface CvResolvedLanguageDto {
  languageName: string;
  proficiency: string;
}

export interface CvResolvedProjectDto {
  title: string;
  description: string | null;
  projectUrl: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface CvDetailDto {
  cvId: number;
  title: string;
  templateName: string;
  summary: string | null;
  photoUrl: string | null;
  fullName: string;
  headline: string | null;
  email: string | null;
  phone: string | null;
  githubUrl: string | null;
  linkedInUrl: string | null;
  sectionOrder: CvSectionType[];
  education: CvItemDto[];
  experience: CvItemDto[];
  certifications: CvItemDto[];
  skills: CvItemDto[];
  languages: CvItemDto[];
  projects: CvItemDto[];
  resolvedEducation: CvResolvedEducationDto[];
  resolvedExperience: CvResolvedExperienceDto[];
  resolvedCertifications: CvResolvedCertificationDto[];
  resolvedSkills: string[];
  resolvedLanguages: CvResolvedLanguageDto[];
  resolvedProjects: CvResolvedProjectDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCvRequest {
  title: string;
  templateName: string;
}

export interface UpdateCvRequest {
  title: string;
  templateName: string;
  summary?: string;
  sectionOrder: string[];
}

export interface UpdateCvSectionItemsRequest {
  referenceType: CvReferenceType;
  referenceIds: number[];
}
