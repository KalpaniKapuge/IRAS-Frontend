import type { SkillResourceType } from "@/types/enums";

export interface SkillResourceDto {
  resourceId: number;
  skillId: number;
  skillName: string;
  title: string;
  url: string;
  resourceType: SkillResourceType;
  provider: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UpsertSkillResourceRequest {
  skillId: number;
  title: string;
  url: string;
  resourceType: SkillResourceType;
  provider: string | null;
  isActive: boolean;
}
