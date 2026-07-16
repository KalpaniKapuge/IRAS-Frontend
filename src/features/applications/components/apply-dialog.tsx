import { useCallback, useEffect, useState } from "react";
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
import { ResumeUploadDropzone } from "@/features/resumes/components/resume-upload-dropzone";
import { SkillConfirmationDialog } from "@/features/resumes/components/skill-confirmation-dialog";
import { resumesApi } from "@/features/resumes/api";
import type { ParseResultDto, ResumeDto } from "@/features/resumes/types";
import { useApplicationsStore } from "../store";

function isUsableResume(resume: ResumeDto) {
  return resume.parseStatus === "Parsed" || resume.parseStatus === "ManuallyEdited";
}

export function ApplyDialog({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const apply = useApplicationsStore((s) => s.apply);
  const isApplying = useApplicationsStore((s) => s.isApplying);
  const myApplications = useApplicationsStore((s) => s.myApplications);
  const loadMine = useApplicationsStore((s) => s.loadMine);

  const [open, setOpen] = useState(false);
  const [resumes, setResumes] = useState<ResumeDto[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCheckingApplication, setIsCheckingApplication] = useState(true);

  const existingApplication = myApplications.find((application) => application.jobId === jobId);

  const loadResumes = useCallback(async () => {
    setResumes(null);
    const list = await resumesApi.getMine();
    const usable = list.filter(isUsableResume);
    const primary = usable.find((r) => r.isPrimary) ?? usable[0];
    setResumes(list);
    setSelectedId(primary?.resumeId ?? null);
  }, []);

  useEffect(() => {
    setIsCheckingApplication(true);
    loadMine().finally(() => setIsCheckingApplication(false));
  }, [jobId, loadMine]);

  useEffect(() => {
    if (!open) return;
    loadResumes();
  }, [loadResumes, open]);

  const usableResumes = resumes?.filter(isUsableResume) ?? [];
  const hasPendingResume = resumes?.some((r) => r.parseStatus === "Pending") ?? false;
  const hasFailedResume = resumes?.some((r) => r.parseStatus === "Failed") ?? false;

  const handleUploaded = async (result: ParseResultDto) => {
    await loadResumes();
    if (result.parseStatus === "Parsed") {
      setSelectedId(result.resumeId);
    }
  };

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
        <Button size="lg" className="gap-2" disabled={isCheckingApplication || !!existingApplication}>
          <Send className="h-4 w-4" /> {isCheckingApplication ? "Checking..." : existingApplication ? "Already applied" : "Apply now"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>
            Choose a parsed resume or upload one here. We'll score your fit and detect skill gaps automatically.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-success">Application submitted!</p>
            <p className="text-sm text-muted-foreground">You can track its status from "My Applications".</p>
          </div>
        ) : resumes === null ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : usableResumes.length === 0 ? (
          <div className="space-y-4">
            <EmptyState
              icon={FileText}
              title="No parsed resume available"
              description={
                hasPendingResume
                  ? "A resume is still being analyzed. Upload another resume or try again after parsing finishes."
                  : hasFailedResume
                    ? "Your uploaded resume could not be parsed. Upload a PDF or DOCX resume to continue."
                    : "Upload a PDF or DOCX resume to continue with this application."
              }
              className="border-none py-4"
            />
            <ResumeUploadDropzone className="py-6" existingCount={resumes.length} onUploaded={handleUploaded} />
          </div>
        ) : (
          <div className="space-y-4">
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
            <ResumeUploadDropzone className="py-5" existingCount={resumes.length} onUploaded={handleUploaded} />
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
        <SkillConfirmationDialog />
      </DialogContent>
    </Dialog>
  );
}
