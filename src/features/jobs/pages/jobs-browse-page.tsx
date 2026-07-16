import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Building2, MapPin, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

  const stats = useMemo(() => {
    const companies = new Set(publishedJobs.map((job) => job.companyName).filter(Boolean));
    const locations = new Set(publishedJobs.map((job) => job.location).filter(Boolean));
    const skillCount = publishedJobs.reduce((sum, job) => sum + job.requiredSkillCount, 0);
    return {
      jobs: publishedJobs.length,
      companies: companies.size,
      locations: locations.size,
      skillCount,
    };
  }, [publishedJobs]);

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-primary/15 bg-card/95 p-4 shadow-soft">
        <div className="grid gap-4 xl:grid-cols-[1fr_600px] xl:items-end">
          <div className="space-y-3">
            <div>
              <Badge variant="info" className="mb-2">
                Candidate job discovery
              </Badge>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Browse Jobs</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Search open positions, compare requirements, and apply only once with your parsed resume.
              </p>
            </div>

            <div className="relative max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, company, or location..."
                className="h-10 rounded-lg border-primary/20 bg-background/80 pl-9 shadow-soft"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/70 px-3 py-2.5">
              <BriefcaseBusiness className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-base font-bold leading-none">{stats.jobs}</p>
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Open roles</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/70 px-3 py-2.5">
              <Building2 className="h-4 w-4 shrink-0 text-info" />
              <div>
                <p className="text-base font-bold leading-none">{stats.companies}</p>
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Companies</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/70 px-3 py-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-success" />
              <div>
                <p className="text-base font-bold leading-none">{stats.locations}</p>
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Locations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/70 px-3 py-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-warning" />
              <div>
                <p className="text-base font-bold leading-none">{stats.skillCount}</p>
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Skill signals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">Recommended openings</p>
          <p className="text-xs text-muted-foreground">
            {isLoadingList ? "Refreshing job list..." : `${publishedJobs.length} role${publishedJobs.length === 1 ? "" : "s"} available`}
          </p>
        </div>
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Clear search
          </button>
        )}
      </div>

      {isLoadingList && publishedJobs.length === 0 ? (
        <CardSkeletonGrid count={6} />
      ) : publishedJobs.length === 0 ? (
        <EmptyState icon={BriefcaseBusiness} title="No open positions found" description="Try a different search term, or check back soon for new listings." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {publishedJobs.map((job) => (
            <JobCard key={job.jobId} job={job} to={`/candidate/jobs/${job.jobId}`} />
          ))}
        </div>
      )}
    </div>
  );
}
