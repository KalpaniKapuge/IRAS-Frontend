export interface AiModelStatusDto {
  aiServiceOnline: boolean;
  aiServiceBaseUrl: string;
  totalResumesParsed: number;
  totalResumesFailed: number;
  parseSuccessRate: number;
}

export interface SystemSettingsDto {
  skillMatchWeight: number;
  semanticSimilarityWeight: number;
  autoMatchThreshold: number;
  aiServiceBaseUrl: string;
  aiServiceTimeoutSeconds: number;
  maxResumeFileSizeBytes: number;
  maxResumesPerCandidate: number;
}
