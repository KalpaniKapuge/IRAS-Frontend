import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radar, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/shared/score-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelative } from "@/lib/format";
import { formatScore } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";
import { jobMatchesApi } from "../api";
import type { JobMatchDto, JobRecommendationDto } from "../types";

export function JobMatchesPage() {
  const candidateId = useAuthStore((s) => s.user!.userId);
  const [matches, setMatches] = useState<JobMatchDto[] | null>(null);
  const [recommended, setRecommended] = useState<JobRecommendationDto[] | null>(null);

  useEffect(() => {
    jobMatchesApi.getMine(candidateId).then(setMatches);
    jobMatchesApi.getRecommended(candidateId).then(setRecommended);
  }, [candidateId]);

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
          {recommended === null ? (
            <RowSkeletonList count={4} />
          ) : recommended.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No recommendations yet"
              description="Upload and parse a primary resume to get live job recommendations scored against your profile."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((rec) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
