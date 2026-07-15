import { useEffect, useState } from "react";
import { Search, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { CardSkeletonGrid } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useJobsStore } from "../store";
import { JobCard } from "../components/job-card";

export function JobsBrowsePage() {
  const { publishedJobs, isLoadingList, browsePublished } = useJobsStore();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);

  useEffect(() => {
    browsePublished(debouncedQuery || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <div className="space-y-6">
      <PageHeader title="Browse Jobs" description="Search open positions and apply with one click using your parsed resume." />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, company, or location…"
          className="pl-9"
        />
      </div>

      {isLoadingList && publishedJobs.length === 0 ? (
        <CardSkeletonGrid count={6} />
      ) : publishedJobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No open positions found" description="Try a different search term, or check back soon for new listings." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publishedJobs.map((job) => (
            <JobCard key={job.jobId} job={job} to={`/candidate/jobs/${job.jobId}`} />
          ))}
        </div>
      )}
    </div>
  );
}
