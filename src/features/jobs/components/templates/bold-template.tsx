import { Briefcase, Building2, Calendar, GraduationCap, Home, MapPin, Sparkles, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { cn, titleCase } from "@/lib/utils";
import { JobDescription } from "../job-description";
import type { JobTemplateProps } from "./types";

// Every color here is either a proper token *pair* (bg-X / text-X-foreground, guaranteed
// legible by the design system in both light and dark mode) or a low-opacity tint of a
// theme-aware chart/semantic color used as text against it — the exact pattern already used
// safely elsewhere in this app (e.g. skill badges). Nothing here is a hardcoded neutral
// (slate/white/black) sitting on top of theme-relative text, which is what broke the last
// two versions: a fixed-dark banner blended into the page in dark mode, and a fixed-white
// card made JobDescription's theme-aware text unreadable on it.
const FACT_TINTS = [
  "bg-primary/10 text-primary",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-5/15 text-chart-5",
  "bg-info/15 text-info",
  "bg-success/15 text-success",
  "bg-chart-3/15 text-chart-3",
];

function FactChip({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tint)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold leading-tight text-foreground">{value}</p>
      </div>
    </div>
  );
}

// Bold's identity: a rich three-stop gradient hero (vs. Modern's two-stop) with an inline
// typographic meta line instead of a badge row, a colored fact-chip grid below it, and a
// gradient "must-have" spotlight stat anchoring the sidebar — distinct from Modern (soft
// gradient card + inline badges) and Classic (letterhead, single column) while staying
// entirely inside the app's theme system so it's correct in both light and dark mode.
export function BoldTemplate({ job, actionSlot }: JobTemplateProps) {
  const mustHave = job.requiredSkills.filter((s) => s.importance === "MustHave");
  const niceToHave = job.requiredSkills.filter((s) => s.importance !== "MustHave");

  const facts = [
    { icon: Sparkles, label: "Seniority", value: job.seniorityLevel },
    { icon: Briefcase, label: "Type", value: titleCase(job.employmentType) },
    { icon: Home, label: "Arrangement", value: titleCase(job.workArrangement) },
    { icon: Timer, label: "Experience", value: `${job.minExpYears}+ yrs` },
    { icon: GraduationCap, label: "Education", value: `${titleCase(job.educationReq)}+` },
    ...(job.location ? [{ icon: MapPin, label: "Location", value: job.location }] : []),
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-elevated">
        <div className="bg-gradient-to-br from-primary via-chart-2 to-chart-5 px-8 py-10 text-primary-foreground sm:px-12 sm:py-14">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                <Building2 className="h-3.5 w-3.5" /> {job.companyName ?? "Confidential"}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
                {job.title}
              </h1>
              <p className="mt-3 text-sm font-medium opacity-90">
                {job.seniorityLevel} · {titleCase(job.employmentType)} · {titleCase(job.workArrangement)}
                {job.postedAt && ` · Posted ${formatDate(job.postedAt)}`}
              </p>
            </div>
            {actionSlot && <div className="shrink-0">{actionSlot}</div>}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {facts.map((fact, i) => (
          <FactChip key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} tint={FACT_TINTS[i % FACT_TINTS.length]} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardContent className="p-6">
            <JobDescription description={job.generatedJd} jobTitle={job.title} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-chart-5 shadow-elevated">
            <CardContent className="p-6 text-primary-foreground">
              <p className="text-6xl font-black leading-none">{mustHave.length}</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-wide opacity-95">
                Must-have skill{mustHave.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-xs opacity-80">
                {job.requiredSkills.length} required skill{job.requiredSkills.length === 1 ? "" : "s"} in total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-foreground">Must-have</p>
                <div className="flex flex-wrap gap-2">
                  {mustHave.map((skill) => (
                    <span
                      key={skill.skillId}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground"
                    >
                      <span className="truncate">{skill.skillName ?? "Required skill"}</span>
                      {skill.minYears > 0 && (
                        <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">{skill.minYears}+ yrs</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {niceToHave.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-foreground">Nice-to-have</p>
                  <div className="flex flex-wrap gap-2">
                    {niceToHave.map((skill) => (
                      <span
                        key={skill.skillId}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground"
                      >
                        <span className="truncate">{skill.skillName ?? "Skill"}</span>
                        {skill.minYears > 0 && (
                          <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px]">{skill.minYears}+ yrs</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
