import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Radar, RefreshCw, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/shared/score-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardSkeletonGrid } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ApiError } from "@/types/common";
import { formatRelative } from "@/lib/format";
import { formatScore } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";
import { jobMatchesApi } from "../api";
import type { JobMatchDto, JobRecommendationDto } from "../types";

type Async<T> = { data: T | null; error: string | null; loading: boolean };

const initial = <T,>(): Async<T> => ({ data: null, error: null, loading: true });

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function JobMatchesPage() {
  const candidateId = useAuthStore((s) => s.user!.userId);
  const [matched, setMatched] = useState<Async<JobMatchDto[]>>(initial);
  const [recommended, setRecommended] = useState<Async<JobRecommendationDto[]>>(initial);

  const loadMatched = useCallback(() => {
    setMatched((s) => ({ ...s, loading: true, error: null }));
    jobMatchesApi
      .getMine(candidateId)
      .then((data) => setMatched({ data, error: null, loading: false }))
      .catch((err) =>
        setMatched({ data: null, loading: false, error: errorMessage(err, "Couldn't load your matches.") }),
      );
  }, [candidateId]);

  const loadRecommended = useCallback(() => {
    setRecommended((s) => ({ ...s, loading: true, error: null }));
    jobMatchesApi
      .getRecommended(candidateId)
      .then((data) => setRecommended({ data, error: null, loading: false }))
      .catch((err) =>
        setRecommended({ data: null, loading: false, error: errorMessage(err, "Couldn't load recommendations.") }),
      );
  }, [candidateId]);

  useEffect(() => {
    loadMatched();
    loadRecommended();
  }, [loadMatched, loadRecommended]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Matches"
        description="Jobs matched to your profile — automatically when posted, or scored live right now against your current resume."
      />

      <Tabs defaultValue="recommended">
        <TabsList>
          <TabsTrigger value="recommended">Recommended for you</TabsTrigger>
          <TabsTrigger value="matched">Auto-matched</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          {recommended.loading ? (
            <CardSkeletonGrid count={6} />
          ) : recommended.error ? (
            <EmptyState
              icon={AlertTriangle}
              title="Couldn't load recommendations"
              description={recommended.error}
              action={
                <Button variant="outline" size="sm" onClick={loadRecommended}>
                  <RefreshCw className="h-4 w-4" /> Try again
                </Button>
              }
            />
          ) : (recommended.data ?? []).length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No recommendations yet"
              description="Upload and parse a primary resume to get live job recommendations scored against your profile."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.data!.map((rec) => (
                <Card key={rec.jobId}>
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <p className="font-semibold">{rec.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">{rec.companyName ?? "Confidential"}</p>
                    </div>
                    <ScoreBar value={rec.matchScore} label="Overall match" />
                    <div className="grid grid-cols-2 gap-3">
                      <ScoreBar value={rec.skillMatch} label="Skill match" />
                      <ScoreBar value={rec.semanticSimilarity} label="Resume relevance" />
                    </div>
                    {rec.mlFitScore !== null && (
                      <Badge variant="info" className="gap-1">
                        <Sparkles className="h-3 w-3" /> AI fit score {formatScore(rec.mlFitScore)}%
                      </Badge>
                    )}
                    <div className="flex justify-end">
                      <Button size="sm" asChild>
                        <Link to={`/candidate/jobs/${rec.jobId}`}>View job</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matched">
          {matched.loading ? (
            <CardSkeletonGrid count={6} />
          ) : matched.error ? (
            <EmptyState
              icon={AlertTriangle}
              title="Couldn't load your matches"
              description={matched.error}
              action={
                <Button variant="outline" size="sm" onClick={loadMatched}>
                  <RefreshCw className="h-4 w-4" /> Try again
                </Button>
              }
            />
          ) : (matched.data ?? []).length === 0 ? (
            <EmptyState
              icon={Radar}
              title="No matches yet"
              description="Auto-matches appear when an employer publishes a job that fits your profile. Make sure automated matching is on in your profile and you have a parsed primary resume."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matched.data!.map((match) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
