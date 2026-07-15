import { http } from "@/lib/api-client";
import type {
  CandidateProfileDto,
  CertificationDto,
  CertificationFormValues,
  EducationDto,
  EducationFormValues,
  UpdateCandidateProfileRequest,
  UpsertCandidateSkillRequest,
  WorkExperienceDto,
  WorkExperienceFormValues,
} from "./types";

const base = (candidateId: number) => `/api/candidates/${candidateId}`;

export const candidateProfileApi = {
  getProfile: (candidateId: number) => http.get<CandidateProfileDto>(base(candidateId)).then((r) => r.data),

  updateProfile: (candidateId: number, payload: UpdateCandidateProfileRequest) =>
    http.put(base(candidateId), payload).then((r) => r.data),

  addEducation: (candidateId: number, payload: EducationFormValues) =>
    http.post<EducationDto>(`${base(candidateId)}/education`, payload).then((r) => r.data),

  updateEducation: (candidateId: number, educationId: number, payload: EducationFormValues) =>
    http.put(`${base(candidateId)}/education/${educationId}`, payload).then((r) => r.data),

  deleteEducation: (candidateId: number, educationId: number) =>
    http.delete(`${base(candidateId)}/education/${educationId}`).then((r) => r.data),

  addExperience: (candidateId: number, payload: WorkExperienceFormValues) =>
    http.post<WorkExperienceDto>(`${base(candidateId)}/experience`, payload).then((r) => r.data),

  updateExperience: (candidateId: number, experienceId: number, payload: WorkExperienceFormValues) =>
    http.put(`${base(candidateId)}/experience/${experienceId}`, payload).then((r) => r.data),

  deleteExperience: (candidateId: number, experienceId: number) =>
    http.delete(`${base(candidateId)}/experience/${experienceId}`).then((r) => r.data),

  addCertification: (candidateId: number, payload: CertificationFormValues) =>
    http.post<CertificationDto>(`${base(candidateId)}/certifications`, payload).then((r) => r.data),

  deleteCertification: (candidateId: number, certificationId: number) =>
    http.delete(`${base(candidateId)}/certifications/${certificationId}`).then((r) => r.data),

  upsertSkill: (candidateId: number, payload: UpsertCandidateSkillRequest) =>
    http.put(`${base(candidateId)}/skills`, payload).then((r) => r.data),

  removeSkill: (candidateId: number, skillId: number) =>
    http.delete(`${base(candidateId)}/skills/${skillId}`).then((r) => r.data),
};
