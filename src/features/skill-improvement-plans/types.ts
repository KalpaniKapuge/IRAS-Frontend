import type { SkillPlanPriority, SkillPlanStatus, SkillTargetLevel } from "@/types/enums";

export interface SkillPlanStepDto {
  stepId: number;
  stepOrder: number;
  title: string;
  description: string;
  activity: string;
  output: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface SkillImprovementPlanDto {
  planId: number;
  skillId: number;
  skillName: string;
  jobId: number | null;
  jobTitle: string | null;

  priority: SkillPlanPriority;
  targetLevel: SkillTargetLevel;
  estimatedDays: number;

  overview: string;
  gapReason: string;

  projectTitle: string;
  projectTask: string;
  projectExpectedOutput: string;

  status: SkillPlanStatus;
  generatedBy: string;
  createdAt: string;

  progressPercent: number;
  steps: SkillPlanStepDto[];
}
