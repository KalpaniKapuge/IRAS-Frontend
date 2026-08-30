import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, FileCheck2, ListChecks, RotateCcw, Sparkles, XCircle } from "lucide-react";
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

// Reject and Request Revision share the same shape — a short comment the candidate will
// see — so one dialog handles both instead of duplicating the form.
function DecisionDialog({
  trigger,
  title,
  notesLabel,
  notesPlaceholder,
  confirmLabel,
  confirmVariant,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  notesLabel: string;
  notesPlaceholder: string;
  confirmLabel: string;
  confirmVariant: "destructive" | "outline";
  onConfirm: (notes: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onConfirm(notes.trim());
      setOpen(false);
      setNotes("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>{notesLabel}</Label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={notesPlaceholder} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant={confirmVariant} onClick={handleSubmit} loading={isSaving}>{confirmLabel}</Button>
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
      await adminSkillPlanReviewApi.verify(evidenceId, "Approve");
      toast.success("Evidence approved.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to approve evidence.");
    }
  };

  const handleReject = async (evidenceId: number, notes: string) => {
    try {
      await adminSkillPlanReviewApi.verify(evidenceId, "Reject", notes);
      toast.success("Evidence rejected.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reject evidence.");
    }
  };

  const handleRequestRevision = async (evidenceId: number, notes: string) => {
    try {
      await adminSkillPlanReviewApi.verify(evidenceId, "RequestRevision", notes);
      toast.success("Revision requested.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to request revision.");
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
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.candidateName}</p>
                    <span className="text-sm text-muted-foreground">— {item.skillName}</span>
                    {item.jobTitle && <span className="text-sm text-muted-foreground">({item.jobTitle})</span>}
                    <Badge variant="muted">{titleCase(item.evidenceType)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleApprove(item.evidenceId)}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <DecisionDialog
                      trigger={
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-3.5 w-3.5" /> Request Revision
                        </Button>
                      }
                      title="Request a revision from the candidate?"
                      notesLabel="What should they fix or add? (shown to the candidate)"
                      notesPlaceholder="e.g. Please include a README explaining how the project meets the roadmap's expected output."
                      confirmLabel="Request Revision"
                      confirmVariant="outline"
                      onConfirm={(notes) => handleRequestRevision(item.evidenceId, notes)}
                    />
                    <DecisionDialog
                      trigger={
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      }
                      title="Reject this evidence?"
                      notesLabel="Reason (shown to the candidate)"
                      notesPlaceholder="e.g. Screenshot is unreadable, please retake."
                      confirmLabel="Reject"
                      confirmVariant="destructive"
                      onConfirm={(notes) => handleReject(item.evidenceId, notes)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5 shrink-0" />
                  Roadmap checklist: {item.stepsCompleted}/{item.totalSteps} steps complete
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <p className="text-xs font-medium text-foreground">Improvement plan: {item.projectTitle}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.planOverview}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">Expected to prove:</span> {item.projectExpectedOutput}
                  </p>
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
