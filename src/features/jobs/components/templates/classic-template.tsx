import { Briefcase, Building2, Calendar, GraduationCap, Home, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { JobDescription } from "../job-description";
import type { JobTemplateProps } from "./types";

function FactRow({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 py-2.5 text-sm last:border-b-0">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

// Single-column document/letter flow — deliberately not a sidebar layout,
// to read like a formal printed job notice rather than a web dashboard card.
export function ClassicTemplate({ job, actionSlot }: JobTemplateProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-4 rounded-t-xl border-b-4 border-chart-3 bg-gradient-to-b from-chart-3/10 to-transparent px-6 pb-6 pt-8 text-center font-serif">
        <p className="flex items-center justify-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-chart-3">
          <Building2 className="h-4 w-4" /> {job.companyName ?? "Confidential"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">{job.title}</h1>
        <p className="text-sm text-muted-foreground">
          {job.seniorityLevel} Position {job.postedAt && `· Posted ${formatDate(job.postedAt)}`}
        </p>
      </div>

      <div className="flex justify-center">{actionSlot}</div>

      <Card className="border-border">
        <CardContent className="p-6">
          <p className="mb-1 font-serif text-sm font-semibold uppercase tracking-wide text-chart-3">
            Position Summary
          </p>
          <FactRow icon={Sparkles} label="Seniority level" value={job.seniorityLevel} />
          <FactRow icon={Briefcase} label="Employment type" value={titleCase(job.employmentType)} />
          <FactRow icon={Home} label="Work arrangement" value={titleCase(job.workArrangement)} />
          {job.location && <FactRow icon={MapPin} label="Location" value={job.location} />}
          <FactRow icon={GraduationCap} label="Minimum education" value={`${titleCase(job.educationReq)}+`} />
          {job.postedAt && <FactRow icon={Calendar} label="Date posted" value={formatDate(job.postedAt)} />}
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 font-serif text-sm font-semibold uppercase tracking-wide text-chart-3">
          Full Description
        </p>
        <JobDescription description={job.generatedJd} jobTitle={job.title} />
      </div>

      <div>
        <p className="mb-3 font-serif text-sm font-semibold uppercase tracking-wide text-chart-3">
          Requirements
        </p>
        <Separator className="mb-3" />
        <ul className="space-y-2">
          {job.requiredSkills.map((skill) => {
            const isMustHave = skill.importance === "MustHave";
            return (
              <li
                key={skill.skillId}
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground/85"
              >
                <span>{skill.skillName ?? "Required skill"}</span>
                <Badge variant={isMustHave ? "default" : "secondary"} className="font-normal">
                  {skill.minYears > 0 ? `${skill.minYears}+ yrs` : isMustHave ? "Required" : "Preferred"}
                </Badge>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
