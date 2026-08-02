export interface JobMatchDto {
  matchId: number;
  jobId: number;
  jobTitle: string;
  companyName: string | null;
  matchScore: number;
  thresholdPassed: boolean;
  matchedAt: string;
}

// Live, on-demand recommendations scored right now against the candidate's current
// resume — unlike JobMatchDto, which is a persisted snapshot taken when the job was
// first published (see IJobMatchingService.GetRecommendedJobsAsync).
export interface JobRecommendationDto {
  jobId: number;
  jobTitle: string;
  companyName: string | null;
  matchScore: number;
  skillMatch: number;
  semanticSimilarity: number;
  mlFitScore: number | null;
}
