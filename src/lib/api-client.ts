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
  // Cap every request so a stalled backend / AI service surfaces as a real error the UI
  // can show and retry, instead of a spinner that hangs forever. Generous enough for the
  // slowest legitimate call (live job-recommendation scoring across all open jobs).
  timeout: 45_000,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (config.data instanceof FormData) {
    config.headers.delete?.("Content-Type");
    config.headers.delete?.("content-type");
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; title?: string; detail?: string; errors?: Record<string, string[]> } | string>) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const problem = typeof data === "string" ? undefined : data;

    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    const timedOut = error.code === "ECONNABORTED" || /timeout/i.test(error.message);

    // ASP.NET Core's automatic model validation (e.g. a [StringLength] violation) returns a
    // ValidationProblemDetails with a generic title ("One or more validation errors
    // occurred") and the actual per-field reasons in `errors`; surface those instead of
    // the useless generic title, everywhere in the app, not just for this one field.
    const fieldErrorSummary =
      problem?.errors && Object.keys(problem.errors).length > 0
        ? Object.entries(problem.errors).map(([field, msgs]) => `${field}: ${msgs.join(" ")}`).join(" - ")
        : undefined;

    const message =
      problem?.message ??
      fieldErrorSummary ??
      problem?.detail ??
      problem?.title ??
      (typeof data === "string" && data.trim().length > 0 ? data : undefined) ??
      (timedOut
        ? "The server took too long to respond. Please try again."
        : status === 0
          ? "Could not reach the server. Check your connection and try again."
          : status === 403
            ? "You don't have permission to do that."
            : status === 404
              ? "The requested resource was not found."
              : status === 413
                ? "The file is too large to upload."
                : "Something went wrong. Please try again.");

    return Promise.reject(new ApiError(message, status, problem?.errors));
  },
);

// Small helper so feature `api.ts` files can write `const { data } = await http.get(...)`
// while still getting typed, unwrapped-error responses via the interceptor above.
export const http = apiClient;
