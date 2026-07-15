import type { CompanySize } from "@/types/enums";

export interface EmployerProfileDto {
  employerId: number;
  companyName: string;
  industry: string | null;
  companySize: CompanySize;
  website: string | null;
  location: string | null;
  description: string | null;
}

export interface UpdateEmployerProfileRequest {
  companyName: string;
  industry?: string;
  companySize: CompanySize;
  website?: string;
  location?: string;
  description?: string;
}
