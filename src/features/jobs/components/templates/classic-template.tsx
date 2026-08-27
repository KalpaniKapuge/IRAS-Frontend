import { Briefcase, Building2, Calendar, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { ApplyDialog } from "@/features/applications/components/apply-dialog";
import { JobDescription } from "../job-description";
import type { JobTemplateProps } from "./types";

function Fact({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ClassicTemplate({ job }: JobTemplateProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="space-y-6 p-8 text-center">
          <div>
            <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" /> {job.companyName ?? "Confidential"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{job.title}</h1>
          </div>
          <Separator />
          <div className="flex justify-center">
            <ApplyDialog jobId={job.jobId} jobTitle={job.title} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border">
          <CardContent className="p-6">
            <JobDescription description={job.generatedJd} jobTitle={job.title} />
          </CardContent>
        </Card>

        <Card className="h-fit border-border">
          <CardContent className="space-y-5 p-6">
            <div className="grid grid-cols-1 gap-4">
              <Fact icon={Sparkles} label="Seniority" value={job.seniorityLevel} />
              <Fact icon={Briefcase} label="Employment type" value={titleCase(job.employmentType)} />
              {job.location && <Fact icon={MapPin} label="Location" value={job.location} />}
              <Fact icon={GraduationCap} label="Minimum education" value={`${titleCase(job.educationReq)}+`} />
              {job.postedAt && <Fact icon={Calendar} label="Posted" value={formatDate(job.postedAt)} />}
            </div>

            <Separator />

            <div>
              <p className="text-sm font-semibold text-foreground">Required skills</p>
              <ul className="mt-2 space-y-1.5">
                {job.requiredSkills.map((skill) => (
                  <li key={skill.skillId} className="flex items-center justify-between text-sm text-foreground/85">
                    <span>{skill.skillName ?? "Required skill"}</span>
                    <span className="text-xs text-muted-foreground">
                      {skill.importance === "MustHave" ? "Must-have" : "Nice-to-have"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
