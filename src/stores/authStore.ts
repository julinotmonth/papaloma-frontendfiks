import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, User } from '../lib/api';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<boolean>;
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          const { user, token } = response.data.data!;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          toast.success('Login berhasil!');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login gagal';
          set({ isLoading: false, error: message });
          toast.error(message);
          return false;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Ignore logout error
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        toast.success('Logout berhasil');
      },

      fetchUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authApi.getMe();
          const { user } = response.data.data!;
          set({ user, isLoading: false });
        } catch (error) {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.updateProfile(data);
          const { user } = response.data.data!;
          set({ user, isLoading: false });
          toast.success('Profil berhasil diperbarui');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Gagal memperbarui profil';
          set({ isLoading: false, error: message });
          toast.error(message);
          return false;
        }
      },

      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.changePassword(data);
          set({ isLoading: false });
          toast.success('Password berhasil diubah');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Gagal mengubah password';
          set({ isLoading: false, error: message });
          toast.error(message);
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
