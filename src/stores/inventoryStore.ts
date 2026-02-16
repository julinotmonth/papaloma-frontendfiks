import { create } from 'zustand';
import { toast } from 'sonner';
import {
  barangApi,
  kategoriApi,
  transaksiMasukApi,
  transaksiKeluarApi,
  dashboardApi,
  Barang,
  BarangInput,
  Kategori,
  TransaksiMasuk,
  TransaksiMasukInput,
  TransaksiKeluar,
  TransaksiKeluarInput,
  DashboardStats,
  ChartData,
  KategoriDistribution,
  TopUsedItem,
  RecentActivity,
} from '../lib/api';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface InventoryState {
  // Data
  barang: Barang[];
  kategori: Kategori[];
  transaksiMasuk: TransaksiMasuk[];
  transaksiKeluar: TransaksiKeluar[];
  lowStockItems: Barang[];
  
  // Dashboard data
  dashboardStats: DashboardStats | null;
  chartData: ChartData[];
  kategoriDistribution: KategoriDistribution[];
  topUsedItems: TopUsedItem[];
  recentActivities: RecentActivity[];
  
  // Pagination
  barangPagination: Pagination | null;
  transaksiMasukPagination: Pagination | null;
  transaksiKeluarPagination: Pagination | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingBarang: boolean;
  isLoadingKategori: boolean;
  isLoadingTransaksiMasuk: boolean;
  isLoadingTransaksiKeluar: boolean;
  isLoadingDashboard: boolean;
  
  // Error
  error: string | null;

  // Kategori Actions
  fetchKategori: () => Promise<void>;
  addKategori: (data: { name: string; description?: string }) => Promise<boolean>;
  updateKategori: (id: number, data: { name?: string; description?: string }) => Promise<boolean>;
  deleteKategori: (id: number) => Promise<boolean>;

  // Barang Actions
  fetchBarang: (params?: { 
    kategoriId?: number; 
    kondisi?: string;
    stokStatus?: string;
    search?: string; 
    page?: number; 
    limit?: number 
  }) => Promise<void>;
  fetchBarangById: (id: number) => Promise<Barang | null>;
  addBarang: (data: BarangInput) => Promise<boolean>;
  updateBarang: (id: number, data: Partial<BarangInput>) => Promise<boolean>;
  deleteBarang: (id: number) => Promise<boolean>;
  fetchLowStockItems: () => Promise<void>;

  // Transaksi Masuk Actions
  fetchTransaksiMasuk: (params?: {
    barangId?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  addTransaksiMasuk: (data: TransaksiMasukInput) => Promise<boolean>;

  // Transaksi Keluar Actions
  fetchTransaksiKeluar: (params?: {
    barangId?: number;
    alasan?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  addTransaksiKeluar: (data: TransaksiKeluarInput) => Promise<boolean>;

  // Dashboard Actions
  fetchDashboardStats: () => Promise<void>;
  fetchChartData: (year?: number) => Promise<void>;
  fetchKategoriDistribution: () => Promise<void>;
  fetchTopUsedItems: (limit?: number) => Promise<void>;
  fetchRecentActivities: (limit?: number) => Promise<void>;
  fetchAllDashboardData: () => Promise<void>;

  // Utility
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  barang: [],
  kategori: [],
  transaksiMasuk: [],
  transaksiKeluar: [],
  lowStockItems: [],
  
  dashboardStats: null,
  chartData: [],
  kategoriDistribution: [],
  topUsedItems: [],
  recentActivities: [],
  
  barangPagination: null,
  transaksiMasukPagination: null,
  transaksiKeluarPagination: null,
  
  isLoading: false,
  isLoadingBarang: false,
  isLoadingKategori: false,
  isLoadingTransaksiMasuk: false,
  isLoadingTransaksiKeluar: false,
  isLoadingDashboard: false,
  
  error: null,

  // Kategori Actions
  fetchKategori: async () => {
    set({ isLoadingKategori: true, error: null });
    try {
      const response = await kategoriApi.getAll();
      set({ 
        kategori: response.data.data?.kategori || [], 
        isLoadingKategori: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat kategori';
      set({ isLoadingKategori: false, error: message });
      toast.error(message);
    }
  },

  addKategori: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await kategoriApi.create(data);
      await get().fetchKategori();
      set({ isLoading: false });
      toast.success('Kategori berhasil ditambahkan');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan kategori';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  updateKategori: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await kategoriApi.update(id, data);
      await get().fetchKategori();
      set({ isLoading: false });
      toast.success('Kategori berhasil diperbarui');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui kategori';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  deleteKategori: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await kategoriApi.delete(id);
      await get().fetchKategori();
      set({ isLoading: false });
      toast.success('Kategori berhasil dihapus');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus kategori';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  // Barang Actions
  fetchBarang: async (params) => {
    set({ isLoadingBarang: true, error: null });
    try {
      const response = await barangApi.getAll(params);
      set({ 
        barang: response.data.data || [],
        barangPagination: response.data.pagination || null,
        isLoadingBarang: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat barang';
      set({ isLoadingBarang: false, error: message });
      toast.error(message);
    }
  },

  fetchBarangById: async (id) => {
    try {
      const response = await barangApi.getById(id);
      return response.data.data?.barang || null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat barang';
      toast.error(message);
      return null;
    }
  },

  addBarang: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await barangApi.create(data);
      await get().fetchBarang();
      set({ isLoading: false });
      toast.success('Barang berhasil ditambahkan');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan barang';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  updateBarang: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await barangApi.update(id, data);
      await get().fetchBarang();
      set({ isLoading: false });
      toast.success('Barang berhasil diperbarui');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui barang';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  deleteBarang: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await barangApi.delete(id);
      await get().fetchBarang();
      set({ isLoading: false });
      toast.success('Barang berhasil dihapus');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus barang';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  fetchLowStockItems: async () => {
    try {
      const response = await barangApi.getLowStock();
      set({ lowStockItems: response.data.data?.barang || [] });
    } catch (error) {
      console.error('Failed to fetch low stock items:', error);
    }
  },

  // Transaksi Masuk Actions
  fetchTransaksiMasuk: async (params) => {
    set({ isLoadingTransaksiMasuk: true, error: null });
    try {
      const response = await transaksiMasukApi.getAll(params);
      set({ 
        transaksiMasuk: response.data.data || [],
        transaksiMasukPagination: response.data.pagination || null,
        isLoadingTransaksiMasuk: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat transaksi masuk';
      set({ isLoadingTransaksiMasuk: false, error: message });
      toast.error(message);
    }
  },

  addTransaksiMasuk: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await transaksiMasukApi.create(data);
      await get().fetchTransaksiMasuk();
      await get().fetchBarang();
      set({ isLoading: false });
      toast.success('Barang masuk berhasil dicatat');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mencatat barang masuk';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  // Transaksi Keluar Actions
  fetchTransaksiKeluar: async (params) => {
    set({ isLoadingTransaksiKeluar: true, error: null });
    try {
      const response = await transaksiKeluarApi.getAll(params);
      set({ 
        transaksiKeluar: response.data.data || [],
        transaksiKeluarPagination: response.data.pagination || null,
        isLoadingTransaksiKeluar: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat transaksi keluar';
      set({ isLoadingTransaksiKeluar: false, error: message });
      toast.error(message);
    }
  },

  addTransaksiKeluar: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await transaksiKeluarApi.create(data);
      await get().fetchTransaksiKeluar();
      await get().fetchBarang();
      set({ isLoading: false });
      toast.success('Barang keluar berhasil dicatat');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mencatat barang keluar';
      set({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  // Dashboard Actions
  fetchDashboardStats: async () => {
    try {
      const response = await dashboardApi.getStats();
      set({ dashboardStats: response.data.data?.stats || null });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  },

  fetchChartData: async (year) => {
    try {
      const response = await dashboardApi.getChartData(year);
      set({ chartData: response.data.data?.chartData || [] });
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  },

  fetchKategoriDistribution: async () => {
    try {
      const response = await dashboardApi.getKategoriDistribution();
      set({ kategoriDistribution: response.data.data?.distribution || [] });
    } catch (error) {
      console.error('Failed to fetch kategori distribution:', error);
    }
  },

  fetchTopUsedItems: async (limit = 8) => {
    try {
      const response = await dashboardApi.getTopUsedItems(limit);
      set({ topUsedItems: response.data.data?.items || [] });
    } catch (error) {
      console.error('Failed to fetch top used items:', error);
    }
  },

  fetchRecentActivities: async (limit = 5) => {
    try {
      const response = await dashboardApi.getRecentActivities(limit);
      set({ recentActivities: response.data.data?.activities || [] });
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
    }
  },

  fetchAllDashboardData: async () => {
    set({ isLoadingDashboard: true });
    try {
      await Promise.all([
        get().fetchDashboardStats(),
        get().fetchChartData(),
        get().fetchKategoriDistribution(),
        get().fetchTopUsedItems(),
        get().fetchRecentActivities(),
        get().fetchLowStockItems(),
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      set({ isLoadingDashboard: false });
    }
  },

  clearError: () => set({ error: null }),
}));
