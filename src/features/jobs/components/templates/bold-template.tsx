import { Briefcase, Building2, Calendar, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { ApplyDialog } from "@/features/applications/components/apply-dialog";
import { JobDescription } from "../job-description";
import type { JobTemplateProps } from "./types";

function Chip({ icon: Icon, text, className }: { icon: typeof Briefcase; text: string; className: string }) {
  return (
    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" /> {text}
    </span>
  );
}

export function BoldTemplate({ job }: JobTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-chart-3 pl-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-chart-3">
              <Building2 className="h-4 w-4" /> {job.companyName ?? "Confidential"}
            </p>
            <h1 className="mt-1 text-4xl font-black tracking-tight text-foreground">{job.title}</h1>
          </div>
          <ApplyDialog jobId={job.jobId} jobTitle={job.title} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip icon={Sparkles} text={job.seniorityLevel} className="bg-primary/10 text-primary" />
          <Chip icon={Briefcase} text={titleCase(job.employmentType)} className="bg-chart-2/10 text-chart-2" />
          {job.location && <Chip icon={MapPin} text={job.location} className="bg-info/10 text-info" />}
          <Chip icon={GraduationCap} text={`${titleCase(job.educationReq)}+`} className="bg-success/10 text-success" />
          {job.postedAt && (
            <Chip icon={Calendar} text={`Posted ${formatDate(job.postedAt)}`} className="bg-chart-3/10 text-chart-3" />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-l-4 border-chart-3 lg:col-span-2">
          <CardContent className="p-6">
            <JobDescription description={job.generatedJd} jobTitle={job.title} />
          </CardContent>
        </Card>

        <Card className="h-fit border-l-4 border-primary">
          <CardContent className="space-y-3 p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-foreground">Required skills</p>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill.skillId}
                  className={
                    skill.importance === "MustHave"
                      ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      : "rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                  }
                >
                  {skill.skillName ?? "Required skill"}
                </span>
              ))}
            </div>
            <div className="border-l-4 border-chart-3 bg-chart-3/10 p-4">
              <p className="text-xs font-bold uppercase text-chart-3">Minimum experience</p>
              <p className="mt-1 text-2xl font-black text-foreground">{job.minExpYears}+ years</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
