import { useEffect, useState } from "react";
import { FileText, Send } from "lucide-react";
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
import { Spinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { resumesApi } from "@/features/resumes/api";
import type { ResumeDto } from "@/features/resumes/types";
import { useApplicationsStore } from "../store";

export function ApplyDialog({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const apply = useApplicationsStore((s) => s.apply);
  const isApplying = useApplicationsStore((s) => s.isApplying);

  const [open, setOpen] = useState(false);
  const [resumes, setResumes] = useState<ResumeDto[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setResumes(null);
    resumesApi.getMine().then((list) => {
      setResumes(list);
      const primary = list.find((r) => r.isPrimary && r.parseStatus !== "Failed") ?? list.find((r) => r.parseStatus === "Parsed");
      setSelectedId(primary?.resumeId ?? null);
    });
  }, [open]);

  const usableResumes = resumes?.filter((r) => r.parseStatus === "Parsed" || r.parseStatus === "ManuallyEdited") ?? [];

  const handleApply = async () => {
    if (!selectedId) return;
    const ok = await apply({ jobId, resumeId: selectedId });
    if (ok) {
      setSubmitted(true);
      setTimeout(() => setOpen(false), 1200);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSubmitted(false);
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Send className="h-4 w-4" /> Apply now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>Choose which resume to submit. We'll score your fit and detect skill gaps automatically.</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-success">Application submitted!</p>
            <p className="text-sm text-muted-foreground">You can track its status from "My Applications".</p>
          </div>
        ) : resumes === null ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : usableResumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No parsed resume available"
            description="Upload a resume in your Resumes page and wait for it to finish parsing before applying."
            className="border-none py-6"
          />
        ) : (
          <div className="space-y-2">
            {usableResumes.map((resume) => (
              <button
                key={resume.resumeId}
                onClick={() => setSelectedId(resume.resumeId)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                  selectedId === resume.resumeId ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {resume.fileFormat} Resume {resume.isPrimary && "(Primary)"}
                </span>
                <span
                  className={cn(
                    "h-4 w-4 shrink-0 rounded-full border-2",
                    selectedId === resume.resumeId ? "border-primary bg-primary" : "border-border",
                  )}
                />
              </button>
            ))}
          </div>
        )}

        {!submitted && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} loading={isApplying} disabled={!selectedId}>
              Submit application
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
