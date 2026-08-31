import { http } from "@/lib/api-client";
import type { CreateAdminUserRequest, UserSummaryDto } from "./types";

export const adminUsersApi = {
  getAll: (role?: string) => http.get<UserSummaryDto[]>("/api/admin/users", { params: { role } }).then((r) => r.data),
  setActive: (userId: number, isActive: boolean) =>
    http.put(`/api/admin/users/${userId}/status`, { isActive }).then((r) => r.data),
  createAdmin: (payload: CreateAdminUserRequest) =>
    http.post<UserSummaryDto>("/api/admin/users/admins", payload).then((r) => r.data),
};
