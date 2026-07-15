import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { formatScore } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ScoreBreakdown } from "./score-breakdown";
import { FeedbackViewDialog } from "./feedback-view-dialog";
import type { ApplicationDto } from "../types";

export function ApplicationCard({ application }: { application: ApplicationDto }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{application.jobTitle}</p>
            <p className="text-sm text-muted-foreground">
              {application.companyName ?? "Confidential"} · Applied {formatDate(application.appliedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Match score</p>
              <p className="text-lg font-semibold text-foreground">{formatScore(application.totalScore)}%</p>
            </div>
            <StatusBadge enumName="ApplicationStatus" value={application.status} />
            {application.status === "Rejected" && (
              <FeedbackViewDialog applicationId={application.applicationId} jobTitle={application.jobTitle} />
            )}
            <Button variant="ghost" size="icon" onClick={() => setExpanded((v) => !v)}>
              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 border-t border-border pt-4">
            <ScoreBreakdown
              totalScore={application.totalScore}
              skillMatch={application.skillMatch}
              experienceMatch={application.experienceMatch}
              educationMatch={application.educationMatch}
              semanticSimilarity={application.semanticSimilarity}
              skillGaps={application.skillGaps}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
