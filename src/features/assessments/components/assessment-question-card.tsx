import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AssessmentQuestionDto } from "../types";

interface AssessmentQuestionCardProps {
  question: AssessmentQuestionDto;
  index: number;
  selectedOptionIndex: number | null;
  freeTextAnswer: string;
  onSelect: (optionIndex: number) => void;
  onFreeTextChange: (value: string) => void;
}

export function AssessmentQuestionCard({
  question,
  index,
  selectedOptionIndex,
  freeTextAnswer,
  onSelect,
  onFreeTextChange,
}: AssessmentQuestionCardProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium">
        {index + 1}. {question.questionText}
      </p>

      {question.questionType === "FreeText" ? (
        <Textarea
          rows={5}
          value={freeTextAnswer}
          onChange={(e) => onFreeTextChange(e.target.value)}
          placeholder="Type your answer — code or query is fine…"
          className="font-mono text-xs leading-relaxed"
        />
      ) : (
        <div className="space-y-2">
          {question.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              type="button"
              onClick={() => onSelect(optionIndex)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors",
                selectedOptionIndex === optionIndex ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
              )}
            >
              <span>{option}</span>
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full border-2",
                  selectedOptionIndex === optionIndex ? "border-primary bg-primary" : "border-border",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
