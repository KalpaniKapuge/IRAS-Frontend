import { create } from "zustand";
import { notificationsApi } from "./api";
import type { NotificationDto } from "./types";

interface NotificationState {
  items: NotificationDto[];
  isLoading: boolean;
  fetch: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  items: [],
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const items = await notificationsApi.getMine();
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    set((s) => ({ items: s.items.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)) }));
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // best-effort; a background refetch will reconcile if this silently failed
    }
  },

  unreadCount: () => get().items.filter((n) => !n.isRead).length,
}));
