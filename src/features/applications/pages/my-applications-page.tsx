import { useEffect } from "react";
import { BadgeCheck, BarChart3, BriefcaseBusiness, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatScore } from "@/lib/utils";
import { useApplicationsStore } from "../store";
import { ApplicationCard } from "../components/application-card";

export function MyApplicationsPage() {
  const { myApplications, isLoading, loadMine } = useApplicationsStore();

  useEffect(() => {
    loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCount = myApplications.filter((app) => !["Rejected", "Hired", "Withdrawn"].includes(app.status)).length;
  const averageScore =
    myApplications.length > 0
      ? myApplications.reduce((sum, application) => sum + application.totalScore, 0) / myApplications.length
      : 0;
  const topScore = myApplications.length > 0 ? Math.max(...myApplications.map((application) => application.totalScore)) : 0;

  return (
    <div className="space-y-7">
      <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-background p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <PageHeader
            title="My Applications"
            description="Track each submitted job application, match quality, status, and skill gaps in one place."
          />
          {myApplications.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-lg border border-border/80 bg-background/70 p-4">
                <BriefcaseBusiness className="mb-3 h-4 w-4 text-primary" />
                <p className="text-2xl font-bold">{myApplications.length}</p>
                <p className="text-xs font-medium text-muted-foreground">Submitted jobs</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-background/70 p-4">
                <BadgeCheck className="mb-3 h-4 w-4 text-success" />
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs font-medium text-muted-foreground">Active applications</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-background/70 p-4">
                <BarChart3 className="mb-3 h-4 w-4 text-info" />
                <p className="text-2xl font-bold">{formatScore(averageScore)}%</p>
                <p className="text-xs font-medium text-muted-foreground">Average match</p>
              </div>
            </div>
          )}
        </div>
        {myApplications.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
              Best match {formatScore(topScore)}%
            </span>
            <span>Open a card to review the scoring details and missing skills.</span>
          </div>
        )}
      </div>

      {isLoading && myApplications.length === 0 ? (
        <RowSkeletonList count={4} />
      ) : myApplications.length === 0 ? (
        <EmptyState icon={ListChecks} title="No applications yet" description="Browse open positions and apply to see them tracked here." />
      ) : (
        <div className="space-y-4">
          {myApplications.map((app) => (
            <ApplicationCard key={app.applicationId} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
