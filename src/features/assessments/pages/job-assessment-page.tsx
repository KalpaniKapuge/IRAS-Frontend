import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardList, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { PageSpinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatScore } from "@/lib/utils";
import { useJobsStore } from "@/features/jobs/store";
import { useAssessmentsStore } from "../store";
import { AssessmentQuestionCard } from "../components/assessment-question-card";
import type { SubmitAssessmentAnswer } from "../types";

interface AnswerState {
  selectedOptionIndex?: number;
  freeTextAnswer?: string;
}

function formatRemaining(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function JobAssessmentPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const numericJobId = Number(jobId);

  const { currentJob, isLoadingDetail, loadJob, clearCurrentJob } = useJobsStore();
  const { status, attempt, result, isLoading, isStarting, isSubmitting, loadStatus, startAssessment, submitAssessment, reset } =
    useAssessmentsStore();

  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    if (!jobId) return;
    loadJob(numericJobId);
    loadStatus(numericJobId);
    return () => {
      clearCurrentJob();
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const buildSubmitPayload = (): SubmitAssessmentAnswer[] =>
    Object.entries(answersRef.current).map(([questionId, a]) => ({
      questionId: Number(questionId),
      selectedOptionIndex: a.selectedOptionIndex,
      freeTextAnswer: a.freeTextAnswer,
    }));

  const handleStart = async () => {
    setAnswers({});
    autoSubmittedRef.current = false;
    await startAssessment(numericJobId);
  };

  const handleSubmit = async () => {
    await submitAssessment(numericJobId, buildSubmitPayload());
  };

  // Countdown, driven by the server-computed deadline (survives reload — a resumed attempt
  // returns the same deadline computed from its original StartedAt, not a fresh timer).
  useEffect(() => {
    if (!attempt || result) {
      setRemainingSeconds(null);
      return;
    }

    const tick = () => {
      const secondsLeft = Math.max(0, Math.floor((new Date(attempt.deadlineAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);
      if (secondsLeft === 0 && !autoSubmittedRef.current && !isSubmitting) {
        autoSubmittedRef.current = true;
        submitAssessment(numericJobId, buildSubmitPayload());
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, result]);

  if (isLoadingDetail || (isLoading && !status)) return <PageSpinner label="Loading assessment..." />;
  if (!currentJob) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Job not found"
        description="This position may have been closed or removed."
        action={<Button onClick={() => navigate("/candidate/jobs")}>Back to jobs</Button>}
      />
    );
  }

  const backButton = (
    <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate(`/candidate/jobs/${numericJobId}`)}>
      <ArrowLeft className="h-4 w-4" /> Back to job
    </Button>
  );

  if (status && !status.requireAssessment) {
    return (
      <div className="space-y-6">
        {backButton}
        <EmptyState
          icon={ClipboardList}
          title="No assessment required"
          description="This job does not require a skill assessment — you can apply directly."
        />
      </div>
    );
  }

  const finalResult = result ?? (status?.isCompleted ? { score: status.score ?? 0, correctCount: 0, answeredCount: 0, totalQuestions: 0 } : null);

  if (finalResult) {
    return (
      <div className="space-y-6">
        {backButton}
        <Card>
          <CardHeader className="items-center text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <CardTitle>Assessment completed</CardTitle>
            <CardDescription>
              {result
                ? `You answered ${result.answeredCount} of ${result.totalQuestions} questions, ${result.correctCount} scored well.`
                : "You've already completed this assessment."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-4xl font-semibold">{formatScore(finalResult.score)}%</p>
            <Button onClick={() => navigate(`/candidate/jobs/${numericJobId}`)}>Continue to apply</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (attempt) {
    const answeredCount = Object.values(answers).filter(
      (a) => a.selectedOptionIndex != null || (a.freeTextAnswer && a.freeTextAnswer.trim().length > 0),
    ).length;
    const allAnswered = answeredCount === attempt.questions.length;
    const timeLow = remainingSeconds != null && remainingSeconds <= 60;

    return (
      <div className="space-y-6">
        {backButton}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Skill Assessment — {currentJob.title}</h1>
            <p className="text-sm text-muted-foreground">
              Answer as many questions as you can before time runs out. You get one attempt for this job.
            </p>
          </div>
          {remainingSeconds != null && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold tabular-nums",
                timeLow ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-muted/30",
              )}
            >
              <Timer className="h-4 w-4" /> {formatRemaining(remainingSeconds)} remaining
            </div>
          )}
        </div>

        <div className="space-y-4">
          {attempt.questions.map((question, index) => (
            <AssessmentQuestionCard
              key={question.questionId}
              question={question}
              index={index}
              selectedOptionIndex={answers[question.questionId]?.selectedOptionIndex ?? null}
              freeTextAnswer={answers[question.questionId]?.freeTextAnswer ?? ""}
              onSelect={(optionIndex) =>
                setAnswers((a) => ({ ...a, [question.questionId]: { ...a[question.questionId], selectedOptionIndex: optionIndex } }))
              }
              onFreeTextChange={(value) =>
                setAnswers((a) => ({ ...a, [question.questionId]: { ...a[question.questionId], freeTextAnswer: value } }))
              }
            />
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">{answeredCount} of {attempt.questions.length} answered</p>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!allAnswered}>
            Submit assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {backButton}
      <Card>
        <CardHeader className="items-center text-center">
          <ClipboardList className="h-10 w-10 text-primary" />
          <CardTitle>Skill assessment required</CardTitle>
          <CardDescription>
            Complete a short quiz (multiple-choice and written/code questions) based on this job's required skills
            before you can apply for {currentJob.title}. You get one attempt and a time limit of about one minute per
            question — once it runs out, whatever you've answered is scored automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleStart} loading={isStarting}>
            {status?.hasAttempted ? "Resume assessment" : "Start assessment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
