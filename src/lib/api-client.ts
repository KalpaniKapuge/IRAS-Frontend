import axios, { AxiosError } from "axios";
import { ApiError } from "@/types/common";

// Indirection to avoid a circular import between the api client and the auth
// store (the store needs to call the api client; the client needs the store's
// token). The auth store calls `setAccessToken` whenever it changes.
let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7031",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; title?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;

    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    const message =
      data?.message ??
      data?.title ??
      (status === 0
        ? "Could not reach the server. Check your connection and try again."
        : status === 403
          ? "You don't have permission to do that."
          : status === 404
            ? "The requested resource was not found."
            : "Something went wrong. Please try again.");

    return Promise.reject(new ApiError(message, status, data?.errors));
  },
);

// Small helper so feature `api.ts` files can write `const { data } = await http.get(...)`
// while still getting typed, unwrapped-error responses via the interceptor above.
export const http = apiClient;
