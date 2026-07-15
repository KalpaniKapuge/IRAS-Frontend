import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setAccessToken, setUnauthorizedHandler } from "@/lib/api-client";
import { ApiError } from "@/types/common";
import type { UserRole } from "@/types/enums";
import { authApi } from "./api";
import type { LoginRequest, RegisterRequest } from "./types";

interface AuthUser {
  userId: number;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      isLoading: false,
      error: null,

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login(payload);
          setAccessToken(res.token);
          set({
            user: { userId: res.userId, email: res.email, role: res.role },
            token: res.token,
            expiresAt: res.expiresAt,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false, error: err instanceof ApiError ? err.message : "Login failed." });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register(payload);
          setAccessToken(res.token);
          set({
            user: { userId: res.userId, email: res.email, role: res.role },
            token: res.token,
            expiresAt: res.expiresAt,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false, error: err instanceof ApiError ? err.message : "Registration failed." });
          throw err;
        }
      },

      logout: () => {
        setAccessToken(null);
        set({ user: null, token: null, expiresAt: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "iras-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, expiresAt: state.expiresAt }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAccessToken(state.token);
      },
    },
  ),
);

setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});

export function isTokenExpired(expiresAt: string | null) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}
