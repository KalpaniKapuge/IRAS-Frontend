import { useEffect, useState } from "react";
import { Activity, Cpu, FileWarning, Gauge, HardDrive, Timer } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/shared/score-bar";
import { PageSpinner } from "@/components/shared/loading-state";
import { formatBytes, formatPercent } from "@/lib/utils";
import { systemStatusApi } from "../api";
import type { AiModelStatusDto, SystemSettingsDto } from "../types";

export function SystemStatusPage() {
  const [aiStatus, setAiStatus] = useState<AiModelStatusDto | null>(null);
  const [settings, setSettings] = useState<SystemSettingsDto | null>(null);

  useEffect(() => {
    systemStatusApi.getAiStatus().then(setAiStatus);
    systemStatusApi.getSettings().then(setSettings);
  }, []);

  if (!aiStatus || !settings) return <PageSpinner label="Checking system health…" />;

  return (
    <div className="space-y-6">
      <PageHeader title="System Status" description="AI service health and current platform configuration." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" /> AI Service</CardTitle>
              <CardDescription className="mt-1 truncate">{aiStatus.aiServiceBaseUrl}</CardDescription>
            </div>
            <Badge variant={aiStatus.aiServiceOnline ? "success" : "destructive"} className="gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${aiStatus.aiServiceOnline ? "bg-success" : "bg-destructive"}`} />
              {aiStatus.aiServiceOnline ? "Online" : "Offline"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreBar value={aiStatus.parseSuccessRate} label="Resume parse success rate" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                <span>{aiStatus.totalResumesParsed} parsed</span>
              </div>
              <div className="flex items-center gap-2">
                <FileWarning className="h-4 w-4 text-destructive" />
                <span>{aiStatus.totalResumesFailed} failed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> Scoring configuration</CardTitle>
            <CardDescription>Weighted formula used to rank every application and job match.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreBar value={settings.skillMatchWeight} label="Skill match weight" />
            <ScoreBar value={settings.semanticSimilarityWeight} label="Semantic similarity weight" />
            <ScoreBar value={settings.autoMatchThreshold} label="Auto-match notification threshold" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Timer className="h-4 w-4 text-primary" /> AI service limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Request timeout</span><span className="font-medium">{settings.aiServiceTimeoutSeconds}s</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Base URL</span><span className="truncate font-medium">{settings.aiServiceBaseUrl}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><HardDrive className="h-4 w-4 text-primary" /> Resume storage limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Max file size</span><span className="font-medium">{formatBytes(settings.maxResumeFileSizeBytes)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Max resumes per candidate</span><span className="font-medium">{settings.maxResumesPerCandidate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Parse success rate</span><span className="font-medium">{formatPercent(aiStatus.parseSuccessRate)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
