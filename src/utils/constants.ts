import type { KategoriBarang, KondisiBarang } from '@/types'

export const APP_NAME = 'Papaloma Inventory'
export const APP_DESCRIPTION = 'Sistem Informasi Inventaris Bahan Baku Restoran'

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  BARANG: '/barang',
  BARANG_MASUK: '/barang-masuk',
  BARANG_KELUAR: '/barang-keluar',
  LAPORAN: '/laporan',
  ADMIN_AREA: '/admin-area',
  PROFIL: '/profil',
} as const

export const KATEGORI_BARANG: KategoriBarang[] = [
  { id: '1', nama: 'Daging & Protein', deskripsi: 'Daging sapi, ayam, ikan, seafood' },
  { id: '2', nama: 'Sayuran', deskripsi: 'Sayuran segar dan beku' },
  { id: '3', nama: 'Buah-buahan', deskripsi: 'Buah segar dan beku' },
  { id: '4', nama: 'Bumbu & Rempah', deskripsi: 'Bumbu dapur dan rempah-rempah' },
  { id: '5', nama: 'Minyak & Lemak', deskripsi: 'Minyak goreng, mentega, margarin' },
  { id: '6', nama: 'Tepung & Biji-bijian', deskripsi: 'Tepung terigu, beras, pasta' },
  { id: '7', nama: 'Dairy', deskripsi: 'Susu, keju, cream' },
  { id: '8', nama: 'Saus & Condiment', deskripsi: 'Kecap, saus sambal, mayonaise' },
  { id: '9', nama: 'Minuman', deskripsi: 'Sirup, kopi, teh' },
  { id: '10', nama: 'Lainnya', deskripsi: 'Bahan baku lainnya' },
]

export const KONDISI_BARANG: KondisiBarang[] = ['Baik', 'Rusak', 'Kadaluarsa']

export const SATUAN_BARANG = [
  'kg',
  'gram',
  'liter',
  'ml',
  'pcs',
  'pack',
  'box',
  'botol',
  'kaleng',
  'sachet',
  'ikat',
  'buah',
  'ekor',
  'porsi',
]

export const LOKASI_PENYIMPANAN = [
  'Gudang Utama',
  'Gudang Dingin (Chiller)',
  'Gudang Beku (Freezer)',
  'Rak Bumbu',
  'Rak Kering',
  'Dapur Utama',
  'Bar',
  'Pantry',
]

export const ALASAN_KELUAR = [
  'Penggunaan Harian',
  'Event/Catering',
  'Rusak/Busuk',
  'Kadaluarsa',
  'Transfer ke Cabang',
  'Return ke Supplier',
  'Lainnya',
]

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export const CHART_COLORS = {
  primary: '#3B82F6',
  accent: '#F97316',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  indigo: '#6366F1',
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Daging & Protein': CHART_COLORS.danger,
  'Sayuran': CHART_COLORS.success,
  'Buah-buahan': CHART_COLORS.warning,
  'Bumbu & Rempah': CHART_COLORS.accent,
  'Minyak & Lemak': CHART_COLORS.purple,
  'Tepung & Biji-bijian': CHART_COLORS.teal,
  'Dairy': CHART_COLORS.info,
  'Saus & Condiment': CHART_COLORS.pink,
  'Minuman': CHART_COLORS.indigo,
  'Lainnya': CHART_COLORS.primary,
}

export const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export const MONTHS_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
]
