import type { CvDetailDto } from "../../types";

export interface CvTemplateProps {
  cv: CvDetailDto;
}

export function initialsFromFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "?";
}
