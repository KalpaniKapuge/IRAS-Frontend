import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardList, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useJobsStore } from "@/features/jobs/store";
import { useAssessmentsStore } from "../store";
import { AssessmentQuestionCard } from "../components/assessment-question-card";
import type { AssessmentQuestionDto, StartAssessmentResponse, SubmitAssessmentAnswer } from "../types";
import type { JobDto } from "@/features/jobs/types";

interface AnswerState {
  selectedOptionIndex?: number;
  freeTextAnswer?: string;
}

function formatRemaining(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function buildFallbackAssessment(job: JobDto): StartAssessmentResponse {
  const skills = (job.requiredSkills ?? [])
    .map((skill) => skill.skillName?.trim())
    .filter((skill): skill is string => Boolean(skill));
  const focusSkills = skills.length > 0 ? skills : [job.title];

  const questions: AssessmentQuestionDto[] = Array.from({ length: 10 }, (_, index) => {
    const skill = focusSkills[index % focusSkills.length];
    const questionId = -(index + 1);

    if (index % 2 === 1) {
      return {
        questionId,
        questionType: "FreeText",
        questionText: `Briefly explain how you would use ${skill} in a real ${job.title} project.`,
        options: [],
      };
    }

    return {
      questionId,
      questionType: "MultipleChoice",
      questionText: `Which activity best demonstrates practical knowledge of ${skill} for this ${job.title} role?`,
      options: [
        `Building or improving a working feature that uses ${skill}`,
        `Only listing ${skill} on a resume without examples`,
        `Avoiding ${skill} and using unrelated tools`,
        `Memorizing definitions without applying them`,
      ],
    };
  });

  return {
    attemptId: -Date.now(),
    startedAt: new Date().toISOString(),
    deadlineAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    questions,
  };
}

export function JobAssessmentPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const numericJobId = Number(jobId);

  const { currentJob, isLoadingDetail, loadJob, clearCurrentJob } = useJobsStore();
  const {
    status,
    attempt,
    result,
    isLoading,
    isStarting,
    isSubmitting,
    startError,
    loadStatus,
    startAssessment,
    submitAssessment,
    clearAttempt,
    reset,
  } = useAssessmentsStore();

  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [timedOutIncomplete, setTimedOutIncomplete] = useState(false);
  const answersRef = useRef(answers);
  const timeoutHandledRef = useRef(false);
  answersRef.current = answers;

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
    if (!currentJob) return;
    setAnswers({});
    timeoutHandledRef.current = false;
    clearAttempt();
    const started = await startAssessment(numericJobId, buildFallbackAssessment(currentJob));
    if (started) {
      setTimedOutIncomplete(false);
      return;
    }
    await loadStatus(numericJobId);
  };

  const handleSubmit = async () => {
    const submitted = await submitAssessment(numericJobId, buildSubmitPayload());
    if (submitted) await loadStatus(numericJobId);
  };

  const isQuestionAnswered = (questionId: number) => {
    const answer = answersRef.current[questionId];
    return answer?.selectedOptionIndex != null || Boolean(answer?.freeTextAnswer?.trim());
  };

  // Countdown is driven by the server-computed deadline. If every question is
  // answered when time ends, submit it. Otherwise do not submit and allow retry.
  useEffect(() => {
    if (!attempt || result) {
      setRemainingSeconds(null);
      timeoutHandledRef.current = false;
      return;
    }

    const tick = () => {
      const secondsLeft = Math.max(0, Math.floor((new Date(attempt.deadlineAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);

      if (secondsLeft === 0 && !timeoutHandledRef.current) {
        timeoutHandledRef.current = true;
        const allQuestionsAnswered = attempt.questions.every((question) => isQuestionAnswered(question.questionId));

        if (allQuestionsAnswered) {
          submitAssessment(numericJobId, buildSubmitPayload());
          return;
        }

        setAnswers({});
        setTimedOutIncomplete(true);
        clearAttempt();
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
          description="This job does not require a skill assessment. You can apply directly."
        />
      </div>
    );
  }

  const finalResult = result ?? (status?.isCompleted ? { correctCount: 0, answeredCount: 0, totalQuestions: 0 } : null);

  if (finalResult) {
    return (
      <div className="space-y-6">
        {backButton}
        <Card>
          <CardHeader className="items-center text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <CardTitle>Assessment completed</CardTitle>
            <CardDescription>
              {result ? "Your assessment was submitted successfully." : "You've already completed this assessment."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
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
            <h1 className="text-2xl font-semibold tracking-tight">Skill Assessment - {currentJob.title}</h1>
            <p className="text-sm text-muted-foreground">
              Complete every question before the timer ends. If time runs out before you finish, this attempt is not submitted.
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
          <p className="text-sm text-muted-foreground">
            {answeredCount} of {attempt.questions.length} answered
          </p>
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
          {timedOutIncomplete ? (
            <RotateCcw className="h-10 w-10 text-warning" />
          ) : (
            <ClipboardList className="h-10 w-10 text-primary" />
          )}
          <CardTitle>{timedOutIncomplete ? "Try the assessment again" : "Skill assessment required"}</CardTitle>
          <CardDescription>
            {timedOutIncomplete
              ? "Time ended before this assessment was submitted, so nothing was saved. Start again when you're ready."
              : `Complete a short quiz (multiple-choice and written/code questions) based on this job's required skills before you can apply for ${currentJob.title}. Finish every question before the timer ends to submit your assessment.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="flex flex-col items-center gap-3">
            {startError && (
              <p className="max-w-lg rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {startError}
              </p>
            )}
            <Button onClick={handleStart} loading={isStarting}>
              {timedOutIncomplete ? "Start again" : status?.hasAttempted ? "Resume assessment" : "Start assessment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
