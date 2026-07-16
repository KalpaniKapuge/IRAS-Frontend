import { useState } from "react";
import { BarChart3, BriefcaseBusiness, CalendarClock, ChevronDown, Lightbulb, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { cn, formatScore } from "@/lib/utils";
import { ScoreBreakdown } from "./score-breakdown";
import { FeedbackViewDialog } from "./feedback-view-dialog";
import type { ApplicationDto } from "../types";

function scoreTone(score: number) {
  if (score >= 0.75) return "text-success";
  if (score >= 0.5) return "text-primary";
  if (score >= 0.25) return "text-warning";
  return "text-destructive";
}

function scoreLabel(score: number) {
  if (score >= 0.75) return "Strong fit";
  if (score >= 0.5) return "Good potential";
  if (score >= 0.25) return "Needs review";
  return "Large gap";
}

export function ApplicationCard({ application }: { application: ApplicationDto }) {
  const [expanded, setExpanded] = useState(false);
  const scorePct = Math.round(Math.max(0, Math.min(1, application.totalScore)) * 100);
  const visibleGaps = application.skillGaps.slice(0, 3);

  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-soft transition-all hover:border-primary/30 hover:shadow-elevated">
      <CardContent className="p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_220px]">
          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge enumName="ApplicationStatus" value={application.status} />
                  <Badge variant={application.skillGaps.length > 0 ? "warning" : "success"}>
                    {application.skillGaps.length > 0 ? `${application.skillGaps.length} skill gap${application.skillGaps.length === 1 ? "" : "s"}` : "No skill gaps"}
                  </Badge>
                </div>
                <p className="truncate text-lg font-bold tracking-tight text-foreground">{application.jobTitle}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-4 w-4" />
                    {application.companyName ?? "Confidential"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4" />
                    Applied {formatDate(application.appliedAt)}
                  </span>
                </div>
              </div>

              {application.status === "Rejected" && (
                <FeedbackViewDialog applicationId={application.applicationId} jobTitle={application.jobTitle} />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border/80 bg-muted/25 p-3">
                <p className="text-xs font-medium text-muted-foreground">Skills</p>
                <p className="mt-1 text-base font-bold">{formatScore(application.skillMatch)}%</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/25 p-3">
                <p className="text-xs font-medium text-muted-foreground">Experience</p>
                <p className="mt-1 text-base font-bold">{formatScore(application.experienceMatch)}%</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/25 p-3">
                <p className="text-xs font-medium text-muted-foreground">Education</p>
                <p className="mt-1 text-base font-bold">{formatScore(application.educationMatch)}%</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/25 p-3">
                <p className="text-xs font-medium text-muted-foreground">Resume</p>
                <p className="mt-1 text-base font-bold">{formatScore(application.semanticSimilarity)}%</p>
              </div>
            </div>

            {visibleGaps.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-warning/20 bg-warning/10 p-3">
                <Lightbulb className="h-4 w-4 shrink-0 text-warning" />
                <span className="text-xs font-semibold uppercase text-muted-foreground">Focus next</span>
                {visibleGaps.map((gap) => (
                  <Badge key={gap.skillId} variant={gap.importance === "MustHave" ? "destructive" : "muted"}>
                    {gap.skillName}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between border-t border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-center lg:text-center">
              <div
                className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${scorePct * 3.6}deg, hsl(var(--muted)) 0deg)`,
                }}
              >
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-card shadow-soft">
                  <span className={cn("text-2xl font-black", scoreTone(application.totalScore))}>{scorePct}%</span>
                  <span className="text-[11px] font-medium text-muted-foreground">Match</span>
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold lg:justify-center">
                  <Target className="h-4 w-4 text-primary" />
                  {scoreLabel(application.totalScore)}
                </p>
                <p className="mt-1 max-w-[190px] text-xs leading-5 text-muted-foreground">
                  Score combines skills, experience, education, and resume relevance.
                </p>
              </div>
            </div>

            <Button variant="outline" className="mt-5 w-full justify-between" onClick={() => setExpanded((value) => !value)}>
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {expanded ? "Hide details" : "View details"}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border bg-muted/15 p-5 sm:p-6">
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
