import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { cn, formatScore, getInitials } from "@/lib/utils";
import { EMPLOYER_SETTABLE_STATUSES, type ApplicationStatus } from "@/types/enums";
import { ScoreBreakdown } from "./score-breakdown";
import { FeedbackReviewDialog } from "./feedback-review-dialog";
import type { RankedApplicantDto } from "../types";

const TERMINAL: ApplicationStatus[] = ["Rejected", "Hired", "Withdrawn"];

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
          <p className="text-xs text-muted-foreground">Match score</p>
          <p className="text-lg font-semibold">{formatScore(applicant.totalScore)}%</p>
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

        {applicant.status === "Rejected" && (
          <FeedbackReviewDialog
            employerId={employerId}
            jobId={jobId}
            applicationId={applicant.applicationId}
            candidateName={applicant.candidateName}
          />
        )}

        <Button variant="ghost" size="icon" onClick={() => setExpanded((v) => !v)}>
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-border p-4">
          <ScoreBreakdown
            totalScore={applicant.totalScore}
            skillMatch={applicant.skillMatch}
            experienceMatch={applicant.experienceMatch}
            educationMatch={applicant.educationMatch}
            semanticSimilarity={applicant.semanticSimilarity}
            skillGaps={applicant.skillGaps}
          />
        </div>
      )}
    </div>
  );
}
