import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldPlus, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatRelative } from "@/lib/format";
import { getInitials } from "@/lib/utils";
import { ApiError } from "@/types/common";
import { USER_ROLES } from "@/types/enums";
import { useAuthStore } from "@/features/auth/store";
import { adminUsersApi } from "../api";
import type { UserSummaryDto } from "../types";

// Admin accounts can't be self-registered from the public sign-up form (RegisterRequest
// rejects Role=Admin server-side) — this is the only in-app way to provision one beyond the
// single seeded bootstrap account, so a logged-in admin can onboard another one safely and
// with an audit trail, instead of editing seed config or the database directly.
function CreateAdminDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await adminUsersApi.createAdmin({ email: email.trim(), password });
      toast.success(`Admin account created for ${email.trim()}.`);
      setOpen(false);
      reset();
      onCreated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create admin account.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary"><ShieldPlus className="h-4 w-4" /> Create Admin</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create admin account</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving} disabled={!email.trim() || password.length < 8}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateAdminDialog onCreated={load} />
          </div>
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
