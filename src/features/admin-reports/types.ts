export interface TopSkillGapDto {
  skillName: string;
  occurrences: number;
}

export interface DashboardStatsDto {
  totalCandidates: number;
  totalEmployers: number;
  totalJobs: number;
  publishedJobs: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  totalResumes: number;
  parsedResumes: number;
  failedResumes: number;
  averageApplicationScore: number;
  totalSkillGapsDetected: number;
  topMissingSkills: TopSkillGapDto[];
  totalJobMatches: number;
  pendingFeedbackReviews: number;
}
