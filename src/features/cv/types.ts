export const CV_SECTION_TYPES = ["Summary", "Skills", "Experience", "Education", "Certifications"] as const;
export type CvSectionType = (typeof CV_SECTION_TYPES)[number];

export const CV_REFERENCE_TYPES = ["Education", "Experience", "Certification", "Skill"] as const;
export type CvReferenceType = (typeof CV_REFERENCE_TYPES)[number];

export interface CvTemplateDto {
  name: string;
  description: string;
}

export interface CvSummaryDto {
  cvId: number;
  title: string;
  templateName: string;
  updatedAt: string;
}

export interface CvItemDto {
  referenceId: number;
  label: string;
  included: boolean;
  orderIndex: number;
}

export interface CvDetailDto {
  cvId: number;
  title: string;
  templateName: string;
  summary: string | null;
  sectionOrder: CvSectionType[];
  education: CvItemDto[];
  experience: CvItemDto[];
  certifications: CvItemDto[];
  skills: CvItemDto[];
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
