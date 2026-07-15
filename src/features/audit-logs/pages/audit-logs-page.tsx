import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/format";
import { auditLogsApi } from "../api";
import type { AuditLogDto } from "../types";

const TAKE_OPTIONS = [50, 100, 200, 500];

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDto[] | null>(null);
  const [take, setTake] = useState(100);

  useEffect(() => {
    auditLogsApi.getRecent(take).then(setLogs);
  }, [take]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="A read-only trail of administrative actions — user management, skill taxonomy edits, and knowledge base changes."
        actions={
          <Select value={String(take)} onValueChange={(v) => setTake(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TAKE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>Last {n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {logs === null ? (
        <RowSkeletonList count={8} />
      ) : logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit activity yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.logId}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                <TableCell className="text-sm font-medium">{log.userEmail ?? `User #${log.userId}`}</TableCell>
                <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.entityType} #{log.entityId}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.ipAddress ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
