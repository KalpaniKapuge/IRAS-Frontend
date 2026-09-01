export interface AssessmentStatusDto {
  requireAssessment: boolean;
  hasAttempted: boolean;
  isCompleted: boolean;
  score: number | null;
}

export interface AssessmentQuestionDto {
  questionId: number;
  questionText: string;
  options: string[];
}

export interface StartAssessmentResponse {
  attemptId: number;
  questions: AssessmentQuestionDto[];
}

export interface SubmitAssessmentAnswer {
  questionId: number;
  selectedOptionIndex: number;
}

export interface SubmitAssessmentRequest {
  answers: SubmitAssessmentAnswer[];
}

export interface AssessmentResultDto {
  score: number;
  correctCount: number;
  totalQuestions: number;
}
