import { create } from 'zustand';
import { usersApi, User } from '../lib/api';
import { toast } from 'sonner';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserState {
  users: User[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (params?: { status?: string; role?: string; search?: string; page?: number; limit?: number }) => Promise<void>;
  createUser: (data: { name: string; email: string; password: string; role?: string; status?: string }) => Promise<boolean>;
  updateUser: (id: number, data: { name?: string; email?: string; role?: string; status?: string }) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  resetPassword: (id: number, newPassword: string) => Promise<boolean>;
  toggleStatus: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersApi.getAll(params);
      set({ 
        users: response.data.data || [],
        pagination: response.data.pagination || null,
        isLoading: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat data users';
      set({ isLoading: false, error: message });
      toast.error(message);
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.create(data);
      await get().fetchUsers();
      set({ isLoading: false });
      toast.success('User berhasil ditambahkan');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan user';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.update(id, data);
      await get().fetchUsers();
      set({ isLoading: false });
      toast.success('User berhasil diperbarui');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui user';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.delete(id);
      await get().fetchUsers();
      set({ isLoading: false });
      toast.success('User berhasil dihapus');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus user';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  resetPassword: async (id, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.resetPassword(id, newPassword);
      set({ isLoading: false });
      toast.success('Password berhasil direset');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mereset password';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  toggleStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.toggleStatus(id);
      await get().fetchUsers();
      set({ isLoading: false });
      toast.success('Status user berhasil diubah');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengubah status user';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
