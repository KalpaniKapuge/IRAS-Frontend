import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApiError } from "@/types/common";
import { DELIVERY_CHANNELS, type DeliveryChannel } from "@/types/enums";
import { feedbackApi } from "@/features/feedback/api";
import type { FeedbackDto } from "@/features/feedback/types";

interface FeedbackReviewDialogProps {
  employerId: number;
  jobId: number;
  applicationId: number;
  candidateName: string;
}

export function FeedbackReviewDialog({ employerId, jobId, applicationId, candidateName }: FeedbackReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackDto | null>(null);
  const [messageText, setMessageText] = useState("");
  const [channel, setChannel] = useState<DeliveryChannel>("InApp");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    feedbackApi
      .getForEmployer(employerId, jobId, applicationId)
      .then((fb) => {
        setFeedback(fb);
        setMessageText(fb.messageText);
        setChannel(fb.channel === "Both" ? "Both" : "InApp");
      })
      .catch(() => setFeedback(null))
      .finally(() => setIsLoading(false));
  }, [open, employerId, jobId, applicationId]);

  const submit = async (decision: "Approved" | "Edited" | "Rejected") => {
    setIsSaving(true);
    try {
      const edited = decision === "Edited" ? messageText : undefined;
      const updated = await feedbackApi.review(employerId, jobId, applicationId, {
        decision,
        editedMessageText: edited,
        channel,
      });
      setFeedback(updated);
      toast.success(decision === "Rejected" ? "Feedback discarded." : "Feedback sent to candidate.");
      if (decision !== "Rejected") setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit feedback decision.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquareText className="h-3.5 w-3.5" /> Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Candidate feedback — {candidateName}</DialogTitle>
          <DialogDescription>
            Review the AI-drafted feedback before it reaches the candidate. Edit freely, or discard it entirely.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !feedback ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No feedback draft found for this application.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge enumName="ApprovalStatus" value={feedback.approvalStatus} />
              <StatusBadge enumName="DeliveryStatus" value={feedback.deliveryStatus} />
            </div>
            <Textarea rows={8} value={messageText} onChange={(e) => setMessageText(e.target.value)} />
            <div className="space-y-2">
              <Label>Delivery channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as DeliveryChannel)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DELIVERY_CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {feedback && feedback.approvalStatus === "PendingReview" && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => submit("Rejected")} loading={isSaving}>
              Discard
            </Button>
            <Button
              variant="secondary"
              onClick={() => submit("Edited")}
              loading={isSaving}
              disabled={messageText === feedback.messageText}
            >
              Save edits & send
            </Button>
            <Button onClick={() => submit("Approved")} loading={isSaving}>
              Approve & send
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
