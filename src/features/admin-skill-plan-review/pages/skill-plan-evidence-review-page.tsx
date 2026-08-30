import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, FileCheck2, Sparkles, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { ApiError } from "@/types/common";
import type { AdminEvidenceReviewDto } from "@/features/skill-improvement-plans/types";
import { adminSkillPlanReviewApi } from "../api";

function RejectDialog({ onReject }: { onReject: (notes: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onReject(notes.trim());
      setOpen(false);
      setNotes("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <XCircle className="h-3.5 w-3.5" /> Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject this evidence?</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Reason (shown to the candidate)</Label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Screenshot is unreadable, please retake." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} loading={isSaving}>Reject</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SkillPlanEvidenceReviewPage() {
  const [items, setItems] = useState<AdminEvidenceReviewDto[] | null>(null);

  const load = () => adminSkillPlanReviewApi.getPending().then(setItems);

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (evidenceId: number) => {
    try {
      await adminSkillPlanReviewApi.verify(evidenceId, true);
      toast.success("Evidence approved.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to approve evidence.");
    }
  };

  const handleReject = async (evidenceId: number, notes: string) => {
    try {
      await adminSkillPlanReviewApi.verify(evidenceId, false, notes);
      toast.success("Evidence rejected.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reject evidence.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Plan Evidence"
        description="Evidence the automatic AI reviewer wasn't confident enough to auto-approve or auto-reject on its own — everything else is triaged automatically."
      />

      {items === null ? (
        <RowSkeletonList count={4} />
      ) : items.length === 0 ? (
        <EmptyState icon={FileCheck2} title="Nothing pending review" description="New evidence submissions will show up here." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.evidenceId}>
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.candidateName}</p>
                    <span className="text-sm text-muted-foreground">— {item.skillName}</span>
                    <Badge variant="muted">{titleCase(item.evidenceType)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleApprove(item.evidenceId)}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <RejectDialog onReject={(notes) => handleReject(item.evidenceId, notes)} />
                  </div>
                </div>
                <a
                  href={item.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.evidenceUrl}</span>
                </a>
                {item.notes && <p className="text-sm text-foreground/80">{item.notes}</p>}
                {item.aiConfidenceScore !== null && (
                  <div className="flex items-start gap-1.5 rounded-md bg-muted/40 p-2">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">AI confidence: {item.aiConfidenceScore}/100</span>
                      {item.aiRationale && <> — {item.aiRationale}</>}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Submitted {formatDate(item.uploadedAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
