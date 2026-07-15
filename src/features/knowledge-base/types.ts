import type { KnowledgeCategory } from "@/types/enums";

export interface KnowledgeBaseDto {
  kbId: number;
  title: string;
  content: string;
  category: KnowledgeCategory;
  isActive: boolean;
  updatedAt: string;
}

export interface UpsertKnowledgeBaseRequest {
  title: string;
  content: string;
  category: KnowledgeCategory;
  isActive: boolean;
}
