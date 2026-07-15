import type { ApprovalStatus, DeliveryChannel, DeliveryStatus } from "@/types/enums";

export interface FeedbackDto {
  feedbackId: number;
  applicationId: number;
  messageText: string;
  approvalStatus: ApprovalStatus;
  deliveryStatus: DeliveryStatus;
  channel: DeliveryChannel;
  generatedAt: string;
  sentAt: string | null;
}

export interface ReviewFeedbackRequest {
  decision: Extract<ApprovalStatus, "Approved" | "Edited" | "Rejected">;
  editedMessageText?: string;
  channel: DeliveryChannel;
}
