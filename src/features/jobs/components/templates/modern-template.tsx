import { Briefcase, Building2, Calendar, CheckCircle2, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { JobDescription } from "../job-description";
import type { JobTemplateProps } from "./types";

export function ModernTemplate({ job, actionSlot }: JobTemplateProps) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-elevated">
        <div className="bg-gradient-to-br from-primary to-chart-2 px-6 py-8 text-primary-foreground sm:px-8 sm:py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground/80">
                <Building2 className="h-4 w-4" /> {job.companyName ?? "Confidential"}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{job.title}</h1>
            </div>
            {actionSlot}
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-primary-foreground/90">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> {job.seniorityLevel}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" /> {titleCase(job.employmentType)}
            </span>
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" /> {titleCase(job.educationReq)}+
            </span>
            {job.postedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Posted {formatDate(job.postedAt)}
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <JobDescription description={job.generatedJd} jobTitle={job.title} />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="space-y-3 p-6">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Required skills
            </p>
            <div className="grid gap-2">
              {job.requiredSkills.map((skill) => {
                const isMustHave = skill.importance === "MustHave";
                return (
                  <div
                    key={skill.skillId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className={isMustHave ? "h-4 w-4 shrink-0 text-primary" : "h-4 w-4 shrink-0 text-chart-2"} />
                      <span className="truncate">{skill.skillName ?? "Required skill"}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {skill.minYears > 0 ? `${skill.minYears}+ yrs` : isMustHave ? "Must-have" : "Nice-to-have"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-chart-2/10 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">Minimum experience</p>
              <p className="mt-1 text-2xl font-bold text-primary">{job.minExpYears}+ years</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
