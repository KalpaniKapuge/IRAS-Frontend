import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  FileText,
  ListChecks,
  MessageSquareWarning,
  Radar,
  Target,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageSpinner } from "@/components/shared/loading-state";
import { CHART_COLORS, CHART_GRID_COLOR, CHART_TEXT_COLOR } from "@/lib/chart-colors";
import { formatScore } from "@/lib/utils";
import { adminReportsApi } from "../api";
import type { DashboardStatsDto } from "../types";

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-elevated">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);

  useEffect(() => {
    adminReportsApi.getDashboard().then(setStats);
  }, []);

  if (!stats) return <PageSpinner label="Loading platform metrics…" />;

  const statusData = Object.entries(stats.applicationsByStatus).map(([status, count]) => ({ status, count }));
  const skillData = stats.topMissingSkills.slice(0, 8).map((s) => ({ name: s.skillName, count: s.occurrences }));

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Overview" description="Real-time metrics across candidates, employers, and AI-driven matching." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Candidates" value={stats.totalCandidates} icon={Users} tone="primary" />
        <StatCard label="Employers" value={stats.totalEmployers} icon={Building2} tone="info" />
        <StatCard
          label="Published jobs"
          value={stats.publishedJobs}
          hint={`${stats.totalJobs} total`}
          icon={Briefcase}
          tone="success"
        />
        <StatCard label="Applications" value={stats.totalApplications} icon={ListChecks} tone="muted" />
        <StatCard
          label="Avg. application score"
          value={`${formatScore(stats.averageApplicationScore)}%`}
          icon={Target}
          tone="primary"
        />
        <StatCard
          label="Resumes parsed"
          value={stats.parsedResumes}
          hint={`${stats.failedResumes} failed`}
          icon={FileText}
          tone={stats.failedResumes > 0 ? "warning" : "success"}
        />
        <StatCard label="Auto job matches" value={stats.totalJobMatches} icon={Radar} tone="info" />
        <StatCard
          label="Pending feedback reviews"
          value={stats.pendingFeedbackReviews}
          icon={MessageSquareWarning}
          tone={stats.pendingFeedbackReviews > 0 ? "warning" : "muted"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications by status</CardTitle>
            <CardDescription>Distribution across the applicant funnel.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {statusData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No application data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={CHART_GRID_COLOR} />
                  <XAxis dataKey="status" tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }} axisLine={{ stroke: CHART_GRID_COLOR }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Top missing skills
            </CardTitle>
            <CardDescription>Skills most frequently missing from applicants across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {skillData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No skill gap data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke={CHART_GRID_COLOR} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="count" fill={CHART_COLORS[3]} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
