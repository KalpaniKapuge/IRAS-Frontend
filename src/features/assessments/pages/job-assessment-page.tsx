import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { PageSpinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatScore } from "@/lib/utils";
import { useJobsStore } from "@/features/jobs/store";
import { useAssessmentsStore } from "../store";
import { AssessmentQuestionCard } from "../components/assessment-question-card";

export function JobAssessmentPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const numericJobId = Number(jobId);

  const { currentJob, isLoadingDetail, loadJob, clearCurrentJob } = useJobsStore();
  const { status, attempt, result, isLoading, isStarting, isSubmitting, loadStatus, startAssessment, submitAssessment, reset } =
    useAssessmentsStore();

  const [answers, setAnswers] = useState<Record<number, number>>({});

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

  const handleStart = async () => {
    setAnswers({});
    await startAssessment(numericJobId);
  };

  const handleSubmit = async () => {
    const payload = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
      questionId: Number(questionId),
      selectedOptionIndex,
    }));
    await submitAssessment(numericJobId, payload);
  };

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

  const finalResult = result ?? (status?.isCompleted ? { score: status.score ?? 0, correctCount: 0, totalQuestions: 0 } : null);

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
                ? `You answered ${result.correctCount} of ${result.totalQuestions} questions correctly.`
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
    const answeredCount = Object.keys(answers).length;
    const allAnswered = answeredCount === attempt.questions.length;

    return (
      <div className="space-y-6">
        {backButton}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Skill Assessment — {currentJob.title}</h1>
          <p className="text-sm text-muted-foreground">
            Answer all {attempt.questions.length} questions, then submit. You get one attempt for this job.
          </p>
        </div>

        <div className="space-y-4">
          {attempt.questions.map((question, index) => (
            <AssessmentQuestionCard
              key={question.questionId}
              question={question}
              index={index}
              selectedOptionIndex={answers[question.questionId] ?? null}
              onSelect={(optionIndex) => setAnswers((a) => ({ ...a, [question.questionId]: optionIndex }))}
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
            Complete a short multiple-choice quiz based on this job's required skills before you can apply for{" "}
            {currentJob.title}. You get one attempt, so take your time.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleStart} loading={isStarting}>
            Start assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
