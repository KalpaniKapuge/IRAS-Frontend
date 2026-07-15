import { http } from "@/lib/api-client";
import type { ChatMessageDto, ChatReplyDto } from "./types";

export const chatApi = {
  getHistory: () => http.get<ChatMessageDto[]>("/api/chat/messages").then((r) => r.data),
  send: (message: string) => http.post<ChatReplyDto>("/api/chat/messages", { message }).then((r) => r.data),
};
