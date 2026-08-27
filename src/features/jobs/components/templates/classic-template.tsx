import { Briefcase, Building2, Calendar, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="space-y-4 border-b-2 border-foreground/80 pb-6 text-center font-serif">
        <p className="flex items-center justify-center gap-1.5 text-sm uppercase tracking-widest text-muted-foreground">
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
          <p className="mb-1 font-serif text-sm font-semibold uppercase tracking-wide text-foreground">
            Position Summary
          </p>
          <FactRow icon={Sparkles} label="Seniority level" value={job.seniorityLevel} />
          <FactRow icon={Briefcase} label="Employment type" value={titleCase(job.employmentType)} />
          {job.location && <FactRow icon={MapPin} label="Location" value={job.location} />}
          <FactRow icon={GraduationCap} label="Minimum education" value={`${titleCase(job.educationReq)}+`} />
          {job.postedAt && <FactRow icon={Calendar} label="Date posted" value={formatDate(job.postedAt)} />}
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 font-serif text-sm font-semibold uppercase tracking-wide text-foreground">
          Full Description
        </p>
        <JobDescription description={job.generatedJd} jobTitle={job.title} />
      </div>

      <div>
        <p className="mb-3 font-serif text-sm font-semibold uppercase tracking-wide text-foreground">
          Requirements
        </p>
        <Separator className="mb-3" />
        <ul className="space-y-2">
          {job.requiredSkills.map((skill) => (
            <li key={skill.skillId} className="flex items-center justify-between text-sm text-foreground/85">
              <span>{skill.skillName ?? "Required skill"}</span>
              <span className="text-xs italic text-muted-foreground">
                {skill.importance === "MustHave" ? "Required" : "Preferred"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
