import { http } from "@/lib/api-client";
import type { AuditLogDto } from "./types";

export const auditLogsApi = {
  getRecent: (take = 100) => http.get<AuditLogDto[]>("/api/admin/audit-logs", { params: { take } }).then((r) => r.data),
};
