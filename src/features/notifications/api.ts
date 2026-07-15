import { http } from "@/lib/api-client";
import type { NotificationDto } from "./types";

export const notificationsApi = {
  getMine: () => http.get<NotificationDto[]>("/api/notifications").then((r) => r.data),
  markAsRead: (notificationId: number) => http.post(`/api/notifications/${notificationId}/read`).then((r) => r.data),
};
