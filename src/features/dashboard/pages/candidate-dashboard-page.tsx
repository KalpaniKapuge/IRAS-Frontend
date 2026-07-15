import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileText, ListChecks, Radar, Target } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { formatScore } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";
import { applicationsApi } from "@/features/applications/api";
import type { ApplicationDto } from "@/features/applications/types";
import { skillGapsApi } from "@/features/skill-gaps/api";
import { jobMatchesApi } from "@/features/job-matches/api";
import { resumesApi } from "@/features/resumes/api";

export function CandidateDashboardPage() {
  const user = useAuthStore((s) => s.user!);
  const [applications, setApplications] = useState<ApplicationDto[] | null>(null);
  const [gapCount, setGapCount] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [resumeCount, setResumeCount] = useState<number | null>(null);

  useEffect(() => {
    applicationsApi.getMine().then(setApplications);
    skillGapsApi.getMySummary(user.userId).then((g) => setGapCount(g.length));
    jobMatchesApi.getMine(user.userId).then((m) => setMatchCount(m.length));
    resumesApi.getMine().then((r) => setResumeCount(r.length));
  }, [user.userId]);

  const avgScore =
    applications && applications.length > 0
      ? applications.reduce((sum, a) => sum + a.totalScore, 0) / applications.length
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.email.split("@")[0]}`}
        description="Here's a snapshot of your job search."
        actions={
          <Button asChild>
            <Link to="/candidate/jobs"><Briefcase className="h-4 w-4" /> Browse jobs</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={applications?.length ?? "—"} icon={ListChecks} tone="primary" />
        <StatCard
          label="Avg. match score"
          value={applications && applications.length > 0 ? `${formatScore(avgScore)}%` : "—"}
          icon={Target}
          tone="success"
        />
        <StatCard label="Job matches" value={matchCount ?? "—"} icon={Radar} tone="info" />
        <StatCard label="Resumes on file" value={resumeCount ?? "—"} icon={FileText} tone="muted" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Recent applications</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/candidate/applications">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {applications === null ? (
            <RowSkeletonList count={3} />
          ) : applications.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No applications yet"
              description="Browse open roles and apply — your progress will show up here."
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 5).map((app) => (
                <div key={app.applicationId} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{app.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.companyName ?? "Confidential"} · Applied {formatDate(app.appliedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatScore(app.totalScore)}%</span>
                    <StatusBadge enumName="ApplicationStatus" value={app.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {gapCount !== null && gapCount > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">You have {gapCount} skill area{gapCount === 1 ? "" : "s"} to improve</p>
                <p className="text-sm text-muted-foreground">Closing these gaps could improve your match scores.</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/candidate/skill-gaps">Review skill gaps</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
