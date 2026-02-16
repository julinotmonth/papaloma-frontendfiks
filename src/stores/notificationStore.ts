import { create } from 'zustand';
import { notificationsApi, Notification } from '../lib/api';
import { toast } from 'sonner';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (params?: { read?: boolean; type?: string; page?: number; limit?: number }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationsApi.getAll(params);
      set({ 
        notifications: response.data.data || [], 
        isLoading: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat notifikasi';
      set({ isLoading: false, error: message });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      set({ unreadCount: response.data.data?.count || 0 });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      const notifications = get().notifications.map((n) =>
        n.id === id ? { ...n, read: 1 } : n
      );
      set({ 
        notifications,
        unreadCount: Math.max(0, get().unreadCount - 1)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menandai notifikasi';
      toast.error(message);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      const notifications = get().notifications.map((n) => ({ ...n, read: 1 }));
      set({ notifications, unreadCount: 0 });
      toast.success('Semua notifikasi ditandai sudah dibaca');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menandai notifikasi';
      toast.error(message);
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationsApi.delete(id);
      const notification = get().notifications.find((n) => n.id === id);
      const notifications = get().notifications.filter((n) => n.id !== id);
      set({ 
        notifications,
        unreadCount: notification && !notification.read 
          ? Math.max(0, get().unreadCount - 1) 
          : get().unreadCount
      });
      toast.success('Notifikasi berhasil dihapus');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus notifikasi';
      toast.error(message);
    }
  },

  deleteAllNotifications: async () => {
    try {
      await notificationsApi.deleteAll();
      set({ notifications: [], unreadCount: 0 });
      toast.success('Semua notifikasi berhasil dihapus');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus notifikasi';
      toast.error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
