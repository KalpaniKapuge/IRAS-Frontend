import type { ReactNode } from "react";
import type { JobDto } from "../../types";

export interface JobTemplateProps {
  job: JobDto;
  // Candidate pages pass an ApplyDialog here; the employer preview passes an
  // Edit action instead (or nothing) — templates stay unaware of who's looking.
  actionSlot?: ReactNode;
}
