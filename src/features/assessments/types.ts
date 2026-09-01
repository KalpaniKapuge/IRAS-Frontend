export type AssessmentQuestionType = "MultipleChoice" | "FreeText";

export interface AssessmentStatusDto {
  requireAssessment: boolean;
  hasAttempted: boolean;
  isCompleted: boolean;
  score: number | null;
  deadlineAt: string | null;
}

export interface AssessmentQuestionDto {
  questionId: number;
  questionType: AssessmentQuestionType;
  questionText: string;
  options: string[];
}

export interface StartAssessmentResponse {
  attemptId: number;
  startedAt: string;
  deadlineAt: string;
  questions: AssessmentQuestionDto[];
}

export interface SubmitAssessmentAnswer {
  questionId: number;
  selectedOptionIndex?: number;
  freeTextAnswer?: string;
}

export interface SubmitAssessmentRequest {
  answers: SubmitAssessmentAnswer[];
}

export interface AssessmentResultDto {
  score: number;
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
}

// Employer-facing view of a completed attempt — includes the answer key alongside what the
// candidate actually answered.
export interface AssessmentQuestionReviewDto {
  questionType: AssessmentQuestionType;
  questionText: string;
  options: string[];
  correctOptionIndex: number | null;
  modelAnswer: string | null;
  selectedOptionIndex: number | null;
  freeTextAnswer: string | null;
  scoreFraction: number;
}

export interface EmployerAssessmentReviewDto {
  score: number;
  completedAt: string | null;
  questions: AssessmentQuestionReviewDto[];
}
