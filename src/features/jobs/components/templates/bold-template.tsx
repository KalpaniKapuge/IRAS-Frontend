import { Briefcase, Building2, Calendar, GraduationCap, MapPin, Sparkles, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { JobDescription } from "../job-description";
import type { JobTemplateProps } from "./types";

function StatTile({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`flex flex-col gap-2 rounded-xl p-4 ${className}`}>
      <Icon className="h-5 w-5" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{label}</p>
        <p className="text-lg font-black leading-tight">{value}</p>
      </div>
    </div>
  );
}

// Editorial "dashboard tile" layout — the header is a grid of stat tiles
// rather than a badge row or a fact list, so the page reads top-to-bottom
// as one bold block instead of hero+sidebar or document+table.
export function BoldTemplate({ job, actionSlot }: JobTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-chart-3">
            <Building2 className="h-4 w-4" /> {job.companyName ?? "Confidential"}
          </p>
          <h1 className="mt-1 text-5xl font-black leading-none tracking-tight text-foreground">{job.title}</h1>
        </div>
        {actionSlot}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile icon={Sparkles} label="Seniority" value={job.seniorityLevel} className="bg-primary text-primary-foreground" />
        <StatTile icon={Briefcase} label="Type" value={titleCase(job.employmentType)} className="bg-chart-2 text-white" />
        <StatTile icon={Timer} label="Experience" value={`${job.minExpYears}+ yrs`} className="bg-chart-3 text-white" />
        <StatTile icon={GraduationCap} label="Education" value={`${titleCase(job.educationReq)}+`} className="bg-success text-success-foreground" />
        {job.location && (
          <StatTile icon={MapPin} label="Location" value={job.location} className="bg-info text-info-foreground" />
        )}
        {job.postedAt && (
          <StatTile icon={Calendar} label="Posted" value={formatDate(job.postedAt)} className="bg-foreground text-background" />
        )}
      </div>

      <Card className="border-l-4 border-chart-3">
        <CardContent className="p-6">
          <JobDescription description={job.generatedJd} jobTitle={job.title} />
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">Required skills</p>
        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.map((skill) => (
            <span
              key={skill.skillId}
              className={
                skill.importance === "MustHave"
                  ? "rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  : "rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground"
              }
            >
              {skill.skillName ?? "Required skill"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
