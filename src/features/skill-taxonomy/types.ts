import type { SkillCategory } from "@/types/enums";
import type { PagedResult } from "@/types/common";

export interface SkillAliasDto {
  aliasId: number;
  aliasText: string;
  source: string;
}

export interface SkillDto {
  skillId: number;
  skillName: string;
  category: SkillCategory;
  description: string | null;
  aliases: SkillAliasDto[];
}

export interface CreateSkillRequest {
  skillName: string;
  category: SkillCategory;
  description?: string;
  aliases?: string[];
}

export interface UpdateSkillRequest {
  skillName: string;
  category: SkillCategory;
  description?: string;
}

export interface SkillResolveResult {
  found: boolean;
  skillId: number | null;
  skillName: string | null;
  matchedBy: "name" | "alias" | "none";
}

export type SkillPagedResult = PagedResult<SkillDto>;
