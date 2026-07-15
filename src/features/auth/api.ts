import { http } from "@/lib/api-client";
import type { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from "./types";

export const authApi = {
  login: (payload: LoginRequest) => http.post<AuthResponse>("/api/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterRequest) =>
    http.post<AuthResponse>("/api/auth/register", payload).then((r) => r.data),

  me: () => http.get<MeResponse>("/api/auth/me").then((r) => r.data),
};
