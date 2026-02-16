import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        console.error('Failed to parse auth storage:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    
    // Extract error message
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
    
    return Promise.reject(new Error(message));
  }
);

// API Response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password }),
  
  logout: () => api.post<ApiResponse>('/auth/logout'),
  
  getMe: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
  
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put<ApiResponse<{ user: User }>>('/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.put<ApiResponse>('/auth/change-password', data),
  
  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ message: string; resetToken?: string; resetUrl?: string }>>('/auth/forgot-password', { email }),
  
  verifyResetToken: (token: string) =>
    api.get<ApiResponse<{ valid: boolean; email: string }>>(`/auth/verify-reset-token/${token}`),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse>('/auth/reset-password', { token, newPassword }),
};

// Users API
export const usersApi = {
  getAll: (params?: { status?: string; role?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<User[]>>('/users', { params }),
  
  getById: (id: number) => api.get<ApiResponse<{ user: User }>>(`/users/${id}`),
  
  create: (data: { name: string; email: string; password: string; role?: string; status?: string }) =>
    api.post<ApiResponse<{ user: User }>>('/users', data),
  
  update: (id: number, data: { name?: string; email?: string; role?: string; status?: string }) =>
    api.put<ApiResponse<{ user: User }>>(`/users/${id}`, data),
  
  delete: (id: number) => api.delete<ApiResponse>(`/users/${id}`),
  
  resetPassword: (id: number, newPassword: string) =>
    api.post<ApiResponse>(`/users/${id}/reset-password`, { newPassword }),
  
  toggleStatus: (id: number) => api.post<ApiResponse<{ user: User }>>(`/users/${id}/toggle-status`),
};

// Kategori API
export const kategoriApi = {
  getAll: () => api.get<ApiResponse<{ kategori: Kategori[] }>>('/kategori'),
  
  getById: (id: number) => api.get<ApiResponse<{ kategori: Kategori }>>(`/kategori/${id}`),
  
  create: (data: { name: string; description?: string }) =>
    api.post<ApiResponse<{ kategori: Kategori }>>('/kategori', data),
  
  update: (id: number, data: { name?: string; description?: string }) =>
    api.put<ApiResponse<{ kategori: Kategori }>>(`/kategori/${id}`, data),
  
  delete: (id: number) => api.delete<ApiResponse>(`/kategori/${id}`),
  
  getDistribution: () => api.get<ApiResponse<{ distribution: KategoriDistribution[] }>>('/kategori/distribution'),
};

// Barang API
export const barangApi = {
  getAll: (params?: { 
    kategoriId?: number; 
    kondisi?: string; 
    stokStatus?: string;
    search?: string; 
    page?: number; 
    limit?: number 
  }) => api.get<ApiResponse<Barang[]>>('/barang', { params }),
  
  getById: (id: number) => api.get<ApiResponse<{ barang: Barang }>>(`/barang/${id}`),
  
  create: (data: BarangInput) => api.post<ApiResponse<{ barang: Barang }>>('/barang', data),
  
  update: (id: number, data: Partial<BarangInput>) =>
    api.put<ApiResponse<{ barang: Barang }>>(`/barang/${id}`, data),
  
  delete: (id: number) => api.delete<ApiResponse>(`/barang/${id}`),
  
  getLowStock: () => api.get<ApiResponse<{ barang: Barang[] }>>('/barang/low-stock'),
  
  getDamaged: () => api.get<ApiResponse<{ barang: Barang[] }>>('/barang/damaged'),
  
  getTopUsed: (limit?: number) => api.get<ApiResponse<{ items: TopUsedItem[] }>>('/barang/top-used', { params: { limit } }),
};

// Transaksi Masuk API
export const transaksiMasukApi = {
  getAll: (params?: {
    barangId?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<TransaksiMasuk[]>>('/transaksi-masuk', { params }),
  
  getById: (id: number) => api.get<ApiResponse<{ transaksi: TransaksiMasuk }>>(`/transaksi-masuk/${id}`),
  
  create: (data: TransaksiMasukInput) =>
    api.post<ApiResponse<{ transaksi: TransaksiMasuk }>>('/transaksi-masuk', data),
  
  getMonthlyTrend: (year?: number) =>
    api.get<ApiResponse<{ trend: MonthlyTrend[] }>>('/transaksi-masuk/monthly-trend', { params: { year } }),
  
  getTotalCurrentMonth: () =>
    api.get<ApiResponse<{ total: number }>>('/transaksi-masuk/total-current-month'),
};

// Transaksi Keluar API
export const transaksiKeluarApi = {
  getAll: (params?: {
    barangId?: number;
    alasan?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<TransaksiKeluar[]>>('/transaksi-keluar', { params }),
  
  getById: (id: number) => api.get<ApiResponse<{ transaksi: TransaksiKeluar }>>(`/transaksi-keluar/${id}`),
  
  create: (data: TransaksiKeluarInput) =>
    api.post<ApiResponse<{ transaksi: TransaksiKeluar }>>('/transaksi-keluar', data),
  
  getMonthlyTrend: (year?: number) =>
    api.get<ApiResponse<{ trend: MonthlyTrend[] }>>('/transaksi-keluar/monthly-trend', { params: { year } }),
  
  getTotalCurrentMonth: () =>
    api.get<ApiResponse<{ total: number }>>('/transaksi-keluar/total-current-month'),
  
  getByReason: (dateFrom?: string, dateTo?: string) =>
    api.get<ApiResponse<{ data: ReasonSummary[] }>>('/transaksi-keluar/by-reason', { params: { dateFrom, dateTo } }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get<ApiResponse<{ stats: DashboardStats }>>('/dashboard/stats'),
  
  getChartData: (year?: number) =>
    api.get<ApiResponse<{ chartData: ChartData[] }>>('/dashboard/chart-data', { params: { year } }),
  
  getKategoriDistribution: () =>
    api.get<ApiResponse<{ distribution: KategoriDistribution[] }>>('/dashboard/kategori-distribution'),
  
  getLowStockItems: () => api.get<ApiResponse<{ items: Barang[] }>>('/dashboard/low-stock'),
  
  getTopUsedItems: (limit?: number) =>
    api.get<ApiResponse<{ items: TopUsedItem[] }>>('/dashboard/top-used', { params: { limit } }),
  
  getRecentActivities: (limit?: number) =>
    api.get<ApiResponse<{ activities: RecentActivity[] }>>('/dashboard/recent-activities', { params: { limit } }),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: { read?: boolean; type?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<Notification[]>>('/notifications', { params }),
  
  getUnreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
  
  markAsRead: (id: number) => api.put<ApiResponse>(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put<ApiResponse>('/notifications/read-all'),
  
  delete: (id: number) => api.delete<ApiResponse>(`/notifications/${id}`),
  
  deleteAll: () => api.delete<ApiResponse>('/notifications'),
};

// Activity Logs API
export const activityLogsApi = {
  getAll: (params?: {
    userId?: number;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<ActivityLog[]>>('/activity-logs', { params }),
  
  getMyLogs: (limit?: number) =>
    api.get<ApiResponse<{ logs: ActivityLog[] }>>('/activity-logs/me', { params: { limit } }),
};

// Laporan API
export const laporanApi = {
  getStokReport: (kategoriId?: number) =>
    api.get<ApiResponse<{ report: StokReport }>>('/laporan/stok', { params: { kategoriId } }),
  
  getMasukReport: (dateFrom?: string, dateTo?: string) =>
    api.get<ApiResponse<{ report: MasukReport }>>('/laporan/masuk', { params: { dateFrom, dateTo } }),
  
  getKeluarReport: (dateFrom?: string, dateTo?: string) =>
    api.get<ApiResponse<{ report: KeluarReport }>>('/laporan/keluar', { params: { dateFrom, dateTo } }),
  
  getPenyusutanReport: () =>
    api.get<ApiResponse<{ report: PenyusutanReport }>>('/laporan/penyusutan'),
  
  getComprehensiveReport: (dateFrom?: string, dateTo?: string) =>
    api.get<ApiResponse<{ report: ComprehensiveReport }>>('/laporan/comprehensive', { params: { dateFrom, dateTo } }),
};

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'inactive';
  avatar?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Kategori {
  id: number;
  name: string;
  description?: string;
  barang_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Barang {
  id: number;
  name: string;
  kategori: {
    id: number;
    name: string;
    description?: string;
  };
  satuan: string;
  stok: number;
  stokMinimum: number;
  hargaPerUnit: number;
  lokasi: string;
  kondisi: 'baik' | 'rusak' | 'kadaluarsa';
  tanggalKadaluarsa?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BarangInput {
  name: string;
  kategoriId: number;
  satuan: string;
  stok?: number;
  stokMinimum?: number;
  hargaPerUnit?: number;
  lokasi: string;
  kondisi?: 'baik' | 'rusak' | 'kadaluarsa';
  tanggalKadaluarsa?: string;
  catatan?: string;
}

export interface TransaksiMasuk {
  id: number;
  barang: {
    id: number;
    name: string;
    satuan: string;
    kategori: {
      id: number;
      name: string;
    };
  };
  jumlah: number;
  tanggal: string;
  supplier: string;
  catatan?: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export interface TransaksiMasukInput {
  barangId: number;
  jumlah: number;
  tanggal: string;
  supplier: string;
  catatan?: string;
}

export interface TransaksiKeluar {
  id: number;
  barang: {
    id: number;
    name: string;
    satuan: string;
    kategori: {
      id: number;
      name: string;
    };
  };
  jumlah: number;
  tanggal: string;
  alasan: string;
  catatan?: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export interface TransaksiKeluarInput {
  barangId: number;
  jumlah: number;
  tanggal: string;
  alasan: string;
  catatan?: string;
}

export interface Notification {
  id: number;
  user_id?: number;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  read: number;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  details?: string;
  created_at: string;
}

export interface DashboardStats {
  totalBarang: number;
  totalNilaiInventaris: number;
  totalBarangMasuk: number;
  totalBarangKeluar: number;
  barangStokRendah: number;
}

export interface ChartData {
  name: string;
  masuk: number;
  keluar: number;
}

export interface KategoriDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TopUsedItem {
  name: string;
  value: number;
}

export interface RecentActivity {
  id: number;
  type: 'masuk' | 'keluar';
  barang: string;
  jumlah: number;
  satuan: string;
  tanggal: string;
}

export interface MonthlyTrend {
  month: number;
  total: number;
}

export interface ReasonSummary {
  alasan: string;
  total: number;
}

export interface StokReport {
  items: (Barang & { totalNilai: number; status: string })[];
  summary: {
    totalItems: number;
    totalNilai: number;
    lowStockCount: number;
  };
}

export interface MasukReport {
  items: TransaksiMasuk[];
  summary: {
    totalTransaksi: number;
    totalJumlah: number;
  };
}

export interface KeluarReport {
  items: TransaksiKeluar[];
  summary: {
    totalTransaksi: number;
    totalJumlah: number;
    byReason: ReasonSummary[];
  };
}

export interface PenyusutanReport {
  items: (Barang & { estimasiKerugian: number })[];
  summary: {
    totalItems: number;
    totalKerugian: number;
    byKondisi: {
      rusak: number;
      kadaluarsa: number;
    };
  };
}

export interface ComprehensiveReport {
  generatedAt: string;
  period: { dateFrom?: string; dateTo?: string };
  stok: {
    totalItems: number;
    totalNilai: number;
    lowStock: number;
  };
  barangMasuk: {
    totalTransaksi: number;
    totalJumlah: number;
  };
  barangKeluar: {
    totalTransaksi: number;
    totalJumlah: number;
  };
  penyusutan: {
    totalItems: number;
    totalKerugian: number;
  };
}

export default api;