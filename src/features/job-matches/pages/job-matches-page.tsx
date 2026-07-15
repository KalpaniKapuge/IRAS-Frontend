import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radar } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreBar } from "@/components/shared/score-bar";
import { Button } from "@/components/ui/button";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelative } from "@/lib/format";
import { useAuthStore } from "@/features/auth/store";
import { jobMatchesApi } from "../api";
import type { JobMatchDto } from "../types";

export function JobMatchesPage() {
  const candidateId = useAuthStore((s) => s.user!.userId);
  const [matches, setMatches] = useState<JobMatchDto[] | null>(null);

  useEffect(() => {
    jobMatchesApi.getMine(candidateId).then(setMatches);
  }, [candidateId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Matches"
        description="Jobs our system proactively matched to your profile — no need to search, just review and apply."
      />

      {matches === null ? (
        <RowSkeletonList count={4} />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Radar}
          title="No matches yet"
          description="Make sure automated matching is enabled in your profile and you have a parsed primary resume."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <Card key={match.matchId}>
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="font-semibold">{match.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">{match.companyName ?? "Confidential"}</p>
                </div>
                <ScoreBar value={match.matchScore} label="Match strength" />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Matched {formatRelative(match.matchedAt)}</p>
                  <Button size="sm" asChild>
                    <Link to={`/candidate/jobs/${match.jobId}`}>View job</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
