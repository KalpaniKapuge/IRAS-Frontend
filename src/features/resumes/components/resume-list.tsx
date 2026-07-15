import { FileText, RotateCcw, Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/format";
import { useResumeStore } from "../store";
import type { ResumeDto } from "../types";

export function ResumeList({ resumes }: { resumes: ResumeDto[] }) {
  const retryParse = useResumeStore((s) => s.retryParse);
  const setPrimary = useResumeStore((s) => s.setPrimary);
  const remove = useResumeStore((s) => s.remove);

  if (resumes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No resumes uploaded yet"
        description="Upload a PDF or DOCX resume above to get started with AI-powered parsing."
      />
    );
  }

  return (
    <div className="space-y-3">
      {resumes.map((resume) => (
        <Card key={resume.resumeId}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{resume.fileFormat} Resume</p>
                  {resume.isPrimary && (
                    <Badge variant="default" className="gap-1">
                      <Star className="h-3 w-3 fill-current" /> Primary
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Uploaded {formatDateTime(resume.uploadedAt)}</p>
                {resume.parseStatus === "Failed" && resume.parseError && (
                  <p className="mt-1 text-xs text-destructive">{resume.parseError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge enumName="ParseStatus" value={resume.parseStatus} />
              {resume.parseStatus === "Failed" && (
                <Button variant="outline" size="sm" onClick={() => retryParse(resume.resumeId)}>
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                </Button>
              )}
              {!resume.isPrimary && resume.parseStatus !== "Failed" && (
                <Button variant="ghost" size="sm" onClick={() => setPrimary(resume.resumeId)}>
                  Make primary
                </Button>
              )}
              <ConfirmAction
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                }
                title="Delete this resume?"
                description="Resumes used in a submitted application cannot be deleted."
                variant="destructive"
                confirmLabel="Delete"
                onConfirm={() => remove(resume.resumeId)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
