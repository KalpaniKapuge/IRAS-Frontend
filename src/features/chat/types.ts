export interface ChatMessageDto {
  messageId: number;
  sender: "User" | "Bot";
  content: string;
  intent: string | null;
  createdAt: string;
}

export interface ChatReplyDto {
  conversationId: number;
  reply: string;
  intent: string | null;
}
