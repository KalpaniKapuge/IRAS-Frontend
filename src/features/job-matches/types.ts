export interface JobMatchDto {
  matchId: number;
  jobId: number;
  jobTitle: string;
  companyName: string | null;
  matchScore: number;
  thresholdPassed: boolean;
  matchedAt: string;
}
