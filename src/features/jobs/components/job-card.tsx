import { Link } from "react-router-dom";
import { ArrowUpRight, BriefcaseBusiness, Building2, CalendarClock, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import type { JobSummaryDto } from "../types";

export function JobCard({ job, to }: { job: JobSummaryDto; to: string }) {
  return (
    <Link to={to} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/80 bg-card/95 shadow-soft transition-all group-hover:-translate-y-0.5 group-hover:border-primary/35 group-hover:shadow-elevated">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Badge variant="secondary" className="mb-2">
                {job.seniorityLevel}
              </Badge>
              <h2 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-foreground">
                {job.title}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{job.companyName ?? "Confidential"}</span>
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                {titleCase(job.employmentType)}
            </span>
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {job.location}
              </span>
            )}
            {job.postedAt && (
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-primary" />
                Posted {formatDate(job.postedAt)}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 rounded-lg border border-primary/15 bg-primary/10 px-3 py-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {job.requiredSkillCount} skill{job.requiredSkillCount === 1 ? "" : "s"}
            </span>
            <span className="text-xs font-medium text-primary">Details</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
