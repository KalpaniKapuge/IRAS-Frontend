import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatRelative } from "@/lib/format";
import { getInitials } from "@/lib/utils";
import { ApiError } from "@/types/common";
import { USER_ROLES } from "@/types/enums";
import { useAuthStore } from "@/features/auth/store";
import { adminUsersApi } from "../api";
import type { UserSummaryDto } from "../types";

export function UsersAdminPage() {
  const currentUserId = useAuthStore((s) => s.user!.userId);
  const [users, setUsers] = useState<UserSummaryDto[] | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const load = () => adminUsersApi.getAll(roleFilter === "all" ? undefined : roleFilter).then(setUsers);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleToggle = async (user: UserSummaryDto) => {
    const next = !user.isActive;
    setUsers((prev) => prev?.map((u) => (u.userId === user.userId ? { ...u, isActive: next } : u)) ?? null);
    try {
      await adminUsersApi.setActive(user.userId, next);
      toast.success(`${user.email} ${next ? "activated" : "deactivated"}.`);
    } catch (err) {
      setUsers((prev) => prev?.map((u) => (u.userId === user.userId ? { ...u, isActive: !next } : u)) ?? null);
      toast.error(err instanceof ApiError ? err.message : "Failed to update user status.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage candidate, employer, and admin accounts."
        actions={
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {USER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {users === null ? (
        <RowSkeletonList count={6} />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(user.email, "")}</AvatarFallback></Avatar>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatRelative(user.lastLogin)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={user.isActive}
                    disabled={user.userId === currentUserId}
                    onCheckedChange={() => handleToggle(user)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
