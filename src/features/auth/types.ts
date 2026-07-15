import type { UserRole } from "@/types/enums";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: Extract<UserRole, "Candidate" | "Employer">;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: string;
}

export interface MeResponse {
  userId: string;
  email: string;
  role: UserRole;
}
