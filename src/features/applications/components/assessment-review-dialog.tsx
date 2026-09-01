import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatScore } from "@/lib/utils";
import { applicationsApi } from "../api";
import type { AssessmentQuestionReviewDto, EmployerAssessmentReviewDto } from "@/features/assessments/types";

interface AssessmentReviewDialogProps {
  employerId: number;
  jobId: number;
  applicationId: number;
  candidateName: string;
  trigger: React.ReactNode;
}

function QuestionReview({ question, index }: { question: AssessmentQuestionReviewDto; index: number }) {
  const passed = question.scoreFraction >= 0.6;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">
          {index + 1}. {question.questionText}
        </p>
        <Badge variant={passed ? "success" : "destructive"} className="shrink-0 gap-1">
          {passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {formatScore(question.scoreFraction)}%
        </Badge>
      </div>

      {question.questionType === "MultipleChoice" ? (
        <div className="space-y-1.5">
          {question.options.map((option, optionIndex) => {
            const isCorrect = optionIndex === question.correctOptionIndex;
            const isSelected = optionIndex === question.selectedOptionIndex;
            return (
              <div
                key={optionIndex}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  isCorrect
                    ? "border-success/40 bg-success/10"
                    : isSelected
                      ? "border-destructive/40 bg-destructive/10"
                      : "border-border",
                )}
              >
                {option}
                {isCorrect && <span className="ml-2 text-xs text-success">Correct answer</span>}
                {isSelected && !isCorrect && <span className="ml-2 text-xs text-destructive">Candidate's answer</span>}
              </div>
            );
          })}
          {question.selectedOptionIndex == null && (
            <p className="text-xs text-muted-foreground">Not answered.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Candidate's answer</p>
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs">
              {question.freeTextAnswer?.trim() || "(not answered)"}
            </pre>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Model answer</p>
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs">
              {question.modelAnswer || "—"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function AssessmentReviewDialog({ employerId, jobId, applicationId, candidateName, trigger }: AssessmentReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState<EmployerAssessmentReviewDto | null | undefined>(undefined);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && review === undefined) {
      applicationsApi.getAssessmentReview(employerId, jobId, applicationId).then(setReview);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{candidateName}'s skill assessment</DialogTitle>
          <DialogDescription>
            The quiz generated from this job's role and required skills, with what the candidate answered.
          </DialogDescription>
        </DialogHeader>

        {review === undefined ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : review === null ? (
          <EmptyState title="No assessment on record" description="This candidate hasn't completed a skill assessment for this job." />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">Overall score</p>
              <p className="text-lg font-semibold">{formatScore(review.score)}%</p>
            </div>
            {review.questions.map((question, index) => (
              <QuestionReview key={index} question={question} index={index} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
