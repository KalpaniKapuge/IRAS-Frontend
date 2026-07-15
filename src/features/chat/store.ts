import { create } from "zustand";
import { chatApi } from "./api";
import type { ChatMessageDto } from "./types";

interface ChatState {
  messages: ChatMessageDto[];
  isLoadingHistory: boolean;
  isSending: boolean;
  hasLoadedOnce: boolean;
  loadHistory: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

let syntheticId = -1;

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isLoadingHistory: false,
  isSending: false,
  hasLoadedOnce: false,

  loadHistory: async () => {
    if (get().hasLoadedOnce) return;
    set({ isLoadingHistory: true });
    try {
      const messages = await chatApi.getHistory();
      set({ messages, isLoadingHistory: false, hasLoadedOnce: true });
    } catch {
      set({ isLoadingHistory: false });
    }
  },

  sendMessage: async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const optimisticUser: ChatMessageDto = {
      messageId: syntheticId--,
      sender: "User",
      content: trimmed,
      intent: null,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ messages: [...s.messages, optimisticUser], isSending: true }));

    try {
      const reply = await chatApi.send(trimmed);
      const botMessage: ChatMessageDto = {
        messageId: syntheticId--,
        sender: "Bot",
        content: reply.reply,
        intent: reply.intent,
        createdAt: new Date().toISOString(),
      };
      set((s) => ({ messages: [...s.messages, botMessage], isSending: false }));
    } catch {
      const errorMessage: ChatMessageDto = {
        messageId: syntheticId--,
        sender: "Bot",
        content: "Sorry, I couldn't reach the assistant service. Please try again in a moment.",
        intent: "Error",
        createdAt: new Date().toISOString(),
      };
      set((s) => ({ messages: [...s.messages, errorMessage], isSending: false }));
    }
  },
}));
