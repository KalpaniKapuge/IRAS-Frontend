export interface AuditLogDto {
  logId: number;
  userId: number;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: number;
  ipAddress: string | null;
  createdAt: string;
}
