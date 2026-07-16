import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { useJobsStore } from "../store";
import { JobDescription } from "../components/job-description";
import { ApplyDialog } from "@/features/applications/components/apply-dialog";

export function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentJob, isLoadingDetail, loadJob, clearCurrentJob } = useJobsStore();

  useEffect(() => {
    if (jobId) loadJob(Number(jobId));
    return () => clearCurrentJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (isLoadingDetail) return <PageSpinner label="Loading job..." />;
  if (!currentJob) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Job not found"
        description="This position may have been closed or removed."
        action={<Button onClick={() => navigate("/candidate/jobs")}>Back to jobs</Button>}
      />
    );
  }

  const job = currentJob;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-4 w-4" /> {job.companyName ?? "Confidential"}
          </p>
        </div>
        <ApplyDialog jobId={job.jobId} jobTitle={job.title} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{job.seniorityLevel}</Badge>
        <Badge variant="outline" className="gap-1">
          <Briefcase className="h-3 w-3" /> {titleCase(job.employmentType)}
        </Badge>
        {job.location && (
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3 w-3" /> {job.location}
          </Badge>
        )}
        <Badge variant="outline" className="gap-1">
          <GraduationCap className="h-3 w-3" /> {titleCase(job.educationReq)}+
        </Badge>
        {job.postedAt && (
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" /> Posted {formatDate(job.postedAt)}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <JobDescription description={job.generatedJd} jobTitle={job.title} />
          </CardContent>
        </Card>

        <Card className="h-fit overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-elevated">
          <CardContent className="space-y-5 p-0">
            <div className="border-b border-border/70 bg-primary/10 px-6 py-5 dark:bg-primary/15">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Candidate fit snapshot</p>
                  <p className="text-xs text-muted-foreground">Key requirements before applying</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 pb-6">
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Required skills
                  </p>
                  <Badge variant="info">{job.requiredSkills.length} skills</Badge>
                </div>

                <div className="grid gap-2">
                  {job.requiredSkills.map((skill) => {
                    const isMustHave = skill.importance === "MustHave";
                    return (
                      <div
                        key={skill.skillId}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/70 px-3 py-2.5 shadow-soft"
                      >
                        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                          <CheckCircle2 className={isMustHave ? "h-4 w-4 shrink-0 text-primary" : "h-4 w-4 shrink-0 text-info"} />
                          <span className="truncate">{skill.skillName ?? "Required skill"}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {skill.minYears > 0 ? `${skill.minYears}+ yrs` : isMustHave ? "Must-have" : "Nice-to-have"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-primary/20 bg-primary/10 p-4 dark:bg-primary/15">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-soft">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Minimum experience</p>
                    <p className="mt-1 text-2xl font-bold text-primary">{job.minExpYears}+ years</p>
                    <p className="mt-1 text-xs text-muted-foreground">Recommended professional experience for this role.</p>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
