import { http } from "@/lib/api-client";
import type { ParseResultDto, ResumeDto } from "./types";

export const resumesApi = {
  getMine: () => http.get<ResumeDto[]>("/api/resumes").then((r) => r.data),

  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http
      .post<ParseResultDto>("/api/resumes", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  retryParse: (resumeId: number) => http.post<ParseResultDto>(`/api/resumes/${resumeId}/retry-parse`).then((r) => r.data),

  confirmSkills: (resumeId: number, skillIds: number[]) =>
    http.post(`/api/resumes/${resumeId}/confirm-skills`, { skillIds }).then((r) => r.data),

  setPrimary: (resumeId: number) => http.post(`/api/resumes/${resumeId}/set-primary`).then((r) => r.data),

  remove: (resumeId: number) => http.delete(`/api/resumes/${resumeId}`).then((r) => r.data),
};
