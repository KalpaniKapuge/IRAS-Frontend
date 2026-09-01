import { useEffect, useState } from "react";
import { CalendarClock, ChevronDown, ClipboardList, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { cn, formatScore, getInitials } from "@/lib/utils";
import { EMPLOYER_SETTABLE_STATUSES, type ApplicationStatus } from "@/types/enums";
import { useInterviewsStore } from "@/features/interviews/store";
import { ScheduleInterviewDialog } from "@/features/interviews/components/schedule-interview-dialog";
import { InterviewListItem } from "@/features/interviews/components/interview-list-item";
import { ScoreBreakdown } from "./score-breakdown";
import { FeedbackReviewDialog } from "./feedback-review-dialog";
import { AssessmentReviewDialog } from "./assessment-review-dialog";
import type { RankedApplicantDto } from "../types";
import type { InterviewDto } from "@/features/interviews/types";

const TERMINAL: ApplicationStatus[] = ["Rejected", "Hired", "Withdrawn"];

// Stable reference for the "no interviews loaded yet" case. A fresh `[] ` literal
// inside the selector would give Zustand a new array identity on every call, and
// since it compares by reference, that reads as "the store changed" forever —
// triggering an infinite re-render loop (React's "Maximum update depth exceeded").
const EMPTY_INTERVIEWS: InterviewDto[] = [];

interface ApplicantRowProps {
  applicant: RankedApplicantDto;
  employerId: number;
  jobId: number;
  onStatusChange: (applicationId: number, status: ApplicationStatus) => void;
}

export function ApplicantRow({ applicant, employerId, jobId, onStatusChange }: ApplicantRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [firstName, lastName] = applicant.candidateName.split(" ");
  const isTerminal = TERMINAL.includes(applicant.status);

  const interviews = useInterviewsStore((s) => s.byApplication[applicant.applicationId] ?? EMPTY_INTERVIEWS);
  const loadForApplication = useInterviewsStore((s) => s.loadForApplication);

  useEffect(() => {
    if (expanded) loadForApplication(employerId, jobId, applicant.applicationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, employerId, jobId, applicant.applicationId]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-4 p-4">
        <Avatar>
          <AvatarFallback>{getInitials(firstName, lastName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-[10rem] flex-1">
          <p className="font-medium">{applicant.candidateName}</p>
          <p className="text-xs text-muted-foreground">Applied {formatDate(applicant.appliedAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            Total marks {applicant.assessmentScore != null && <span className="opacity-70">(CV + quiz)</span>}
          </p>
          <p className="text-lg font-semibold">{formatScore(applicant.totalMarks)}%</p>
        </div>

        {isTerminal ? (
          <StatusBadge enumName="ApplicationStatus" value={applicant.status} />
        ) : (
          <Select value={applicant.status} onValueChange={(v) => onStatusChange(applicant.applicationId, v as ApplicationStatus)}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={applicant.status} disabled>{applicant.status} (current)</SelectItem>
              {EMPLOYER_SETTABLE_STATUSES.filter((s) => s !== applicant.status).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" size="sm" asChild>
          <a href={applicant.resumeFileUrl}>
            <FileText className="h-3.5 w-3.5" /> View CV
          </a>
        </Button>

        {applicant.assessmentScore != null && (
          <AssessmentReviewDialog
            employerId={employerId}
            jobId={jobId}
            applicationId={applicant.applicationId}
            candidateName={applicant.candidateName}
            trigger={
              <Button variant="outline" size="sm">
                <ClipboardList className="h-3.5 w-3.5" /> View quiz
              </Button>
            }
          />
        )}

        {applicant.status === "Rejected" && (
          <FeedbackReviewDialog
            employerId={employerId}
            jobId={jobId}
            applicationId={applicant.applicationId}
            candidateName={applicant.candidateName}
          />
        )}

        {!isTerminal && (
          <ScheduleInterviewDialog
            employerId={employerId}
            jobId={jobId}
            applicationId={applicant.applicationId}
            candidateName={applicant.candidateName}
            trigger={
              <Button variant="outline" size="sm">
                <CalendarClock className="h-3.5 w-3.5" /> Interview
              </Button>
            }
          />
        )}

        <Button variant="ghost" size="icon" onClick={() => setExpanded((v) => !v)}>
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-border p-4">
          <ScoreBreakdown
            totalScore={applicant.totalScore}
            skillMatch={applicant.skillMatch}
            experienceMatch={applicant.experienceMatch}
            educationMatch={applicant.educationMatch}
            semanticSimilarity={applicant.semanticSimilarity}
            assessmentScore={applicant.assessmentScore}
            skillGaps={applicant.skillGaps}
          />
          {interviews.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interviews</p>
                {interviews.map((interview) => (
                  <InterviewListItem key={interview.interviewId} interview={interview} employerId={employerId} isEmployerView />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
