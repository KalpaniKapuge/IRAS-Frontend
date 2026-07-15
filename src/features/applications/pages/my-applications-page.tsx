import { useEffect } from "react";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useApplicationsStore } from "../store";
import { ApplicationCard } from "../components/application-card";

export function MyApplicationsPage() {
  const { myApplications, isLoading, loadMine } = useApplicationsStore();

  useEffect(() => {
    loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="My Applications" description="Track the status and match score of every job you've applied to." />
      {isLoading && myApplications.length === 0 ? (
        <RowSkeletonList count={4} />
      ) : myApplications.length === 0 ? (
        <EmptyState icon={ListChecks} title="No applications yet" description="Browse open positions and apply to see them tracked here." />
      ) : (
        <div className="space-y-3">
          {myApplications.map((app) => (
            <ApplicationCard key={app.applicationId} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
