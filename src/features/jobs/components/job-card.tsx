import { Link } from "react-router-dom";
import { Briefcase, Building2, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import type { JobSummaryDto } from "../types";

export function JobCard({ job, to }: { job: JobSummaryDto; to: string }) {
  return (
    <Link to={to}>
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-elevated">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold leading-snug text-foreground">{job.title}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {job.companyName ?? "Confidential"}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">{job.seniorityLevel}</Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {titleCase(job.employmentType)}
            </span>
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {job.location}
              </span>
            )}
            {job.postedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Posted {formatDate(job.postedAt)}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">{job.requiredSkillCount} required skills</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
