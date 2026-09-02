import type { UserRole } from "@/types/enums";
import type { NotificationDto } from "./types";

// Maps a notification's related entity to an in-app route for the current role. Returns
// null when there's nowhere useful to send the user (the notification then just expands
// in place). Entities without a dedicated detail route (an application, a feedback item,
// an interview) resolve to the relevant list page.
export function notificationLink(n: NotificationDto, role: UserRole): string | null {
  const type = n.relatedEntityType;
  const id = n.relatedEntityId;
  if (!type) return null;

  if (role === "Candidate") {
    switch (type) {
      case "Job":
        return id ? `/candidate/jobs/${id}` : "/candidate/jobs";
      case "Application":
      case "Feedback":
        return "/candidate/applications";
      case "Interview":
        return "/candidate/interviews";
      default:
        return null;
    }
  }

  if (role === "Employer") {
    switch (type) {
      case "Job":
        return id ? `/employer/jobs/${id}` : "/employer/jobs";
      case "Interview":
        return "/employer/interviews";
      case "Application":
      case "Candidate":
        return "/employer/jobs";
      default:
        return null;
    }
  }

  if (role === "Admin" && type === "Job") return "/admin/jobs";

  return null;
}
