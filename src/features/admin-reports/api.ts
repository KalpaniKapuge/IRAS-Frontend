import { http } from "@/lib/api-client";
import type { DashboardStatsDto } from "./types";

export const adminReportsApi = {
  getDashboard: () => http.get<DashboardStatsDto>("/api/admin/reports/dashboard").then((r) => r.data),
};
