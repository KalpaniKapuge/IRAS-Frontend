import type { UserRole } from "@/types/enums";

export interface UserSummaryDto {
  userId: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}
