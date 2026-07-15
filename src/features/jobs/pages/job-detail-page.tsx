import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, Building2, Calendar, GraduationCap, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageSpinner } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { useJobsStore } from "../store";
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

  if (isLoadingDetail) return <PageSpinner label="Loading job…" />;
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
        <Badge variant="outline" className="gap-1"><Briefcase className="h-3 w-3" /> {titleCase(job.employmentType)}</Badge>
        {job.location && <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" /> {job.location}</Badge>}
        <Badge variant="outline" className="gap-1"><GraduationCap className="h-3 w-3" /> {titleCase(job.educationReq)}+</Badge>
        {job.postedAt && <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> Posted {formatDate(job.postedAt)}</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {job.generatedJd ?? "No description provided yet."}
            </p>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-sm font-semibold">Required skills</p>
              <Separator className="my-3" />
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s) => (
                  <Badge key={s.skillId} variant={s.importance === "MustHave" ? "destructive" : "muted"}>
                    {s.skillName}
                    {s.minYears > 0 && <span className="opacity-70"> · {s.minYears}y+</span>}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Minimum experience</p>
              <p className="text-sm text-muted-foreground">{job.minExpYears} year(s)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
