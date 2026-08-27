import { http } from "@/lib/api-client";
import type { EmployerProfileDto, UpdateEmployerProfileRequest } from "./types";

export const employerProfileApi = {
  get: (employerId: number) => http.get<EmployerProfileDto>(`/api/employers/${employerId}`).then((r) => r.data),
  update: (employerId: number, payload: UpdateEmployerProfileRequest) =>
    http.put(`/api/employers/${employerId}`, payload).then((r) => r.data),

  uploadLogo: (employerId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http
      .post<EmployerProfileDto>(`/api/employers/${employerId}/logo`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
