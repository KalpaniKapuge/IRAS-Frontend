import { http } from "@/lib/api-client";
import type {
  AssessmentQuestionDto,
  AssessmentResultDto,
  AssessmentStatusDto,
  StartAssessmentResponse,
  SubmitAssessmentRequest,
} from "./types";

function normalizeQuestion(raw: any, index: number): AssessmentQuestionDto {
  const rawType = raw.questionType ?? raw.type ?? raw.kind ?? "MultipleChoice";
  const questionType = /free|text|written|code/i.test(String(rawType)) ? "FreeText" : "MultipleChoice";
  const options = raw.options ?? raw.choices ?? raw.answers ?? [];

  return {
    questionId: Number(raw.questionId ?? raw.id ?? raw.assessmentQuestionId ?? index + 1),
    questionType,
    questionText: String(raw.questionText ?? raw.text ?? raw.prompt ?? raw.question ?? ""),
    options: Array.isArray(options) ? options.map(String) : [],
  };
}

function normalizeStartResponse(data: any): StartAssessmentResponse {
  const source = data?.attempt ?? data?.assessment ?? data;
  const questionsSource = source?.questions ?? source?.items ?? source?.assessmentQuestions ?? data?.questions ?? [];
  const questions = Array.isArray(questionsSource)
    ? questionsSource.map(normalizeQuestion).filter((question) => question.questionText.trim().length > 0)
    : [];

  return {
    attemptId: Number(source?.attemptId ?? source?.id ?? source?.assessmentAttemptId ?? Date.now()),
    startedAt: String(source?.startedAt ?? source?.startTime ?? new Date().toISOString()),
    deadlineAt: String(source?.deadlineAt ?? source?.expiresAt ?? source?.endTime ?? new Date(Date.now() + 15 * 60_000).toISOString()),
    questions,
  };
}

export const assessmentsApi = {
  getStatus: (jobId: number) =>
    http.get<AssessmentStatusDto>(`/api/jobs/${jobId}/assessment/status`).then((r) => r.data),

  start: (jobId: number) =>
    http.post(`/api/jobs/${jobId}/assessment/start`, {}).then((r) => normalizeStartResponse(r.data)),

  submit: (jobId: number, payload: SubmitAssessmentRequest) =>
    http.post<AssessmentResultDto>(`/api/jobs/${jobId}/assessment/submit`, payload).then((r) => r.data),
};
