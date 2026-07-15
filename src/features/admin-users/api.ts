import { http } from "@/lib/api-client";
import type { UserSummaryDto } from "./types";

export const adminUsersApi = {
  getAll: (role?: string) => http.get<UserSummaryDto[]>("/api/admin/users", { params: { role } }).then((r) => r.data),
  setActive: (userId: number, isActive: boolean) =>
    http.put(`/api/admin/users/${userId}/status`, { isActive }).then((r) => r.data),
};
