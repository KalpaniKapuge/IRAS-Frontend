import type { NotificationType, RelatedEntityType } from "@/types/enums";

export interface NotificationDto {
  notificationId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType: RelatedEntityType | null;
  relatedEntityId: number | null;
  isRead: boolean;
  createdAt: string;
}
