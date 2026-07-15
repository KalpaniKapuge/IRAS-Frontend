import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { feedbackApi } from "@/features/feedback/api";
import type { FeedbackDto } from "@/features/feedback/types";

export function FeedbackViewDialog({ applicationId, jobTitle }: { applicationId: number; jobTitle: string }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackDto | null | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    setFeedback(undefined);
    feedbackApi.getMyFeedback(applicationId).then(setFeedback);
  }, [open, applicationId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquareText className="h-3.5 w-3.5" /> View feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback — {jobTitle}</DialogTitle>
        </DialogHeader>
        {feedback === undefined ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : feedback === null ? (
          <EmptyState
            icon={MessageSquareText}
            title="No feedback yet"
            description="The employer hasn't shared feedback for this application yet."
            className="border-none py-6"
          />
        ) : (
          <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm leading-relaxed">{feedback.messageText}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
